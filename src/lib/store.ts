import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import {
  SEED_BADGES,
  SEED_GUIDE_REQUESTS,
  SEED_PLACES,
  SEED_PROFILES,
  SEED_VOUCHES,
} from "../data/seed";
import {
  applySafetyVote,
  canVolunteerAsGuide,
  computeCheckInUpgradeDelta,
  computeVouchPointsDelta,
  evaluateNewBadges,
  getTierFromScore,
  sortFeedPlaces,
} from "./domain";
import { getSupabaseServerClient, isSupabaseConfigured } from "./supabase";
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

interface DemoState {
  profiles: Profile[];
  places: Place[];
  vouches: VouchRecord[];
  badges: UserBadge[];
  guideRequests: GuideRequest[];
}

const DEMO_STORE_PATH = path.join(process.cwd(), ".data", "demo-store.json");

function buildInitialDemoState(): DemoState {
  return {
    profiles: structuredClone(SEED_PROFILES),
    places: structuredClone(SEED_PLACES),
    vouches: structuredClone(SEED_VOUCHES),
    badges: structuredClone(SEED_BADGES),
    guideRequests: structuredClone(SEED_GUIDE_REQUESTS),
  };
}

function readDemoState(): DemoState {
  try {
    if (fs.existsSync(DEMO_STORE_PATH)) {
      const raw = fs.readFileSync(DEMO_STORE_PATH, "utf8");
      const parsed = JSON.parse(raw) as DemoState;
      if (parsed.profiles && parsed.places) {
        return parsed;
      }
    }
  } catch {
    // Recreate clean state if cache file is unreadable
  }
  const initial = buildInitialDemoState();
  writeDemoState(initial);
  return initial;
}

