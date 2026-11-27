import type {
  EnrichedPlace,
  Place,
  Profile,
  TrailblazerTier,
  UserBadge,
  VouchRecord,
} from "../types/domain";

/**
 * Computes the blueprint's Hidden Gem Score:
 * ((Vouches * 2) + (Verified Check-ins * 5)) / log10(Mainstream Popularity Index + 10)
 */
export function computeHiddenGemScore(
  vouchesCount: number,
  verifiedCheckinsCount: number,
  mainstreamPopularityIndex: number,
): number {
  const numerator = vouchesCount * 2 + verifiedCheckinsCount * 5;
  const denominator = Math.log10(Math.max(0, mainstreamPopularityIndex) + 10);
  if (denominator <= 0) return 0;
  return Number((numerator / denominator).toFixed(2));
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
