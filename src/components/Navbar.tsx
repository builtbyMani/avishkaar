"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BarChart3,
  BookmarkCheck,
  Compass,
  Layers,
  PlusCircle,
  Trophy,
  X,
} from "lucide-react";
import { TRAILBLAZER_TIER_STYLES } from "@/lib/domain";
import { useApp } from "./AppProvider";
import { AvishkaarLogo } from "./AvishkaarLogo";
import { MemojiAvatar } from "./MemojiAvatar";

export function Navbar() {
  const pathname = usePathname();
  const { activeUser, offlineCards, openAuthModal } = useApp();
  const [impactOpen, setImpactOpen] = useState(false);

  useEffect(() => {
    if (!impactOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setImpactOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [impactOpen]);

  const navItems = [
    { href: "/", label: "Discover", icon: Compass },
    { href: "/submit", label: "Post", icon: PlusCircle },
    {
      href: "/offline",
      label: `Saved (${offlineCards.length})`,
      icon: BookmarkCheck,
      badge: offlineCards.length > 0 ? offlineCards.length : null,
    },
    { href: "/profile", label: "Profile", icon: Trophy },
  ];

  return (
    <>
      {/* Desktop Left Slim Rail (Pinterest-style) */}
      <aside className="no-print fixed inset-y-0 left-0 z-40 hidden w-16 flex-col items-center justify-between border-r border-black/12 bg-[#FAF7F2] py-4 md:flex">
        <div className="flex flex-col items-center gap-4">
          <Link
            href="/"
            aria-label="Avishkaar Home"
            className="flex h-10 w-10 items-center justify-center rounded-xl transition hover:bg-black/5"
          >
            <AvishkaarLogo size={26} />
          </Link>

          <nav className="flex flex-col items-center gap-2" aria-label="Primary rail">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-label={item.label}
                  className={`group relative flex h-11 w-11 items-center justify-center rounded-xl transition ${
                    active
                      ? "bg-[#1B3B36] text-white"
                      : "text-[#1B3B36] hover:bg-black/5"
                  }`}
                >
                  <Icon className="h-5 w-5" strokeWidth={active ? 2.25 : 1.75} />
                  {item.badge !== null && item.badge !== undefined && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#C85A32] px-1 text-[10px] font-bold text-white">
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
          aria-label="Impact & Stack"
          className="flex h-11 w-11 items-center justify-center rounded-xl text-[#52635F] transition hover:bg-black/5 hover:text-[#1B3B36]"
        >
          <BarChart3 className="h-5 w-5" strokeWidth={1.75} />
        </button>
      </aside>

      {/* Top Sticky Bar */}
      <header className="no-print sticky top-0 z-30 border-b border-black/12 bg-[#FAF7F2] md:pl-16">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-3 px-4 py-2.5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <AvishkaarLogo size={24} />
              <span className="font-display text-lg font-bold tracking-tight text-[#1B3B36]">
                Avishkaar
              </span>
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
                  className={`inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition whitespace-nowrap ${
                    active ? "bg-[#1B3B36] text-white" : "text-[#1B3B36] hover:bg-black/5"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" strokeWidth={active ? 2.25 : 1.75} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={openAuthModal}
            aria-label="Account"
            className="tactile-press inline-flex min-h-9 items-center gap-2 rounded-full border border-black/12 bg-white py-1 pl-1.5 pr-3 text-left transition hover:border-[#C85A32]"
          >
            <MemojiAvatar
              id={activeUser?.id}
              name={activeUser?.displayName || "Guest"}
              size={28}
            />
            {activeUser ? (
              <div className="flex items-center gap-2">
                <span className="max-w-[110px] truncate text-xs font-semibold text-[#1B3B36]">
                  {activeUser.displayName.split(" ")[0]}
                </span>
                <span
                  className={`hidden rounded-full border px-2 py-0.5 text-[10px] font-bold sm:inline-block ${
                    TRAILBLAZER_TIER_STYLES[activeUser.tier]?.badge ??
                    TRAILBLAZER_TIER_STYLES.Wanderer.badge
                  }`}
                >
                  {activeUser.tier} · {activeUser.trailblazerScore}
                </span>
              </div>
            ) : (
              <span className="text-xs font-semibold text-[#1B3B36]">Sign In</span>
            )}
          </button>
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
            className="animate-panel-in relative w-full max-w-2xl space-y-5 rounded-3xl border border-black/20 bg-[#FAF7F2] p-6 shadow-none"
          >
            <button
              type="button"
              onClick={() => setImpactOpen(false)}
              className="absolute right-4 top-4 rounded-full p-1.5 text-[#52635F] hover:bg-black/5"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>

            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-950">
                <Layers className="h-3.5 w-3.5" />
                Anti-Overtourism Impact &amp; Stack
              </span>
              <h2 id="impact-modal-title" className="mt-2 font-display text-2xl font-bold text-[#1B3B36]">
                Digital Discovery Layer for Swadesh Darshan 2.0 &amp; CBDD
              </h2>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-black/12 bg-white p-4">
                <div className="text-2xl font-bold text-[#C85A32]">67.4%</div>
                <p className="mt-1 text-xs text-[#52635F]">
                  Of India&rsquo;s 428.55 crore domestic tourist visits (2025) concentrated in just 5 states.
                </p>
              </div>
              <div className="rounded-2xl border border-black/12 bg-white p-4">
                <div className="text-2xl font-bold text-[#1B3B36]">60%</div>
                <p className="mt-1 text-xs text-[#52635F]">
                  Foreign air arrivals funneled through Delhi &amp; Mumbai while regional gems stay invisible.
                </p>
              </div>
              <div className="rounded-2xl border border-black/12 bg-white p-4">
                <div className="text-2xl font-bold text-[#1B3B36]">₹2,207 cr</div>
                <p className="mt-1 text-xs text-[#52635F]">
                  Swadesh Darshan 2.0 &amp; Challenge-Based Destination Development circuits ready to amplify.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#52635F]">
                4-Box Architecture
              </h3>
              <div className="grid gap-2.5 sm:grid-cols-4">
                {[
                  { title: "Next.js Edge", sub: "App Router + Tailwind + Offline Pocket Cards" },
                  { title: "Supabase + PostGIS", sub: "5 Tables + CDN Media + H3 Radius Ready" },
                  { title: "Gemini Write-Time", sub: "Multilingual JSON Cards + Detour Matcher" },
                  { title: "Leaflet + OSM", sub: "Vendor Pins + Verified Red Safety Zones" },
                ].map((box) => (
                  <div key={box.title} className="rounded-xl border border-black/12 bg-white p-3">
                    <div className="text-xs font-bold text-[#1B3B36]">{box.title}</div>
                    <p className="mt-1 text-[11px] text-[#52635F]">{box.sub}</p>
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
