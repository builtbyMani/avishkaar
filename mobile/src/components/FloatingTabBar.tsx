import type { Tabs } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Keyboard, Platform, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { EASE_OUT_EXPO, TACTILE_SPRING, TactilePressable } from "../theme/motion";
import { COLORS } from "../theme/tokens";
import { useApp } from "./AppProvider";
import { BookmarkCheck, Compass, PlusCircle, User } from "./Icons";

type TabBarProps = Parameters<NonNullable<React.ComponentProps<typeof Tabs>["tabBar"]>>[0];

const TAB_CONFIG = [
  { name: "index", label: "Explore", Icon: Compass },
  { name: "submit", label: "Post", Icon: PlusCircle },
  { name: "offline", label: "Saved", Icon: BookmarkCheck },
  { name: "profile", label: "Profile", Icon: User },
] as const;

export function FloatingTabBar({ state, emitter, navigateToTab }: TabBarProps) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { offlineCards } = useApp();
  const [barWidth, setBarWidth] = useState(0);
  const [androidKeyboardOpen, setAndroidKeyboardOpen] = useState(false);
  const hasMeasuredRef = useRef(false);

  useEffect(() => {
    if (Platform.OS !== "android") return;
    const showSub = Keyboard.addListener("keyboardDidShow", () => setAndroidKeyboardOpen(true));
    const hideSub = Keyboard.addListener("keyboardDidHide", () => setAndroidKeyboardOpen(false));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const count = state.routes.length;
  const tabWidth = barWidth > 0 ? (barWidth - 12) / count : 0;
  const indicatorX = useSharedValue(0);
  const barVisibility = useSharedValue(1);

  useEffect(() => {
    if (tabWidth <= 0) return;
    const target = state.index * tabWidth;
    if (!hasMeasuredRef.current) {
      hasMeasuredRef.current = true;
      indicatorX.value = target;
    } else {
      indicatorX.value = withSpring(target, TACTILE_SPRING);
    }
  }, [indicatorX, state.index, tabWidth]);

  useEffect(() => {
    barVisibility.value = withTiming(androidKeyboardOpen ? 0 : 1, {
      duration: 180,
      easing: EASE_OUT_EXPO,
    });
  }, [androidKeyboardOpen, barVisibility]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
  }));

  const outerAnimStyle = useAnimatedStyle(() => ({
    opacity: barVisibility.value,
    maxHeight: androidKeyboardOpen ? 0 : 120,
    paddingTop: androidKeyboardOpen ? 0 : 8,
    paddingBottom: androidKeyboardOpen ? 0 : Math.max(insets.bottom, 10),
    borderTopWidth: androidKeyboardOpen ? 0 : 1,
    overflow: "hidden" as const,
  }));

  const isTablet = width >= 768;

  return (
    <Animated.View
      pointerEvents={androidKeyboardOpen ? "none" : "auto"}
      style={[styles.outer, outerAnimStyle]}
    >
      <View
        style={[styles.bar, isTablet && styles.barTablet]}
        onLayout={(e) => setBarWidth(e.nativeEvent.layout.width)}
      >
        {tabWidth > 0 && (
          <Animated.View
            pointerEvents="none"
            style={[styles.activePill, { width: tabWidth }, indicatorStyle]}
          />
        )}

        {state.routes.map((route, idx) => {
          const cfg = TAB_CONFIG.find((c) => c.name === route.name) ?? TAB_CONFIG[0];
          const Icon = cfg.Icon;
          const active = state.index === idx;
          const badge = route.name === "offline" && offlineCards.length > 0 ? offlineCards.length : null;

          return (
            <TactilePressable
              key={route.key}
              haptic="selection"
              scaleTo={0.95}
              onPress={() => {
                const event = emitter.emit({
                  type: "tabPress",
                  target: route.key,
                  canPreventDefault: true,
                });
                if (!active && !event.defaultPrevented) {
                  navigateToTab(route.key);
                }
              }}
              style={styles.tabItem}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              accessibilityLabel={cfg.label}
            >
              <View style={styles.iconBox}>
                <Icon
                  size={19}
                  color={active ? COLORS.parchment : COLORS.ink}
                  strokeWidth={active ? 2 : 1.65}
                />
                {badge !== null && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{badge}</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
                {cfg.label}
              </Text>
            </TactilePressable>
          );
        })}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  outer: {
    backgroundColor: COLORS.parchment,
    borderTopColor: COLORS.border,
    paddingHorizontal: 14,
  },
  bar: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
    padding: 6,
  },
  barTablet: {
    width: "100%",
    maxWidth: 520,
    alignSelf: "center",
  },
  activePill: {
    position: "absolute",
    left: 6,
    top: 6,
    bottom: 6,
    borderRadius: 13,
    backgroundColor: COLORS.wine,
  },
  tabItem: {
    flex: 1,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    zIndex: 2,
  },
  iconBox: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.ink,
  },
  tabLabelActive: {
    color: COLORS.parchment,
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -11,
    minWidth: 16,
    height: 16,
    borderRadius: 99,
    backgroundColor: COLORS.turmeric,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: "800",
    color: COLORS.ink,
  },
});
