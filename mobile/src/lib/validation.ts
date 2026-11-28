import { PLACE_CATEGORIES, REGIONS } from "./domain";
import type { LocalVendor, MediaItem, PlaceCategory, SafetyAlert, StructuredCards } from "../types/domain";

export const MAX_TITLE_LEN = 120;
export const MAX_DESCRIPTION_LEN = 4000;
export const MAX_MEDIA_ITEMS = 10;
export const MAX_VENDORS = 10;
export const MAX_SAFETY_ALERTS = 10;

const SAFETY_TAGS = ["Cultural Etiquette", "Avoid After Dark", "Low Network", "Scam Alert"];

export interface PlaceInput {
  title?: string;
  region?: string;
  category?: PlaceCategory;
  rawDescription?: string;
  lat?: unknown;
  lng?: unknown;
  media?: MediaItem[];
  structuredCards?: StructuredCards;
  localVendors?: LocalVendor[];
  safetyAlerts?: SafetyAlert[];
}

export type ValidationResult =
  | { ok: true; lat: number; lng: number; category: PlaceCategory; region: string }
  | { ok: false; error: string };

function isValidMediaUrl(url: unknown): boolean {
  if (typeof url !== "string" || url.length === 0 || url.length > 2048) return false;
  if (url.startsWith("/uploads/") || url.startsWith("/images/")) return true;
  if (url.startsWith("file://") || url.startsWith("content://") || url.startsWith("ph://")) return true;
  try {
    const u = new URL(url);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

export function validatePlaceInput(body: PlaceInput): ValidationResult {
  if (!body.title?.trim() || body.title.trim().length < 3 || body.title.trim().length > MAX_TITLE_LEN) {
    return { ok: false, error: `Title is required (3-${MAX_TITLE_LEN} chars).` };
  }
  if (!body.region || !(REGIONS as readonly string[]).includes(body.region)) {
    return { ok: false, error: `Region must be one of: ${REGIONS.join(", ")}.` };
  }
  const category = body.category || "Hidden Village";
  if (!(PLACE_CATEGORIES as readonly string[]).includes(category)) {
    return { ok: false, error: `Category must be one of: ${PLACE_CATEGORIES.join(", ")}.` };
  }
  if (!body.rawDescription?.trim() || body.rawDescription.trim().length > MAX_DESCRIPTION_LEN) {
    return { ok: false, error: `Field notes are required (max ${MAX_DESCRIPTION_LEN} chars).` };
  }
  const lat = typeof body.lat === "number" ? body.lat : Number(body.lat);
  const lng = typeof body.lng === "number" ? body.lng : Number(body.lng);
  if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
    return { ok: false, error: "Latitude is required and must be between -90 and 90." };
  }
  if (!Number.isFinite(lng) || lng < -180 || lng > 180) {
    return { ok: false, error: "Longitude is required and must be between -180 and 180." };
  }
  if (body.media !== undefined) {
    if (!Array.isArray(body.media) || body.media.length > MAX_MEDIA_ITEMS) {
      return { ok: false, error: `Media must be an array of at most ${MAX_MEDIA_ITEMS} items.` };
    }
    for (const m of body.media) {
      if ((m.type !== "image" && m.type !== "video") || !isValidMediaUrl(m.url)) {
        return { ok: false, error: "Each media item needs a valid photo or video URL." };
      }
    }
  }
  if (body.localVendors !== undefined) {
    if (!Array.isArray(body.localVendors) || body.localVendors.length > MAX_VENDORS) {
      return { ok: false, error: `localVendors must be an array of at most ${MAX_VENDORS} items.` };
    }
    for (const v of body.localVendors) {
      if (!v.name?.trim() || v.name.length > 120 || (v.specialty ?? "").length > 200 || (v.contact ?? "").length > 200) {
        return { ok: false, error: "Each vendor needs a name (max 120 chars)." };
      }
      if (!Number.isFinite(v.lat) || v.lat < -90 || v.lat > 90 || !Number.isFinite(v.lng) || v.lng < -180 || v.lng > 180) {
        return { ok: false, error: "Each vendor needs valid coordinates." };
      }
    }
  }
  if (body.safetyAlerts !== undefined) {
    if (!Array.isArray(body.safetyAlerts) || body.safetyAlerts.length > MAX_SAFETY_ALERTS) {
      return { ok: false, error: `safetyAlerts must be an array of at most ${MAX_SAFETY_ALERTS} items.` };
    }
    for (const a of body.safetyAlerts) {
      if (!SAFETY_TAGS.includes(a.tag) || !a.message?.trim() || a.message.length > 300) {
        return { ok: false, error: "Each safety alert needs a valid tag and message." };
      }
    }
  }
  return { ok: true, lat, lng, category, region: body.region };
}
