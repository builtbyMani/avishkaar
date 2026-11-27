"use client";

import { useEffect, useRef, useState } from "react";

const MIN_MS = 1800; // minimum time the loader stays up
const MAX_MS = 4000; // failsafe — never trap the user

export function usePreloadProgress(images: string[], active: boolean): number {
  const [progress, setProgress] = useState(0);
  const loadedRef = useRef(0);
  const startRef = useRef(0);

  useEffect(() => {
    if (!active) return;
    loadedRef.current = 0;
    startRef.current = performance.now();
    let raf = 0;
    let cancelled = false;

    // Preload every image; count completions (errors count too — never hang)
    images.forEach((src) => {
      const img = new Image();
      img.onload = img.onerror = () => {
        loadedRef.current += 1;
      };
      img.src = src;
    });

    const tick = () => {
      if (cancelled) return;
      const elapsed = performance.now() - startRef.current;
      const timePart = Math.min(elapsed / MIN_MS, 1);
      const assetPart = images.length ? loadedRef.current / images.length : 1;
      const ready = assetPart >= 1 && elapsed >= MIN_MS;
      const target = ready ? 100 : Math.min(timePart, assetPart) * 90;

      setProgress((p) => {
        const next = p + (target - p) * 0.12;
        return ready && next > 99 ? 100 : Math.floor(next);
      });

      if (elapsed > MAX_MS) {
        setProgress(100);
        return;
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [images, active]);

  return progress;
}
