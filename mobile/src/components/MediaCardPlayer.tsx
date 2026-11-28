import { Image } from "expo-image";
import * as Linking from "expo-linking";
import { useVideoPlayer, VideoView } from "expo-video";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { WebView } from "react-native-webview";
import {
  DEFAULT_PLACE_FALLBACK_ASSET,
  resolveMediaSource,
  resolveMediaUrl,
} from "../lib/assets";
import { extractYouTubeEmbedId } from "../lib/domain";
import { getApiBaseUrl } from "../lib/supabase";
import { TactilePressable } from "../theme/motion";
import { COLORS } from "../theme/tokens";
import type { MediaItem } from "../types/domain";
import { Film, PauseIcon, PlayIcon, Volume2, VolumeX, Youtube } from "./Icons";

function getAspectRatio(aspect?: MediaItem["aspect"], compact?: boolean): number {
  if (!compact && !aspect) return 16 / 10;
  if (aspect === "portrait") return 3 / 4;
  if (aspect === "square") return 1;
  return 4 / 3;
}

function NativeVideoCard({
  url,
  thumbnail,
  caption,
  durationSec,
  aspectRatio,
  active,
  apiBase,
}: {
  url: string;
  thumbnail?: string;
  caption?: string;
  durationSec?: number;
  aspectRatio: number;
  active: boolean;
  apiBase?: string;
}) {
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [failed, setFailed] = useState(false);
  const [hasRenderedFrame, setHasRenderedFrame] = useState(false);

  const resolvedVideoUrl = resolveMediaUrl(url, apiBase) ?? url;
  const posterSource = thumbnail
    ? resolveMediaSource(thumbnail, apiBase)
    : DEFAULT_PLACE_FALLBACK_ASSET;

  useEffect(() => {
    setFailed(false);
    setPlaying(false);
    setHasRenderedFrame(false);
  }, [resolvedVideoUrl]);

  const player = useVideoPlayer(resolvedVideoUrl, (p) => {
    p.loop = true;
    p.muted = true;
  });

  useEffect(() => {
    const sub = player.addListener("statusChange", ({ status }) => {
      if (status === "error") {
        setFailed(true);
        setPlaying(false);
      } else if (status === "readyToPlay") {
        setHasRenderedFrame(true);
      }
    });
    return () => sub.remove();
  }, [player]);

  useEffect(() => {
    try {
      player.muted = muted;
    } catch {
      // Ignore player unmount race
    }
  }, [muted, player]);

  useEffect(() => {
    if (!active && playing) {
      try {
        player.pause();
      } catch {
        // Ignore
      }
      setPlaying(false);
    }
  }, [active, player, playing]);

  const togglePlay = () => {
    if (failed) return;
    try {
      if (playing) {
        player.pause();
        setPlaying(false);
      } else {
        player.play();
        setPlaying(true);
      }
    } catch {
      setFailed(true);
    }
  };

  if (failed) {
    return (
      <View style={[styles.frame, { aspectRatio }]}>
        <Image source={posterSource} style={styles.mediaFill} contentFit="cover" />
        <View style={styles.overlayTop}>
          <View style={styles.topLeftBadge}>
            <Film size={12} color={COLORS.turmeric} />
            <Text style={styles.badgeText} numberOfLines={1}>
              {caption || "Short Clip"}
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.frame, styles.videoFrame, { aspectRatio }]}>
      <VideoView
        player={player}
        style={styles.mediaFill}
        contentFit="cover"
        nativeControls={false}
        onFirstFrameRender={() => setHasRenderedFrame(true)}
      />

      {(!hasRenderedFrame || !playing) && (
        <Image
          source={posterSource}
          style={[StyleSheet.absoluteFill, { opacity: playing && hasRenderedFrame ? 0 : 1 }]}
          contentFit="cover"
          pointerEvents="none"
        />
      )}

      <View style={styles.overlayTop}>
        <View style={styles.topLeftBadge}>
          <Film size={12} color={COLORS.turmeric} />
          <Text style={styles.badgeText}>
            {playing ? "Playing" : "Tap Clip"}
            {durationSec ? ` · 0:${String(durationSec).padStart(2, "0")}` : ""}
          </Text>
        </View>

        <View style={styles.videoControls}>
          <TactilePressable
            onPress={togglePlay}
            style={styles.circleControl}
            accessibilityLabel={playing ? "Pause clip" : "Play clip"}
          >
            {playing ? <PauseIcon size={13} color="#FFFFFF" /> : <PlayIcon size={13} color="#FFFFFF" />}
          </TactilePressable>

          <TactilePressable
            onPress={() => setMuted((m) => !m)}
            style={styles.circleControl}
            accessibilityLabel={muted ? "Unmute clip" : "Mute clip"}
          >
            {muted ? <VolumeX size={13} color="#FFFFFF" /> : <Volume2 size={13} color="#FFFFFF" />}
          </TactilePressable>
        </View>
      </View>
    </View>
  );
}

