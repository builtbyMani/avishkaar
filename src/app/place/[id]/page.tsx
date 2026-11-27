"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  BookmarkCheck,
  BookmarkPlus,
  Bus,
  CheckCircle2,
  Compass,
  HandHeart,
  Landmark,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  Printer,
  QrCode,
  ShieldAlert,
  Store,
  UserCheck,
  Utensils,
  WifiOff,
  X,
} from "lucide-react";
import { useApp } from "@/components/AppProvider";
import { LeafletMap } from "@/components/LeafletMap";
import { MediaCardPlayer } from "@/components/MediaCardPlayer";
import type { EnrichedPlace, GuideRequest, LocalVendor, Profile, UserBadge } from "@/types/domain";

export default function PlaceDetailPage() {
  const params = useParams<{ id: string }>();
  const placeId = params?.id;
  const {
    activeUser,
    refreshProfiles,
    saveOfflineCard,
    removeOfflineCard,
    isSavedOffline,
  } = useApp();

  const [place, setPlace] = useState<EnrichedPlace | null>(null);
  const [matchingGuides, setMatchingGuides] = useState<Profile[]>([]);
  const [guideRequests, setGuideRequests] = useState<GuideRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [demoCheckInToggle, setDemoCheckInToggle] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [selectedGuide, setSelectedGuide] = useState<Profile | null>(null);
  const [preferredDate, setPreferredDate] = useState("2026-12-10");
  const [requestNotes, setRequestNotes] = useState("");
  const [submittingGuide, setSubmittingGuide] = useState(false);
  const [upiVendor, setUpiVendor] = useState<LocalVendor | null>(null);

  const loadPlace = useCallback(async () => {
    if (!placeId) return;
    setLoading(true);
    try {
      const qs = activeUser ? `?viewerId=${encodeURIComponent(activeUser.id)}` : "";
      const res = await fetch(`/api/places/${placeId}${qs}`, { cache: "no-store" });
      if (res.ok) {
        const data = (await res.json()) as {
          place: EnrichedPlace;
          matchingGuides: Profile[];
          guideRequests: GuideRequest[];
        };
        setPlace(data.place);
        setMatchingGuides(data.matchingGuides ?? []);
        setGuideRequests(data.guideRequests ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, [placeId, activeUser]);

  useEffect(() => {
    void loadPlace();
  }, [loadPlace]);

  async function handleVouch() {
    if (!activeUser || !place) return;
    const res = await fetch(`/api/places/${place.id}/vouch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: activeUser.id }),
    });
    const data = (await res.json()) as {
      pointsAwarded?: number;
      isVerifiedVisit?: boolean;
      unlockedBadges?: UserBadge[];
      error?: string;
    };
    if (!res.ok) {
      setFeedback(data.error || "Vouch failed");
      return;
    }
    const badgeInfo =
      data.unlockedBadges && data.unlockedBadges.length > 0
        ? ` New badge unlocked: ${data.unlockedBadges.map((b) => b.badgeName).join(", ")}!`
        : "";
    setFeedback(
      data.pointsAwarded
        ? `${data.isVerifiedVisit ? "Verified Visit Vouch" : "Vouch"} recorded (+${data.pointsAwarded} Trailblazer pts to ${place.author.displayName}).${badgeInfo}`
        : "Your vouch is already recorded.",
    );
    await Promise.all([loadPlace(), refreshProfiles()]);
  }

  async function handleCheckIn() {
    if (!activeUser || !place) return;
    setFeedback(null);

    if (demoCheckInToggle) {
      const res = await fetch(`/api/places/${place.id}/checkin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: activeUser.id, demoCheckIn: true }),
      });
      const data = (await res.json()) as { bonusDelta?: number; error?: string };
      if (!res.ok) {
        setFeedback(data.error || "Demo check-in failed");
        return;
      }
      setFeedback(
        data.bonusDelta && data.bonusDelta > 0
          ? `Demo Check-in verified! Previous Vouch upgraded (+${data.bonusDelta} bonus pts).`
          : "Demo Check-in verified! Your Vouch here now awards +25 Verified Visit points.",
      );
      await Promise.all([loadPlace(), refreshProfiles()]);
      return;
    }

    if (!navigator.geolocation) {
      setFeedback("Browser Geolocation unavailable — enable Demo Check-in toggle for judging.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const res = await fetch(`/api/places/${place.id}/checkin`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: activeUser.id,
            demoCheckIn: false,
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          }),
        });
        const data = (await res.json()) as { bonusDelta?: number; error?: string };
        if (!res.ok) {
          setFeedback(data.error || "Geolocation check-in failed");
          return;
        }
        setFeedback("Geolocation check-in verified! Verified Visit Vouch (+25 pts) unlocked.");
        await Promise.all([loadPlace(), refreshProfiles()]);
      },
      (err) => {
        setFeedback(
          `Geolocation denied (${err.message}). Toggle "Demo Check-in" ON for live judging.`,
        );
      },
    );
  }

  function handleSaveOffline() {
    if (!place) return;
    if (isSavedOffline(place.id)) {
      removeOfflineCard(place.id);
      setFeedback("Removed from Offline Pocket Cards.");
      return;
    }
    saveOfflineCard({
      placeId: place.id,
      title: place.title,
      region: place.region,
      category: place.category,
      savedAt: new Date().toISOString(),
      commute: place.structuredCards.commute,
      food: place.structuredCards.food,
      livingHeritage: place.structuredCards.livingHeritage ?? [],
      safetyAlerts: place.safetyAlerts,
      localVendors: place.localVendors,
    });
    setFeedback("Saved for Offline! Accessible anytime in Offline Pocket without signal.");
  }

  async function handleGuideRequestSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!activeUser || !place || !selectedGuide) return;
    setSubmittingGuide(true);
    try {
      const res = await fetch("/api/guide-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          placeId: place.id,
          guideId: selectedGuide.id,
          requesterId: activeUser.id,
          preferredDate,
          notes: requestNotes,
        }),
      });
      if (!res.ok) {
        const err = (await res.json()) as { error?: string };
        throw new Error(err.error || "Failed to send request");
      }
      setFeedback(`Guide request sent to ${selectedGuide.displayName} (Status: Pending).`);
      setSelectedGuide(null);
      setRequestNotes("");
      await loadPlace();
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : "Could not send request");
    } finally {
      setSubmittingGuide(false);
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-40 rounded bg-[#EAE2D6]" />
        <div className="h-80 rounded-3xl bg-[#EAE2D6]" />
        <div className="grid gap-4 md:grid-cols-3">
          <div className="h-44 rounded-2xl bg-[#EAE2D6]" />
          <div className="h-44 rounded-2xl bg-[#EAE2D6]" />
          <div className="h-44 rounded-2xl bg-[#EAE2D6]" />
        </div>
      </div>
    );
  }

  if (!place) {
    return (
      <div className="rounded-2xl border border-[#E8E0D4] bg-white p-10 text-center">
        <h1 className="font-display text-2xl font-bold text-[#1B3B36]">Place not found</h1>
        <Link href="/" className="mt-4 inline-block text-sm font-bold text-[#C85A32] underline">
          Back to Discover
        </Link>
      </div>
    );
  }

  const savedOffline = isSavedOffline(place.id);

  return (
    <div className="space-y-8">
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1B3B36] hover:text-[#C85A32]"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Discovery Feed
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleSaveOffline}
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition ${
              savedOffline
                ? "bg-emerald-700 text-white"
                : "border border-[#E8E0D4] bg-white text-[#1B3B36] hover:border-[#1B3B36]"
            }`}
          >
            {savedOffline ? <BookmarkCheck className="h-4 w-4" /> : <BookmarkPlus className="h-4 w-4" />}
            {savedOffline ? "Saved Offline" : "Save for Offline"}
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#E8E0D4] bg-white px-4 py-2 text-xs font-bold text-[#1B3B36] hover:bg-stone-50"
          >
            <Printer className="h-4 w-4" /> Print / PDF Card
          </button>
        </div>
      </div>

      {feedback && (
        <div className="no-print flex items-center justify-between rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-950">
          <span className="inline-flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-amber-700" />
            {feedback}
          </span>
          <button type="button" onClick={() => setFeedback(null)} className="text-xs font-bold underline">
            Close
          </button>
        </div>
      )}

      {/* Hero Header + Media */}
      <section className="print-card overflow-hidden rounded-3xl border border-[#E8E0D4] bg-white shadow-xs">
        <div className="grid gap-0 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <MediaCardPlayer media={place.media[0]} title={place.title} />
          </div>
          <div className="flex flex-col justify-between p-6 lg:col-span-5">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#1B3B36] px-3 py-1 text-xs font-bold text-white">
                  Gem Score {place.hiddenGemScore}
                </span>
                <span className="rounded-full bg-[#FAF7F2] px-3 py-1 text-xs font-semibold text-[#1B3B36]">
                  {place.category}
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#52635F]">
                  <MapPin className="h-3.5 w-3.5 text-[#C85A32]" />
                  {place.region}
                </span>
              </div>

              <h1 className="font-display text-3xl font-bold text-[#1B3B36]">
                {place.title}
              </h1>

              <p className="text-sm leading-relaxed text-[#52635F]">{place.rawDescription}</p>

              <div className="rounded-xl border border-[#E8E0D4] bg-[#FAF7F2] p-3 text-xs">
                <div className="font-bold text-[#1B3B36]">
                  Discovered by {place.author.displayName} ({place.author.tier} · {place.author.trailblazerScore} pts)
                </div>
                <div className="mt-1 text-[#52635F]">
                  {place.vouchesCount} Vouches · {place.verifiedCheckinsCount} Verified Check-ins
                </div>
              </div>
            </div>

            {/* Vouch & Check-in Controls */}
            <div className="no-print mt-6 space-y-3 border-t border-[#E8E0D4] pt-4">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => void handleVouch()}
                  className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                    place.userHasVouched
                      ? "bg-emerald-700 text-white"
                      : "bg-[#C85A32] text-white hover:bg-[#b24d28]"
                  }`}
                >
                  <HandHeart className="h-4 w-4" />
                  {place.userHasVouched
                    ? place.userVerifiedVisitVouch
                      ? "Verified Visit Vouched (+25)"
                      : "Vouched (+10)"
                    : place.userHasCheckedIn
                      ? "Verified Visit Vouch (+25 pts)"
                      : "Vouch (+10 pts)"}
                </button>

                <button
                  type="button"
                  onClick={() => void handleCheckIn()}
                  className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                    place.userHasCheckedIn
                      ? "border border-emerald-300 bg-emerald-50 text-emerald-900"
                      : "border border-[#1B3B36] bg-white text-[#1B3B36] hover:bg-[#1B3B36] hover:text-white"
                  }`}
                >
                  <Navigation className="h-4 w-4" />
                  {place.userHasCheckedIn ? "Checked In ✓" : "Check In"}
                </button>
              </div>

              <label className="flex cursor-pointer items-center justify-between rounded-xl border border-[#E8E0D4] bg-[#FAF7F2] px-3 py-2 text-xs">
                <span className="font-semibold text-[#1B3B36]">
                  Demo Check-in Toggle (Bypass GPS radius for live judging)
                </span>
                <input
                  type="checkbox"
                  checked={demoCheckInToggle}
                  onChange={(e) => setDemoCheckInToggle(e.target.checked)}
                  className="h-4 w-4 accent-[#C85A32]"
                />
              </label>
            </div>
          </div>
        </div>
      </section>

      {/* High-Contrast Safety & Do Not Do Banner */}
      {place.safetyAlerts.length > 0 && (
        <section className="print-card rounded-2xl border-2 border-red-600 bg-red-50 p-5 text-red-950">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-red-600" />
            <h2 className="font-display text-xl font-bold text-red-900">
              Safety &amp; &ldquo;Do Not Do&rdquo; Advisories
            </h2>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {place.safetyAlerts.map((alert, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-red-200 bg-white p-3.5 shadow-2xs"
              >
                <span className="inline-flex items-center gap-1 rounded-full bg-red-600 px-2.5 py-0.5 text-[11px] font-bold text-white">
                  {alert.tag === "Low Network" ? (
                    <WifiOff className="h-3 w-3" />
                  ) : (
                    <AlertTriangle className="h-3 w-3" />
                  )}
                  {alert.tag}
                </span>
                <p className="mt-2 text-sm font-medium text-stone-800">{alert.message}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Structured Commute, Food, Activity & Living Heritage Cards */}
      <section className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        <div className="print-card rounded-2xl border border-[#E8E0D4] bg-white p-5">
          <div className="flex items-center gap-2 text-[#1B3B36]">
            <Bus className="h-5 w-5 text-[#C85A32]" />
            <h2 className="font-display text-lg font-bold">Last-Mile Commute</h2>
          </div>
          <ul className="mt-3 space-y-2.5 text-sm text-[#52635F]">
            {place.structuredCards.commute.map((step, i) => (
              <li key={i} className="flex gap-2">
                <span className="font-bold text-[#C85A32]">{i + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="print-card rounded-2xl border border-[#E8E0D4] bg-white p-5">
          <div className="flex items-center gap-2 text-[#1B3B36]">
            <Utensils className="h-5 w-5 text-[#C85A32]" />
            <h2 className="font-display text-lg font-bold">Must-Try Food</h2>
          </div>
          <div className="mt-3 space-y-3">
            {place.structuredCards.food.map((item, i) => (
              <div key={i} className="rounded-xl bg-[#FAF7F2] p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-bold text-[#1B3B36]">{item.name}</span>
                  {item.priceHint && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-900">
                      {item.priceHint}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-[#52635F]">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="print-card rounded-2xl border border-[#E8E0D4] bg-white p-5">
          <div className="flex items-center gap-2 text-[#1B3B36]">
            <Compass className="h-5 w-5 text-[#C85A32]" />
            <h2 className="font-display text-lg font-bold">Local Activities</h2>
          </div>
          <ul className="mt-3 space-y-2.5 text-sm text-[#52635F]">
            {place.structuredCards.activities.map((act, i) => (
              <li key={i} className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#1B3B36]" />
                <span>{act}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="print-card rounded-2xl border border-[#E8E0D4] bg-white p-5">
          <div className="flex items-center gap-2 text-[#1B3B36]">
            <Landmark className="h-5 w-5 text-[#C85A32]" />
            <h2 className="font-display text-lg font-bold">Living Heritage &amp; Etiquette</h2>
          </div>
          <ul className="mt-3 space-y-2.5 text-sm text-[#52635F]">
            {(place.structuredCards.livingHeritage?.length
              ? place.structuredCards.livingHeritage
              : [
                  `Support community craft studios directly in ${place.region}.`,
                  "Ask permission before taking close-up photos of artisans and elders.",
                ]
            ).map((tip, i) => (
              <li key={i} className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#C85A32]" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Support Local (Zero-Commission Local Economy Action Cards) */}
      <section className="print-card rounded-2xl border border-[#E8E0D4] bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Store className="h-5 w-5 text-[#D97706]" />
            <h2 className="font-display text-2xl font-bold text-[#1B3B36]">
              Zero-Commission &ldquo;Support Local&rdquo; Cards
            </h2>
          </div>
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-900">
            0% Platform Commission
          </span>
        </div>
        <p className="mt-1 text-sm text-[#52635F]">
          Direct community spots verified by travelers so 100% of tourism revenue stays in local hands.
        </p>

        {place.localVendors.length === 0 ? (
          <p className="mt-4 text-sm text-[#52635F]">No local vendors tagged yet.</p>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {place.localVendors.map((v) => {
              const phoneDigits = (v.whatsapp || v.contact).replace(/[^\d+]/g, "");
              const waDigits = phoneDigits.replace(/^\+/, "");
              const upiHandle =
                v.upiId ||
                `${v.name.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 12)}@upi`;
              return (
                <div
                  key={v.id}
                  className="flex flex-col justify-between rounded-xl border border-[#E8E0D4] bg-[#FAF7F2] p-4"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-[#1B3B36]">{v.name}</span>
                      <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-900">
                        {v.category}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs text-[#52635F]">{v.specialty}</p>
                    <p className="mt-2 text-xs font-semibold text-[#1B3B36]">
                      {v.contact} · {v.lat.toFixed(4)}, {v.lng.toFixed(4)}
                    </p>
                  </div>
                  <div className="no-print mt-3 flex flex-wrap gap-2 border-t border-[#E8E0D4] pt-3">
                    <a
                      href={`https://www.openstreetmap.org/directions?to=${v.lat},${v.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg bg-[#1B3B36] px-2.5 py-1.5 text-[11px] font-bold text-white hover:bg-[#C85A32]"
                    >
                      <Navigation className="h-3 w-3" /> Navigate to Pin
                    </a>
                    {waDigits.length >= 8 ? (
                      <a
                        href={`https://wa.me/${waDigits}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-lg border border-emerald-300 bg-emerald-50 px-2.5 py-1.5 text-[11px] font-bold text-emerald-900 hover:bg-emerald-100"
                      >
                        <MessageCircle className="h-3 w-3" /> WhatsApp
                      </a>
                    ) : null}
                    {phoneDigits.length >= 6 ? (
                      <a
                        href={`tel:${phoneDigits}`}
                        className="inline-flex items-center gap-1 rounded-lg border border-[#E8E0D4] bg-white px-2.5 py-1.5 text-[11px] font-bold text-[#1B3B36] hover:bg-stone-50"
                      >
                        <Phone className="h-3 w-3" /> Call
                      </a>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => setUpiVendor({ ...v, upiId: upiHandle })}
                      className="inline-flex items-center gap-1 rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-1.5 text-[11px] font-bold text-amber-950 hover:bg-amber-100"
                    >
                      <QrCode className="h-3 w-3" /> Direct UPI QR
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Interactive Leaflet Map */}
      <section className="no-print space-y-3">
        <h2 className="font-display text-2xl font-bold text-[#1B3B36]">
          Interactive Area &amp; Safety Map
        </h2>
        <LeafletMap
          places={[place]}
          vendors={place.localVendors}
          center={[place.lat, place.lng]}
          zoom={13}
          heightClass="h-[360px]"
        />
      </section>

      {/* Trust-Gated Volunteer Local Guides */}
      <section className="no-print rounded-2xl border border-[#E8E0D4] bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-emerald-700" />
              <h2 className="font-display text-2xl font-bold text-[#1B3B36]">
                Trust-Gated Volunteer Local Guides
              </h2>
            </div>
            <p className="mt-1 text-sm text-[#52635F]">
              Only Pathfinder (100+ pts), Local Legend (300+ pts), or verified locals can guide in {place.region}.
            </p>
          </div>
          <Link
            href="/profile"
            className="text-xs font-bold text-[#C85A32] hover:underline"
          >
            Volunteer as a Guide →
          </Link>
        </div>

        {matchingGuides.length === 0 ? (
          <p className="mt-4 text-sm text-[#52635F]">
            No active volunteer guides for {place.region} yet.
          </p>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {matchingGuides.map((guide) => (
              <div
                key={guide.id}
                className="flex flex-col justify-between rounded-xl border border-[#E8E0D4] bg-[#FAF7F2] p-4"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-[#1B3B36]">{guide.displayName}</span>
                    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-900">
                      {guide.tier} · {guide.trailblazerScore} pts
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[#52635F]">
                    Languages: {guide.languages.join(", ") || "English"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedGuide(guide)}
                  className="mt-4 rounded-lg bg-[#1B3B36] px-4 py-2 text-xs font-bold text-white hover:bg-[#C85A32]"
                >
                  Request Guide
                </button>
              </div>
            ))}
          </div>
        )}

        {guideRequests.length > 0 && (
          <div className="mt-6 border-t border-[#E8E0D4] pt-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#52635F]">
              Recent Guide Requests for This Destination
            </h3>
            <div className="mt-2 space-y-2">
              {guideRequests.map((req) => (
                <div
                  key={req.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#E8E0D4] bg-white px-3.5 py-2.5 text-xs"
                >
                  <span className="text-[#1B3B36]">
                    <strong>{req.preferredDate || "Flexible"}</strong> — {req.notes}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 font-bold ${
                      req.status === "Accepted"
                        ? "bg-emerald-100 text-emerald-900"
                        : "bg-amber-100 text-amber-900"
                    }`}
                  >
                    {req.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Request Guide Modal */}
      {selectedGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <form
            onSubmit={handleGuideRequestSubmit}
            className="w-full max-w-md space-y-4 rounded-2xl border border-[#E8E0D4] bg-[#FAF7F2] p-6 shadow-2xl"
          >
            <h3 className="font-display text-xl font-bold text-[#1B3B36]">
              Request Guide: {selectedGuide.displayName}
            </h3>
            <p className="text-xs text-[#52635F]">
              Speaks {selectedGuide.languages.join(", ")} · {place.title}
            </p>
            <div>
              <label className="block text-xs font-bold text-[#1B3B36]">Preferred Date</label>
              <input
                type="date"
                required
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[#E8E0D4] bg-white px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#1B3B36]">Trip Notes</label>
              <textarea
                required
                rows={3}
                value={requestNotes}
                onChange={(e) => setRequestNotes(e.target.value)}
                placeholder="Tell the volunteer guide what trails, local food, or crafts you'd love to explore..."
                className="mt-1 w-full rounded-lg border border-[#E8E0D4] bg-white px-3 py-2 text-sm"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedGuide(null)}
                className="rounded-lg border border-[#E8E0D4] bg-white px-4 py-2 text-xs font-bold text-[#1B3B36]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingGuide}
                className="rounded-lg bg-[#C85A32] px-4 py-2 text-xs font-bold text-white disabled:opacity-60"
              >
                {submittingGuide ? "Sending..." : "Send Request"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Zero-Commission Direct UPI QR Modal */}
      {upiVendor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-sm space-y-4 rounded-2xl border border-[#E8E0D4] bg-[#FAF7F2] p-6 text-center shadow-2xl">
            <button
              type="button"
              onClick={() => setUpiVendor(null)}
              className="absolute right-4 top-4 rounded-full p-1 text-[#52635F] hover:bg-[#E8E0D4]"
              aria-label="Close UPI preview"
            >
              <X className="h-4 w-4" />
            </button>
            <span className="inline-block rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-bold text-emerald-900">
              0% Platform Commission · Direct to Local
            </span>
            <h3 className="font-display text-xl font-bold text-[#1B3B36]">{upiVendor.name}</h3>
            <p className="text-xs text-[#52635F]">{upiVendor.specialty}</p>
            <div className="mx-auto flex h-40 w-40 items-center justify-center rounded-2xl border border-[#E8E0D4] bg-white p-3">
              <svg viewBox="0 0 21 21" className="h-full w-full fill-[#1B3B36]" aria-label="UPI QR Code Preview">
                <rect x="0" y="0" width="7" height="7" />
                <rect x="1" y="1" width="5" height="5" fill="#fff" />
                <rect x="2" y="2" width="3" height="3" />
                <rect x="14" y="0" width="7" height="7" />
                <rect x="15" y="1" width="5" height="5" fill="#fff" />
                <rect x="16" y="2" width="3" height="3" />
                <rect x="0" y="14" width="7" height="7" />
                <rect x="1" y="15" width="5" height="5" fill="#fff" />
                <rect x="2" y="16" width="3" height="3" />
                <rect x="9" y="2" width="2" height="2" />
                <rect x="8" y="6" width="3" height="2" />
                <rect x="9" y="10" width="4" height="3" />
                <rect x="14" y="9" width="3" height="2" />
                <rect x="10" y="15" width="3" height="3" />
                <rect x="15" y="14" width="4" height="2" />
                <rect x="17" y="17" width="3" height="3" />
              </svg>
            </div>
            <div className="rounded-xl border border-[#E8E0D4] bg-white px-3 py-2 text-xs font-mono font-bold text-[#1B3B36]">
              {upiVendor.upiId}
            </div>
            <a
              href={`upi://pay?pa=${encodeURIComponent(upiVendor.upiId || "")}&pn=${encodeURIComponent(upiVendor.name)}&cu=INR`}
              className="block w-full rounded-xl bg-[#1B3B36] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#C85A32]"
            >
              Open in UPI App
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
