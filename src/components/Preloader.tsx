"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { usePreloadProgress } from "@/hooks/usePreloadProgress";
import { PRELOADER_IMAGES } from "@/data/preloader-images";

const WORD_LEFT = "AVISH";
const WORD_RIGHT = "KAAR";
const CYCLE_MS = 180;

export default function Preloader() {
  const [shouldShow, setShouldShow] = useState(false);
  const [done, setDone] = useState(false);
  const [imgIndex, setImgIndex] = useState(0);
  const progress = usePreloadProgress(PRELOADER_IMAGES, shouldShow);

  // Session gate + reduced motion + unmount overflow cleanup
  useEffect(() => {
    const seen = sessionStorage.getItem("avishkaar-preloaded");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!seen && !reduced) {
      setShouldShow(true);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Cycle the photo window while visible
  useEffect(() => {
    if (!shouldShow || done) return;
    const id = setInterval(
      () => setImgIndex((i) => (i + 1) % PRELOADER_IMAGES.length),
      CYCLE_MS,
    );
    return () => clearInterval(id);
  }, [shouldShow, done]);

  // Finish: mark session, release scroll, trigger curtain exit
  useEffect(() => {
    if (progress >= 100 && shouldShow && !done) {
      const t = setTimeout(() => {
        setDone(true);
        sessionStorage.setItem("avishkaar-preloaded", "1");
        document.body.style.overflow = "";
      }, 250);
      return () => clearTimeout(t);
    }
  }, [progress, shouldShow, done]);

  const letters = (word: string, offset: number) =>
    word.split("").map((ch, i) => (
      <motion.span
        key={offset + i}
        className="inline-block"
        initial={{ y: "110%" }}
        animate={{ y: 0 }}
        transition={{
          duration: 0.7,
          delay: 0.05 * (offset + i),
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        {ch}
      </motion.span>
    ));

  return (
    <AnimatePresence>
      {shouldShow && !done && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col justify-between bg-black text-white"
          exit={{ y: "-100%" }}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          aria-hidden="true"
        >
          {/* Centre wordmark + cycling photo window */}
          <div className="flex flex-1 items-center justify-center overflow-hidden px-3">
            <div className="flex items-center font-[family-name:var(--font-preloader)] font-black uppercase leading-none tracking-tight text-[11vw] sm:text-[12vw] md:text-[9rem]">
              <span className="flex overflow-hidden">{letters(WORD_LEFT, 0)}</span>
              <motion.span
                className="mx-1 inline-block h-[0.72em] w-[0.55em] overflow-hidden rounded-[2px] md:mx-2"
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={PRELOADER_IMAGES[imgIndex]}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </motion.span>
              <span className="flex overflow-hidden">
                {letters(WORD_RIGHT, WORD_LEFT.length)}
              </span>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="flex items-end justify-between p-5 font-mono text-xs uppercase tracking-widest md:p-8">
            <span>( Loading )</span>
            <span className="text-sm md:text-base">
              {String(progress).padStart(2, "0")}%
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
