import React, { useEffect } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, Rect, Stop } from "react-native-svg";
import { useReducedMotion } from "../theme/motion";

/**
 * 60fps UI-thread animated sunset meadow horizon replacing WebGL Three.js
 * for identical smooth rendering across iOS and Android without percentage-width SVG clipping.
 */
export function SunsetMeadowScene() {
  const reduced = useReducedMotion();
  const { width } = useWindowDimensions();
  const layerWidth = Math.ceil(width * 1.12);
  const sideOffset = -Math.ceil((layerWidth - width) / 2);

  const breeze = useSharedValue(0);
  const drift = useSharedValue(0);
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (reduced) {
      breeze.value = 0;
      drift.value = 0;
      pulse.value = 1;
      return;
    }
    breeze.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2400, easing: Easing.inOut(Easing.sin) }),
        withTiming(-1, { duration: 2400, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
    drift.value = withRepeat(
      withSequence(
        withTiming(18, { duration: 7000, easing: Easing.inOut(Easing.sin) }),
        withTiming(-12, { duration: 7000, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.06, { duration: 3200, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.98, { duration: 3200, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
  }, [breeze, drift, pulse, reduced]);

  const cloudStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: drift.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const meadowSwayFront = useAnimatedStyle(() => ({
    transform: [{ translateX: breeze.value * 5 }, { rotate: `${breeze.value * 0.45}deg` }],
  }));

  const meadowSwayBack = useAnimatedStyle(() => ({
    transform: [{ translateX: -breeze.value * 3 }],
  }));

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Sky gradient fading seamlessly from #F5F0E6 into warm #E9DFC9 + #F2D59B */}
      <Svg width="100%" height="100%" style={StyleSheet.absoluteFill} viewBox="0 0 400 320" preserveAspectRatio="none">
        <Defs>
          <LinearGradient id="avishkaarSkyGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#F5F0E6" stopOpacity={1} />
            <Stop offset="0.38" stopColor="#EFE5D0" stopOpacity={1} />
            <Stop offset="0.72" stopColor="#E9DFC9" stopOpacity={1} />
            <Stop offset="1" stopColor="#F2D59B" stopOpacity={1} />
          </LinearGradient>
        </Defs>
        <Rect x={0} y={0} width={400} height={320} fill="url(#avishkaarSkyGrad)" />
      </Svg>

      {/* Sun glow */}
      <Animated.View style={[styles.sunWrap, glowStyle]}>
        <Svg width={220} height={220} viewBox="0 0 220 220">
          <Defs>
            <LinearGradient id="avishkaarSunHalo" x1="0.5" y1="0" x2="0.5" y2="1">
              <Stop offset="0" stopColor="#FFF7E8" stopOpacity={0.95} />
              <Stop offset="1" stopColor="#F2D59B" stopOpacity={0.15} />
            </LinearGradient>
          </Defs>
          <Circle cx={110} cy={110} r={96} fill="url(#avishkaarSunHalo)" />
          <Circle cx={110} cy={110} r={48} fill="#FFF7E8" fillOpacity={0.92} />
        </Svg>
      </Animated.View>

      {/* Drifting horizon clouds */}
      <Animated.View style={[styles.cloudLayer, { left: sideOffset, width: layerWidth }, cloudStyle]}>
        <Svg width={layerWidth} height={120} viewBox="0 0 420 120" preserveAspectRatio="xMidYMid slice">
          <G fill="#FAF5EA" fillOpacity={0.78}>
            <Ellipse cx={85} cy={44} rx={48} ry={14} />
            <Ellipse cx={110} cy={38} rx={26} ry={12} />
            <Ellipse cx={305} cy={56} rx={58} ry={15} />
            <Ellipse cx={332} cy={48} rx={30} ry={12} />
          </G>
        </Svg>
      </Animated.View>

      {/* Back ridge & foliage */}
      <Animated.View style={[styles.hillsBack, { left: sideOffset, width: layerWidth }, meadowSwayBack]}>
        <Svg width={layerWidth} height="100%" viewBox="0 0 420 220" preserveAspectRatio="none">
          <Path
            d="M0 112 C72 80, 140 94, 212 108 C286 122, 344 76, 420 96 L420 220 L0 220 Z"
            fill="#647616"
            fillOpacity={0.45}
          />
          <Path
            d="M0 132 C85 110, 165 144, 248 122 C315 104, 372 118, 420 126 L420 220 L0 220 Z"
            fill="#4A700E"
            fillOpacity={0.68}
          />
        </Svg>
      </Animated.View>

      {/* Foreground meadow + blooming wildflower stalks */}
      <Animated.View style={[styles.hillsFront, { left: sideOffset, width: layerWidth }, meadowSwayFront]}>
        <Svg width={layerWidth} height="100%" viewBox="0 0 420 190" preserveAspectRatio="none">
          <Path
            d="M0 78 C64 56, 128 84, 206 72 C292 58, 355 82, 420 62 L420 190 L0 190 Z"
            fill="#34500E"
          />
          <Path
            d="M0 112 C90 92, 175 116, 268 98 C340 84, 385 102, 420 94 L420 190 L0 190 Z"
            fill="#172604"
          />
          <G>
            <Path d="M52 152 Q54 114 48 88" stroke="#4A8C24" strokeWidth={2.2} fill="none" />
            <Circle cx={48} cy={85} r={5.5} fill="#D8352A" />
            <Circle cx={48} cy={85} r={2.2} fill="#F2C83A" />

            <Path d="M118 164 Q124 128 122 104" stroke="#4A8C24" strokeWidth={2.2} fill="none" />
            <Circle cx={122} cy={101} r={6} fill="#F6F0EE" />
            <Circle cx={122} cy={101} r={2.5} fill="#F2C83A" />

            <Path d="M188 168 Q184 134 190 112" stroke="#4A8C24" strokeWidth={2} fill="none" />
            <Circle cx={190} cy={109} r={5.2} fill="#E890B0" />
            <Circle cx={190} cy={109} r={2} fill="#F2C83A" />

            <Path d="M276 164 Q279 122 272 92" stroke="#4A8C24" strokeWidth={2.4} fill="none" />
            <Circle cx={272} cy={89} r={6.6} fill="#FFF4EC" />
            <Circle cx={272} cy={89} r={2.8} fill="#F4C24A" />

            <Path d="M342 158 Q336 122 346 96" stroke="#4A8C24" strokeWidth={2.2} fill="none" />
            <Circle cx={346} cy={93} r={5.6} fill="#F0507A" />
            <Circle cx={346} cy={93} r={2.3} fill="#F2C83A" />

            <Path d="M386 168 Q392 132 384 108" stroke="#4A8C24" strokeWidth={2.2} fill="none" />
            <Circle cx={384} cy={105} r={5.8} fill="#F6C040" />
            <Circle cx={384} cy={105} r={2.4} fill="#E09A2A" />
          </G>
        </Svg>
      </Animated.View>

      {/* Top veil fading seamlessly into #F5F0E6 copy area */}
      <Svg width="100%" height="36%" style={styles.topFade} viewBox="0 0 400 120" preserveAspectRatio="none">
        <Defs>
          <LinearGradient id="avishkaarTopVeil" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#F5F0E6" stopOpacity={1} />
            <Stop offset="1" stopColor="#F5F0E6" stopOpacity={0} />
          </LinearGradient>
        </Defs>
        <Rect x={0} y={0} width={400} height={120} fill="url(#avishkaarTopVeil)" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: "hidden",
    backgroundColor: "#F5F0E6",
  },
  sunWrap: {
    position: "absolute",
    alignSelf: "center",
    top: "14%",
    alignItems: "center",
    justifyContent: "center",
  },
  cloudLayer: {
    position: "absolute",
    top: "16%",
    height: 120,
  },
  hillsBack: {
    position: "absolute",
    bottom: 0,
    height: "68%",
  },
  hillsFront: {
    position: "absolute",
    bottom: 0,
    height: "56%",
  },
  topFade: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
});
