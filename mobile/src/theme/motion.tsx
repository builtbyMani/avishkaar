import * as Haptics from "expo-haptics";
import React, { useEffect, useState } from "react";
import {
  AccessibilityInfo,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, {
  Easing,
  LinearTransition,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { COLORS } from "./tokens";

/**
 * Critically damped UI spring (Apple WWDC Fluid Interfaces: no overshoot on routine controls)
 */
export const UI_SPRING = {
  damping: 26,
  stiffness: 320,
  mass: 0.9,
} as const;

/**
 * Snappier tactile spring for tab pills, press release, and drawer snaps
 */
export const TACTILE_SPRING = {
  damping: 22,
  stiffness: 380,
  mass: 0.75,
} as const;

/**
 * Gentle momentum spring with subtle bounce for gesture releases & badge reveals
 */
export const GESTURE_SPRING = {
  damping: 18,
  stiffness: 240,
  mass: 0.95,
} as const;

export const EASE_OUT_EXPO = Easing.bezier(0.22, 1, 0.36, 1);
export const EASE_IN_OUT = Easing.bezier(0.77, 0, 0.175, 1);

export const LIST_LAYOUT_TRANSITION = LinearTransition.springify().damping(25).stiffness(280);

export function triggerHaptic(
  type: "light" | "medium" | "selection" | "success" | "warning" = "light",
) {
  try {
    if (type === "selection") {
      void Haptics.selectionAsync();
    } else if (type === "success") {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else if (type === "warning") {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } else if (type === "medium") {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  } catch {
    // Simulator / web safe no-op
  }
}

// Singleton AccessibilityInfo reduced-motion subscription so 50+ feed cards share 1 native listener.
let cachedReducedMotion = false;
let listenerRegistered = false;
const listeners = new Set<(value: boolean) => void>();

function ensureReducedMotionSubscription() {
  if (listenerRegistered) return;
  listenerRegistered = true;
  AccessibilityInfo.isReduceMotionEnabled()
    .then((val) => {
      cachedReducedMotion = Boolean(val);
      listeners.forEach((cb) => cb(cachedReducedMotion));
    })
    .catch(() => {});

  AccessibilityInfo.addEventListener("reduceMotionChanged", (val) => {
    cachedReducedMotion = Boolean(val);
    listeners.forEach((cb) => cb(cachedReducedMotion));
  });
}

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(cachedReducedMotion);

  useEffect(() => {
    ensureReducedMotionSubscription();
    setReduced(cachedReducedMotion);
    const cb = (val: boolean) => setReduced(val);
    listeners.add(cb);
    return () => {
      listeners.delete(cb);
    };
  }, []);

  return reduced;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface TactilePressableProps extends Omit<PressableProps, "style"> {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  scaleTo?: number;
  haptic?: "none" | "light" | "medium" | "selection";
}

/**
 * Responds immediately on press-in (UI-thread scale) with optional haptic causality.
 */
export function TactilePressable({
  children,
  style,
  scaleTo = 0.965,
  haptic = "light",
  disabled,
  onPressIn,
  onPressOut,
  onPress,
  ...rest
}: TactilePressableProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      {...rest}
      disabled={disabled}
      onPressIn={(e) => {
        if (!disabled) {
          scale.value = withTiming(scaleTo, { duration: 95, easing: EASE_OUT_EXPO });
        }
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.value = withSpring(1, TACTILE_SPRING);
        onPressOut?.(e);
      }}
      onPress={(e) => {
        if (!disabled && haptic !== "none") {
          triggerHaptic(haptic);
        }
        onPress?.(e);
      }}
      style={[animatedStyle, style]}
    >
      {children}
    </AnimatedPressable>
  );
}

/**
 * Staggered entrance animation for initial viewport cards (index < 10);
 * deeper items render immediately so fast scrolling never waits on opacity fades.
 */
export function StaggerReveal({
  index = 0,
  children,
  style,
}: {
  index?: number;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const reduced = useReducedMotion();
  const shouldAnimate = !reduced && index < 10;
  const opacity = useSharedValue(shouldAnimate ? 0 : 1);
  const translateY = useSharedValue(shouldAnimate ? 14 : 0);

  useEffect(() => {
    if (!shouldAnimate) {
      opacity.value = 1;
      translateY.value = 0;
      return;
    }
    const delay = index * 30;
    opacity.value = withDelay(delay, withTiming(1, { duration: 260, easing: EASE_OUT_EXPO }));
    translateY.value = withDelay(delay, withSpring(0, UI_SPRING));
  }, [index, opacity, shouldAnimate, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return <Animated.View style={[animatedStyle, style]}>{children}</Animated.View>;
}

const DISMISS_OFFSET = 520;

/**
 * Interactive UI-thread bottom sheet with finger-tracking swipe-to-dismiss,
 * backdrop opacity scrubbing, keyboard avoidance, and smooth exit before unmount.
 */
export function AnimatedBottomSheet({
  open,
  onClose,
  children,
  sheetStyle,
  keyboardAvoid = false,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  sheetStyle?: StyleProp<ViewStyle>;
  keyboardAvoid?: boolean;
}) {
  const reduced = useReducedMotion();
  const [mounted, setMounted] = useState(open);
  const translateY = useSharedValue(DISMISS_OFFSET);
  const backdropOpacity = useSharedValue(0);

  useEffect(() => {
    if (open) {
      setMounted(true);
      if (reduced) {
        translateY.value = 0;
        backdropOpacity.value = 1;
      } else {
        translateY.value = DISMISS_OFFSET;
        backdropOpacity.value = 0;
        backdropOpacity.value = withTiming(1, { duration: 220, easing: EASE_OUT_EXPO });
        translateY.value = withSpring(0, { damping: 26, stiffness: 300, mass: 0.88 });
      }
    } else if (mounted) {
      if (reduced) {
        setMounted(false);
      } else {
        backdropOpacity.value = withTiming(0, { duration: 190, easing: EASE_OUT_EXPO });
        translateY.value = withTiming(
          DISMISS_OFFSET,
          { duration: 210, easing: EASE_OUT_EXPO },
          (finished) => {
            "worklet";
            if (finished) {
              scheduleOnRN(setMounted, false);
            }
          },
        );
      }
    }
  }, [backdropOpacity, mounted, open, reduced, translateY]);

  const panGesture = Gesture.Pan()
    .activeOffsetY(6)
    .failOffsetX([-18, 18])
    .onUpdate((e) => {
      "worklet";
      // Rubber-band slightly upward; 1:1 tracking downward
      translateY.value = e.translationY < 0 ? e.translationY * 0.14 : e.translationY;
      backdropOpacity.value = interpolate(
        Math.max(0, translateY.value),
        [0, 320],
        [1, 0.25],
      );
    })
    .onEnd((e) => {
      "worklet";
      if (e.translationY > 96 || e.velocityY > 650) {
        scheduleOnRN(triggerHaptic, "light");
        scheduleOnRN(onClose);
      } else {
        translateY.value = withSpring(0, TACTILE_SPRING);
        backdropOpacity.value = withTiming(1, { duration: 160 });
      }
    });

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const sheetAnimStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  if (!mounted) return null;

  const content = (
    <GestureHandlerRootView style={sheetStyles.root}>
      <Animated.View style={[sheetStyles.backdrop, backdropStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      <Animated.View style={[sheetStyles.sheetBase, sheetStyle, sheetAnimStyle]}>
        <GestureDetector gesture={panGesture}>
          <View style={sheetStyles.handleTouchArea}>
            <View style={sheetStyles.handleBar} />
          </View>
        </GestureDetector>
        {children}
      </Animated.View>
    </GestureHandlerRootView>
  );

  return (
    <Modal visible={mounted} transparent statusBarTranslucent animationType="none" onRequestClose={onClose}>
      {keyboardAvoid ? (
        <KeyboardAvoidingView
          style={sheetStyles.root}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          {content}
        </KeyboardAvoidingView>
      ) : (
        content
      )}
    </Modal>
  );
}

/**
 * Centered modal card with smooth UI-thread scale & backdrop exit animation.
 */
export function AnimatedCenterModal({
  open,
  onClose,
  children,
  cardStyle,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  cardStyle?: StyleProp<ViewStyle>;
}) {
  const reduced = useReducedMotion();
  const [mounted, setMounted] = useState(open);
  const progress = useSharedValue(0);

  useEffect(() => {
    if (open) {
      setMounted(true);
      if (reduced) {
        progress.value = 1;
      } else {
        progress.value = 0;
        progress.value = withSpring(1, { damping: 24, stiffness: 320, mass: 0.85 });
      }
    } else if (mounted) {
      if (reduced) {
        setMounted(false);
      } else {
        progress.value = withTiming(
          0,
          { duration: 180, easing: EASE_OUT_EXPO },
          (finished) => {
            "worklet";
            if (finished) {
              scheduleOnRN(setMounted, false);
            }
          },
        );
      }
    }
  }, [mounted, open, progress, reduced]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
  }));

  const cardAnimStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: interpolate(progress.value, [0, 1], [0.92, 1]) }],
  }));

  if (!mounted) return null;

  return (
    <Modal visible={mounted} transparent statusBarTranslucent animationType="none" onRequestClose={onClose}>
      <View style={sheetStyles.centerRoot}>
        <Animated.View style={[sheetStyles.backdrop, backdropStyle]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>
        <Animated.View style={[cardStyle, cardAnimStyle]}>{children}</Animated.View>
      </View>
    </Modal>
  );
}

const sheetStyles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "flex-end",
  },
  centerRoot: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  backdrop: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "rgba(43, 20, 26, 0.52)",
  },
  sheetBase: {
    maxHeight: "88%",
    backgroundColor: COLORS.parchment,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 20,
    paddingTop: 6,
  },
  handleTouchArea: {
    alignItems: "center",
    paddingTop: 6,
    paddingBottom: 12,
  },
  handleBar: {
    width: 42,
    height: 4,
    borderRadius: 99,
    backgroundColor: "rgba(43,20,26,0.22)",
  },
});
