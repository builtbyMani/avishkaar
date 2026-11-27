import { GoogleGenAI, Type } from "@google/genai";
import type { EnrichedPlace, PlaceCategory } from "@/types/domain";

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
  const tokens = normalized
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length >= 3);
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
  // Prefer genuinely uncrowded spots
  score += Math.max(0, 40 - place.mainstreamPopularityIndex) * 0.2;
  return score;
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

  const alternatives: DetourAlternative[] = ranked.map((place) => {
    const crowdReductionPercent = Math.max(
      35,
      Math.min(
        92,
        Math.round(((profile.crowdIndex - place.mainstreamPopularityIndex) / profile.crowdIndex) * 100),
      ),
    );
    const commuteSummary =
      place.structuredCards.commute[0] ||
      `Reach via regional transit in ${place.region}`;

    return {
      place,
      matchReason: `Matches ${profile.label} vibe (${place.category}) with ${place.vouchesCount} community vouches and MPI ${place.mainstreamPopularityIndex}.`,
      crowdReductionPercent,
      commuteSummary,
    };
  });

  return {
    hotspot: cleaned,
    hotspotCrowdIndex: profile.crowdIndex,
    alternatives,
    source: "fallback",
  };
}

export async function findDetourAlternatives(
  query: string,
  places: EnrichedPlace[],
): Promise<DetourResult> {
  const fallback = findDetourAlternativesFallback(query, places);
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || places.length === 0) {
    return fallback;
  }

  const ai = new GoogleGenAI({ apiKey });
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const compactCatalog = places.map((p) => ({
    id: p.id,
    title: p.title,
    region: p.region,
    category: p.category,
    mpi: p.mainstreamPopularityIndex,
    gemScore: p.hiddenGemScore,
    commute: p.structuredCards.commute[0] ?? "",
  }));

  const prompt = `A traveler wants to skip the crowds at "${query}".
Pick the TOP 3 offbeat alternatives from this catalog that match the vibe/landscape/heritage while keeping mainstream popularity (mpi) low and Gem Score high.
Return strict JSON with each chosen place id, a short 1-sentence matchReason comparing vibe & crowd relief, and a 1-line commuteSummary.

Catalog:
${JSON.stringify(compactCatalog)}`;

  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("Gemini detour timeout")), 6000),
  );

  try {
    const response = await Promise.race([
      ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              picks: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    matchReason: { type: Type.STRING },
                    commuteSummary: { type: Type.STRING },
                  },
                  required: ["id", "matchReason", "commuteSummary"],
                },
              },
            },
            required: ["picks"],
          },
        },
      }),
      timeoutPromise,
    ]);

    const parsed = JSON.parse(response.text || "{}") as {
      picks?: Array<{ id: string; matchReason: string; commuteSummary: string }>;
    };
    const byId = new Map(places.map((p) => [p.id, p]));
    const picked: DetourAlternative[] = [];

    for (const item of parsed.picks ?? []) {
      const place = byId.get(item.id);
      if (!place || picked.some((x) => x.place.id === place.id)) continue;
      picked.push({
        place,
        matchReason: item.matchReason,
        crowdReductionPercent: Math.max(
          35,
          Math.min(
            92,
            Math.round(((fallback.hotspotCrowdIndex - place.mainstreamPopularityIndex) / fallback.hotspotCrowdIndex) * 100),
          ),
        ),
        commuteSummary: item.commuteSummary || place.structuredCards.commute[0] || "",
      });
    }

    if (picked.length >= 2) {
      return {
        hotspot: query.trim(),
        hotspotCrowdIndex: fallback.hotspotCrowdIndex,
        alternatives: picked.slice(0, 3),
        source: "gemini",
      };
    }
    return fallback;
  } catch {
    return fallback;
  }
}
