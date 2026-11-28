import AsyncStorage from "@react-native-async-storage/async-storage";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  SEED_BADGES,
  SEED_GUIDE_REQUESTS,
  SEED_PLACES,
  SEED_PROFILES,
  SEED_VOUCHES,
} from "../data/seed";
import { findDetourAlternativesFallback, type DetourResult } from "./detour";
import {
  applySafetyVote,
  canVolunteerAsGuide,
  computeCheckInUpgradeDelta,
  computeVouchPointsDelta,
  evaluateNewBadges,
  getTierFromScore,
  haversineDistanceKm,
  isUuid,
  matchPlaceByIdOrSlug,
  sortFeedPlaces,
} from "./domain";
import { extractStructuredPlaceFallback, type GeminiExtractionResult } from "./gemini";
import { getApiBaseUrl, getAuthHeaders, getSupabaseClient, isSupabaseConfigured } from "./supabase";
import { detectFileKind } from "./upload-validation";
import type {
  EnrichedPlace,
  GuideRequest,
  LocalVendor,
  MediaItem,
  Place,
  PlaceCategory,
  Profile,
  SafetyAlert,
  StructuredCards,
  UserBadge,
  VouchRecord,
} from "../types/domain";

const DEMO_STORE_KEY = "avishkaar_mobile_demo_store_v1";
const FEED_CACHE_KEY = "avishkaar_mobile_feed_cache_v1";
const MAX_CHECKIN_RADIUS_KM = 25;
const MAX_IMAGE_SIZE_BYTES = 25 * 1024 * 1024;
const MAX_VIDEO_SIZE_BYTES = 8 * 1024 * 1024;

interface DemoState {
  profiles: Profile[];
  places: Place[];
  vouches: VouchRecord[];
  badges: UserBadge[];
  guideRequests: GuideRequest[];
}

