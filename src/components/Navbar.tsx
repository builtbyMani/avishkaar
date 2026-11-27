"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookmarkCheck, Compass, PlusCircle, ShieldCheck, Trophy, User } from "lucide-react";
import { useApp } from "./AppProvider";

const TIER_STYLES: Record<string, string> = {
  "Local Legend": "bg-amber-100 text-amber-900 border-amber-300",
  Pathfinder: "bg-emerald-100 text-emerald-900 border-emerald-300",
  Wanderer: "bg-stone-100 text-stone-700 border-stone-300",
};

export function Navbar() {
  const pathname = usePathname();
  const { activeUser, offlineCards, openAuthModal, mode } = useApp();

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
    <header className="no-print sticky top-0 z-40 border-b border-[#E8E0D4] bg-[#FAF7F2]/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
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
  );
}
