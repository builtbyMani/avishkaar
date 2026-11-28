import type {
  EnrichedPlace,
  Place,
  PlaceCategory,
  Profile,
  SafetyAlert,
  TrailblazerTier,
  UserBadge,
  VouchRecord,
} from "../types/domain";

export const REGIONS = [
  "Spiti & Kinnaur",
  "Meghalaya & Northeast",
  "Deccan & Western Ghats",
  "Kutch & Thar",
  "Malabar & Konkan",
  "Western Himalaya",
  "Gangetic Plains & Bundelkhand",
  "Central India & Deccan",
  "Bengal, Odisha & the East",
] as const;

export const PLACE_CATEGORIES: readonly PlaceCategory[] = [
  "Hidden Village",
  "Regional Cuisine",
  "Living Heritage",
  "Sacred & Craft",
  "Nature & Trail",
];

export function formatUpiHandle(name: string, explicitUpiId?: string): string {
  if (explicitUpiId?.trim()) return explicitUpiId.trim();
  return `${name.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 12)}@upi`;
}

export function getGemScoreBreakdown(
  place: Pick<Place, "vouchesCount" | "verifiedCheckinsCount" | "mainstreamPopularityIndex">,
): {
  vouchesPoints: number;
  checkinsPoints: number;
  crowdPenalty: number;
  score: number;
} {
  const vouchesPoints = place.vouchesCount * 2;
  const checkinsPoints = place.verifiedCheckinsCount * 5;
  const crowdPenalty = Math.log10(Math.max(0, place.mainstreamPopularityIndex) + 10);
  const score =
    crowdPenalty > 0
      ? Number(((vouchesPoints + checkinsPoints) / crowdPenalty).toFixed(2))
      : 0;
  return {
    vouchesPoints,
    checkinsPoints,
    crowdPenalty: Number(crowdPenalty.toFixed(2)),
    score,
  };
}

/**
 * Computes the blueprint's Hidden Gem Score:
 * ((Vouches * 2) + (Verified Check-ins * 5)) / log10(Mainstream Popularity Index + 10)
 */
export function computeHiddenGemScore(
  vouchesCount: number,
  verifiedCheckinsCount: number,
  mainstreamPopularityIndex: number,
): number {
  return getGemScoreBreakdown({
    vouchesCount,
    verifiedCheckinsCount,
    mainstreamPopularityIndex,
  }).score;
}

export function getTierFromScore(score: number): TrailblazerTier {
  if (score >= 300) return "Local Legend";
  if (score >= 100) return "Pathfinder";
  return "Wanderer";
}

export function canVolunteerAsGuide(profile: Pick<Profile, "trailblazerScore" | "isVerifiedLocal">): boolean {
  return profile.trailblazerScore >= 100 || profile.isVerifiedLocal;
}

export function computeVouchPointsDelta(
  existing: Pick<VouchRecord, "checkedInAt" | "vouchedAt" | "pointsAwarded"> | undefined,
): { pointsDelta: number; isVerifiedVisit: boolean; isNewVouchCount: boolean } {
  if (!existing) {
    return { pointsDelta: 10, isVerifiedVisit: false, isNewVouchCount: true };
  }
  if (!existing.vouchedAt) {
    const isVerified = Boolean(existing.checkedInAt);
    return {
      pointsDelta: isVerified ? 25 : 10,
      isVerifiedVisit: isVerified,
      isNewVouchCount: true,
    };
  }
  if (existing.checkedInAt && existing.pointsAwarded < 25) {
    return {
      pointsDelta: 25 - existing.pointsAwarded,
      isVerifiedVisit: true,
      isNewVouchCount: false,
    };
  }
  return {
    pointsDelta: 0,
    isVerifiedVisit: existing.pointsAwarded >= 25,
    isNewVouchCount: false,
  };
}

export function computeCheckInUpgradeDelta(
  existing: Pick<VouchRecord, "checkedInAt" | "vouchedAt" | "pointsAwarded"> | undefined,
): { pointsDelta: number; isFirstCheckIn: boolean } {
  if (!existing) {
    return { pointsDelta: 0, isFirstCheckIn: true };
  }
  if (existing.checkedInAt) {
    return { pointsDelta: 0, isFirstCheckIn: false };
  }
  const pointsDelta = existing.vouchedAt && existing.pointsAwarded < 25 ? 25 - existing.pointsAwarded : 0;
  return { pointsDelta, isFirstCheckIn: true };
}