function generateId(): string {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function cloneData<T>(val: T): T {
  return JSON.parse(JSON.stringify(val)) as T;
}

function buildInitialDemoState(): DemoState {
  return {
    profiles: cloneData(SEED_PROFILES),
    places: cloneData(SEED_PLACES),
    vouches: cloneData(SEED_VOUCHES),
    badges: cloneData(SEED_BADGES),
    guideRequests: cloneData(SEED_GUIDE_REQUESTS),
  };
}

let memoryDemoState: DemoState | null = null;

async function readDemoState(): Promise<DemoState> {
  if (memoryDemoState) return memoryDemoState;
  try {
    const raw = await AsyncStorage.getItem(DEMO_STORE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as DemoState;
      if (Array.isArray(parsed.profiles) && Array.isArray(parsed.places)) {
        memoryDemoState = parsed;
        return parsed;
      }
    }
  } catch {
    // Recreate clean state if storage is unreadable
  }
  const initial = buildInitialDemoState();
  memoryDemoState = initial;
  await writeDemoState(initial);
  return initial;
}

async function writeDemoState(state: DemoState): Promise<void> {
  memoryDemoState = state;
  try {
    await AsyncStorage.setItem(DEMO_STORE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage quota failure gracefully
  }
}

function mapSupabaseProfile(row: Record<string, unknown>): Profile {
  const score = Number(row.trailblazer_score ?? 0);
  return {
    id: String(row.id),
    username: String(row.username ?? "explorer"),
    displayName: String(row.display_name ?? "Explorer"),
    avatarUrl: row.avatar_url ? String(row.avatar_url) : undefined,
    trailblazerScore: score,
    tier: (row.tier as Profile["tier"]) ?? getTierFromScore(score),
    isGuide: Boolean(row.is_guide),
    isVerifiedLocal: Boolean(row.is_verified_local),
    guideRegion: row.guide_region ? String(row.guide_region) : null,
    languages: Array.isArray(row.languages) ? row.languages.map(String) : [],
  };
}

function mapSupabasePlace(row: Record<string, unknown>): Place {
  const cards = (row.structured_cards as StructuredCards | null) ?? {
    commute: [],
    food: [],
    activities: [],
  };
  return {
    id: String(row.id),
    authorId: String(row.author_id),
    title: String(row.title),
    region: String(row.region),
    category: row.category as PlaceCategory,
    rawDescription: String(row.raw_description ?? ""),
    lat: Number(row.lat),
    lng: Number(row.lng),
    media: Array.isArray(row.media) ? (row.media as MediaItem[]) : [],
    structuredCards: {
      commute: Array.isArray(cards.commute) ? cards.commute : [],
      food: Array.isArray(cards.food) ? cards.food : [],
      activities: Array.isArray(cards.activities) ? cards.activities : [],
      livingHeritage: Array.isArray(cards.livingHeritage) ? cards.livingHeritage : [],
    },
    localVendors: Array.isArray(row.local_vendors) ? (row.local_vendors as LocalVendor[]) : [],
    safetyAlerts: Array.isArray(row.safety_alerts) ? (row.safety_alerts as SafetyAlert[]) : [],
    mainstreamPopularityIndex: Number(row.mainstream_popularity_index ?? 10),
    vouchesCount: Number(row.vouches_count ?? 0),
    verifiedCheckinsCount: Number(row.verified_checkins_count ?? 0),
    createdAt: String(row.created_at ?? new Date().toISOString()),
  };
}

function toSupabasePlaceRow(place: Place) {
  return {
    id: place.id,
    author_id: place.authorId,
    title: place.title,
    region: place.region,
    category: place.category,
    raw_description: place.rawDescription,
    lat: place.lat,
    lng: place.lng,
    media: place.media,
    structured_cards: place.structuredCards,
    local_vendors: place.localVendors,
    safety_alerts: place.safetyAlerts,
    mainstream_popularity_index: place.mainstreamPopularityIndex,
    vouches_count: place.vouchesCount,
    verified_checkins_count: place.verifiedCheckinsCount,
    created_at: place.createdAt,
  };
}

function mapSupabaseVouch(v: Record<string, unknown>): VouchRecord {
  return {
    id: String(v.id),
    placeId: String(v.place_id),
    userId: String(v.user_id),
    checkedInAt: v.checked_in_at ? String(v.checked_in_at) : null,
    vouchedAt: v.vouched_at ? String(v.vouched_at) : null,
    isVerifiedVisit: Boolean(v.is_verified_visit),
    pointsAwarded: Number(v.points_awarded ?? 0),
  };
}

function mapSupabaseBadge(b: Record<string, unknown>): UserBadge {
  return {
    id: String(b.id),
    userId: String(b.user_id),
    badgeKey: b.badge_key as UserBadge["badgeKey"],
    badgeName: String(b.badge_name),
    description: String(b.description),
    awardedAt: String(b.awarded_at),
  };
}

function mapSupabaseGuideRequest(r: Record<string, unknown>): GuideRequest {
  return {
    id: String(r.id),
    placeId: String(r.place_id),
    guideId: String(r.guide_id),
    requesterId: String(r.requester_id),
    preferredDate: String(r.preferred_date ?? ""),
    notes: String(r.notes ?? ""),
    status: (r.status as GuideRequest["status"]) ?? "Pending",
    createdAt: String(r.created_at),
  };
}

function awardDemoBadgesForUser(state: DemoState, targetId: string): UserBadge[] {
  const target = state.profiles.find((p) => p.id === targetId);
  if (!target) return [];
  const authoredCount = state.places.filter((p) => p.authorId === target.id).length;
  const vouchedPlaceIds = new Set(
    state.vouches.filter((v) => v.userId === target.id && v.vouchedAt).map((v) => v.placeId),
  );
  const vouchedPlaces = state.places.filter((p) => vouchedPlaceIds.has(p.id));
  const existing = state.badges.filter((b) => b.userId === target.id);
  const unlocked = evaluateNewBadges({
    profile: target,
    authoredPlacesCount: authoredCount,
    vouchedPlaces,
    existingBadges: existing,
  });
  state.badges.push(...unlocked);
  return unlocked;
}

function activeSupabaseClient(useDemoOverride?: boolean): SupabaseClient | null {
  if (useDemoOverride) return null;
  if (!isSupabaseConfigured()) return null;
  return getSupabaseClient();
}

export async function listProfiles(options?: { demoMode?: boolean }): Promise<Profile[]> {
  const sb = activeSupabaseClient(options?.demoMode);
  if (sb) {
    try {
      const { data, error } = await sb
        .from("profiles")
        .select("*")
        .order("trailblazer_score", { ascending: false });
      if (error) throw error;
      return (data ?? []).map(mapSupabaseProfile);
    } catch {
      // Offline fallback to cached/seed profiles
    }
  }
  const state = await readDemoState();
  return [...state.profiles].sort((a, b) => b.trailblazerScore - a.trailblazerScore);
}

export async function getProfileById(
  userId: string,
  options?: { demoMode?: boolean },
): Promise<Profile | null> {
  const sb = activeSupabaseClient(options?.demoMode);
  if (sb) {
    const { data, error } = await sb.from("profiles").select("*").eq("id", userId).maybeSingle();
    if (error) throw error;
    return data ? mapSupabaseProfile(data) : null;
  }
  const state = await readDemoState();
  return state.profiles.find((p) => p.id === userId) ?? null;
}

export async function ensureSupabaseProfile(user: {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown>;
}): Promise<Profile | null> {
  const sb = getSupabaseClient();
  if (!sb) return null;
  const existing = await getProfileById(user.id);
  if (existing) return existing;
  const meta = user.user_metadata ?? {};
  const displayName =
    (typeof meta.full_name === "string" && meta.full_name) ||
    (typeof meta.name === "string" && meta.name) ||
    user.email?.split("@")[0] ||
    "Traveler";
  const username = `${displayName.toLowerCase().replace(/[^a-z0-9_]+/g, "_")}_${user.id.slice(0, 6)}`;
  const avatarUrl = typeof meta.avatar_url === "string" ? meta.avatar_url : null;
  const { data, error } = await sb
    .from("profiles")
    .upsert({ id: user.id, username, display_name: displayName, avatar_url: avatarUrl })
    .select("*")
    .single();
  if (error) return null;
  return mapSupabaseProfile(data);
}

export async function listPlaces(
  viewerId?: string,
  options?: { demoMode?: boolean },
): Promise<{ places: EnrichedPlace[]; fromCache?: boolean }> {
  const sb = activeSupabaseClient(options?.demoMode);
  if (sb) {
    try {
      const [placesRes, profilesRes, vouchesRes] = await Promise.all([
        sb.from("places").select("*"),
        sb.from("profiles").select("*"),
        viewerId
          ? sb.from("vouches").select("*").eq("user_id", viewerId)
          : Promise.resolve({ data: [], error: null }),
      ]);
      if (placesRes.error) throw placesRes.error;
      if (profilesRes.error) throw profilesRes.error;
      if (vouchesRes.error) throw vouchesRes.error;

      const profilesMap = new Map(
        (profilesRes.data ?? []).map((r) => {
          const p = mapSupabaseProfile(r);
          return [p.id, p];
        }),
      );
      const vouchesMap = new Map<string, VouchRecord>(
        (vouchesRes.data ?? []).map((v: Record<string, unknown>) => {
          const mapped = mapSupabaseVouch(v);
          return [mapped.placeId, mapped];
        }),
      );
      const sorted = sortFeedPlaces((placesRes.data ?? []).map(mapSupabasePlace), profilesMap, vouchesMap);
      void AsyncStorage.setItem(FEED_CACHE_KEY, JSON.stringify(sorted)).catch(() => {});
      return { places: sorted };
    } catch {
      try {
        const cached = await AsyncStorage.getItem(FEED_CACHE_KEY);
        if (cached) {
          return { places: JSON.parse(cached) as EnrichedPlace[], fromCache: true };
        }
      } catch {
        // Fall through to bundled 58 destinations
      }
    }
  }

  const state = await readDemoState();
  const profilesMap = new Map(state.profiles.map((p) => [p.id, p]));
  const vouchesMap = new Map(
    viewerId ? state.vouches.filter((v) => v.userId === viewerId).map((v) => [v.placeId, v]) : [],
  );
  return { places: sortFeedPlaces(state.places, profilesMap, vouchesMap) };
}

export async function getPlaceDetail(
  placeIdOrSlug: string,
  viewerId?: string,
  options?: { demoMode?: boolean },
): Promise<{
  place: EnrichedPlace | null;
  matchingGuides: Profile[];
  guideRequests: GuideRequest[];
}> {
  const sb = activeSupabaseClient(options?.demoMode);
  if (sb) {
    try {
      let rawPlace: Place | null = null;
      if (isUuid(placeIdOrSlug)) {
        const { data, error } = await sb.from("places").select("*").eq("id", placeIdOrSlug).maybeSingle();
        if (error) throw error;
        rawPlace = data ? mapSupabasePlace(data) : null;
      } else {
        const { data, error } = await sb.from("places").select("*");
        if (error) throw error;
        rawPlace = matchPlaceByIdOrSlug((data ?? []).map(mapSupabasePlace), placeIdOrSlug) ?? null;
      }
      if (!rawPlace) return { place: null, matchingGuides: [], guideRequests: [] };

      const [guidesRes, requestsRes, vouchRes] = await Promise.all([
        sb.from("profiles").select("*").eq("is_guide", true).order("trailblazer_score", { ascending: false }),
        sb.from("guide_requests").select("*").eq("place_id", rawPlace.id).order("created_at", { ascending: false }),
        viewerId
          ? sb.from("vouches").select("*").eq("place_id", rawPlace.id).eq("user_id", viewerId).maybeSingle()
          : Promise.resolve({ data: null, error: null }),
      ]);
      if (guidesRes.error) throw guidesRes.error;
      if (requestsRes.error) throw requestsRes.error;
      if (vouchRes.error) throw vouchRes.error;

      const author = await getProfileById(rawPlace.authorId);
      const profilesMap = new Map<string, Profile>(author ? [[author.id, author]] : []);
      const vouchesMap = new Map<string, VouchRecord>(
        vouchRes.data ? [[rawPlace.id, mapSupabaseVouch(vouchRes.data)]] : [],
      );
      const [enriched] = sortFeedPlaces([rawPlace], profilesMap, vouchesMap);
      const matchingGuides = (guidesRes.data ?? [])
        .map(mapSupabaseProfile)
        .filter((p) => canVolunteerAsGuide(p) && (!p.guideRegion || p.guideRegion === rawPlace.region));

      return {
        place: enriched,
        matchingGuides,
        guideRequests: (requestsRes.data ?? [])
          .map(mapSupabaseGuideRequest)
          .filter((r) => viewerId !== undefined && (r.requesterId === viewerId || r.guideId === viewerId)),
      };
    } catch {
      // Fallback to cached feed / seed when offline
      try {
        const cached = await AsyncStorage.getItem(FEED_CACHE_KEY);
        if (cached) {
          const places = JSON.parse(cached) as EnrichedPlace[];
          const found = matchPlaceByIdOrSlug(places, placeIdOrSlug) ?? null;
          if (found) return { place: found, matchingGuides: [], guideRequests: [] };
        }
      } catch {
        // Ignore
      }
    }
  }

  const state = await readDemoState();
  const rawPlace = matchPlaceByIdOrSlug(state.places, placeIdOrSlug);
  if (!rawPlace) return { place: null, matchingGuides: [], guideRequests: [] };
  const profilesMap = new Map(state.profiles.map((p) => [p.id, p]));
  const vouchesMap = new Map(
    viewerId
      ? state.vouches.filter((v) => v.placeId === rawPlace.id && v.userId === viewerId).map((v) => [v.placeId, v])
      : [],
  );
  const [place] = sortFeedPlaces([rawPlace], profilesMap, vouchesMap);
  const matchingGuides = state.profiles
    .filter(
      (p) =>
        p.isGuide &&
        canVolunteerAsGuide(p) &&
        (!p.guideRegion || p.guideRegion === rawPlace.region),
    )
    .sort((a, b) => b.trailblazerScore - a.trailblazerScore);
  const guideRequests = state.guideRequests.filter(
    (r) => r.placeId === rawPlace.id && viewerId !== undefined && (r.requesterId === viewerId || r.guideId === viewerId),
  );
  return { place, matchingGuides, guideRequests };
}

export async function performVouch(
  placeId: string,
  userId: string,
  options?: { demoMode?: boolean },
): Promise<{
  pointsAwarded: number;
  isVerifiedVisit: boolean;
  vouchesCount: number;
  unlockedBadges: UserBadge[];
}> {
  const sb = activeSupabaseClient(options?.demoMode);
  if (sb) {
    const beforeKeys = new Set((await listUserBadges(userId)).map((b) => b.badgeKey));
    const { data, error } = await sb.rpc("vouch_place", {
      p_place_id: placeId,
      p_user_id: userId,
    });
    if (error) throw new Error(error.message);
    const { data: placeRow, error: placeErr } = await sb
      .from("places")
      .select("vouches_count")
      .eq("id", placeId)
      .single();
    if (placeErr) throw new Error(placeErr.message);
    const afterBadges = await listUserBadges(userId);
    const pointsAwarded = Number((data as { points_awarded?: number }).points_awarded ?? 0);
    return {
      pointsAwarded,
      isVerifiedVisit: pointsAwarded >= 25,
      vouchesCount: Number(placeRow?.vouches_count ?? 0),
      unlockedBadges: afterBadges.filter((b) => !beforeKeys.has(b.badgeKey)),
    };
  }

  const state = await readDemoState();
  const place = state.places.find((p) => p.id === placeId);
  if (!place) throw new Error("Place not found");
  if (place.authorId === userId) throw new Error("You cannot vouch for your own place.");

  const existing = state.vouches.find((v) => v.placeId === placeId && v.userId === userId);
  const { pointsDelta, isVerifiedVisit, isNewVouchCount } = computeVouchPointsDelta(existing);

  if (!existing) {
    state.vouches.push({
      id: generateId(),
      placeId,
      userId,
      checkedInAt: null,
      vouchedAt: new Date().toISOString(),
      isVerifiedVisit,
      pointsAwarded: pointsDelta,
    });
  } else {
    if (!existing.vouchedAt) existing.vouchedAt = new Date().toISOString();
    existing.isVerifiedVisit = isVerifiedVisit;
    existing.pointsAwarded += pointsDelta;
  }

  if (isNewVouchCount) place.vouchesCount += 1;

  const author = state.profiles.find((p) => p.id === place.authorId);
  if (author && pointsDelta > 0) {
    author.trailblazerScore += pointsDelta;
    author.tier = getTierFromScore(author.trailblazerScore);
  }

  let newlyUnlocked: UserBadge[] = [];
  for (const targetId of new Set([userId, place.authorId])) {
    const unlocked = awardDemoBadgesForUser(state, targetId);
    if (targetId === userId) newlyUnlocked = unlocked;
  }

  await writeDemoState(state);
  return {
    pointsAwarded: pointsDelta,
    isVerifiedVisit,
    vouchesCount: place.vouchesCount,
    unlockedBadges: newlyUnlocked,
  };
}

export async function performCheckIn(
  params: {
    placeId: string;
    placeTitle: string;
    placeLat: number;
    placeLng: number;
    userId: string;
    demoCheckIn: boolean;
    lat?: number;
    lng?: number;
  },
  options?: { demoMode?: boolean },
): Promise<{
  checkedIn: boolean;
  bonusDelta: number;
  verifiedCheckinsCount: number;
}> {
  if (!params.demoCheckIn) {
    if (!Number.isFinite(params.lat) || !Number.isFinite(params.lng)) {
      throw new Error("GPS coordinates required unless Simulate GPS Check-In is enabled.");
    }
    const distanceKm = haversineDistanceKm(
      Number(params.lat),
      Number(params.lng),
      params.placeLat,
      params.placeLng,
    );
    if (distanceKm > MAX_CHECKIN_RADIUS_KM) {
      throw new Error(
        `You are ${distanceKm.toFixed(1)} km from ${params.placeTitle} (must be within ${MAX_CHECKIN_RADIUS_KM} km, or toggle Simulate GPS Check-In ON).`,
      );
    }
  }

  const sb = activeSupabaseClient(options?.demoMode);
  if (sb) {
    const { data, error } = await sb.rpc("check_in_place", {
      p_place_id: params.placeId,
      p_user_id: params.userId,
    });
    if (error) throw new Error(error.message);
    const { data: placeRow, error: placeErr } = await sb
      .from("places")
      .select("verified_checkins_count")
      .eq("id", params.placeId)
      .single();
    if (placeErr) throw new Error(placeErr.message);
    return {
      checkedIn: true,
      bonusDelta: Number((data as { bonus_delta?: number }).bonus_delta ?? 0),
      verifiedCheckinsCount: Number(placeRow?.verified_checkins_count ?? 0),
    };
  }

  const state = await readDemoState();
  const place = state.places.find((p) => p.id === params.placeId);
  if (!place) throw new Error("Place not found");
  if (place.authorId === params.userId) throw new Error("You cannot check in to your own place.");

  const existing = state.vouches.find((v) => v.placeId === params.placeId && v.userId === params.userId);
  const { pointsDelta, isFirstCheckIn } = computeCheckInUpgradeDelta(existing);

  if (!existing) {
    state.vouches.push({
      id: generateId(),
      placeId: params.placeId,
      userId: params.userId,
      checkedInAt: new Date().toISOString(),
      vouchedAt: null,
      isVerifiedVisit: true,
      pointsAwarded: 0,
    });
  } else if (isFirstCheckIn) {
    existing.checkedInAt = new Date().toISOString();
    existing.isVerifiedVisit = true;
    existing.pointsAwarded += pointsDelta;
  }

  if (isFirstCheckIn) place.verifiedCheckinsCount += 1;
  if (pointsDelta > 0) {
    const author = state.profiles.find((p) => p.id === place.authorId);
    if (author) {
      author.trailblazerScore += pointsDelta;
      author.tier = getTierFromScore(author.trailblazerScore);
    }
    awardDemoBadgesForUser(state, place.authorId);
  }

  await writeDemoState(state);
  return {
    checkedIn: true,
    bonusDelta: pointsDelta,
    verifiedCheckinsCount: place.verifiedCheckinsCount,
  };
}

export async function verifyOrFlagSafetyAlert(
  placeId: string,
  alertIndex: number,
  userId: string,
  action: "verify" | "flag",
  options?: { demoMode?: boolean },
): Promise<SafetyAlert[]> {
  const sb = activeSupabaseClient(options?.demoMode);
  if (sb) {
    const { data, error } = await sb.rpc("verify_safety_alert", {
      p_place_id: placeId,
      p_alert_index: alertIndex,
      p_user_id: userId,
      p_action: action,
    });
    if (error) throw new Error(error.message);
    return Array.isArray(data) ? (data as SafetyAlert[]) : [];
  }

  const state = await readDemoState();
  const voter = state.profiles.find((p) => p.id === userId);
  const voterTier = voter?.tier ?? "Wanderer";
  const place = state.places.find((p) => p.id === placeId);
  if (!place) throw new Error("Place not found");
  if (alertIndex < 0 || alertIndex >= place.safetyAlerts.length) {
    throw new Error("Safety alert not found");
  }
  place.safetyAlerts = place.safetyAlerts.map((a, idx) =>
    idx === alertIndex ? applySafetyVote(a, userId, action, voterTier) : a,
  );
  await writeDemoState(state);
  return place.safetyAlerts;
}

export async function createPlace(
  input: {
    authorId: string;
    title: string;
    region: string;
    category: PlaceCategory;
    rawDescription: string;
    lat: number;
    lng: number;
    media: MediaItem[];
    structuredCards: StructuredCards;
    localVendors: LocalVendor[];
    safetyAlerts: SafetyAlert[];
  },
  options?: { demoMode?: boolean },
): Promise<{ place: Place; unlockedBadges: UserBadge[] }> {
  const authorProfile = await getProfileById(input.authorId, options);
  const authorTier = authorProfile?.tier ?? "Wanderer";
  const taggedAlerts: SafetyAlert[] = input.safetyAlerts.map((a) => ({
    ...a,
    authorTier: a.authorTier ?? authorTier,
    verifiedBy: a.verifiedBy ?? [],
    flaggedBy: a.flaggedBy ?? [],
  }));

  const newPlace: Place = {
    id: generateId(),
    authorId: input.authorId,
    title: input.title,
    region: input.region,
    category: input.category,
    rawDescription: input.rawDescription,
    lat: input.lat,
    lng: input.lng,
    media: input.media,
    structuredCards: input.structuredCards,
    localVendors: input.localVendors,
    safetyAlerts: taggedAlerts,
    mainstreamPopularityIndex: 5,
    vouchesCount: 0,
    verifiedCheckinsCount: 0,
    createdAt: new Date().toISOString(),
  };

  const sb = activeSupabaseClient(options?.demoMode);
  if (sb) {
    const beforeKeys = new Set((await listUserBadges(input.authorId, options)).map((b) => b.badgeKey));
    const { data, error } = await sb
      .from("places")
      .insert(toSupabasePlaceRow(newPlace))
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    const { error: badgeErr } = await sb.rpc("award_milestone_badges", { p_user_id: input.authorId });
    if (badgeErr) throw new Error(badgeErr.message);
    const afterBadges = await listUserBadges(input.authorId, options);
    return {
      place: mapSupabasePlace(data),
      unlockedBadges: afterBadges.filter((b) => !beforeKeys.has(b.badgeKey)),
    };
  }

  const state = await readDemoState();
  state.places.unshift(newPlace);
  const unlockedBadges = awardDemoBadgesForUser(state, input.authorId);
  await writeDemoState(state);
  return { place: newPlace, unlockedBadges };
}

async function readUriAsArrayBuffer(uri: string): Promise<ArrayBuffer> {
  try {
    const response = await fetch(uri);
    if (typeof response.arrayBuffer === "function") {
      return await response.arrayBuffer();
    }
  } catch {
    // Fallback to XHR binary read for Android content:// or local file URIs
  }
  return await new Promise<ArrayBuffer>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", uri, true);
    xhr.responseType = "arraybuffer";
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300 && xhr.response) {
        resolve(xhr.response as ArrayBuffer);
      } else if (xhr.status === 0 && xhr.response) {
        resolve(xhr.response as ArrayBuffer);
      } else {
        reject(new Error(`Could not read local media URI (status ${xhr.status}).`));
      }
    };
    xhr.onerror = () => reject(new Error("Could not read local media URI from device storage."));
    xhr.send();
  });
}

