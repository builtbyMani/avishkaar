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
  // Local development demo always allows it (hackathon judging flow).
  // In production it requires an explicit opt-in, e.g. on a judging deployment.
  if (env.NODE_ENV === "production") return env.ALLOW_DEMO_CHECKIN === "true";
  return true;
}

export const PLACE_CATEGORY_STYLES: Record<
  PlaceCategory,
  { pillIdle: string; pillActive: string; badge: string }
> = {
  "Hidden Village": {
    pillIdle: "border-black/12 bg-[#F4F5ED] text-[#1F271C] hover:border-[#3D5236]",
    pillActive: "border-[#3D5236] bg-[#3D5236] text-[#F4F5ED]",
    badge: "border border-black/12 bg-[#F4F5ED] text-[#1F271C]",
  },
  "Regional Cuisine": {
    pillIdle: "border-black/12 bg-[#F4F5ED] text-[#1F271C] hover:border-[#3D5236]",
    pillActive: "border-[#3D5236] bg-[#3D5236] text-[#F4F5ED]",
    badge: "border border-black/12 bg-[#F4F5ED] text-[#1F271C]",
  },
  "Living Heritage": {
    pillIdle: "border-black/12 bg-[#F4F5ED] text-[#1F271C] hover:border-[#3D5236]",
    pillActive: "border-[#3D5236] bg-[#3D5236] text-[#F4F5ED]",
    badge: "border border-black/12 bg-[#F4F5ED] text-[#1F271C]",
  },
  "Sacred & Craft": {
    pillIdle: "border-black/12 bg-[#F4F5ED] text-[#1F271C] hover:border-[#3D5236]",
    pillActive: "border-[#3D5236] bg-[#3D5236] text-[#F4F5ED]",
    badge: "border border-black/12 bg-[#F4F5ED] text-[#1F271C]",
  },
  "Nature & Trail": {
    pillIdle: "border-black/12 bg-[#F4F5ED] text-[#1F271C] hover:border-[#3D5236]",
    pillActive: "border-[#3D5236] bg-[#3D5236] text-[#F4F5ED]",
    badge: "border border-black/12 bg-[#F4F5ED] text-[#1F271C]",
  },
};

export const REGION_STYLES: Record<
  string,
  { cardBg: string; border: string; pill: string; dot: string }
> = {
  "Spiti & Kinnaur": {
    cardBg: "bg-[#E9ECEF]",
    border: "border-[#64748B]/25",
    pill: "bg-[#DCE3E8] text-[#26323F]",
    dot: "bg-[#4A6074]",
  },
  "Meghalaya & Northeast": {
    cardBg: "bg-[#E3ECE3]",
    border: "border-[#3D5236]/25",
    pill: "bg-[#D3E2D4] text-[#1F3422]",
    dot: "bg-[#3D5236]",
  },
  "Deccan & Western Ghats": {
    cardBg: "bg-[#EFE6DC]",
    border: "border-[#7C4D34]/22",
    pill: "bg-[#E7D8C8] text-[#452819]",
    dot: "bg-[#7C4D34]",
  },
  "Kutch & Thar": {
    cardBg: "bg-[#F3ECD9]",
    border: "border-[#8A6D2F]/24",
    pill: "bg-[#EAE0C3] text-[#463612]",
    dot: "bg-[#8A6D2F]",
  },
  "Malabar & Konkan": {
    cardBg: "bg-[#E2ECEA]",
    border: "border-[#2D615B]/24",
    pill: "bg-[#D1E3DF] text-[#183834]",
    dot: "bg-[#2D615B]",
  },
};

export function getRegionStyle(region: string) {
  return (
    REGION_STYLES[region] ?? {
      cardBg: "bg-[#F4F5ED]",
      border: "border-black/12",
      pill: "bg-[#E0E3D3] text-[#1F271C]",
      dot: "bg-[#667D5C]",
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
    badge: "border-black/12 bg-[#F4F5ED] text-[#566151]",
    progressFill: "bg-[#667D5C]",
    cardRing: "border-black/20",
  },
  Pathfinder: {
    badge: "border-[#3D5236]/25 bg-[#E3ECE3] text-[#283B23]",
    progressFill: "bg-[#4A6443]",
    cardRing: "border-[#4A6443]",
  },
  "Local Legend": {
    badge: "border-[#3D5236]/30 bg-[#DCE5D5] text-[#1F271C]",
    progressFill: "bg-[#3D5236]",
    cardRing: "border-[#3D5236]",
  },
};

export type FeedbackTone = "success" | "error" | "info";

export interface FeedbackMessage {
  kind: FeedbackTone;
  text: string;
}

export const FEEDBACK_TONE_STYLES: Record<FeedbackTone, string> = {
  success: "border-emerald-300 bg-emerald-50 text-emerald-900",
  error: "border-red-300 bg-red-50 text-red-900",
  info: "border-black/15 bg-[#FAF7F2] text-[#1B3B36]",
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

export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
