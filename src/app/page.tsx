"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Crown,
  Flame,
  HandHeart,
  Map as MapIcon,
  LayoutGrid,
  MapPin,
  PlusCircle,
  Route,
  Sparkles,
  Store,
  X,
} from "lucide-react";
import { useApp } from "@/components/AppProvider";
import { LeafletMap } from "@/components/LeafletMap";
import { MediaCardPlayer } from "@/components/MediaCardPlayer";
import { getGemScoreBreakdown, isSafetyAlertPublic, PLACE_CATEGORIES } from "@/lib/domain";
import { getAuthHeaders } from "@/lib/supabase";
import type { EnrichedPlace, PlaceCategory, UserBadge } from "@/types/domain";

interface DetourAlternativeView {
  place: EnrichedPlace;
  matchReason: string;
  crowdReductionPercent: number;
  commuteSummary: string;
}

interface DetourResponseView {
  hotspot: string;
  hotspotCrowdIndex: number;
  alternatives: DetourAlternativeView[];
  source: "gemini" | "fallback";
}

const QUICK_DETOURS = ["Ooty", "Goa", "Hampi"];

const CATEGORIES: Array<"All" | PlaceCategory> = ["All", ...PLACE_CATEGORIES];

export default function DiscoverPage() {
  const { activeUser, refreshProfiles } = useApp();
  const [places, setPlaces] = useState<EnrichedPlace[]>([]);
  const [feedError, setFeedError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<"All" | PlaceCategory>("All");
  const [region, setRegion] = useState<string>("All");
  const [viewMode, setViewMode] = useState<"masonry" | "map">("masonry");
  const [toast, setToast] = useState<string | null>(null);
  const [vouchingId, setVouchingId] = useState<string | null>(null);
  const [detourQuery, setDetourQuery] = useState("");
  const [detourLoading, setDetourLoading] = useState(false);
  const [detourResult, setDetourResult] = useState<DetourResponseView | null>(null);
  const [openScoreId, setOpenScoreId] = useState<string | null>(null);

  const loadFeed = useCallback(async () => {
    setLoading(true);
    setFeedError(null);
    try {
      const qs = activeUser ? `?viewerId=${encodeURIComponent(activeUser.id)}` : "";
      const res = await fetch(`/api/places${qs}`, {
        cache: "no-store",
        headers: { ...(await getAuthHeaders()) },
      });
      if (!res.ok) throw new Error(`Feed request failed (${res.status})`);
      const data = (await res.json()) as { places: EnrichedPlace[] };
      setPlaces(data.places ?? []);
    } catch {
      setFeedError("Could not load the discovery feed. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, [activeUser]);

  useEffect(() => {
    void loadFeed();
  }, [loadFeed]);

  const regions = useMemo(() => {
    const set = new Set(places.map((p) => p.region));
    return ["All", ...Array.from(set)];
  }, [places]);

  const filtered = useMemo(() => {
    return places.filter((p) => {
      if (category !== "All" && p.category !== category) return false;
      if (region !== "All" && p.region !== region) return false;
      return true;
    });
  }, [places, category, region]);

  async function handleVouch(placeId: string) {
    if (!activeUser) return;
    setVouchingId(placeId);
    try {
      const res = await fetch(`/api/places/${placeId}/vouch`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(await getAuthHeaders()),
        },
        body: JSON.stringify({ userId: activeUser.id }),
      });
      const data = (await res.json()) as {
        pointsAwarded?: number;
        isVerifiedVisit?: boolean;
        unlockedBadges?: UserBadge[];
        error?: string;
      };
      if (!res.ok) throw new Error(data.error || "Vouch failed");

      const badgeMsg =
        data.unlockedBadges && data.unlockedBadges.length > 0
          ? ` Unlocked badge: ${data.unlockedBadges.map((b) => b.badgeName).join(", ")}!`
          : "";
      setToast(
        data.pointsAwarded && data.pointsAwarded > 0
          ? `Vouched! Author earned +${data.pointsAwarded} Trailblazer pts.${badgeMsg}`
          : "Already vouched for this hidden gem.",
      );
      await Promise.all([loadFeed(), refreshProfiles()]);
    } catch (err) {
      setToast(err instanceof Error ? err.message : "Could not vouch");
    } finally {
      setVouchingId(null);
    }
  }

  async function handleDetourSearch(queryText: string) {
    const cleaned = queryText.trim();
    if (!cleaned) {
      setDetourResult(null);
      return;
    }
    setDetourQuery(cleaned);
    setDetourLoading(true);
    try {
      const res = await fetch("/api/detour", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: cleaned, viewerId: activeUser?.id }),
      });
      if (res.ok) {
        const data = (await res.json()) as DetourResponseView;
        setDetourResult(data);
      } else {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setToast(data.error || "Detour lookup failed. Please try again.");
      }
    } finally {
      setDetourLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Editorial Hero */}
      <section className="rounded-3xl border border-[#E8E0D4] bg-gradient-to-br from-[#1B3B36] via-[#224741] to-[#2F5951] p-6 text-[#FAF7F2] shadow-sm sm:p-8">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-amber-200">
              <Sparkles className="h-3.5 w-3.5" />
              Ranked by Hidden Gem Score — Never Paid Ads or Tourist Traps
            </div>
            <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Discover offbeat villages, regional kitchens &amp; living crafts.
            </h1>
            <p className="text-sm text-[#E8E0D4] sm:text-base">
              Every card packs AI-structured last-mile commute tips, must-try local food,
              safety advisories, offline pocket cards, and trust-gated local guides.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/submit"
              className="inline-flex items-center gap-2 rounded-full bg-[#C85A32] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#b24d28]"
            >
              <PlusCircle className="h-4 w-4" />
              Post a Hidden Gem
            </Link>
            <button
              type="button"
              onClick={() => setViewMode((m) => (m === "masonry" ? "map" : "masonry"))}
              className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              {viewMode === "masonry" ? (
                <>
                  <MapIcon className="h-4 w-4" /> Map View
                </>
              ) : (
                <>
                  <LayoutGrid className="h-4 w-4" /> Masonry Grid
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {toast && (
        <div className="flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900">
          <span className="inline-flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            {toast}
          </span>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="text-xs font-bold underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* "Instead of X, Go Here" Detour Bar */}
      <section className="rounded-2xl border border-[#E8E0D4] bg-white p-4 shadow-xs sm:p-5">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void handleDetourSearch(detourQuery);
          }}
          className="flex flex-col gap-3 sm:flex-row sm:items-center"
        >
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#C85A32] shrink-0">
            <Route className="h-4 w-4" />
            Instead of X, Go Here
          </div>
          <div className="relative flex-1">
            <input
              value={detourQuery}
              onChange={(e) => setDetourQuery(e.target.value)}
              placeholder="Skip the crowds at Ooty, Goa, Hampi, Manali..."
              className="w-full rounded-full border border-[#E8E0D4] bg-[#FAF7F2] px-4 py-2 text-sm outline-none focus:border-[#C85A32]"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="submit"
              disabled={detourLoading || !detourQuery.trim()}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#1B3B36] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#C85A32] disabled:opacity-50"
            >
              {detourLoading ? "Finding Detours..." : "Find Top 3 Gems"}
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
            {detourResult && (
              <button
                type="button"
                onClick={() => {
                  setDetourResult(null);
                  setDetourQuery("");
                }}
                className="inline-flex items-center gap-1 rounded-full border border-[#E8E0D4] px-3 py-2 text-xs font-semibold text-[#52635F] hover:text-[#1B3B36]"
              >
                <X className="h-3.5 w-3.5" /> Clear
              </button>
            )}
          </div>
        </form>

        <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs">
          <span className="font-semibold text-[#52635F]">Quick detours:</span>
          {QUICK_DETOURS.map((hub) => (
            <button
              key={hub}
              type="button"
              onClick={() => void handleDetourSearch(hub)}
              className="rounded-full bg-[#FAF7F2] px-3 py-1 font-semibold text-[#1B3B36] transition hover:bg-[#C85A32] hover:text-white"
            >
              Skip {hub}
            </button>
          ))}
        </div>

        {detourResult && (
          <div className="mt-4 border-t border-[#F1EBE1] pt-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="font-bold text-[#1B3B36]">
                Top 3 Offbeat Detours for &ldquo;{detourResult.hotspot}&rdquo; (Crowd Index{" "}
                {detourResult.hotspotCrowdIndex})
              </span>
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 font-bold text-amber-900">
                {detourResult.source === "gemini" ? "Gemini Vibe Match" : "Crowd + Vibe Engine"}
              </span>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {detourResult.alternatives.map((alt) => (
                <Link
                  key={alt.place.id}
                  href={`/place/${alt.place.id}`}
                  className="rounded-xl border border-[#E8E0D4] bg-[#FAF7F2] p-3.5 transition hover:border-[#C85A32] hover:bg-white"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-900">
                      {alt.crowdReductionPercent}% Less Crowded
                    </span>
                    <span className="text-[11px] font-bold text-[#1B3B36]">
                      Gem {alt.place.hiddenGemScore}
                    </span>
                  </div>
                  <h3 className="mt-2 font-display text-sm font-bold text-[#1B3B36]">
                    {alt.place.title}
                  </h3>
                  <p className="mt-1 text-xs text-[#52635F]">{alt.matchReason}</p>
                  <p className="mt-2 text-[11px] font-semibold text-[#C85A32]">
                    Commute: {alt.commuteSummary}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>

      {feedError && (
        <div className="flex items-center justify-between rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-900">
          <span>{feedError}</span>
          <button type="button" onClick={() => void loadFeed()} className="font-bold underline">
            Retry
          </button>
        </div>
      )}

      {/* Filter Pills */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                category === cat
                  ? "bg-[#1B3B36] text-white"
                  : "border border-[#E8E0D4] bg-white text-[#1B3B36] hover:border-[#C85A32]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#52635F]">
            Region:
          </span>
          {regions.map((reg) => (
            <button
              key={reg}
              type="button"
              onClick={() => setRegion(reg)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                region === reg
                  ? "bg-[#C85A32] text-white"
                  : "bg-[#EAE2D6]/60 text-[#1B3B36] hover:bg-[#EAE2D6]"
              }`}
            >
              {reg}
            </button>
          ))}
        </div>
      </section>

      {/* Content */}
      {loading ? (
        <div className="columns-1 gap-4 space-y-4 sm:columns-2 md:columns-4">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div
              key={idx}
              className="break-inside-avoid animate-pulse overflow-hidden rounded-2xl border border-[#E8E0D4] bg-white p-3"
            >
              <div className="h-56 w-full rounded-xl bg-[#EAE2D6]" />
              <div className="mt-3 h-4 w-3/4 rounded bg-[#EAE2D6]" />
              <div className="mt-2 h-3 w-1/2 rounded bg-[#EAE2D6]" />
            </div>
          ))}
        </div>
      ) : viewMode === "map" ? (
        <LeafletMap places={filtered} heightClass="h-[520px]" />
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#E8E0D4] bg-white p-12 text-center">
          <p className="font-display text-xl font-bold text-[#1B3B36]">
            No hidden gems match those filters yet.
          </p>
          <p className="mt-1 text-sm text-[#52635F]">
            Clear filters or share your own discovery.
          </p>
        </div>
      ) : (
        <section className="columns-1 gap-4 space-y-4 sm:columns-2 md:columns-4">
          {filtered.map((place) => {
            const publicAlertCount = place.safetyAlerts.filter(isSafetyAlertPublic).length;
            const gemBreakdown = getGemScoreBreakdown(place);
            return (
            <article
              key={place.id}
              className="group relative break-inside-avoid overflow-hidden rounded-2xl border border-[#E8E0D4] bg-white shadow-xs transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="relative">
                <Link href={`/place/${place.id}`} className="block">
                  <MediaCardPlayer
                    media={place.media[0]}
                    title={place.title}
                    compact
                  />
                </Link>
                <div className="pointer-events-none absolute bottom-2.5 left-2.5 flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setOpenScoreId((prev) => (prev === place.id ? null : place.id));
                    }}
                    className="pointer-events-auto inline-flex items-center gap-1 rounded-full bg-[#1B3B36]/95 px-2.5 py-1 text-[11px] font-bold text-white shadow-xs backdrop-blur-xs transition hover:bg-[#C85A32]"
                    title="Click for Hidden Gem Score math breakdown"
                  >
                    <Flame className="h-3 w-3 text-amber-300" />
                    Gem {place.hiddenGemScore}
                  </button>
                  {publicAlertCount > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-600/90 px-2 py-1 text-[10px] font-bold text-white">
                      <AlertTriangle className="h-3 w-3" />
                      {publicAlertCount} Alert{publicAlertCount > 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              </div>

              {openScoreId === place.id && (
                <div className="border-b border-[#E8E0D4] bg-[#FAF7F2] p-3 text-[11px] text-[#1B3B36]">
                  <div className="flex items-center justify-between font-bold">
                    <span>Explainable Gem Math</span>
                    <button
                      type="button"
                      onClick={() => setOpenScoreId(null)}
                      className="text-[#C85A32] hover:underline"
                    >
                      Close
                    </button>
                  </div>
                  <div className="mt-1.5 space-y-1 text-[#52635F]">
                    <div className="flex justify-between">
                      <span>Community Vouches ({place.vouchesCount} × 2)</span>
                      <strong className="text-[#1B3B36]">+{gemBreakdown.vouchesPoints}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Local Impact / Check-ins ({place.verifiedCheckinsCount} × 5)</span>
                      <strong className="text-[#1B3B36]">+{gemBreakdown.checkinsPoints}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Crowd Penalty log10({place.mainstreamPopularityIndex} + 10)</span>
                      <strong className="text-[#1B3B36]">
                        ÷ {gemBreakdown.crowdPenalty.toFixed(2)}
                      </strong>
                    </div>
                    <div className="flex justify-between border-t border-[#E8E0D4] pt-1 font-bold text-[#1B3B36]">
                      <span>Final Hidden Gem Score</span>
                      <span>{gemBreakdown.score}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2.5 p-3.5">
                <div className="flex items-center justify-between gap-2 text-[11px] font-semibold text-[#52635F]">
                  <span className="inline-flex items-center gap-1 truncate">
                    <MapPin className="h-3 w-3 text-[#C85A32]" />
                    {place.region}
                  </span>
                  <span className="rounded-full bg-[#FAF7F2] px-2 py-0.5 text-[10px] font-bold text-[#1B3B36]">
                    {place.category}
                  </span>
                </div>

                <Link href={`/place/${place.id}`} className="block">
                  <h2 className="font-display text-base font-bold leading-snug text-[#1B3B36] group-hover:text-[#C85A32]">
                    {place.title}
                  </h2>
                </Link>

                <p className="line-clamp-2 text-xs leading-relaxed text-[#52635F]">
                  {place.rawDescription}
                </p>

                <div className="flex items-center justify-between border-t border-[#F1EBE1] pt-2.5 text-xs">
                  <div className="flex items-center gap-1.5 truncate">
                    {place.author.tier === "Local Legend" && (
                      <Crown
                        className="h-3.5 w-3.5 shrink-0 text-amber-600"
                        aria-label="Local Legend Priority"
                      />
                    )}
                    <span className="truncate font-medium text-[#1B3B36]">
                      {place.author.displayName}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {place.localVendors.length > 0 && (
                      <span
                        title="Support Local tags"
                        className="inline-flex items-center gap-0.5 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800"
                      >
                        <Store className="h-3 w-3" />
                        {place.localVendors.length}
                      </span>
                    )}
                    <button
                      type="button"
                      disabled={vouchingId === place.id}
                      onClick={() => void handleVouch(place.id)}
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold transition ${
                        place.userHasVouched
                          ? "bg-emerald-100 text-emerald-900"
                          : "bg-[#FAF7F2] text-[#1B3B36] hover:bg-[#C85A32] hover:text-white"
                      }`}
                    >
                      <HandHeart className="h-3.5 w-3.5" />
                      {place.vouchesCount}
                    </button>
                  </div>
                </div>
              </div>
            </article>
            );
          })}
        </section>
      )}
    </div>
  );
}
