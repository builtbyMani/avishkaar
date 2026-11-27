import { GoogleGenAI, Type } from "@google/genai";
import type { SafetyAlert, SafetyTag, StructuredCards } from "../types/domain";

export interface GeminiExtractionResult {
  structuredCards: StructuredCards;
  safetyAlerts: SafetyAlert[];
  source: "gemini" | "fallback";
}

const VALID_SAFETY_TAGS: SafetyTag[] = [
  "Cultural Etiquette",
  "Avoid After Dark",
  "Low Network",
  "Scam Alert",
];

/**
 * Deterministic fallback when GEMINI_API_KEY is unset, API times out, or JSON parsing fails.
 */
export function extractStructuredPlaceFallback(
  rawText: string,
  title: string,
  region: string,
): GeminiExtractionResult {
  const sentences = rawText
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const commuteMatches = sentences.filter((s) =>
    /\b(bus|train|ferry|walk|trek|auto|cab|jeep|km|hr|min|road|trail|station|ghat)\b/i.test(s),
  );
  const foodMatches = sentences.filter((s) =>
    /\b(eat|food|dish|meal|tea|chai|coffee|rice|curry|roti|thali|bread|sweet|fish|honey|try|kitchen)\b/i.test(s),
  );
  const safetyAlerts: SafetyAlert[] = [];

  if (/\b(dark|night|evening|sunset|fog|unlit|cliff)\b/i.test(rawText)) {
    safetyAlerts.push({
      tag: "Avoid After Dark",
      message: "Limited lighting on approach routes—plan return before dusk.",
    });
  }
  if (/\b(network|signal|wifi|offline|cash|upi|bsnl)\b/i.test(rawText)) {
    safetyAlerts.push({
      tag: "Low Network",
      message: "Weak cellular reception reported; save this pocket card offline and carry cash.",
    });
  }
  if (/\b(temple|dress|shoes|photo|permission|sacred|elder|respect|monastery)\b/i.test(rawText)) {
    safetyAlerts.push({
      tag: "Cultural Etiquette",
      message: "Respect local customs, dress modestly in sacred spaces, and ask before photographing residents.",
    });
  }
  if (/\b(scam|tout|broker|overcharge|fake|fare)\b/i.test(rawText)) {
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

  const used = new Set([...commuteMatches, ...foodMatches]);
  const remaining = sentences.filter((s) => !used.has(s));
  const activities =
    remaining.length > 0
      ? remaining.slice(0, 3)
      : [
          `Explore ${title} at dawn on foot to observe local life and heritage architecture.`,
          `Connect with village artisans or community elders for heritage stories.`,
        ];

  return {
    structuredCards: { commute, food, activities },
    safetyAlerts,
    source: "fallback",
  };
}

export async function structurePlaceWithGemini(
  rawText: string,
  title: string,
  region: string,
): Promise<GeminiExtractionResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return extractStructuredPlaceFallback(rawText, title, region);
  }

  const ai = new GoogleGenAI({ apiKey });
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

  const prompt = `Extract structured travel field cards from this user submission for "${title}" in "${region}".
Keep every item concise, practical, and faithful to the input without inventing fake names.
Return strict JSON matching the schema.

User description:
"""
${rawText}
"""`;

  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("Gemini API timeout")), 8000),
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
              commute: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              food: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    detail: { type: Type.STRING },
                    priceHint: { type: Type.STRING },
                  },
                  required: ["name", "detail"],
                },
              },
              activities: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              safetyAlerts: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    tag: {
                      type: Type.STRING,
                      enum: VALID_SAFETY_TAGS,
                    },
                    message: { type: Type.STRING },
                  },
                  required: ["tag", "message"],
                },
              },
            },
            required: ["commute", "food", "activities", "safetyAlerts"],
          },
        },
      }),
      timeoutPromise,
    ]);

    const parsed = JSON.parse(response.text || "{}") as {
      commute?: string[];
      food?: Array<{ name: string; detail: string; priceHint?: string }>;
      activities?: string[];
      safetyAlerts?: Array<{ tag: SafetyTag; message: string }>;
    };

    const sanitizedAlerts = (parsed.safetyAlerts ?? []).filter(
      (a) => VALID_SAFETY_TAGS.includes(a.tag) && a.message?.trim(),
    );

    if (!parsed.commute?.length && !parsed.food?.length && !parsed.activities?.length) {
      return extractStructuredPlaceFallback(rawText, title, region);
    }

    return {
      structuredCards: {
        commute: parsed.commute?.slice(0, 4) ?? [],
        food: parsed.food?.slice(0, 4) ?? [],
        activities: parsed.activities?.slice(0, 4) ?? [],
      },
      safetyAlerts:
        sanitizedAlerts.length > 0
          ? sanitizedAlerts
          : extractStructuredPlaceFallback(rawText, title, region).safetyAlerts,
      source: "gemini",
    };
  } catch {
    return extractStructuredPlaceFallback(rawText, title, region);
  }
}
