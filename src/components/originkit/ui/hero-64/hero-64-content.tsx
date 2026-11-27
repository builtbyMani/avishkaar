// Delivered by Originkit · adapted for Avishkaar
/* eslint-disable */
// @ts-nocheck
"use client";
import Link from "next/link";
import { motion } from "motion/react";
import { useApp } from "@/components/AppProvider";
import { AvishkaarLogo } from "@/components/AvishkaarLogo";
import StillSunsetMeadow from "@/components/originkit/ui/hero-64/still-sunset-meadow";

export default function Hero() {
  const { enterHome, openAuthModal, activeUser, preloaderDone } = useApp();

  return (
    <section className="hero">
      <header className="nav">
        <a
          className="logo"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            enterHome();
          }}
        >
          {preloaderDone ? (
            <motion.div
              layoutId="avishkaar-brand-mark"
              transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center gap-2"
            >
              <AvishkaarLogo size={24} />
              <span className="font-display text-xl font-bold tracking-tight text-[#2B141A]">
                Avishkaar
              </span>
            </motion.div>
          ) : (
            <div className="flex items-center gap-2 opacity-0" aria-hidden="true">
              <AvishkaarLogo size={24} />
              <span className="font-display text-xl font-bold tracking-tight">
                Avishkaar
              </span>
            </div>
          )}
        </a>

        <nav className="links" aria-label="Primary">
          <button type="button" onClick={enterHome} className="active">
            Discover
          </button>
          <Link href="/submit">Post Gem</Link>
          <Link href="/offline">Saved</Link>
          <Link href="/profile">Profile</Link>
        </nav>

        <button type="button" onClick={openAuthModal} className="btn btn-sm">
          {activeUser ? activeUser.displayName.split(" ")[0] : "Sign In"}
        </button>
      </header>

      <div className="copy">
        <h1 className="font-display">
          Places <span className="font-script text-[#6B1D2F]">off the</span> beaten path.
        </h1>
        <p className="hero-lead">
          Community-verified villages, regional kitchens, and living heritage — ranked by
          Hidden Gem Score, never tourist traps.
        </p>
        <button type="button" onClick={enterHome} className="btn btn-lg">
          Explore Gems <span aria-hidden="true">→</span>
        </button>
        <p lang="hi" className="hero-hindi">
          आओ कभी हवेली पे
        </p>
      </div>

      <div className="scene" aria-hidden="true">
        <StillSunsetMeadow
          sky={{ top: "#F5F0E6", horizon: "#E9DFC9", glow: "#F2D59B" }}
          haze={4}
          speed={20}
          hover={20}
          cloudSpeed={6}
        />
        <div className="fade" />
      </div>
    </section>
  );
}
