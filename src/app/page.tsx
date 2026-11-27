"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  HandHeart,
  Info,
  LayoutGrid,
  MapIcon,
  PlusCircle,
  ScoreFlameIcon,
  Search,
  ShieldCheck,
  Store,
  X,
} from "@/components/Icons";
import { useApp } from "@/components/AppProvider";
import { LeafletMap } from "@/components/LeafletMap";
import { MediaCardPlayer } from "@/components/MediaCardPlayer";
import { MemojiAvatar } from "@/components/MemojiAvatar";
import Hero64 from "@/components/originkit/hero-64";
import {
  FEEDBACK_TONE_STYLES,
  getGemScoreBreakdown,
  getRegionStyle,
  isSafetyAlertPublic,
  PLACE_CATEGORIES,
  type FeedbackMessage,
} from "@/lib/domain";
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
  const { activeUser, refreshProfiles, enteredHome } = useApp();
  const [places, setPlaces] = useState<EnrichedPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<"All" | PlaceCategory>("All");
  const [region, setRegion] = useState<string>("All");
  const [viewMode, setViewMode] = useState<"masonry" | "map">("masonry");
  const [toast, setToast] = useState<FeedbackMessage | null>(null);
  const [vouchingId, setVouchingId] = useState<string | null>(null);
  const [detourQuery, setDetourQuery] = useState("");
  const [detourLoading, setDetourLoading] = useState(false);
  const [detourResult, setDetourResult] = useState<DetourResponseView | null>(null);
  const [openScoreId, setOpenScoreId] = useState<string | null>(null);

  const loadFeed = useCallback(async () => {
    setLoading(true);
    try {
      const qs = activeUser ? `?viewerId=${encodeURIComponent(activeUser.id)}` : "";
      const res = await fetch(`/api/places${qs}`, { cache: "no-store" });
      if (!res.ok) {
        setToast({ kind: "error", text: "Could not load discovery feed — check connection and retry." });
        return;
      }
      const data = (await res.json()) as { places: EnrichedPlace[] };
      setPlaces(data.places ?? []);
    } catch {
      setToast({ kind: "error", text: "Could not load discovery feed — check connection and retry." });
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
          ? { kind: "success", text: `Vouched! Author earned +${data.pointsAwarded} Trailblazer pts.${badgeMsg}` }
          : { kind: "info", text: "Already vouched for this hidden gem." },
      );
      await Promise.all([loadFeed(), refreshProfiles()]);
    } catch (err) {
      setToast({ kind: "error", text: err instanceof Error ? err.message : "Could not vouch" });
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
      if (!res.ok) {
        setToast({ kind: "error", text: "Detour lookup failed — verify hotspot name and retry." });
        return;
      }
      const data = (await res.json()) as DetourResponseView;
      setDetourResult(data);
    } catch {
      setToast({ kind: "error", text: "Detour lookup failed — verify hotspot name and retry." });
    } finally {
      setDetourLoading(false);
    }
  }

  if (!enteredHome) {
    return <Hero64 />;
  }

  return (
    <div className="space-y-6">
      {/* Top Search & Action Strip */}
      <section id="discover-feed" className="scroll-mt-20 space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleDetourSearch(detourQuery);
            }}
            className="flex flex-1 items-center gap-2 rounded-full border border-[#2B141A]/12 bg-[#FAF7F0] px-4 py-1.5 transition focus-within:border-[#6B1D2F] focus-within:bg-white"
          >
            <Search className="h-4 w-4 shrink-0 text-[#61454D]" strokeWidth={1.75} />
            <input
              value={detourQuery}
              onChange={(e) => setDetourQuery(e.target.value)}
              placeholder="Skip crowded hubs (Ooty, Goa, Hampi, Manali)..."
              className="min-h-8 w-full bg-transparent text-sm text-[#2B141A] placeholder:text-[#61454D] outline-none"
            />
            {detourQuery && (
              <button
                type="button"
                onClick={() => {
                  setDetourQuery("");
                  setDetourResult(null);
                }}
                className="rounded-full p-1 text-[#61454D] hover:bg-black/5 hover:text-[#2B141A]"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
            <button
              type="submit"
              disabled={detourLoading || !detourQuery.trim()}
              className="shrink-0 rounded-full bg-[#D9A12B] px-4 py-1.5 text-xs font-bold text-[#2B141A] transition hover:bg-[#c89122] disabled:opacity-45"
            >
              {detourLoading ? "Finding..." : "Detour"}
            </button>
          </form>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/submit"
              className="tactile-press inline-flex min-h-10 items-center gap-1.5 rounded-full bg-[#6B1D2F] px-4 py-2 text-xs font-bold text-[#F5F0E6] transition hover:bg-[#521523]"
            >
              <PlusCircle className="h-4 w-4" strokeWidth={1.75} />
              Post Gem
            </Link>
            <button
              type="button"
              onClick={() => setViewMode((m) => (m === "masonry" ? "map" : "masonry"))}
              className="tactile-press inline-flex min-h-10 items-center gap-1.5 rounded-full border border-[#2B141A]/12 bg-[#FAF7F0] px-4 py-2 text-xs font-semibold text-[#2B141A] transition hover:border-[#6B1D2F]"
            >
              {viewMode === "masonry" ? (
                <>
                  <MapIcon className="h-4 w-4" strokeWidth={1.75} /> Map
                </>
              ) : (
                <>
                  <LayoutGrid className="h-4 w-4" strokeWidth={1.75} /> Grid
                </>
              )}
            </button>
          </div>
        </div>

        {/* Unified Neutral Filter Strip */}
        <div className="scroll-fade-x flex items-center gap-2 overflow-x-auto pb-1">
          {CATEGORIES.map((cat) => {
            const active = category === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`min-h-9 shrink-0 rounded-full border px-4 py-1.5 text-[13px] font-medium transition whitespace-nowrap ${
                  active
                    ? "border-[#6B1D2F] bg-[#6B1D2F] text-[#F5F0E6]"
                    : "border-[#2B141A]/12 bg-[#FAF7F0] text-[#2B141A] hover:border-[#6B1D2F]"
                }`}
              >
                {cat}
              </button>
            );
          })}

          <span className="mx-1 h-4 w-px shrink-0 bg-[#2B141A]/15" aria-hidden="true" />

          {regions.map((reg) => {
            const active = region === reg;
            return (
              <button
                key={reg}
                type="button"
                onClick={() => setRegion(reg)}
                className={`min-h-9 shrink-0 rounded-full border px-4 py-1.5 text-[13px] font-medium transition whitespace-nowrap ${
                  active
                    ? "border-[#6B1D2F] bg-[#6B1D2F] text-[#F5F0E6]"
                    : "border-[#2B141A]/12 bg-[#FAF7F0] text-[#2B141A] hover:border-[#6B1D2F]"
                }`}
              >
                {reg === "All" ? "All Regions" : reg}
              </button>
            );
          })}

          <span className="mx-1 h-4 w-px shrink-0 bg-[#2B141A]/15" aria-hidden="true" />

          {QUICK_DETOURS.map((hub) => (
            <button
              key={hub}
              type="button"
              onClick={() => void handleDetourSearch(hub)}
              className="min-h-9 shrink-0 rounded-full border border-[#2B141A]/12 bg-[#FAF7F0] px-4 py-1.5 text-[13px] font-medium text-[#61454D] transition hover:border-[#D9A12B] hover:text-[#2B141A] whitespace-nowrap"
            >
              Skip {hub}
            </button>
          ))}
        </div>
      </section>

      {toast && (
        <div
          className={`animate-panel-in flex items-center justify-between rounded-2xl border px-4 py-3 text-sm font-medium ${FEEDBACK_TONE_STYLES[toast.kind]}`}
        >
          <span className="inline-flex items-center gap-2">
            {toast.kind === "error" ? (
              <AlertTriangle className="h-4 w-4 shrink-0 text-[#A63D2A]" strokeWidth={1.75} />
            ) : toast.kind === "info" ? (
              <Info className="h-4 w-4 shrink-0 text-[#61454D]" strokeWidth={1.75} />
            ) : (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-[#6B1D2F]" strokeWidth={1.75} />
            )}
            {toast.text}
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

      {/* Expandable Detour Alternatives Strip */}
      {detourResult && (
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-2xl border border-black/12 bg-white p-4"
        >
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-bold text-[#2B141A]">
              Top 3 Offbeat Detours for &ldquo;{detourResult.hotspot}&rdquo; (Crowd Index{" "}
              {detourResult.hotspotCrowdIndex})
            </span>
            <span className="rounded-full border border-[#D9A12B]/40 bg-[#D9A12B]/15 px-2.5 py-0.5 font-semibold text-[#2B141A]">
              {detourResult.source === "gemini" ? "Gemini Vibe Match" : "Crowd + Vibe Engine"}
            </span>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {detourResult.alternatives.map((alt) => (
              <Link
                key={alt.place.id}
                href={`/place/${alt.place.id}`}
                className="flex h-full flex-col justify-between rounded-xl border border-[#2B141A]/12 bg-[#FAF7F0] p-4 transition hover:border-[#6B1D2F] hover:bg-white"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-full border border-[#6B1D2F]/20 bg-[#EFE3E6] px-2.5 py-0.5 text-[11px] font-semibold text-[#6B1D2F]">
                      {alt.crowdReductionPercent}% Less Crowded
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#2B141A] tabular-nums">
                      <ScoreFlameIcon className="h-3 w-3 text-[#D9A12B]" />
                      {alt.place.hiddenGemScore}
                    </span>
                  </div>
                  <h3 className="mt-2 font-bold text-[15px] leading-snug tracking-[-0.01em] text-[#2B141A]">
                    {alt.place.title}
                  </h3>
                  <p className="mt-1 text-xs text-[#61454D]">{alt.matchReason}</p>
                </div>
                <p className="mt-2 text-[11px] font-semibold text-[#6B1D2F]">
                  Commute: {alt.commuteSummary}
                </p>
              </Link>
            ))}
          </div>
        </motion.section>
      )}

      {/* Feed Content */}
      {loading ? (
        <div className="columns-1 gap-4 space-y-4 sm:columns-2 md:columns-3 lg:columns-4">
          {Array.from({ length: 8 }).map((_, idx) => {
            const aspect = ["aspect-[3/4]", "aspect-square", "aspect-[4/3]", "aspect-[3/4]"][
              idx % 4
            ];
            return (
              <div
                key={idx}
                className="break-inside-avoid animate-pulse overflow-hidden rounded-2xl border border-black/12 bg-white"
              >
                <div className={`${aspect} w-full bg-[#EBE4D5]`} />
                <div className="space-y-2 p-3">
                  <div className="h-3.5 w-3/4 rounded bg-[#EBE4D5]" />
                  <div className="h-3 w-1/2 rounded bg-[#EBE4D5]" />
                </div>
              </div>
            );
          })}
        </div>
      ) : viewMode === "map" ? (
        <LeafletMap places={filtered} heightClass="h-[540px]" />
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#2B141A]/15 bg-[#FAF7F0] p-12 text-center">
          <p className="font-rozha text-2xl text-[#2B141A]">
            No hidden gems match those filters yet.
          </p>
          <p className="mt-1 text-sm text-[#61454D]">
            Clear active filters or post a verified offbeat spot to seed this region.
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            {(category !== "All" || region !== "All") && (
              <button
                type="button"
                onClick={() => {
                  setCategory("All");
                  setRegion("All");
                }}
                className="min-h-9 rounded-full border border-[#2B141A]/12 bg-[#F5F0E6] px-4 py-1.5 text-xs font-bold text-[#2B141A] hover:border-[#6B1D2F]"
              >
                Clear Filters
              </button>
            )}
            <Link
              href="/submit"
              className="inline-flex min-h-9 items-center rounded-full bg-[#6B1D2F] px-4 py-1.5 text-xs font-bold text-[#F5F0E6] hover:bg-[#521523]"
            >
              Post a Hidden Gem
            </Link>
          </div>
        </div>
      ) : (
        <section className="columns-1 gap-4 space-y-4 sm:columns-2 md:columns-3 lg:columns-4">
          {filtered.map((place, idx) => {
            const publicAlertCount = place.safetyAlerts.filter(isSafetyAlertPublic).length;
            const gemBreakdown = getGemScoreBreakdown(place);
            const regionStyle = getRegionStyle(place.region);
            return (
              <motion.article
                key={place.id}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{
                  duration: 0.34,
                  delay: Math.min(idx % 4, 3) * 0.04,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className={`group break-inside-avoid overflow-hidden rounded-2xl border ${regionStyle.border} ${regionStyle.cardBg}`}
              >
                {/* Media Frame with Clean Gist Hover Overlay (no duplicate title or pill collision) */}
                <div className="relative overflow-hidden bg-[#DDE1D2]">
                  <Link href={`/place/${place.id}`} className="block">
                    <MediaCardPlayer
                      media={place.media[0]}
                      title={place.title}
                      compact
                    />

                    {/* Hover Gist Overlay */}
                    <div className="pointer-events-none absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-[#2B141A]/90 via-[#2B141A]/40 to-transparent p-4 text-[#F5F0E6] opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100">
                      <div className="translate-y-2 space-y-2 transition-transform duration-200 group-hover:translate-y-0 group-focus-within:translate-y-0">
                        {publicAlertCount > 0 && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#A63D2A] px-2.5 py-0.5 text-[11px] font-semibold text-[#F5F0E6]">
                            <AlertTriangle className="h-3 w-3" />
                            {publicAlertCount} local advisory
                          </span>
                        )}
                        <p className="line-clamp-3 text-[13px] leading-relaxed text-[#F5F0E6]/95">
                          {place.rawDescription}
                        </p>
                        <div className="flex items-center justify-between pt-1 text-xs font-semibold text-[#F5F0E6]">
                          <span>Read field guide</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </div>
                      </div>
                    </div>
                  </Link>

                  {/* Top-Right Quick Vouch Action */}
                  <button
                    type="button"
                    disabled={vouchingId === place.id}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      void handleVouch(place.id);
                    }}
                    className={`tactile-press absolute right-2.5 top-2.5 z-10 inline-flex min-h-8 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition ${
                      place.userHasVouched
                        ? "bg-[#6B1D2F] text-[#F5F0E6]"
                        : "bg-[#2B141A]/85 text-[#F5F0E6] hover:bg-[#6B1D2F] sm:opacity-0 sm:group-hover:opacity-100"
                    }`}
                  >
                    <HandHeart className="h-3.5 w-3.5" strokeWidth={1.75} />
                    {place.vouchesCount}
                  </button>
                </div>

                {/* Region-Tinted Card Body */}
                <div className="space-y-2.5 p-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${regionStyle.pill}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${regionStyle.dot}`} />
                      {place.region}
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setOpenScoreId((prev) => (prev === place.id ? null : place.id));
                      }}
                      className="inline-flex items-center gap-1 rounded-full border border-[#D9A12B]/40 bg-[#D9A12B]/15 px-2.5 py-0.5 text-xs font-semibold text-[#2B141A] tabular-nums transition hover:border-[#D9A12B]"
                      title="Gem Score breakdown"
                    >
                      <ScoreFlameIcon className="h-3.5 w-3.5 text-[#D9A12B]" />
                      {place.hiddenGemScore}
                    </button>
                  </div>

                  <Link
                    href={`/place/${place.id}`}
                    className="block text-[19px] font-bold leading-snug tracking-[-0.015em] text-[#2B141A] hover:text-[#6B1D2F]"
                  >
                    {place.title}
                  </Link>

                  <div className="flex items-center justify-between gap-2 pt-0.5">
                    <div className="flex items-center gap-2 text-xs text-[#61454D]">
                      <MemojiAvatar id={place.author.id} name={place.author.displayName} size={22} />
                      <span className="font-medium text-[#2B141A]">{place.author.displayName}</span>
                      {place.author.tier === "Local Legend" && (
                        <ShieldCheck
                          className="h-3.5 w-3.5 text-[#D9A12B]"
                          aria-label="Regional Steward"
                        />
                      )}
                    </div>
                    {place.localVendors.length > 0 && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-[#61454D]">
                        <Store className="h-3.5 w-3.5 text-[#6B1D2F]" />
                        {place.localVendors.length}
                      </span>
                    )}
                  </div>

                  {openScoreId === place.id && (
                    <div className="rounded-xl border border-black/12 bg-[#F4F5ED] p-3 text-xs text-[#1F271C]">
                      <div className="flex items-center justify-between font-semibold">
                        <span>Gem Score Formula</span>
                        <button
                          type="button"
                          onClick={() => setOpenScoreId(null)}
                          className="text-[#3D5236] hover:underline"
                        >
                          Close
                        </button>
                      </div>
                      <div className="mt-1.5 space-y-1 text-[#566151] tabular-nums">
                        <div className="flex justify-between">
                          <span>Vouches ({place.vouchesCount} × 2)</span>
                          <strong className="text-[#1F271C]">+{gemBreakdown.vouchesPoints}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Check-ins ({place.verifiedCheckinsCount} × 5)</span>
                          <strong className="text-[#1F271C]">+{gemBreakdown.checkinsPoints}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Crowd log10({place.mainstreamPopularityIndex} + 10)</span>
                          <strong className="text-[#1F271C]">÷ {gemBreakdown.crowdPenalty.toFixed(2)}</strong>
                        </div>
                        <div className="flex justify-between border-t border-black/10 pt-1 font-bold text-[#1F271C]">
                          <span>Score</span>
                          <span>{gemBreakdown.score}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.article>
            );
          })}
        </section>
      )}
    </div>
  );
}
