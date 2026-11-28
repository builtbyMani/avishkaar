import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, useWindowDimensions, View } from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { scheduleOnRN } from "react-native-worklets";
import { EASE_OUT_EXPO, TactilePressable, UI_SPRING, useReducedMotion } from "../theme/motion";
import { COLORS, FONTS } from "../theme/tokens";
import { useApp } from "./AppProvider";
import { AvishkaarLogo } from "./AvishkaarLogo";
import { ArrowRight } from "./Icons";
import { MemojiAvatar } from "./MemojiAvatar";
import { SunsetMeadowScene } from "./SunsetMeadowScene";

export function LandingScreen({ visible }: { visible: boolean }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const compact = height < 720;
  const isTablet = width >= 768;
  const reduced = useReducedMotion();
  const { activeUser, enterHome, openAuthModal, preloaderDone } = useApp();

  const [mounted, setMounted] = useState(visible);

  const layerProgress = useSharedValue(visible ? 1 : 0);
  const copyTranslateY = useSharedValue(reduced ? 0 : 18);
  const copyOpacity = useSharedValue(reduced ? 1 : 0);
  const sceneOpacity = useSharedValue(reduced ? 1 : 0);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      layerProgress.value = reduced
        ? 1
        : withTiming(1, { duration: 280, easing: EASE_OUT_EXPO });
    } else if (mounted) {
      if (reduced) {
        layerProgress.value = 0;
        setMounted(false);
      } else {
        layerProgress.value = withTiming(
          0,
          { duration: 360, easing: EASE_OUT_EXPO },
          (finished) => {
            "worklet";
            if (finished) {
              scheduleOnRN(setMounted, false);
            }
          },
        );
      }
    }
  }, [layerProgress, mounted, reduced, visible]);

  useEffect(() => {
    if (!visible) return;
    if (reduced) {
      copyOpacity.value = 1;
      copyTranslateY.value = 0;
      sceneOpacity.value = 1;
      return;
    }
    if (!preloaderDone) return;
    copyOpacity.value = withDelay(40, withTiming(1, { duration: 380, easing: EASE_OUT_EXPO }));
    copyTranslateY.value = withDelay(40, withSpring(0, UI_SPRING));
    sceneOpacity.value = withDelay(90, withTiming(1, { duration: 440, easing: EASE_OUT_EXPO }));
  }, [copyOpacity, copyTranslateY, preloaderDone, reduced, sceneOpacity, visible]);

  const containerAnimStyle = useAnimatedStyle(() => ({
    opacity: layerProgress.value,
    transform: [
      { translateY: interpolate(layerProgress.value, [0, 1], [-24, 0]) },
      { scale: interpolate(layerProgress.value, [0, 1], [0.985, 1]) },
    ],
  }));

  const copyStyle = useAnimatedStyle(() => ({
    opacity: copyOpacity.value,
    transform: [{ translateY: copyTranslateY.value }],
  }));

  const sceneStyle = useAnimatedStyle(() => ({
    opacity: sceneOpacity.value,
    transform: [{ translateY: interpolate(layerProgress.value, [0, 1], [36, 0]) }],
  }));

  if (!mounted) return null;

  const navigateAndEnter = (href: "/(tabs)" | "/(tabs)/submit" | "/(tabs)/offline" | "/(tabs)/profile") => {
    enterHome();
    router.navigate(href);
  };

  return (
    <Animated.View
      pointerEvents={visible ? "auto" : "none"}
      style={[
        styles.container,
        { paddingTop: insets.top + 8 },
        containerAnimStyle,
      ]}
    >
      {/* Absolute Sunset Meadow Horizon matching CSS .hero-64 .scene */}
      <Animated.View
        style={[
          styles.sceneWrap,
          { height: compact ? "42%" : "48%" },
          sceneStyle,
        ]}
      >
        <SunsetMeadowScene />
      </Animated.View>

      {/* Top Hero Header */}
      <View style={styles.nav}>
        <TactilePressable
          onPress={() => navigateAndEnter("/(tabs)")}
          style={styles.brandRow}
          accessibilityLabel="Avishkaar Home"
        >
          <AvishkaarLogo size={24} />
          <Text style={styles.brandWordmark}>Avishkaar</Text>
        </TactilePressable>

        {isTablet && (
          <View style={styles.tabletLinks}>
            <TactilePressable onPress={() => navigateAndEnter("/(tabs)")}>
              <Text style={[styles.tabletLinkText, styles.tabletLinkActive]}>Discover</Text>
            </TactilePressable>
            <TactilePressable onPress={() => navigateAndEnter("/(tabs)/submit")}>
              <Text style={styles.tabletLinkText}>Post Gem</Text>
            </TactilePressable>
            <TactilePressable onPress={() => navigateAndEnter("/(tabs)/offline")}>
              <Text style={styles.tabletLinkText}>Saved</Text>
            </TactilePressable>
            <TactilePressable onPress={() => navigateAndEnter("/(tabs)/profile")}>
              <Text style={styles.tabletLinkText}>Profile</Text>
            </TactilePressable>
          </View>
        )}

        <TactilePressable
          onPress={openAuthModal}
          style={styles.authBtn}
          accessibilityLabel="Account"
        >
          {activeUser ? (
            <MemojiAvatar id={activeUser.id} name={activeUser.displayName} size={22} />
          ) : null}
          <Text style={styles.authBtnText} numberOfLines={1}>
            {activeUser ? activeUser.displayName.split(" ")[0] : "Sign In"}
          </Text>
        </TactilePressable>
      </View>

      {/* Center Editorial Copy floating cleanly above meadow fade */}
      <Animated.View
        style={[
          styles.copy,
          compact && { paddingTop: 14, gap: 10 },
          copyStyle,
        ]}
      >
        <Text
          style={[
            styles.headline,
            compact && { fontSize: 36, lineHeight: 40 },
            isTablet && { fontSize: 56, lineHeight: 60 },
          ]}
        >
          Places <Text style={styles.headlineAccent}>off the</Text> beaten path.
        </Text>

        <Text style={[styles.lead, compact && { fontSize: 15, lineHeight: 21 }]}>
          Community-verified villages, regional kitchens, and living heritage — ranked by Hidden Gem Score, never tourist traps.
        </Text>

        <TactilePressable
          onPress={enterHome}
          haptic="medium"
          style={styles.ctaBtn}
          accessibilityLabel="Explore Gems"
        >
          <Text style={styles.ctaText}>Explore Gems</Text>
          <ArrowRight size={16} color={COLORS.parchment} strokeWidth={2.1} />
        </TactilePressable>

        <Text style={[styles.hindiLine, compact && { fontSize: 23, lineHeight: 28 }]}>
          आओ कभी हवेली पे
        </Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 400,
    backgroundColor: COLORS.parchment,
  },
  nav: {
    zIndex: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 6,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  brandWordmark: {
    fontFamily: FONTS.display,
    fontSize: 23,
    color: COLORS.ink,
    letterSpacing: -0.4,
  },
  tabletLinks: {
    flexDirection: "row",
    alignItems: "center",
    gap: 24,
  },
  tabletLinkText: {
    fontSize: 14,
    color: COLORS.muted,
    fontWeight: "500",
  },
  tabletLinkActive: {
    color: COLORS.ink,
    fontWeight: "600",
  },
  authBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: COLORS.wine,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  authBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.parchment,
    maxWidth: 110,
  },
  copy: {
    zIndex: 8,
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 32,
    gap: 14,
  },
  headline: {
    fontFamily: FONTS.display,
    fontSize: 44,
    lineHeight: 48,
    letterSpacing: -0.9,
    color: COLORS.ink,
    textAlign: "center",
  },
  headlineAccent: {
    fontFamily: FONTS.displayItalic,
    color: COLORS.wine,
  },
  lead: {
    fontFamily: FONTS.rozha,
    fontSize: 17,
    lineHeight: 24,
    color: COLORS.ink,
    textAlign: "center",
    maxWidth: 360,
  },
  ctaBtn: {
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: COLORS.wine,
    borderRadius: 999,
    paddingVertical: 13,
    paddingHorizontal: 24,
  },
  ctaText: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.4,
    color: COLORS.parchment,
  },
  hindiLine: {
    marginTop: 4,
    fontFamily: FONTS.rozha,
    fontSize: 27,
    lineHeight: 34,
    color: COLORS.wine,
    letterSpacing: 0.3,
  },
  sceneWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
});
