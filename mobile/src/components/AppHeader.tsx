import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getTierDisplayLabel } from "../lib/domain";
import { TactilePressable } from "../theme/motion";
import { COLORS, FONTS } from "../theme/tokens";
import { useApp } from "./AppProvider";
import { AvishkaarLogo } from "./AvishkaarLogo";
import { BarChart3 } from "./Icons";
import { MemojiAvatar } from "./MemojiAvatar";

export function AppHeader({ title }: { title?: string }) {
  const insets = useSafeAreaInsets();
  const { activeUser, openAuthModal, openImpactModal, exitToLanding, scrollProgress } = useApp();

  const progressStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: Math.max(0, Math.min(1, scrollProgress.value)) }],
  }));

  return (
    <View style={[styles.wrap, { paddingTop: insets.top + 6 }]}>
      <View style={styles.row}>
        <TactilePressable
          onPress={exitToLanding}
          style={styles.brandBtn}
          accessibilityLabel="Return to Landing"
        >
          <AvishkaarLogo size={22} />
          <Text style={styles.brandText}>{title || "Avishkaar"}</Text>
        </TactilePressable>

        <View style={styles.rightRow}>
          {activeUser && (
            <Text style={styles.telemetryText} numberOfLines={1}>
              {getTierDisplayLabel(activeUser.tier)} · {activeUser.trailblazerScore} pts
            </Text>
          )}

          <TactilePressable
            onPress={openImpactModal}
            style={styles.iconPill}
            accessibilityLabel="Platform Impact & Architecture"
          >
            <BarChart3 size={16} color={COLORS.muted} strokeWidth={1.75} />
          </TactilePressable>

          <TactilePressable
            onPress={openAuthModal}
            style={styles.accountPill}
            accessibilityLabel="Account and Profiles"
          >
            <MemojiAvatar
              id={activeUser?.id}
              name={activeUser?.displayName || "Guest"}
              size={26}
            />
            <Text style={styles.accountName} numberOfLines={1}>
              {activeUser ? activeUser.displayName.split(" ")[0] : "Sign In"}
            </Text>
          </TactilePressable>
        </View>
      </View>

      {/* Hairline UI-thread scroll progress indicator */}
      <View style={styles.progressTrack}>
        <Animated.View style={[styles.progressFill, progressStyle]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: COLORS.parchment,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 10,
    gap: 8,
  },
  brandBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  brandText: {
    fontFamily: FONTS.display,
    fontSize: 22,
    color: COLORS.ink,
    letterSpacing: -0.4,
  },
  rightRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  telemetryText: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.muted,
    fontVariant: ["tabular-nums"],
    maxWidth: 118,
  },
  iconPill: {
    width: 34,
    height: 34,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  accountPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    paddingVertical: 4,
    paddingLeft: 5,
    paddingRight: 12,
  },
  accountName: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.ink,
    maxWidth: 84,
  },
  progressTrack: {
    height: 2,
    width: "100%",
    backgroundColor: "transparent",
    overflow: "hidden",
  },
  progressFill: {
    height: 2,
    width: "100%",
    backgroundColor: COLORS.terracotta,
    transformOrigin: "0% 50%",
  },
});