export async function uploadMediaAsset(params: {
  uri: string;
  mimeType?: string | null;
  fileSize?: number;
  kind?: "image" | "video";
  userId: string;
  demoMode?: boolean;
}): Promise<{ type: "image" | "video"; url: string }> {
  const isVideoHint = params.kind === "video" || Boolean(params.mimeType?.startsWith("video/"));
  if (isVideoHint && params.fileSize && params.fileSize > MAX_VIDEO_SIZE_BYTES) {
    throw new Error("Short video clip exceeds the 8 MB limit (or paste a YouTube Shorts URL instead).");
  }
  if (!isVideoHint && params.fileSize && params.fileSize > MAX_IMAGE_SIZE_BYTES) {
    throw new Error("Photo exceeds 25 MB limit.");
  }

  const apiBase = getApiBaseUrl();
  const sb = activeSupabaseClient(params.demoMode);

  // When a backend URL is configured, prefer /api/upload so server magic-byte checks & service-role bucket upload apply.
  if (apiBase) {
    try {
      const formData = new FormData();
      formData.append("file", {
        uri: params.uri,
        name: isVideoHint ? "clip.mp4" : "photo.jpg",
        type: params.mimeType || (isVideoHint ? "video/mp4" : "image/jpeg"),
      } as unknown as Blob);
      formData.append("userId", params.userId);
      const headers = await getAuthHeaders();
      const res = await fetch(`${apiBase}/api/upload`, {
        method: "POST",
        headers,
        body: formData,
      });
      const data = (await res.json()) as { url?: string; type?: "image" | "video"; error?: string };
      if (res.ok && data.url) {
        return {
          type: data.type ?? (isVideoHint ? "video" : "image"),
          url: data.url.startsWith("/") ? `${apiBase}${data.url}` : data.url,
        };
      }
      if (!sb) {
        throw new Error(data.error || "Upload failed");
      }
    } catch (err) {
      if (!sb) {
        throw err instanceof Error ? err : new Error("Upload failed");
      }
    }
  }

  if (sb) {
    const arrayBuffer = await readUriAsArrayBuffer(params.uri);
    const bytes = new Uint8Array(arrayBuffer);
    const detected = detectFileKind(bytes);
    if (!detected) {
      throw new Error("Only JPEG, PNG, WebP, GIF images and MP4/WebM clips are supported.");
    }
    if (detected.kind === "video" && bytes.byteLength > MAX_VIDEO_SIZE_BYTES) {
      throw new Error("Short video clip exceeds the 8 MB limit.");
    }
    if (detected.kind === "image" && bytes.byteLength > MAX_IMAGE_SIZE_BYTES) {
      throw new Error("Photo exceeds 25 MB limit.");
    }
    const safeName = `${generateId()}${detected.ext}`;
    const { error } = await sb.storage
      .from("place-media")
      .upload(safeName, arrayBuffer, { contentType: detected.contentType, upsert: false });
    if (error) {
      if (/row-level security/i.test(error.message)) {
        throw new Error(
          "Storage upload blocked by Supabase RLS policy on bucket 'place-media'. Apply 0002_storage_rls.sql, set EXPO_PUBLIC_API_URL, or paste an image/YouTube URL.",
        );
      }
      throw new Error(error.message);
    }
    const { data } = sb.storage.from("place-media").getPublicUrl(safeName);
    return { type: detected.kind, url: data.publicUrl };
  }

  return { type: isVideoHint ? "video" : "image", url: params.uri };
}

