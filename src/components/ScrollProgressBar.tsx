"use client";

import { memo } from "react";
import { motion, useScroll, useSpring } from "motion/react";

export const ScrollProgressBar = memo(function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 26,
    restDelta: 0.001,
  });

  return (
    <motion.div
      style={{ scaleX, transformOrigin: "0% 50%" }}
      className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] bg-[#C85A32]"
      aria-hidden="true"
    />
  );
});
