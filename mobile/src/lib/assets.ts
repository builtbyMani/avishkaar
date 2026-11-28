import type { ImageProps } from "expo-image";

type MediaAssetSource = NonNullable<ImageProps["source"]>;

const LOCAL_PLACE_ASSETS: Record<string, number> = {
  "/images/places/anegundi.jpg": require("../../assets/places/anegundi.jpg"),
  "/images/places/bundi.jpg": require("../../assets/places/bundi.jpg"),
  "/images/places/channapatna.jpg": require("../../assets/places/channapatna.jpg"),
  "/images/places/chettinad.jpg": require("../../assets/places/chettinad.jpg"),
  "/images/places/chhau.jpg": require("../../assets/places/chhau.jpg"),
  "/images/places/dhanushkodi.jpg": require("../../assets/places/dhanushkodi.jpg"),
  "/images/places/dzukou.jpg": require("../../assets/places/dzukou.jpg"),
  "/images/places/gokarna.jpg": require("../../assets/places/gokarna.jpg"),
  "/images/places/gurez.jpg": require("../../assets/places/gurez.jpg"),
  "/images/places/kaas.jpg": require("../../assets/places/kaas.jpg"),
  "/images/places/kalpa.jpg": require("../../assets/places/kalpa.jpg"),
  "/images/places/kongthong.jpg": require("../../assets/places/kongthong.jpg"),
  "/images/places/kumbalangi.jpg": require("../../assets/places/kumbalangi.jpg"),
  "/images/places/majuli.jpg": require("../../assets/places/majuli.jpg"),
  "/images/places/nirona.jpg": require("../../assets/places/nirona.jpg"),
  "/images/places/pandavula-gutta.jpg": require("../../assets/places/pandavula-gutta.jpg"),
  "/images/places/patola.jpg": require("../../assets/places/patola.jpg"),
  "/images/places/turtuk.jpg": require("../../assets/places/turtuk.jpg"),
  "/images/places/warli.jpg": require("../../assets/places/warli.jpg"),
  "/images/places/ziro.jpg": require("../../assets/places/ziro.jpg"),
};

export const PRELOADER_ASSET_SOURCES: MediaAssetSource[] = [
  require("../../assets/preloader/place-1.jpg"),
  require("../../assets/preloader/place-2.jpg"),
  require("../../assets/preloader/place-3.jpg"),
  require("../../assets/preloader/place-4.jpg"),
  require("../../assets/preloader/place-5.jpg"),
  require("../../assets/preloader/place-6.jpg"),
];

export const DEFAULT_PLACE_FALLBACK_ASSET: MediaAssetSource =
  LOCAL_PLACE_ASSETS["/images/places/kalpa.jpg"];

export function resolveMediaUrl(url?: string, apiBaseUrl?: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("/uploads/") && apiBaseUrl) {
    return `${apiBaseUrl.replace(/\/$/, "")}${trimmed}`;
  }
  if (/^(https?:|file:|content:|ph:|data:)/i.test(trimmed)) {
    return trimmed;
  }
  return null;
}

/**
 * Resolves Next.js-style `/images/places/*.jpg` paths from Supabase/Seed rows
 * into bundled static assets, while passing remote HTTPS or device URIs cleanly.
 */
export function resolveMediaSource(url?: string, apiBaseUrl?: string): MediaAssetSource {
  if (!url) return DEFAULT_PLACE_FALLBACK_ASSET;
  const trimmed = url.trim();
  const bundled = LOCAL_PLACE_ASSETS[trimmed];
  if (bundled !== undefined) return bundled;
  const resolved = resolveMediaUrl(trimmed, apiBaseUrl);
  if (resolved) return { uri: resolved };
  return DEFAULT_PLACE_FALLBACK_ASSET;
}