export async function listUserBadges(
  userId: string,
  options?: { demoMode?: boolean },
): Promise<UserBadge[]> {
  const sb = activeSupabaseClient(options?.demoMode);
  if (sb) {
    const { data, error } = await sb.from("user_badges").select("*").eq("user_id", userId);
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapSupabaseBadge);
  }
  const state = await readDemoState();
  return state.badges.filter((b) => b.userId === userId);
}

export async function getUserProfileOverview(
  userId: string,
  options?: { demoMode?: boolean },
): Promise<{
  profile: Profile | null;
  badges: UserBadge[];
  guideRequests: GuideRequest[];
  authoredPlaces: EnrichedPlace[];
}> {
  const [profile, badges, guideRequests, feed] = await Promise.all([
    getProfileById(userId, options),
    listUserBadges(userId, options),
    listGuideRequests({ userId }, options),
    listPlaces(userId, options),
  ]);
  return {
    profile,
    badges,
    guideRequests,
    authoredPlaces: feed.places.filter((p) => p.authorId === userId),
  };
}

export async function updateGuideProfile(
  input: {
    userId: string;
    isGuide: boolean;
    guideRegion: string | null;
    languages: string[];
  },
  options?: { demoMode?: boolean },
): Promise<Profile> {
  const existing = await getProfileById(input.userId, options);
  if (!existing) throw new Error("Profile not found");
  if (input.isGuide && !canVolunteerAsGuide(existing)) {
    throw new Error(
      "Trust gate: Only Pathfinder (100+ pts), Local Legend (300+ pts), or verified locals can volunteer as a guide.",
    );
  }

  const sb = activeSupabaseClient(options?.demoMode);
  if (sb) {
    const { data, error } = await sb
      .from("profiles")
      .update({
        is_guide: input.isGuide,
        guide_region: input.guideRegion,
        languages: input.languages,
      })
      .eq("id", input.userId)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return mapSupabaseProfile(data);
  }

  const state = await readDemoState();
  const profile = state.profiles.find((p) => p.id === input.userId);
  if (!profile) throw new Error("Profile not found");
  profile.isGuide = input.isGuide;
  profile.guideRegion = input.guideRegion;
  profile.languages = input.languages;
  await writeDemoState(state);
  return profile;
}

