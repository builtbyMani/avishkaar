import { Platform } from "react-native";
import type { PlaceCategory, TrailblazerTier } from "../types/domain";

export const COLORS = {
  // 60% Neutral warm parchment
  parchment: "#F5F0E6",
  surface: "#FAF7F0",
  well: "#EBE4D5",
  white: "#FFFFFF",
  // Text ink
  ink: "#2B141A",
  muted: "#61454D",
  border: "rgba(43, 20, 26, 0.12)",
  borderStrong: "rgba(43, 20, 26, 0.22)",
  // 30% Primary Wine Red
  wine: "#6B1D2F",
  wineDark: "#521523",
  wineTint: "#EFE3E6",
  wineBorder: "rgba(107, 29, 47, 0.24)",
  // 10% Single Turmeric Accent
  turmeric: "#D9A12B",
  turmericDark: "#C89122",
  turmericTint: "rgba(217, 161, 43, 0.15)",
  turmericBorder: "rgba(217, 161, 43, 0.42)",
  // Semantic tokens
  brick: "#A63D2A",
  brickTint: "#F8EAE6",
  brickBorder: "rgba(166, 61, 42, 0.35)",
  terracotta: "#C85A32",
  emerald: "#047857",
  emeraldDark: "#065F46",
  emeraldTint: "#ECFDF5",
  emeraldBorder: "#A7F3D0",
  redAlertBg: "#FEF2F2",
  redAlertBorder: "#DC2626",
  redAlertText: "#7F1D1D",
} as const;

export const FONTS = {
  sans: Platform.select({
    ios: "System",
    android: "sans-serif",
    default: "System",
  }),
  rozha: "RozhaOne-Regular",
  modak: "Modak-Regular",
  display: "InstrumentSerif-Regular",
  displayItalic: "InstrumentSerif-Italic",
  preloader: "ArchivoBlack-Regular",
} as const;

export const REGION_STYLES: Record<
  string,
  { cardBg: string; border: string; pillBg: string; dot: string }
> = {
  "Spiti & Kinnaur": {
    cardBg: "#F7F4EC",
    border: "rgba(43, 20, 26, 0.12)",
    pillBg: "#EAE5D8",
    dot: "#6B1D2F",
  },
  "Meghalaya & Northeast": {
    cardBg: "#F3EAEB",
    border: "rgba(107, 29, 47, 0.16)",
    pillBg: "#EAD9DC",
    dot: "#6B1D2F",
  },
  "Deccan & Western Ghats": {
    cardBg: "#F5EDE1",
    border: "rgba(43, 20, 26, 0.12)",
    pillBg: "#EAE0CE",
    dot: "#D9A12B",
  },
  "Kutch & Thar": {
    cardBg: "#F7F0DE",
    border: "rgba(217, 161, 43, 0.28)",
    pillBg: "#EFE3C2",
    dot: "#D9A12B",
  },
  "Malabar & Konkan": {
    cardBg: "#F4ECEE",
    border: "rgba(107, 29, 47, 0.14)",
    pillBg: "#EBDCE0",
    dot: "#6B1D2F",
  },
};

export function getRegionStyle(region: string) {
  return (
    REGION_STYLES[region] ?? {
      cardBg: "#FAF7F0",
      border: "rgba(43, 20, 26, 0.12)",
      pillBg: "#EBE4D5",
      dot: "#6B1D2F",
    }
  );
}

export const PLACE_CATEGORY_BADGE: Record<
  PlaceCategory,
  { bg: string; border: string; text: string }
> = {
  "Hidden Village": {
    bg: "rgba(217, 161, 43, 0.15)",
    border: "rgba(217, 161, 43, 0.40)",
    text: "#2B141A",
  },
  "Regional Cuisine": {
    bg: "rgba(217, 161, 43, 0.15)",
    border: "rgba(217, 161, 43, 0.40)",
    text: "#2B141A",
  },
  "Living Heritage": {
    bg: "rgba(217, 161, 43, 0.15)",
    border: "rgba(217, 161, 43, 0.40)",
    text: "#2B141A",
  },
  "Sacred & Craft": {
    bg: "rgba(217, 161, 43, 0.15)",
    border: "rgba(217, 161, 43, 0.40)",
    text: "#2B141A",
  },
  "Nature & Trail": {
    bg: "rgba(217, 161, 43, 0.15)",
    border: "rgba(217, 161, 43, 0.40)",
    text: "#2B141A",
  },
};

export const TRAILBLAZER_TIER_STYLES: Record<
  TrailblazerTier,
  { bg: string; border: string; text: string; progressFill: string; cardRing: string }
> = {
  Wanderer: {
    bg: "#FAF7F0",
    border: "rgba(43, 20, 26, 0.15)",
    text: "#61454D",
    progressFill: "#61454D",
    cardRing: "rgba(43, 20, 26, 0.22)",
  },
  Pathfinder: {
    bg: "#EFE3E6",
    border: "rgba(107, 29, 47, 0.25)",
    text: "#6B1D2F",
    progressFill: "#6B1D2F",
    cardRing: "#6B1D2F",
  },
  "Local Legend": {
    bg: "rgba(217, 161, 43, 0.15)",
    border: "rgba(217, 161, 43, 0.50)",
    text: "#2B141A",
    progressFill: "#6B1D2F",
    cardRing: "#D9A12B",
  },
};

export type FeedbackTone = "success" | "error" | "info";

export interface FeedbackMessage {
  kind: FeedbackTone;
  text: string;
}

export const FEEDBACK_TONE_STYLES: Record<
  FeedbackTone,
  { bg: string; border: string; text: string }
> = {
  success: {
    bg: "#F1E6E8",
    border: "rgba(107, 29, 47, 0.25)",
    text: "#2B141A",
  },
  error: {
    bg: "#F8EAE6",
    border: "rgba(166, 61, 42, 0.35)",
    text: "#A63D2A",
  },
  info: {
    bg: "#FAF7F0",
    border: "rgba(43, 20, 26, 0.15)",
    text: "#2B141A",
  },
};

export type GuideModuleKey = "commute" | "food" | "activities" | "livingHeritage";

export const GUIDE_MODULE_COLORS: Record<GuideModuleKey, string> = {
  commute: "#475569",
  food: "#C85A32",
  activities: "#0F766E",
  livingHeritage: "#D97706",
};