export function sortFeedPlaces(
  places: Place[],
  profilesById: Map<string, Profile>,
  vouchesForUser: Map<string, VouchRecord>,
): EnrichedPlace[] {
  return places
    .map((place) => {
      const author = profilesById.get(place.authorId) ?? {
        id: place.authorId,
        username: "explorer",
        displayName: "Local Explorer",
        trailblazerScore: 0,
        tier: "Wanderer" as const,
        isGuide: false,
        isVerifiedLocal: false,
        guideRegion: null,
        languages: [],
      };
      const userVouch = vouchesForUser.get(place.id);
      return {
        ...place,
        author,
        hiddenGemScore: computeHiddenGemScore(
          place.vouchesCount,
          place.verifiedCheckinsCount,
          place.mainstreamPopularityIndex,
        ),
        userHasVouched: Boolean(userVouch?.vouchedAt),
        userHasCheckedIn: Boolean(userVouch?.checkedInAt),
        userVerifiedVisitVouch: Boolean(userVouch?.isVerifiedVisit && userVouch?.vouchedAt),
      };
    })
    .sort((a, b) => {
      const scoreDiff = b.hiddenGemScore - a.hiddenGemScore;
      if (Math.abs(scoreDiff) > 0.001) return scoreDiff;
      // Local Legends receive priority visibility when scores tie
      const aLegend = a.author.tier === "Local Legend" ? 1 : 0;
      const bLegend = b.author.tier === "Local Legend" ? 1 : 0;
      return bLegend - aLegend;
    });
}

export function evaluateNewBadges(params: {
  profile: Profile;
  authoredPlacesCount: number;
  vouchedPlaces: Place[];
  existingBadges: UserBadge[];
  nowIso?: string;
}): UserBadge[] {
  const { profile, authoredPlacesCount, vouchedPlaces, existingBadges, nowIso = new Date().toISOString() } = params;
  const owned = new Set(existingBadges.map((b) => b.badgeKey));
  const unlocked: UserBadge[] = [];

  if (!owned.has("first_discovery") && authoredPlacesCount >= 1) {
    unlocked.push({
      id: `${profile.id}-first_discovery`,
      userId: profile.id,
      badgeKey: "first_discovery",
      badgeName: "First Discovery",
      description: "Shared your first offbeat hidden gem with the community.",
      awardedAt: nowIso,
    });
  }

  const foodieVouches = vouchedPlaces.filter(
    (p) => p.category === "Regional Cuisine" || p.structuredCards.food.length >= 2,
  ).length;
  if (!owned.has("foodie_scout") && foodieVouches >= 2) {
    unlocked.push({
      id: `${profile.id}-foodie_scout`,
      userId: profile.id,
      badgeKey: "foodie_scout",
      badgeName: "Foodie Scout",
      description: "Vouched for 2+ regional food & culinary heritage spots.",
      awardedAt: nowIso,
    });
  }

  if (!owned.has("local_legend") && profile.trailblazerScore >= 300) {
    unlocked.push({
      id: `${profile.id}-local_legend`,
      userId: profile.id,
      badgeKey: "local_legend",
      badgeName: "Local Legend",
      description: "Reached 300+ Trailblazer Points and unlocked priority visibility.",
      awardedAt: nowIso,
    });
  }

  return unlocked;
}

export function haversineDistanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function isSafetyAlertPublic(alert: SafetyAlert): boolean {
  const verifies = alert.verifiedBy?.length ?? 0;
  const flags = alert.flaggedBy?.length ?? 0;
  if (flags >= 2 && flags > verifies) return false;
  if (alert.authorTier === "Pathfinder" || alert.authorTier === "Local Legend") return true;
  if (verifies >= 2) return true;
  // No legacy exemption: untagged alerts stay private until Pathfinder+ authorship
  // or 2+ community verifies. Seed alerts are tagged Local Legend in src/data/seed.ts.
  return false;
}

export function applySafetyVote(
  alert: SafetyAlert,
  userId: string,
  action: "verify" | "flag",
  voterTier: TrailblazerTier = "Wanderer",
): SafetyAlert {
  const verifiedSet = new Set(alert.verifiedBy ?? []);
  const flaggedSet = new Set(alert.flaggedBy ?? []);

  if (action === "verify") {
    flaggedSet.delete(userId);
    verifiedSet.add(userId);
  } else {
    verifiedSet.delete(userId);
    flaggedSet.add(userId);
  }

  const nextTier =
    action === "verify" && (voterTier === "Pathfinder" || voterTier === "Local Legend")
      ? voterTier
      : alert.authorTier;

  return {
    ...alert,
    authorTier: nextTier,
    verifiedBy: Array.from(verifiedSet),
    flaggedBy: Array.from(flaggedSet),
  };
}

