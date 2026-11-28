import { Image } from "expo-image";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, useWindowDimensions, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { scheduleOnRN } from "react-native-worklets";
import { PRELOADER_ASSET_SOURCES } from "../lib/assets";
import { EASE_OUT_EXPO, UI_SPRING, useReducedMotion } from "../theme/motion";
import { COLORS, FONTS } from "../theme/tokens";
import { AvishkaarLogo } from "./AvishkaarLogo";

const WORD_LEFT = "AVISH";
const WORD_RIGHT = "KAAR";
const CYCLE_MS = 180;
const MIN_MS = 1650;
const MAX_MS = 3200;

function LetterReveal({ char, index }: { char: string; index: number }) {
  const translateY = useSharedValue(64);
  const opacity = useSharedValue(0);

  useEffect(() => {
    const delay = 42 * index;
    translateY.value = withDelay(
      delay,
      withTiming(0, { duration: 600, easing: EASE_OUT_EXPO }),
    );
    opacity.value = withDelay(delay, withTiming(1, { duration: 380, easing: EASE_OUT_EXPO }));
  }, [index, opacity, translateY]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <View style={styles.letterMask}>
      <Animated.Text style={[styles.wordmarkLetter, style]}>{char}</Animated.Text>
    </View>
  );
}

export function Preloader({
  visible,
  onDone,
}: {
  visible: boolean;
  onDone: () => void;
}) {
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  const { width, height } = useWindowDimensions();

  const [imgIndex, setImgIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const finishingRef = useRef(false);
  const pillRectRef = useRef<{ x: number; y: number; w: number; h: number } | null>(null);

  const curtainOpacity = useSharedValue(1);
  const wordmarkOpacity = useSharedValue(1);
  const barProgress = useSharedValue(0);
  const slotScaleY = useSharedValue(0.04);
  const pillTranslateX = useSharedValue(0);
  const pillTranslateY = useSharedValue(0);
  const pillScale = useSharedValue(1);
  const pillOpacity = useSharedValue(1);

  useEffect(() => {
    if (!visible) return;
    finishingRef.current = false;
    curtainOpacity.value = 1;
    wordmarkOpacity.value = 1;
    barProgress.value = 0;
    slotScaleY.value = 0.04;
    pillTranslateX.value = 0;
    pillTranslateY.value = 0;
    pillScale.value = 1;
    pillOpacity.value = 1;
    setProgress(0);

    if (reduced) {
      onDone();
      return;
    }

    slotScaleY.value = withDelay(220, withSpring(1, UI_SPRING));

    const cycleTimer = setInterval(() => {
      setImgIndex((i) => (i + 1) % PRELOADER_ASSET_SOURCES.length);
    }, CYCLE_MS);

    const start = Date.now();
    // 110ms cadence keeps React renders light while smooth Reanimated bar interpolates at 60/120fps
    const progTimer = setInterval(() => {
      const elapsed = Date.now() - start;
      const ratio = Math.min(elapsed / MIN_MS, 1);
      const next = ratio >= 1 ? 100 : Math.min(96, Math.floor(ratio * 100));
      setProgress(next);
      barProgress.value = withTiming(ratio >= 1 ? 1 : ratio, { duration: 120 });

      if ((ratio >= 1 || elapsed >= MAX_MS) && !finishingRef.current) {
        finishingRef.current = true;
        clearInterval(progTimer);
        clearInterval(cycleTimer);
        setProgress(100);
        barProgress.value = withTiming(1, { duration: 120 });

        // Compute exact top-left destination matching LandingScreen header (left: 20, top: insets.top + 14)
        const measured = pillRectRef.current;
        const originCenterX = measured ? measured.x + measured.w / 2 : width / 2;
        const originCenterY = measured ? measured.y + measured.h / 2 : height / 2 - 34;
        const targetCenterX = 20 + 62;
        const targetCenterY = insets.top + 14 + 16;

        wordmarkOpacity.value = withTiming(0, { duration: 220, easing: EASE_OUT_EXPO });
        pillTranslateX.value = withSpring(targetCenterX - originCenterX, {
          damping: 24,
          stiffness: 230,
          mass: 0.85,
        });
        pillTranslateY.value = withSpring(targetCenterY - originCenterY, {
          damping: 24,
          stiffness: 230,
          mass: 0.85,
        });
        pillScale.value = withTiming(0.94, { duration: 420, easing: EASE_OUT_EXPO });

        // Curtain fades separately so the floating brand pill stays solid during flight and hands off seamlessly
        curtainOpacity.value = withDelay(
          160,
          withTiming(0, { duration: 420, easing: EASE_OUT_EXPO }),
        );
        pillOpacity.value = withDelay(
          440,
          withTiming(0, { duration: 180, easing: EASE_OUT_EXPO }, (finished) => {
            "worklet";
            if (finished) {
              scheduleOnRN(onDone);
            }
          }),
        );
      }
    }, 110);

    return () => {
      clearInterval(cycleTimer);
      clearInterval(progTimer);
    };
  }, [
    barProgress,
    curtainOpacity,
    height,
    insets.top,
    onDone,
    pillOpacity,
    pillScale,
    pillTranslateX,
    pillTranslateY,
    reduced,
    slotScaleY,
    visible,
    width,
    wordmarkOpacity,
  ]);

  const curtainStyle = useAnimatedStyle(() => ({
    opacity: curtainOpacity.value,
  }));

  const wordmarkFadeStyle = useAnimatedStyle(() => ({
    opacity: wordmarkOpacity.value,
  }));

  const pillStyle = useAnimatedStyle(() => ({
    opacity: pillOpacity.value,
    transform: [
      { translateX: pillTranslateX.value },
      { translateY: pillTranslateY.value },
      { scale: pillScale.value },
    ],
  }));

  const slotStyle = useAnimatedStyle(() => ({
    transform: [{ scaleY: slotScaleY.value }],
  }));

  const progressFillStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: barProgress.value }],
  }));

  if (!visible || reduced) return null;

  return (
    <View style={styles.root} pointerEvents="auto">
      {/* Dark Wine-Ink Curtain */}
      <Animated.View style={[styles.curtainBg, curtainStyle]} />

      <View
        style={[
          styles.inner,
          { paddingTop: insets.top + 16, paddingBottom: Math.max(insets.bottom, 20) + 12 },
        ]}
      >
        <View style={styles.center}>
          {/* Floating Brand Pill that hands off independently of curtain opacity */}
          <Animated.View
            onLayout={(e) => {
              const { x, y, width: w, height: h } = e.nativeEvent.layout;
              pillRectRef.current = { x, y, w, h };
            }}
            style={[styles.brandPill, pillStyle]}
          >
            <AvishkaarLogo size={22} />
            <Text style={styles.brandPillText}>Avishkaar</Text>
          </Animated.View>

          <Animated.View style={[styles.wordmarkRow, wordmarkFadeStyle]}>
            <View style={styles.lettersGroup}>
              {WORD_LEFT.split("").map((ch, idx) => (
                <LetterReveal key={`l-${idx}`} char={ch} index={idx} />
              ))}
            </View>

            <Animated.View style={[styles.photoSlot, slotStyle]}>
              <Image
                source={PRELOADER_ASSET_SOURCES[imgIndex]}
                style={styles.photoSlotImg}
                contentFit="cover"
                transition={80}
              />
            </Animated.View>

            <View style={styles.lettersGroup}>
              {WORD_RIGHT.split("").map((ch, idx) => (
                <LetterReveal key={`r-${idx}`} char={ch} index={WORD_LEFT.length + idx} />
              ))}
            </View>
          </Animated.View>
        </View>

        <Animated.View style={[styles.bottomWrap, wordmarkFadeStyle]}>
          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressFill, progressFillStyle]} />
          </View>
          <View style={styles.bottomBar}>
            <Text style={styles.bottomLabel}>( LOADING )</Text>
            <Text style={styles.bottomPercent}>{String(progress).padStart(2, "0")}%</Text>
          </View>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 1000,
  },
  curtainBg: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: COLORS.ink,
  },
  inner: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 22,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
  },
  brandPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: COLORS.parchment,
    borderRadius: 999,
    paddingHorizontal: 15,
    paddingVertical: 7,
    zIndex: 10,
  },
  brandPillText: {
    fontFamily: FONTS.display,
    fontSize: 18,
    color: COLORS.ink,
    letterSpacing: -0.3,
  },
  wordmarkRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  lettersGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  letterMask: {
    overflow: "hidden",
  },
  wordmarkLetter: {
    fontFamily: FONTS.preloader,
    fontSize: 34,
    lineHeight: 40,
    letterSpacing: -0.8,
    color: COLORS.parchment,
    textTransform: "uppercase",
  },
  photoSlot: {
    width: 24,
    height: 32,
    marginHorizontal: 5,
    borderRadius: 3,
    overflow: "hidden",
    backgroundColor: COLORS.wine,
  },
  photoSlotImg: {
    width: "100%",
    height: "100%",
  },
  bottomWrap: {
    gap: 10,
  },
  progressTrack: {
    height: 2,
    width: "100%",
    backgroundColor: "rgba(245, 240, 230, 0.16)",
    borderRadius: 99,
    overflow: "hidden",
  },
  progressFill: {
    height: 2,
    width: "100%",
    backgroundColor: COLORS.turmeric,
    transformOrigin: "0% 50%",
  },
  bottomBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  bottomLabel: {
    fontSize: 11,
    letterSpacing: 1.8,
    color: "rgba(245, 240, 230, 0.8)",
    fontWeight: "600",
  },
  bottomPercent: {
    fontSize: 14,
    letterSpacing: 1,
    color: COLORS.parchment,
    fontVariant: ["tabular-nums"],
    fontWeight: "700",
  },
});
