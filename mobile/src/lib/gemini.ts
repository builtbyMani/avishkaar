import type { SafetyAlert, StructuredCards } from "../types/domain";

export interface GeminiExtractionResult {
  structuredCards: StructuredCards;
  safetyAlerts: SafetyAlert[];
  source: "gemini" | "fallback";
}

/**
 * Deterministic multilingual-aware fallback when API / Gemini is unreachable.
 * Recognizes English + Hindi/Hinglish/Telugu/Tamil cues.
 */
export function extractStructuredPlaceFallback(
  rawText: string,
  title: string,
  region: string,
): GeminiExtractionResult {
  const sentences = rawText
    .split(/(?<=[.!?।])\s+|\n+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const commuteMatches = sentences.filter((s) =>
    /\b(bus|train|ferry|walk|trek|auto|rikshaw|cab|jeep|km|hr|min|road|trail|station|ghat|gaadi|rasta|padal|bandi)\b/i.test(
      s,
    ),
  );
  const foodMatches = sentences.filter((s) =>
    /\b(eat|food|dish|meal|tea|chai|coffee|rice|curry|roti|thali|bread|sweet|fish|honey|try|kitchen|khana|khaye|mithai|idli|dosa|biryani|chutney|bojanam|saapadu)\b/i.test(
      s,
    ),
  );
  const heritageMatches = sentences.filter((s) =>
    /\b(heritage|tradition|weave|loom|artisan|craft|temple|mandir|kovil|folk|etiquette|ritual|bamboo|mask|potter|parampara|kalakari|sanskriti|elders|courtyard)\b/i.test(
      s,
    ),
  );

  const safetyAlerts: SafetyAlert[] = [];

  if (/\b(dark|night|evening|sunset|fog|unlit|cliff|raat|shaam|andhera|cheekati|iravu)\b/i.test(rawText)) {
    safetyAlerts.push({
      tag: "Avoid After Dark",
      message: "Limited lighting on approach routes—plan return before dusk.",
    });
  }
  if (/\b(network|signal|wifi|offline|cash|upi|bsnl|paise|dabbu|kaasu)\b/i.test(rawText)) {
    safetyAlerts.push({
      tag: "Low Network",
      message: "Weak cellular reception reported; save this pocket card offline and carry cash.",
    });
  }
  if (/\b(temple|dress|shoes|photo|permission|sacred|elder|respect|monastery|mandir|chappal|kovil)\b/i.test(rawText)) {
    safetyAlerts.push({
      tag: "Cultural Etiquette",
      message: "Respect local customs, dress modestly in sacred spaces, and ask before photographing residents.",
    });
  }
  if (/\b(scam|tout|broker|overcharge|fake|fare|dhoka|loot|mosam|cheat|extra)\b/i.test(rawText)) {
    safetyAlerts.push({
      tag: "Scam Alert",
      message: "Confirm official transport rates with locals before booking private rides.",
    });
  }
  if (safetyAlerts.length === 0) {
    safetyAlerts.push({
      tag: "Low Network",
      message: `Remote pockets around ${region} can lose mobile data—keep offline directions ready.`,
    });
  }

  const commute =
    commuteMatches.length > 0
      ? commuteMatches.slice(0, 3)
      : [
          `Reach the nearest regional transit hub in ${region}, then hire a shared local jeep or walk the final approach to ${title}.`,
        ];

  const food =
    foodMatches.length > 0
      ? foodMatches.slice(0, 3).map((line, idx) => ({
          name: `Local Specialty #${idx + 1}`,
          detail: line,
          priceHint: "INR 80–200",
        }))
      : [
          {
            name: `${region} Home-Cooked Thali`,
            detail: `Ask family kitchens near ${title} for seasonal local grains, chutneys, and regional dishes.`,
            priceHint: "INR 120–220",
          },
        ];

  const livingHeritage =
    heritageMatches.length > 0
      ? heritageMatches.slice(0, 3)
      : [
          `Observe living craft traditions and architectural heritage in ${title} quietly without disrupting artisans.`,
          `Greet village elders respectfully and carry back all plastic waste.`,
        ];

  const used = new Set([...commuteMatches, ...foodMatches, ...heritageMatches]);
  const remaining = sentences.filter((s) => !used.has(s));
  const activities =
    remaining.length > 0
      ? remaining.slice(0, 3)
      : [
          `Explore ${title} at dawn on foot to observe local life and heritage architecture.`,
          `Connect with village artisans or community elders for heritage stories.`,
        ];

  return {
    structuredCards: { commute, food, activities, livingHeritage },
    safetyAlerts,
    source: "fallback",
  };
}