export async function listGuideRequests(
  filter: { placeId?: string; userId?: string },
  options?: { demoMode?: boolean },
): Promise<GuideRequest[]> {
  const sb = activeSupabaseClient(options?.demoMode);
  if (sb) {
    try {
      let query = sb.from("guide_requests").select("*").order("created_at", { ascending: false });
      if (filter.placeId) query = query.eq("place_id", filter.placeId);
      if (filter.userId) {
        query = query.or(`requester_id.eq.${filter.userId},guide_id.eq.${filter.userId}`);
      }
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []).map(mapSupabaseGuideRequest);
    } catch {
      return [];
    }
  }
  const state = await readDemoState();
  return state.guideRequests.filter((r) => {
    if (filter.placeId && r.placeId !== filter.placeId) return false;
    if (filter.userId && r.requesterId !== filter.userId && r.guideId !== filter.userId) return false;
    return true;
  });
}

export async function createGuideRequest(
  input: {
    placeId: string;
    guideId: string;
    requesterId: string;
    preferredDate: string;
    notes: string;
  },
  options?: { demoMode?: boolean },
): Promise<GuideRequest> {
  const req: GuideRequest = {
    id: generateId(),
    placeId: input.placeId,
    guideId: input.guideId,
    requesterId: input.requesterId,
    preferredDate: input.preferredDate,
    notes: input.notes,
    status: "Pending",
    createdAt: new Date().toISOString(),
  };

  const sb = activeSupabaseClient(options?.demoMode);
  if (sb) {
    const { data, error } = await sb
      .from("guide_requests")
      .insert({
        id: req.id,
        place_id: req.placeId,
        guide_id: req.guideId,
        requester_id: req.requesterId,
        preferred_date: req.preferredDate || null,
        notes: req.notes,
        status: "Pending",
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return mapSupabaseGuideRequest(data);
  }

  const state = await readDemoState();
  state.guideRequests.unshift(req);
  await writeDemoState(state);
  return req;
}

export async function acceptGuideRequest(
  requestId: string,
  guideId: string,
  options?: { demoMode?: boolean },
): Promise<GuideRequest> {
  const sb = activeSupabaseClient(options?.demoMode);
  if (sb) {
    const { data, error } = await sb
      .from("guide_requests")
      .update({ status: "Accepted" })
      .eq("id", requestId)
      .eq("guide_id", guideId)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return mapSupabaseGuideRequest(data);
  }

  const state = await readDemoState();
  const req = state.guideRequests.find((r) => r.id === requestId && r.guideId === guideId);
  if (!req) throw new Error("Guide request not found");
  req.status = "Accepted";
  await writeDemoState(state);
  return req;
}

export async function findDetourAlternatives(
  query: string,
  places: EnrichedPlace[],
  viewerId?: string,
): Promise<DetourResult> {
  const apiBase = getApiBaseUrl();
  if (apiBase) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(`${apiBase}/api/detour`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim(), viewerId }),
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (res.ok) {
        const data = (await res.json()) as DetourResult;
        if (Array.isArray(data.alternatives) && data.alternatives.length > 0) return data;
      }
    } catch {
      // Fallback transparently
    }
  }
  return findDetourAlternativesFallback(query, places);
}

export async function structurePlaceNotes(
  rawDescription: string,
  title: string,
  region: string,
): Promise<GeminiExtractionResult> {
  const apiBase = getApiBaseUrl();
  if (apiBase) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 7000);
      const res = await fetch(`${apiBase}/api/structure-place`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawDescription, title, region }),
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (res.ok) {
        const data = (await res.json()) as GeminiExtractionResult;
        if (data.structuredCards) return data;
      }
    } catch {
      // Fallback transparently
    }
  }
  return extractStructuredPlaceFallback(rawDescription, title, region);
}
