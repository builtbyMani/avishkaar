import React from "react";
import Svg, { Circle, Path } from "react-native-svg";
import { COLORS } from "../theme/tokens";

export function AvishkaarLogo({ size = 28 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <Path d="M16 3L28 27H22.2L16 14.2L9.8 27H4L16 3Z" fill={COLORS.wine} />
      <Circle cx={16} cy={23.5} r={3} fill={COLORS.turmeric} />
    </Svg>
  );
}
