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
  ShieldCheck,
  Trophy,
  User,
  X,
} from "lucide-react";
import { useApp } from "./AppProvider";

const TIER_STYLES: Record<string, string> = {
  "Local Legend": "bg-amber-100 text-amber-900 border-amber-300",
  Pathfinder: "bg-emerald-100 text-emerald-900 border-emerald-300",
  Wanderer: "bg-stone-100 text-stone-700 border-stone-300",
};

export function Navbar() {
  const pathname = usePathname();
  const { activeUser, offlineCards, openAuthModal, mode } = useApp();
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
    { href: "/submit", label: "Post a Gem", icon: PlusCircle },
    {
      href: "/offline",
      label: `Offline (${offlineCards.length})`,
      icon: BookmarkCheck,
    },
    { href: "/profile", label: "Profile & Badges", icon: Trophy },
  ];

  return (
    <>
      <header className="no-print sticky top-0 z-40 border-b border-[#E8E0D4] bg-[#FAF7F2]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <Link href="/" className="flex items-center gap-2.5 group">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1B3B36] text-[#FAF7F2] shadow-sm transition group-hover:bg-[#C85A32]">
                <Compass className="h-5 w-5" />
              </span>
              <div>
                <span className="font-display text-xl font-bold tracking-tight text-[#1B3B36]">
                  Avishkaar
                </span>
                <span className="hidden text-[11px] font-medium uppercase tracking-wider text-[#52635F] sm:block">
                  Offbeat Heritage &amp; Trust
                </span>
              </div>
            </Link>
            <span className="hidden rounded-full border border-[#E8E0D4] bg-white px-2.5 py-0.5 text-[11px] font-medium text-[#52635F] md:inline-flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-[#1B3B36]" />
              {mode === "supabase" ? "Supabase Live" : "Local Demo Store"}
            </span>
          </div>

          <nav className="flex items-center gap-1.5 overflow-x-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition whitespace-nowrap sm:text-sm ${
                    active
                      ? "bg-[#1B3B36] text-white shadow-sm"
                      : "text-[#1B3B36] hover:bg-[#E8E0D4]/60"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
            <button
              type="button"
              onClick={() => setImpactOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#E8E0D4] bg-white px-3 py-1.5 text-xs font-semibold text-[#1B3B36] transition hover:border-[#C85A32] whitespace-nowrap"
            >
              <BarChart3 className="h-3.5 w-3.5 text-[#C85A32]" />
              Impact &amp; Stack
            </button>
          </nav>

          <button
            type="button"
            onClick={openAuthModal}
            className="inline-flex items-center gap-2 rounded-full border border-[#E8E0D4] bg-white px-3 py-1.5 text-left shadow-xs transition hover:border-[#C85A32]"
          >
            <User className="h-4 w-4 text-[#C85A32]" />
            {activeUser ? (
              <div className="flex items-center gap-2">
                <span className="max-w-[120px] truncate text-xs font-semibold text-[#1B3B36]">
                  {activeUser.displayName.split(" ")[0]}
                </span>
                <span
                  className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${
                    TIER_STYLES[activeUser.tier] || TIER_STYLES.Wanderer
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
          onClick={(e) => {
            if (e.target === e.currentTarget) setImpactOpen(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="impact-modal-title"
            className="relative w-full max-w-2xl space-y-5 rounded-3xl border border-[#E8E0D4] bg-[#FAF7F2] p-6 shadow-2xl"
          >
            <button
              type="button"
              onClick={() => setImpactOpen(false)}
              className="absolute right-4 top-4 rounded-full p-1.5 text-[#52635F] hover:bg-[#E8E0D4]"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>

            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-950">
                <Layers className="h-3.5 w-3.5" />
                Anti-Overtourism Impact &amp; Scalable Stack
              </span>
              <h2 id="impact-modal-title" className="mt-2 font-display text-2xl font-bold text-[#1B3B36]">
                Digital Discovery Layer for Swadesh Darshan 2.0 &amp; CBDD
              </h2>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-[#E8E0D4] bg-white p-4">
                <div className="text-2xl font-bold text-[#C85A32]">67.4%</div>
                <p className="mt-1 text-xs text-[#52635F]">
                  Of India&rsquo;s 428.55 crore domestic tourist visits (2025) concentrated in just 5 states.
                </p>
              </div>
              <div className="rounded-2xl border border-[#E8E0D4] bg-white p-4">
                <div className="text-2xl font-bold text-[#1B3B36]">60%</div>
                <p className="mt-1 text-xs text-[#52635F]">
                  Foreign air arrivals funneled through Delhi &amp; Mumbai while regional gems stay invisible.
                </p>
              </div>
              <div className="rounded-2xl border border-[#E8E0D4] bg-white p-4">
                <div className="text-2xl font-bold text-emerald-700">₹2,207 cr</div>
                <p className="mt-1 text-xs text-[#52635F]">
                  Swadesh Darshan 2.0 &amp; Challenge-Based Destination Development circuits ready to amplify.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#52635F]">
                4-Box Production Architecture
              </h3>
              <div className="grid gap-2.5 sm:grid-cols-4">
                {[
                  { title: "Next.js Edge", sub: "App Router + Tailwind + Offline Pocket Cards" },
                  { title: "Supabase + PostGIS", sub: "5 Tables + CDN Media + H3 Radius Ready" },
                  { title: "Gemini Write-Time", sub: "Multilingual JSON Cards + Detour Matcher" },
                  { title: "Leaflet + OSM", sub: "Vendor Pins + Verified Red Safety Zones" },
                ].map((box) => (
                  <div key={box.title} className="rounded-xl border border-[#E8E0D4] bg-white p-3">
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
