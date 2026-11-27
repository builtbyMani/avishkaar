"use client";

import { useState } from "react";
import { Film, Volume2, VolumeX } from "lucide-react";
import type { MediaItem } from "@/types/domain";

const FALLBACK_SVG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 720" fill="none"><rect width="600" height="720" fill="#EAE2D6"/><path d="M0 540L160 360L290 480L430 300L600 500V720H0V540Z" fill="#1B3B36" fill-opacity="0.22"/><circle cx="450" cy="170" r="52" fill="#C85A32" fill-opacity="0.35"/></svg>`,
  );

export function MediaCardPlayer({
  media,
  title,
  compact = false,
}: {
  media: MediaItem;
  title: string;
  compact?: boolean;
}) {
  const [muted, setMuted] = useState(true);
  const [imgSrc, setImgSrc] = useState(
    media.type === "video" ? media.thumbnail || FALLBACK_SVG : media.url,
  );
  const [videoFailed, setVideoFailed] = useState(false);

  const aspectClass =
    media.aspect === "portrait"
      ? "aspect-[3/4]"
      : media.aspect === "square"
        ? "aspect-square"
        : "aspect-[4/3]";

  if (media.type === "video" && !videoFailed) {
    return (
      <div className={`relative w-full overflow-hidden bg-stone-900 ${compact ? aspectClass : "aspect-[9/12] max-h-[460px]"}`}>
        <video
          src={media.url}
          poster={media.thumbnail || FALLBACK_SVG}
          autoPlay
          loop
          muted={muted}
          playsInline
          onError={() => setVideoFailed(true)}
          className="h-full w-full object-cover"
        />
        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between p-2.5">
          <span className="inline-flex items-center gap-1 rounded-full bg-black/65 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-xs">
            <Film className="h-3 w-3 text-amber-300" />
            Short Clip {media.durationSec ? `· 0:${String(media.durationSec).padStart(2, "0")}` : ""}
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setMuted((m) => !m);
            }}
            className="pointer-events-auto rounded-full bg-black/65 p-1.5 text-white hover:bg-black/85"
            aria-label={muted ? "Unmute clip" : "Mute clip"}
          >
            {muted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full overflow-hidden bg-[#EAE2D6] ${compact ? aspectClass : "aspect-[16/10] max-h-[460px]"}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imgSrc}
        alt={media.caption || title}
        onError={() => setImgSrc(FALLBACK_SVG)}
        className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
      />
    </div>
  );
}
