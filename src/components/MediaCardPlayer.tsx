"use client";

import { useRef, useState } from "react";
import { Film, Play, Pause, Volume2, VolumeX, Youtube } from "lucide-react";
import type { MediaItem } from "@/types/domain";

const FALLBACK_SVG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 720" fill="none"><rect width="600" height="720" fill="#EAE2D6"/><path d="M0 540L160 360L290 480L430 300L600 500V720H0V540Z" fill="#1B3B36" fill-opacity="0.22"/><circle cx="450" cy="170" r="52" fill="#C85A32" fill-opacity="0.35"/></svg>`,
  );

export function extractYouTubeEmbedId(url: string): string | null {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");
    if (host === "youtu.be") {
      const id = parsed.pathname.slice(1).split("/")[0];
      return id || null;
    }
    if (host === "youtube.com" || host === "m.youtube.com") {
      if (parsed.pathname.startsWith("/shorts/")) {
        return parsed.pathname.split("/shorts/")[1]?.split("/")[0] || null;
      }
      if (parsed.pathname.startsWith("/embed/")) {
        return parsed.pathname.split("/embed/")[1]?.split("/")[0] || null;
      }
      const v = parsed.searchParams.get("v");
      return v || null;
    }
  } catch {
    return null;
  }
  return null;
}

export function MediaCardPlayer({
  media,
  title,
  compact = false,
}: {
  media: MediaItem;
  title: string;
  compact?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(false);
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

  const youtubeId = extractYouTubeEmbedId(media.url);
  if (youtubeId) {
    return (
      <div
        className={`relative w-full overflow-hidden bg-black ${
          compact ? aspectClass : "aspect-[9/12] max-h-[460px]"
        }`}
      >
        <iframe
          src={`https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1`}
          title={media.caption || title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="h-full w-full border-0"
        />
        <span className="pointer-events-none absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-red-600/90 px-2.5 py-1 text-[10px] font-bold text-white">
          <Youtube className="h-3 w-3" />
          YouTube Short
        </span>
      </div>
    );
  }

  function handleHoverStart() {
    if (!videoRef.current) return;
    videoRef.current
      .play()
      .then(() => setPlaying(true))
      .catch(() => setPlaying(false));
  }

  function handleHoverEnd() {
    if (!videoRef.current) return;
    videoRef.current.pause();
    setPlaying(false);
  }

  function handleTogglePlay(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current
        .play()
        .then(() => setPlaying(true))
        .catch(() => setPlaying(false));
    } else {
      videoRef.current.pause();
      setPlaying(false);
    }
  }

  if (media.type === "video" && !videoFailed) {
    return (
      <div
        onMouseEnter={handleHoverStart}
        onMouseLeave={handleHoverEnd}
        className={`relative w-full overflow-hidden bg-stone-900 ${
          compact ? aspectClass : "aspect-[9/12] max-h-[460px]"
        }`}
      >
        <video
          ref={videoRef}
          src={media.url}
          poster={media.thumbnail || FALLBACK_SVG}
          loop
          muted={muted}
          playsInline
          preload="metadata"
          onError={() => setVideoFailed(true)}
          className="h-full w-full object-cover"
        />
        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between p-2.5">
          <span className="inline-flex items-center gap-1 rounded-full bg-black/65 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-xs">
            <Film className="h-3 w-3 text-amber-300" />
            {playing ? "Playing" : "Hover Clip"}{" "}
            {media.durationSec ? `· 0:${String(media.durationSec).padStart(2, "0")}` : ""}
          </span>
          <div className="pointer-events-auto flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleTogglePlay}
              className="rounded-full bg-black/65 p-1.5 text-white hover:bg-black/85"
              aria-label={playing ? "Pause clip" : "Play clip"}
            >
              {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setMuted((m) => !m);
              }}
              className="rounded-full bg-black/65 p-1.5 text-white hover:bg-black/85"
              aria-label={muted ? "Unmute clip" : "Mute clip"}
            >
              {muted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative w-full overflow-hidden bg-[#EAE2D6] ${
        compact ? aspectClass : "aspect-[16/10] max-h-[460px]"
      }`}
    >
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
