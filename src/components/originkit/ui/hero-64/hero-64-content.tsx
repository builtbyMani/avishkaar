// Delivered by Originkit · adapted for Avishkaar
/* eslint-disable */
// @ts-nocheck
"use client";
import Link from "next/link";
import StillSunsetMeadow from "@/components/originkit/ui/hero-64/still-sunset-meadow";

export default function Hero() {
  return (
    <section className="hero">
      <div className="copy">
        <h1 className="font-display">
          Places <span className="font-script">off the</span> beaten path.
        </h1>
        <p>
          Community-verified villages, regional kitchens, and living heritage — ranked by
          Hidden Gem Score, never tourist traps.
        </p>
        <div className="cta-row">
          <a className="btn btn-lg" href="#discover-feed">
            Explore Gems <span aria-hidden="true">→</span>
          </a>
          <Link className="btn btn-outline btn-lg" href="/submit">
            Post a Gem
          </Link>
        </div>
      </div>

      <div className="scene" aria-hidden="true">
        <StillSunsetMeadow
          sky={{ top: "#EAECE0", horizon: "#DDE3CB", glow: "#F2E2BA" }}
          haze={4}
          speed={16}
          hover={16}
          cloudSpeed={5}
        />
        <div className="fade" />
      </div>
    </section>
  );
}
