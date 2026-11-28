import type { EnrichedPlace, PlaceCategory } from "../types/domain";

export interface DetourAlternative {
  place: EnrichedPlace;
  matchReason: string;
  crowdReductionPercent: number;
  commuteSummary: string;
}

export interface DetourResult {
  hotspot: string;
  hotspotCrowdIndex: number;
  alternatives: DetourAlternative[];
  source: "gemini" | "fallback";
}

interface HotspotProfile {
  label: string;
  crowdIndex: number;
  vibeKeywords: string[];
  preferredCategories: PlaceCategory[];
  preferredRegions?: string[];
}

const KNOWN_HOTSPOTS: Array<{ aliases: string[]; profile: HotspotProfile }> = [
  {
    aliases: ["ooty", "munnar", "shimla", "manali", "darjeeling", "mussoorie", "nainital", "kodaikanal"],
    profile: {
      label: "Hill Station Hotspot",
      crowdIndex: 94,
      vibeKeywords: ["apple", "ridge", "mist", "pine", "mountain", "bamboo", "valley", "orchard", "tea", "glacier"],
      preferredCategories: ["Hidden Village", "Nature & Trail"],
      preferredRegions: ["Spiti & Kinnaur", "Meghalaya & Northeast"],
    },
  },
  {
    aliases: ["goa", "pondicherry", "puducherry", "varkala", "kovalam", "alleppey", "kochi"],
    profile: {
      label: "Coastal & Backwater Hotspot",
      crowdIndex: 96,
      vibeKeywords: ["coast", "cove", "crab", "lagoon", "fish", "coconut", "kokum", "canoe", "beach", "sandbar"],
      preferredCategories: ["Regional Cuisine", "Nature & Trail"],
      preferredRegions: ["Malabar & Konkan"],
    },
  },
  {
    aliases: ["hampi", "jaipur", "udaipur", "jodhpur", "mysuru", "mysore", "agra", "varanasi"],
    profile: {
      label: "Heritage & Stepwell Hotspot",
      crowdIndex: 95,
      vibeKeywords: ["stepwell", "heritage", "courtyard", "loom", "craft", "temple", "coracle", "paint", "stone", "mansion"],
      preferredCategories: ["Living Heritage", "Sacred & Craft"],
      preferredRegions: ["Deccan & Western Ghats", "Kutch & Thar"],
    },
  },
  {
    aliases: ["leh", "ladakh", "pangong", "kasol", "spiti"],
    profile: {
      label: "High-Altitude Circuit",
      crowdIndex: 88,
      vibeKeywords: ["pass", "glacier", "buckwheat", "apricot", "river", "limestone", "log", "valley"],
      preferredCategories: ["Hidden Village", "Nature & Trail"],
      preferredRegions: ["Spiti & Kinnaur", "Meghalaya & Northeast"],
    },
  },
];

function matchHotspotProfile(query: string): HotspotProfile {
  const normalized = query.trim().toLowerCase();
  for (const entry of KNOWN_HOTSPOTS) {
    if (entry.aliases.some((alias) => normalized.includes(alias))) {
      return entry.profile;
    }
  }
  const tokens = normalized.split(/[^a-z0-9]+/).filter((t) => t.length >= 3);
  return {
    label: query.trim(),
    crowdIndex: 90,
    vibeKeywords: tokens,
    preferredCategories: ["Hidden Village", "Living Heritage", "Regional Cuisine"],
  };
}

function scoreDetourCandidate(place: EnrichedPlace, profile: HotspotProfile): number {
  const haystack = `${place.title} ${place.region} ${place.category} ${place.rawDescription}`.toLowerCase();
  let score = place.hiddenGemScore;
  if (profile.preferredCategories.includes(place.category)) score += 6;
  if (profile.preferredRegions?.includes(place.region)) score += 5;
  for (const kw of profile.vibeKeywords) {
    if (haystack.includes(kw)) score += 2.5;
  }
  score += Math.max(0, 40 - place.mainstreamPopularityIndex) * 0.2;
  return score;
}

function calcCrowdReduction(hotspotCrowdIndex: number, mpi: number): number {
  return Math.max(
    35,
    Math.min(92, Math.round(((hotspotCrowdIndex - mpi) / hotspotCrowdIndex) * 100)),
  );
}

export function findDetourAlternativesFallback(
  query: string,
  places: EnrichedPlace[],
): DetourResult {
  const cleaned = query.trim();
  const profile = matchHotspotProfile(cleaned);

  const ranked = [...places]
    .filter((p) => !p.title.toLowerCase().includes(cleaned.toLowerCase()))
    .sort((a, b) => scoreDetourCandidate(b, profile) - scoreDetourCandidate(a, profile))
    .slice(0, 3);

  const alternatives: DetourAlternative[] = ranked.map((place) => ({
    place,
    matchReason: `Matches ${profile.label} vibe (${place.category}) with ${place.vouchesCount} community vouches and MPI ${place.mainstreamPopularityIndex}.`,
    crowdReductionPercent: calcCrowdReduction(profile.crowdIndex, place.mainstreamPopularityIndex),
    commuteSummary:
      place.structuredCards.commute[0] || `Reach via regional transit in ${place.region}`,
  }));

  return {
    hotspot: cleaned,
    hotspotCrowdIndex: profile.crowdIndex,
    alternatives,
    source: "fallback",
  };
}