function writeDemoState(state: DemoState): void {
  fs.mkdirSync(path.dirname(DEMO_STORE_PATH), { recursive: true });
  fs.writeFileSync(DEMO_STORE_PATH, JSON.stringify(state, null, 2), "utf8");
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

export async function listProfiles(): Promise<Profile[]> {
  if (isSupabaseConfigured()) {
    const sb = getSupabaseServerClient();
    if (sb) {
      const { data, error } = await sb.from("profiles").select("*").order("trailblazer_score", { ascending: false });
      if (!error && data) return data.map(mapSupabaseProfile);
    }
  }
  return readDemoState().profiles;
}

export async function getProfileById(userId: string): Promise<Profile | null> {
  if (isSupabaseConfigured()) {
    const sb = getSupabaseServerClient();
    if (sb) {
      const { data } = await sb.from("profiles").select("*").eq("id", userId).maybeSingle();
      if (data) return mapSupabaseProfile(data);
    }
  }
  return readDemoState().profiles.find((p) => p.id === userId) ?? null;
}

export async function listPlaces(viewerId?: string): Promise<EnrichedPlace[]> {
  if (isSupabaseConfigured()) {
    const sb = getSupabaseServerClient();
    if (sb) {
      const [placesRes, profilesRes, vouchesRes] = await Promise.all([
        sb.from("places").select("*"),
        sb.from("profiles").select("*"),
        viewerId ? sb.from("vouches").select("*").eq("user_id", viewerId) : Promise.resolve({ data: [] }),
      ]);
      if (!placesRes.error && placesRes.data && profilesRes.data) {
        const profilesMap = new Map(profilesRes.data.map((r) => {
          const p = mapSupabaseProfile(r);
          return [p.id, p];
        }));
        const vouchesMap = new Map<string, VouchRecord>(
          (vouchesRes.data ?? []).map((v: Record<string, unknown>) => [
            String(v.place_id),
            {
              id: String(v.id),
              placeId: String(v.place_id),
              userId: String(v.user_id),
              checkedInAt: v.checked_in_at ? String(v.checked_in_at) : null,
              vouchedAt: v.vouched_at ? String(v.vouched_at) : null,
              isVerifiedVisit: Boolean(v.is_verified_visit),
              pointsAwarded: Number(v.points_awarded ?? 0),
            },
          ]),
        );
        return sortFeedPlaces(placesRes.data.map(mapSupabasePlace), profilesMap, vouchesMap);
      }
    }
  }

  const state = readDemoState();
  const profilesMap = new Map(state.profiles.map((p) => [p.id, p]));
  const vouchesMap = new Map(
    state.vouches.filter((v) => !viewerId || v.userId === viewerId).map((v) => [v.placeId, v]),
  );
  return sortFeedPlaces(state.places, profilesMap, viewerId ? vouchesMap : new Map());
}

export async function getPlaceDetail(
  placeId: string,
  viewerId?: string,
): Promise<{
  place: EnrichedPlace | null;
  matchingGuides: Profile[];
  guideRequests: GuideRequest[];
}> {
  const allPlaces = await listPlaces(viewerId);
  const place = allPlaces.find((p) => p.id === placeId) ?? null;
  if (!place) {
    return { place: null, matchingGuides: [], guideRequests: [] };
  }

  const profiles = await listProfiles();
  const matchingGuides = profiles
    .filter(
      (p) =>
        p.isGuide &&
        canVolunteerAsGuide(p) &&
        (!p.guideRegion || p.guideRegion === place.region),
    )
    .sort((a, b) => b.trailblazerScore - a.trailblazerScore);

  const guideRequests = await listGuideRequests({ placeId });
  return { place, matchingGuides, guideRequests };
}

export async function createPlace(input: {
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
}): Promise<{ place: Place; unlockedBadges: UserBadge[] }> {
  const authorProfile = await getProfileById(input.authorId);
  const authorTier = authorProfile?.tier ?? "Wanderer";
  const taggedAlerts: SafetyAlert[] = input.safetyAlerts.map((a) => ({
    ...a,
    authorTier: a.authorTier ?? authorTier,
    verifiedBy: a.verifiedBy ?? [],
    flaggedBy: a.flaggedBy ?? [],
  }));

  const newPlace: Place = {
    id: crypto.randomUUID(),
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
    vouchesCount: 1,
    verifiedCheckinsCount: 0,
    createdAt: new Date().toISOString(),
  };

  if (isSupabaseConfigured()) {
    const sb = getSupabaseServerClient();
    if (sb) {
      const { data, error } = await sb
        .from("places")
        .insert({
          id: newPlace.id,
          author_id: newPlace.authorId,
          title: newPlace.title,
          region: newPlace.region,
          category: newPlace.category,
          raw_description: newPlace.rawDescription,
          lat: newPlace.lat,
          lng: newPlace.lng,
          media: newPlace.media,
          structured_cards: newPlace.structuredCards,
          local_vendors: newPlace.localVendors,
          safety_alerts: newPlace.safetyAlerts,
          mainstream_popularity_index: newPlace.mainstreamPopularityIndex,
          vouches_count: newPlace.vouchesCount,
          verified_checkins_count: 0,
        })
        .select("*")
        .single();
      if (!error && data) {
        await sb.rpc("award_milestone_badges", { p_user_id: input.authorId });
        const { data: badgesData } = await sb.from("user_badges").select("*").eq("user_id", input.authorId);
        return {
          place: mapSupabasePlace(data),
          unlockedBadges: (badgesData ?? []).map((b: Record<string, unknown>) => ({
            id: String(b.id),
            userId: String(b.user_id),
            badgeKey: b.badge_key as UserBadge["badgeKey"],
            badgeName: String(b.badge_name),
            description: String(b.description),
            awardedAt: String(b.awarded_at),
          })),
        };
      }
    }
  }

  const state = readDemoState();
  state.places.unshift(newPlace);
  const author = state.profiles.find((p) => p.id === input.authorId);
  let unlockedBadges: UserBadge[] = [];
  if (author) {
    const authoredCount = state.places.filter((p) => p.authorId === author.id).length;
    const vouchedPlaceIds = new Set(
      state.vouches.filter((v) => v.userId === author.id && v.vouchedAt).map((v) => v.placeId),
    );
    const vouchedPlaces = state.places.filter((p) => vouchedPlaceIds.has(p.id));
    const existing = state.badges.filter((b) => b.userId === author.id);
    unlockedBadges = evaluateNewBadges({
      profile: author,
      authoredPlacesCount: authoredCount,
      vouchedPlaces,
      existingBadges: existing,
    });
    state.badges.push(...unlockedBadges);
  }
  writeDemoState(state);
  return { place: newPlace, unlockedBadges };
}

export async function performCheckIn(placeId: string, userId: string): Promise<{
  checkedIn: boolean;
  bonusDelta: number;
  verifiedCheckinsCount: number;
}> {
  if (isSupabaseConfigured()) {
    const sb = getSupabaseServerClient();
    if (sb) {
      const { data, error } = await sb.rpc("check_in_place", {
        p_place_id: placeId,
        p_user_id: userId,
      });
      if (!error && data) {
        const { data: placeRow } = await sb
          .from("places")
          .select("verified_checkins_count")
          .eq("id", placeId)
          .single();
        return {
          checkedIn: true,
          bonusDelta: Number((data as { bonus_delta?: number }).bonus_delta ?? 0),
          verifiedCheckinsCount: Number(placeRow?.verified_checkins_count ?? 0),
        };
      }
    }
  }

  const state = readDemoState();
  const place = state.places.find((p) => p.id === placeId);
  if (!place) throw new Error("Place not found");

  const existing = state.vouches.find((v) => v.placeId === placeId && v.userId === userId);
  const { pointsDelta, isFirstCheckIn } = computeCheckInUpgradeDelta(existing);

  if (!existing) {
    state.vouches.push({
      id: crypto.randomUUID(),
      placeId,
      userId,
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

  if (isFirstCheckIn) {
    place.verifiedCheckinsCount += 1;
  }
  if (pointsDelta > 0) {
    const author = state.profiles.find((p) => p.id === place.authorId);
    if (author) {
      author.trailblazerScore += pointsDelta;
      author.tier = getTierFromScore(author.trailblazerScore);
    }
  }

  writeDemoState(state);
  return {
    checkedIn: true,
    bonusDelta: pointsDelta,
    verifiedCheckinsCount: place.verifiedCheckinsCount,
  };
}

export async function performVouch(placeId: string, userId: string): Promise<{
  pointsAwarded: number;
  isVerifiedVisit: boolean;
  vouchesCount: number;
  authorScore: number;
  authorTier: Profile["tier"];
  unlockedBadges: UserBadge[];
}> {
  if (isSupabaseConfigured()) {
    const sb = getSupabaseServerClient();
    if (sb) {
      const { data, error } = await sb.rpc("vouch_place", {
        p_place_id: placeId,
        p_user_id: userId,
      });
      if (!error && data) {
        const { data: placeRow } = await sb.from("places").select("author_id, vouches_count").eq("id", placeId).single();
        const author = placeRow ? await getProfileById(String(placeRow.author_id)) : null;
        const badges = await listUserBadges(userId);
        return {
          pointsAwarded: Number((data as { points_awarded?: number }).points_awarded ?? 0),
          isVerifiedVisit: Number((data as { points_awarded?: number }).points_awarded ?? 0) >= 25,
          vouchesCount: Number(placeRow?.vouches_count ?? 0),
          authorScore: author?.trailblazerScore ?? 0,
          authorTier: author?.tier ?? "Wanderer",
          unlockedBadges: badges,
        };
      }
    }
  }

  const state = readDemoState();
  const place = state.places.find((p) => p.id === placeId);
  if (!place) throw new Error("Place not found");

  const existing = state.vouches.find((v) => v.placeId === placeId && v.userId === userId);
  const { pointsDelta, isVerifiedVisit, isNewVouchCount } = computeVouchPointsDelta(existing);

  if (!existing) {
    state.vouches.push({
      id: crypto.randomUUID(),
      placeId,
      userId,
      checkedInAt: null,
      vouchedAt: new Date().toISOString(),
      isVerifiedVisit,
      pointsAwarded: pointsDelta,
    });
  } else {
    if (!existing.vouchedAt) {
      existing.vouchedAt = new Date().toISOString();
    }
    existing.isVerifiedVisit = isVerifiedVisit;
    existing.pointsAwarded += pointsDelta;
  }

  if (isNewVouchCount) {
    place.vouchesCount += 1;
  }

  const author = state.profiles.find((p) => p.id === place.authorId);
  if (author && pointsDelta > 0) {
    author.trailblazerScore += pointsDelta;
    author.tier = getTierFromScore(author.trailblazerScore);
  }

  // Evaluate milestone badges for both voucher (Foodie Scout) and author (Local Legend / First Discovery)
  const newlyUnlocked: UserBadge[] = [];
  for (const targetId of new Set([userId, place.authorId])) {
    const target = state.profiles.find((p) => p.id === targetId);
    if (!target) continue;
    const authoredCount = state.places.filter((p) => p.authorId === target.id).length;
    const vouchedPlaceIds = new Set(
      state.vouches.filter((v) => v.userId === target.id && v.vouchedAt).map((v) => v.placeId),
    );
    const vouchedPlaces = state.places.filter((p) => vouchedPlaceIds.has(p.id));
    const existingBadges = state.badges.filter((b) => b.userId === target.id);
    const unlocked = evaluateNewBadges({
      profile: target,
      authoredPlacesCount: authoredCount,
      vouchedPlaces,
      existingBadges,
    });
    state.badges.push(...unlocked);
    if (targetId === userId) newlyUnlocked.push(...unlocked);
  }

  writeDemoState(state);
  return {
    pointsAwarded: pointsDelta,
    isVerifiedVisit,
    vouchesCount: place.vouchesCount,
    authorScore: author?.trailblazerScore ?? 0,
    authorTier: author?.tier ?? "Wanderer",
    unlockedBadges: newlyUnlocked,
  };
}

export async function listUserBadges(userId: string): Promise<UserBadge[]> {
  if (isSupabaseConfigured()) {
    const sb = getSupabaseServerClient();
    if (sb) {
      const { data } = await sb.from("user_badges").select("*").eq("user_id", userId);
      if (data) {
        return data.map((b: Record<string, unknown>) => ({
          id: String(b.id),
          userId: String(b.user_id),
          badgeKey: b.badge_key as UserBadge["badgeKey"],
          badgeName: String(b.badge_name),
          description: String(b.description),
          awardedAt: String(b.awarded_at),
        }));
      }
    }
  }
  return readDemoState().badges.filter((b) => b.userId === userId);
}

export async function updateGuideProfile(input: {
  userId: string;
  isGuide: boolean;
  guideRegion: string | null;
  languages: string[];
}): Promise<Profile> {
  const existing = await getProfileById(input.userId);
  if (!existing) throw new Error("Profile not found");

  if (input.isGuide && !canVolunteerAsGuide(existing)) {
    throw new Error(
      "Trust gate: Only Pathfinder (100+ pts), Local Legend (300+ pts), or verified locals can volunteer as a guide.",
    );
  }

  if (isSupabaseConfigured()) {
    const sb = getSupabaseServerClient();
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
      if (!error && data) return mapSupabaseProfile(data);
    }
  }

  const state = readDemoState();
  const profile = state.profiles.find((p) => p.id === input.userId);
  if (!profile) throw new Error("Profile not found");
  profile.isGuide = input.isGuide;
  profile.guideRegion = input.guideRegion;
  profile.languages = input.languages;
  writeDemoState(state);
  return profile;
}

export async function listGuideRequests(filter?: {
  placeId?: string;
  userId?: string;
}): Promise<GuideRequest[]> {
  if (isSupabaseConfigured()) {
    const sb = getSupabaseServerClient();
    if (sb) {
      let query = sb.from("guide_requests").select("*").order("created_at", { ascending: false });
      if (filter?.placeId) query = query.eq("place_id", filter.placeId);
      if (filter?.userId) {
        query = query.or(`requester_id.eq.${filter.userId},guide_id.eq.${filter.userId}`);
      }
      const { data } = await query;
      if (data) {
        return data.map((r: Record<string, unknown>) => ({
          id: String(r.id),
          placeId: String(r.place_id),
          guideId: String(r.guide_id),
          requesterId: String(r.requester_id),
          preferredDate: String(r.preferred_date ?? ""),
          notes: String(r.notes ?? ""),
          status: (r.status as GuideRequest["status"]) ?? "Pending",
          createdAt: String(r.created_at),
        }));
      }
    }
  }

  const requests = readDemoState().guideRequests;
  return requests.filter((r) => {
    if (filter?.placeId && r.placeId !== filter.placeId) return false;
    if (filter?.userId && r.requesterId !== filter.userId && r.guideId !== filter.userId) return false;
    return true;
  });
}

export async function createGuideRequest(input: {
  placeId: string;
  guideId: string;
  requesterId: string;
  preferredDate: string;
  notes: string;
}): Promise<GuideRequest> {
  const req: GuideRequest = {
    id: crypto.randomUUID(),
    placeId: input.placeId,
    guideId: input.guideId,
    requesterId: input.requesterId,
    preferredDate: input.preferredDate,
    notes: input.notes,
    status: "Pending",
    createdAt: new Date().toISOString(),
  };

  if (isSupabaseConfigured()) {
    const sb = getSupabaseServerClient();
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
      if (!error && data) {
        return {
          id: String(data.id),
          placeId: String(data.place_id),
          guideId: String(data.guide_id),
          requesterId: String(data.requester_id),
          preferredDate: String(data.preferred_date ?? ""),
          notes: String(data.notes ?? ""),
          status: (data.status as GuideRequest["status"]) ?? "Pending",
          createdAt: String(data.created_at),
        };
      }
    }
  }

  const state = readDemoState();
  state.guideRequests.unshift(req);
  writeDemoState(state);
  return req;
}

export async function acceptGuideRequest(requestId: string, guideId: string): Promise<GuideRequest> {
  if (isSupabaseConfigured()) {
    const sb = getSupabaseServerClient();
    if (sb) {
      const { data, error } = await sb
        .from("guide_requests")
        .update({ status: "Accepted" })
        .eq("id", requestId)
        .eq("guide_id", guideId)
        .select("*")
        .single();
      if (!error && data) {
        return {
          id: String(data.id),
          placeId: String(data.place_id),
          guideId: String(data.guide_id),
          requesterId: String(data.requester_id),
          preferredDate: String(data.preferred_date ?? ""),
          notes: String(data.notes ?? ""),
          status: "Accepted",
          createdAt: String(data.created_at),
        };
      }
    }
  }

  const state = readDemoState();
  const req = state.guideRequests.find((r) => r.id === requestId && r.guideId === guideId);
  if (!req) throw new Error("Guide request not found");
  req.status = "Accepted";
  writeDemoState(state);
  return req;
}

export async function verifyOrFlagSafetyAlert(
  placeId: string,
  alertIndex: number,
  userId: string,
  action: "verify" | "flag",
): Promise<SafetyAlert[]> {
  const voter = await getProfileById(userId);
  const voterTier = voter?.tier ?? "Wanderer";

  if (isSupabaseConfigured()) {
    const sb = getSupabaseServerClient();
    if (sb) {
      const { data: placeRow, error: fetchErr } = await sb
        .from("places")
        .select("safety_alerts")
        .eq("id", placeId)
        .single();
      if (!fetchErr && placeRow) {
        const alerts = Array.isArray(placeRow.safety_alerts)
          ? (placeRow.safety_alerts as SafetyAlert[])
          : [];
        if (alertIndex < 0 || alertIndex >= alerts.length) {
          throw new Error("Safety alert not found");
        }
        const updated = alerts.map((a, idx) =>
          idx === alertIndex ? applySafetyVote(a, userId, action, voterTier) : a,
        );
        const { error: updErr } = await sb
          .from("places")
          .update({ safety_alerts: updated })
          .eq("id", placeId);
        if (!updErr) return updated;
      }
    }
  }

  const state = readDemoState();
  const place = state.places.find((p) => p.id === placeId);
  if (!place) throw new Error("Place not found");
  if (alertIndex < 0 || alertIndex >= place.safetyAlerts.length) {
    throw new Error("Safety alert not found");
  }

  place.safetyAlerts = place.safetyAlerts.map((a, idx) =>
    idx === alertIndex ? applySafetyVote(a, userId, action, voterTier) : a,
  );
  writeDemoState(state);
  return place.safetyAlerts;
}