export function isDemoCheckInAllowed(env: {
  NODE_ENV?: string;
  ALLOW_DEMO_CHECKIN?: string;
}): boolean {
  // Enabled by default (including deployment builds) unless explicitly turned off.
  return env.ALLOW_DEMO_CHECKIN !== "false";
}

export const PLACE_CATEGORY_STYLES: Record<
  PlaceCategory,
  { pillIdle: string; pillActive: string; badge: string }
> = {
  "Hidden Village": {
    pillIdle: "border-black/12 bg-[#FAF7F0] text-[#2B141A] hover:border-[#6B1D2F]",
    pillActive: "border-[#6B1D2F] bg-[#6B1D2F] text-[#F5F0E6]",
    badge: "border border-[#D9A12B]/40 bg-[#D9A12B]/15 text-[#2B141A]",
  },
  "Regional Cuisine": {
    pillIdle: "border-black/12 bg-[#FAF7F0] text-[#2B141A] hover:border-[#6B1D2F]",
    pillActive: "border-[#6B1D2F] bg-[#6B1D2F] text-[#F5F0E6]",
    badge: "border border-[#D9A12B]/40 bg-[#D9A12B]/15 text-[#2B141A]",
  },
  "Living Heritage": {
    pillIdle: "border-black/12 bg-[#FAF7F0] text-[#2B141A] hover:border-[#6B1D2F]",
    pillActive: "border-[#6B1D2F] bg-[#6B1D2F] text-[#F5F0E6]",
    badge: "border border-[#D9A12B]/40 bg-[#D9A12B]/15 text-[#2B141A]",
  },
  "Sacred & Craft": {
    pillIdle: "border-black/12 bg-[#FAF7F0] text-[#2B141A] hover:border-[#6B1D2F]",
    pillActive: "border-[#6B1D2F] bg-[#6B1D2F] text-[#F5F0E6]",
    badge: "border border-[#D9A12B]/40 bg-[#D9A12B]/15 text-[#2B141A]",
  },
  "Nature & Trail": {
    pillIdle: "border-black/12 bg-[#FAF7F0] text-[#2B141A] hover:border-[#6B1D2F]",
    pillActive: "border-[#6B1D2F] bg-[#6B1D2F] text-[#F5F0E6]",
    badge: "border border-[#D9A12B]/40 bg-[#D9A12B]/15 text-[#2B141A]",
  },
};

export const REGION_STYLES: Record<
  string,
  { cardBg: string; border: string; pill: string; dot: string }
> = {
  "Spiti & Kinnaur": {
    cardBg: "bg-[#F7F4EC]",
    border: "border-[#2B141A]/12",
    pill: "bg-[#EAE5D8] text-[#2B141A]",
    dot: "bg-[#6B1D2F]",
  },
  "Meghalaya & Northeast": {
    cardBg: "bg-[#F3EAEB]",
    border: "border-[#6B1D2F]/16",
    pill: "bg-[#EAD9DC] text-[#2B141A]",
    dot: "bg-[#6B1D2F]",
  },
  "Deccan & Western Ghats": {
    cardBg: "bg-[#F5EDE1]",
    border: "border-[#2B141A]/12",
    pill: "bg-[#EAE0CE] text-[#2B141A]",
    dot: "bg-[#D9A12B]",
  },
  "Kutch & Thar": {
    cardBg: "bg-[#F7F0DE]",
    border: "border-[#D9A12B]/28",
    pill: "bg-[#EFE3C2] text-[#2B141A]",
    dot: "bg-[#D9A12B]",
  },
  "Malabar & Konkan": {
    cardBg: "bg-[#F4ECEE]",
    border: "border-[#6B1D2F]/14",
    pill: "bg-[#EBDCE0] text-[#2B141A]",
    dot: "bg-[#6B1D2F]",
  },
};

