"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  BarChart3,
  BookmarkCheck,
  Compass,
  Layers,
  PlusCircle,
  User,
  X,
} from "@/components/Icons";
import { getTierDisplayLabel } from "@/lib/domain";
import { useApp } from "./AppProvider";
import { AvishkaarLogo } from "./AvishkaarLogo";
import { MemojiAvatar } from "./MemojiAvatar";
import { ScrollProgressBar } from "./ScrollProgressBar";

export function Navbar() {
  const pathname = usePathname();
  const { activeUser, offlineCards, openAuthModal, preloaderDone, enteredHome } = useApp();
  const [impactOpen, setImpactOpen] = useState(false);

  useEffect(() => {
    if (!impactOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setImpactOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [impactOpen]);

  if (pathname === "/" && !enteredHome) {
    return null;
  }

  const navItems = [
    { href: "/", label: "Explore", icon: Compass },
    { href: "/submit", label: "Post", icon: PlusCircle },
    {
      href: "/offline",
      label: offlineCards.length > 0 ? `Saved (${offlineCards.length})` : "Saved",
      icon: BookmarkCheck,
      badge: offlineCards.length > 0 ? offlineCards.length : null,
    },
    { href: "/profile", label: "Profile", icon: User },
  ];

  return (
    <>
      {/* Desktop Left Rail with clear labels */}
      <aside className="no-print fixed inset-y-0 left-0 z-40 hidden w-20 flex-col items-center justify-between border-r border-[#1B2A22]/12 bg-[#F5F0E6] py-4 md:flex">
        <div className="flex w-full flex-col items-center gap-4 px-1.5">
          <Link
            href="/"
            aria-label="Avishkaar Home"
            className="flex h-10 w-10 items-center justify-center rounded-xl transition hover:bg-black/5"
          >
            <AvishkaarLogo size={26} />
          </Link>

          <nav className="flex w-full flex-col items-center gap-1.5" aria-label="Primary rail">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={item.label}
                  className={`group relative flex w-full flex-col items-center justify-center gap-1 rounded-xl py-2 transition ${
                    active ? "text-[#F5F0E6]" : "text-[#1B2A22] hover:bg-black/5"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="rail-active"
                      transition={{ type: "spring", stiffness: 320, damping: 28 }}
                      className="absolute inset-0 rounded-xl bg-[#1F3D2E]"
                    />
                  )}
                  <Icon className="relative z-10 h-[18px] w-[18px]" strokeWidth={active ? 1.9 : 1.65} />
                  <span className="relative z-10 text-[11px] font-medium leading-none">
                    {item.href === "/offline" ? "Saved" : item.label}
                  </span>
                  {item.badge !== null && item.badge !== undefined && (
                    <span className="absolute right-2 top-1.5 z-10 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#D9A12B] px-1 text-[10px] font-bold text-[#1B2A22]">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <button
          type="button"
          onClick={() => setImpactOpen(true)}
          title="Platform Impact & Architecture"
          className="flex w-16 flex-col items-center justify-center gap-1 rounded-xl py-2 text-[#4B5C52] transition hover:bg-black/5 hover:text-[#1B2A22]"
        >
          <BarChart3 className="h-[18px] w-[18px]" strokeWidth={1.65} />
          <span className="text-[11px] font-medium leading-none">Impact</span>
        </button>
      </aside>

      {/* Top Sticky Bar */}
      <header className="no-print sticky top-0 z-30 border-b border-[#1B2A22]/12 bg-[#F5F0E6] md:pl-20">
        <ScrollProgressBar />
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-3 px-4 py-2.5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              {preloaderDone ? (
                <motion.div
                  layoutId="avishkaar-brand-mark"
                  transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
                  className="flex items-center gap-2"
                >
                  <AvishkaarLogo size={24} />
                  <span className="font-display text-2xl tracking-tight text-[#1B2A22]">
                    Avishkaar
                  </span>
                </motion.div>
              ) : (
                <div className="flex items-center gap-2 opacity-0" aria-hidden="true">
                  <AvishkaarLogo size={24} />
                  <span className="font-display text-2xl tracking-tight">
                    Avishkaar
                  </span>
                </div>
              )}
            </Link>
          </div>

          {/* Mobile horizontal navigation */}
          <nav className="scroll-fade-x flex items-center gap-1.5 overflow-x-auto px-1 md:hidden">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex min-h-9 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] font-medium transition whitespace-nowrap ${
                    active ? "bg-[#1F3D2E] text-[#F5F0E6]" : "text-[#1B2A22] hover:bg-black/5"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" strokeWidth={active ? 1.9 : 1.65} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            {activeUser && (
              <span className="hidden text-[13px] font-medium text-[#4B5C52] tabular-nums sm:inline">
                {getTierDisplayLabel(activeUser.tier)} · {activeUser.trailblazerScore} pts
              </span>
            )}
            <button
              type="button"
              onClick={openAuthModal}
              aria-label="Account"
              className="tactile-press inline-flex min-h-10 items-center gap-2.5 rounded-full border border-[#1B2A22]/12 bg-[#FAF7F0] py-1 pl-1.5 pr-4 text-left transition hover:border-[#1F3D2E]"
            >
              <MemojiAvatar
                id={activeUser?.id}
                name={activeUser?.displayName || "Guest"}
                size={30}
              />
              <span className="max-w-[130px] truncate text-sm font-semibold text-[#1B2A22]">
                {activeUser ? activeUser.displayName.split(" ")[0] : "Sign In"}
              </span>
            </button>
          </div>
        </div>
      </header>

      {impactOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setImpactOpen(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="impact-modal-title"
            className="animate-panel-in relative w-full max-w-2xl space-y-5 rounded-3xl border border-[#1B2A22]/15 bg-[#F5F0E6] p-6 shadow-none"
          >
            <button
              type="button"
              onClick={() => setImpactOpen(false)}
              className="absolute right-4 top-4 rounded-full p-1.5 text-[#4B5C52] hover:bg-black/5"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>

            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#D9A12B]/40 bg-[#D9A12B]/15 px-3 py-1 text-xs font-semibold text-[#1B2A22]">
                <Layers className="h-3.5 w-3.5 text-[#D9A12B]" />
                Anti-Overtourism Impact &amp; Stack
              </span>
              <h2 id="impact-modal-title" className="mt-2 font-rozha text-2xl text-[#1B2A22]">
                Digital Discovery Layer for Swadesh Darshan 2.0 &amp; CBDD
              </h2>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-[#1B2A22]/12 bg-[#FAF7F0] p-4">
                <div className="text-2xl font-bold text-[#1F3D2E]">67.4%</div>
                <p className="mt-1 text-xs text-[#4B5C52]">
                  Of India&rsquo;s 428.55 crore domestic tourist visits (2025) concentrated in just 5 states.
                </p>
              </div>
              <div className="rounded-2xl border border-[#1B2A22]/12 bg-[#FAF7F0] p-4">
                <div className="text-2xl font-bold text-[#1B2A22]">60%</div>
                <p className="mt-1 text-xs text-[#4B5C52]">
                  Foreign air arrivals funneled through Delhi &amp; Mumbai while regional gems stay invisible.
                </p>
              </div>
              <div className="rounded-2xl border border-[#1B2A22]/12 bg-[#FAF7F0] p-4">
                <div className="text-2xl font-bold text-[#1B2A22]">₹2,207 cr</div>
                <p className="mt-1 text-xs text-[#4B5C52]">
                  Swadesh Darshan 2.0 &amp; Challenge-Based Destination Development circuits ready to amplify.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#4B5C52]">
                4-Box Architecture
              </h3>
              <div className="grid gap-2.5 sm:grid-cols-4">
                {[
                  { title: "Next.js Edge", sub: "App Router + Tailwind + Offline Pocket Cards" },
                  { title: "Supabase + PostGIS", sub: "5 Tables + CDN Media + H3 Radius Ready" },
                  { title: "Gemini Write-Time", sub: "Multilingual JSON Cards + Detour Matcher" },
                  { title: "Leaflet + OSM", sub: "Vendor Pins + Verified Alert Zones" },
                ].map((box) => (
                  <div key={box.title} className="rounded-xl border border-[#1B2A22]/12 bg-[#FAF7F0] p-3">
                    <div className="text-xs font-bold text-[#1B2A22]">{box.title}</div>
                    <p className="mt-1 text-[11px] text-[#4B5C52]">{box.sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