export function MediaCardPlayer({
  media,
  title,
  compact = false,
  isFocused = true,
}: {
  media?: MediaItem;
  title: string;
  compact?: boolean;
  isFocused?: boolean;
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const [ytFailed, setYtFailed] = useState(false);

  useEffect(() => {
    setImgFailed(false);
    setYtFailed(false);
  }, [media?.url]);

  const aspectRatio = getAspectRatio(media?.aspect, compact);
  const apiBase = getApiBaseUrl();

  if (!media) {
    return (
      <View style={[styles.frame, { aspectRatio }]}>
        <Image source={DEFAULT_PLACE_FALLBACK_ASSET} style={styles.mediaFill} contentFit="cover" />
      </View>
    );
  }

  const youtubeId = extractYouTubeEmbedId(media.url);
  if (youtubeId) {
    // In compact masonry grids, render lightweight poster preview so scrolling stays 60/120fps
    if (compact) {
      return (
        <View style={[styles.frame, styles.videoFrame, { aspectRatio }]}>
          <Image
            source={
              imgFailed
                ? DEFAULT_PLACE_FALLBACK_ASSET
                : { uri: `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg` }
            }
            style={styles.mediaFill}
            contentFit="cover"
            transition={180}
            onError={() => setImgFailed(true)}
          />
          <View style={styles.ytBadge} pointerEvents="none">
            <Youtube size={12} color="#FFFFFF" />
            <Text style={styles.badgeText}>YouTube Short</Text>
          </View>
          <View style={styles.centerPlayBadge} pointerEvents="none">
            <PlayIcon size={18} color="#FFFFFF" />
          </View>
        </View>
      );
    }

    return (
      <View style={[styles.frame, styles.videoFrame, { aspectRatio }]}>
        {!ytFailed ? (
          <WebView
            source={{
              uri: `https://www.youtube.com/embed/${youtubeId}?rel=0&playsinline=1&modestbranding=1`,
            }}
            style={styles.mediaFill}
            allowsInlineMediaPlayback
            allowsFullscreenVideo
            mediaPlaybackRequiresUserAction={false}
            javaScriptEnabled
            onError={() => setYtFailed(true)}
          />
        ) : (
          <TactilePressable
            onPress={() => void Linking.openURL(media.url)}
            style={styles.ytFallback}
          >
            <Youtube size={28} color="#FFFFFF" />
            <Text style={styles.ytFallbackText}>Open YouTube Short: {media.caption || title}</Text>
          </TactilePressable>
        )}
        <View style={styles.ytBadge} pointerEvents="none">
          <Youtube size={12} color="#FFFFFF" />
          <Text style={styles.badgeText}>YouTube Short</Text>
        </View>
      </View>
    );
  }

  if (media.type === "video") {
    return (
      <NativeVideoCard
        url={media.url}
        thumbnail={media.thumbnail}
        caption={media.caption}
        durationSec={media.durationSec}
        aspectRatio={aspectRatio}
        active={isFocused}
        apiBase={apiBase}
      />
    );
  }

  const imageSource = imgFailed
    ? DEFAULT_PLACE_FALLBACK_ASSET
    : resolveMediaSource(media.url, apiBase);

  return (
    <View style={[styles.frame, { aspectRatio }]}>
      <Image
        source={imageSource}
        style={styles.mediaFill}
        contentFit="cover"
        transition={200}
        cachePolicy="memory-disk"
        onError={() => setImgFailed(true)}
        accessibilityLabel={media.caption || title}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    width: "100%",
    overflow: "hidden",
    backgroundColor: COLORS.well,
    position: "relative",
  },
  videoFrame: {
    backgroundColor: "#1C1917",
  },
  mediaFill: {
    width: "100%",
    height: "100%",
  },
  overlayTop: {
    position: "absolute",
    top: 8,
    left: 8,
    right: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
  },
  topLeftBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(43, 20, 26, 0.90)",
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 4,
    maxWidth: "70%",
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.parchment,
  },
  videoControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  circleControl: {
    width: 28,
    height: 28,
    borderRadius: 99,
    backgroundColor: "rgba(0,0,0,0.68)",
    alignItems: "center",
    justifyContent: "center",
  },
  ytBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(12, 10, 9, 0.90)",
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  centerPlayBadge: {
    position: "absolute",
    alignSelf: "center",
    top: "42%",
    width: 44,
    height: 44,
    borderRadius: 99,
    backgroundColor: "rgba(43, 20, 26, 0.85)",
    alignItems: "center",
    justifyContent: "center",
  },
  ytFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    gap: 8,
  },
  ytFallbackText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
    textAlign: "center",
  },
});