export function getRegionStyle(region: string) {
  return (
    REGION_STYLES[region] ?? {
      cardBg: "bg-[#FAF7F0]",
      border: "border-[#2B141A]/12",
      pill: "bg-[#EBE4D5] text-[#2B141A]",
      dot: "bg-[#6B1D2F]",
    }
  );
}

export const TIER_DISPLAY_LABELS: Record<TrailblazerTier, string> = {
  Wanderer: "Explorer",
  Pathfinder: "Field Scout",
  "Local Legend": "Regional Steward",
};

export function getTierDisplayLabel(tier: TrailblazerTier): string {
  return TIER_DISPLAY_LABELS[tier] ?? tier;
}

export const TRAILBLAZER_TIER_STYLES: Record<
  TrailblazerTier,
  { badge: string; progressFill: string; cardRing: string }
> = {
  Wanderer: {
    badge: "border-[#2B141A]/15 bg-[#FAF7F0] text-[#61454D]",
    progressFill: "bg-[#61454D]",
    cardRing: "border-[#2B141A]/20",
  },
  Pathfinder: {
    badge: "border-[#6B1D2F]/25 bg-[#EFE3E6] text-[#6B1D2F]",
    progressFill: "bg-[#6B1D2F]",
    cardRing: "border-[#6B1D2F]",
  },
  "Local Legend": {
    badge: "border-[#D9A12B]/50 bg-[#D9A12B]/15 text-[#2B141A]",
    progressFill: "bg-[#6B1D2F]",
    cardRing: "border-[#D9A12B]",
  },
};

export type FeedbackTone = "success" | "error" | "info";

export interface FeedbackMessage {
  kind: FeedbackTone;
  text: string;
}

export const FEEDBACK_TONE_STYLES: Record<FeedbackTone, string> = {
  success: "border-[#6B1D2F]/25 bg-[#F1E6E8] text-[#2B141A]",
  error: "border-[#A63D2A]/35 bg-[#F8EAE6] text-[#A63D2A]",
  info: "border-[#2B141A]/15 bg-[#FAF7F0] text-[#2B141A]",
};

export type GuideModuleKey = "commute" | "food" | "activities" | "livingHeritage";

export const GUIDE_MODULE_STYLES: Record<
  GuideModuleKey,
  { card: string; offline: string; icon: string }
> = {
  commute: {
    card: "border-l-4 border-l-slate-600",
    offline: "border-l-2 border-l-slate-600 pl-3",
    icon: "text-slate-700",
  },
  food: {
    card: "border-l-4 border-l-[#C85A32]",
    offline: "border-l-2 border-l-[#C85A32] pl-3",
    icon: "text-[#C85A32]",
  },
  activities: {
    card: "border-l-4 border-l-teal-700",
    offline: "border-l-2 border-l-teal-700 pl-3",
    icon: "text-teal-700",
  },
  livingHeritage: {
    card: "border-l-4 border-l-amber-600",
    offline: "border-l-2 border-l-amber-600 pl-3",
    icon: "text-amber-700",
  },
};

export function buildGoogleMapsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${lat},${lng}`)}`;
}

export function filterPlaces<
  T extends {
    title: string;
    region: string;
    category: PlaceCategory;
    rawDescription: string;
    author?: { displayName: string };
  },
>(
  places: readonly T[],
  filters: { category?: "All" | PlaceCategory; region?: string; query?: string },
): T[] {
  const category = filters.category ?? "All";
  const region = filters.region ?? "All";
  const q = filters.query?.trim().toLowerCase() ?? "";
  const tokens = q ? q.split(/\s+/).filter(Boolean) : [];
  return places.filter((p) => {
    if (category !== "All" && p.category !== category) return false;
    if (region !== "All" && p.region !== region) return false;
    if (tokens.length === 0) return true;
    const haystack = `${p.title} ${p.region} ${p.category} ${p.rawDescription} ${p.author?.displayName ?? ""}`.toLowerCase();
    return tokens.every((t) => haystack.includes(t));
  });
}

export const VOLUNTEER_GUIDE_DISCLAIMERS = {
  title: "Volunteer Local Guide Disclaimer",
  points: [
    "Independent community peers: Volunteer guides are community members verified by local reputation, not licensed tour operators or employees of Avishkaar.",
    "Agree on plans upfront: Confirm timings, meetup spot, language, and any shared transport or meal costs directly in advance, and meet first in public areas.",
    "Personal safety responsibility: Travelers remain responsible for checking weather, terrain, permits, and regional advisories before departing.",
  ],
} as const;

export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
