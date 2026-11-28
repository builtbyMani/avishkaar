"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Award, Check, CheckCircle2, Info, Lock, ShieldCheck, Trophy, UserCheck } from "@/components/Icons";
import { useApp } from "@/components/AppProvider";
import { MemojiAvatar } from "@/components/MemojiAvatar";
import { canVolunteerAsGuide, getPlaceSlug, getTierDisplayLabel, REGIONS, TRAILBLAZER_TIER_STYLES, VOLUNTEER_GUIDE_DISCLAIMERS } from "@/lib/domain";
import { getAuthHeaders } from "@/lib/supabase";
import type { EnrichedPlace, GuideRequest, Profile, UserBadge } from "@/types/domain";

export default function ProfilePage() {
  const { activeUser, refreshProfiles, openAuthModal } = useApp();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [requests, setRequests] = useState<GuideRequest[]>([]);
  const [authoredPlaces, setAuthoredPlaces] = useState<EnrichedPlace[]>([]);

  const [isGuide, setIsGuide] = useState(false);
  const [guideRegion, setGuideRegion] = useState<string>(REGIONS[0]);
  const [languagesText, setLanguagesText] = useState("English, Hindi");
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    if (!activeUser) return;
    const res = await fetch(`/api/profile?userId=${encodeURIComponent(activeUser.id)}`, {
      cache: "no-store",
    });
    if (res.ok) {
      const data = (await res.json()) as {
        profile: Profile;
        badges: UserBadge[];
        guideRequests: GuideRequest[];
        authoredPlaces: EnrichedPlace[];
      };
      setProfile(data.profile);
      setBadges(data.badges ?? []);
      setRequests(data.guideRequests ?? []);
      setAuthoredPlaces(data.authoredPlaces ?? []);
      setIsGuide(data.profile.isGuide);
      if (data.profile.guideRegion) setGuideRegion(data.profile.guideRegion);
      if (data.profile.languages.length > 0) setLanguagesText(data.profile.languages.join(", "));
    }
  }, [activeUser]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  async function handleSaveGuide(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    setStatusMsg(null);
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(await getAuthHeaders()),
      },
      body: JSON.stringify({
        userId: profile.id,
        isGuide,
        guideRegion: isGuide ? guideRegion : null,
        languages: languagesText
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      }),
    });
    const data = (await res.json()) as { error?: string };
    if (!res.ok) {
      setStatusMsg(data.error || "Failed to update guide status");
      return;
    }
    setStatusMsg("Volunteer Guide preferences saved!");
    await Promise.all([loadProfile(), refreshProfiles()]);
  }

  async function handleAcceptRequest(requestId: string) {
    if (!profile) return;
    const res = await fetch("/api/guide-requests", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(await getAuthHeaders()),
      },
      body: JSON.stringify({ requestId, guideId: profile.id }),
    });
    if (res.ok) {
      setStatusMsg("Guide request accepted!");
      await loadProfile();
    }
  }

  if (!profile) {
    return <div className="h-64 animate-pulse rounded-3xl bg-[#EAE2D6]" />;
  }

  const guideEligible = canVolunteerAsGuide(profile);
  const progressPercent = Math.min(100, Math.round((profile.trailblazerScore / 300) * 100));

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <section className="rounded-2xl border border-black/12 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <MemojiAvatar id={profile.id} name={profile.displayName} size={56} />
            <div>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${
                  TRAILBLAZER_TIER_STYLES[profile.tier].badge
                }`}
              >
                <Award className="h-3.5 w-3.5" strokeWidth={2} />
                {getTierDisplayLabel(profile.tier)}
              </span>
              <h1 className="mt-1.5 font-display text-4xl text-[#1F271C]">
                {profile.displayName}
              </h1>
              <p className="text-sm text-[#566151]">
                @{profile.username} · {profile.trailblazerScore} Community Points
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={openAuthModal}
            className="tactile-press min-h-10 rounded-full border border-black/12 bg-[#FAF7F2] px-4 py-2 text-xs font-bold text-[#6B1D2F] hover:border-[#6B1D2F]"
          >
            Account &amp; Profiles
          </button>
        </div>

        {/* Tier progress */}
        <div className="mt-6 space-y-2">
          <div className="flex justify-between text-xs font-semibold text-[#566151]">
            <span>Explorer (0)</span>
            <span>Field Scout (100)</span>
            <span>Regional Steward (300+)</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-[#EAE2D6]">
            <div
              className={`h-full rounded-full transition-all duration-300 ${TRAILBLAZER_TIER_STYLES[profile.tier].progressFill}`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </section>

      {statusMsg && (
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900">
          <CheckCircle2 className="h-4 w-4 text-emerald-700" />
          {statusMsg}
        </div>
      )}

      {/* Trophy Shelf (Asymmetric Bento) */}
      <section className="rounded-2xl border border-black/12 bg-white p-5">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-[#D97706]" strokeWidth={2} />
          <h2 className="font-display text-2xl font-bold text-[#6B1D2F]">Trophy Shelf</h2>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {[
            {
              key: "first_discovery",
              name: "First Discovery",
              desc: "Publish your first hidden gem.",
              span: false,
            },
            {
              key: "foodie_scout",
              name: "Foodie Scout",
              desc: "Vouch for 2+ regional food spots.",
              span: false,
            },
            {
              key: "local_legend",
              name: "Regional Steward",
              desc: "Reach 300+ community points for priority regional curation.",
              span: true,
            },
          ].map((b) => {
            const unlocked = badges.find((ub) => ub.badgeKey === b.key);
            return (
              <div
                key={b.key}
                className={`flex flex-col justify-between rounded-2xl border p-4 ${
                  b.span ? "md:col-span-2" : ""
                } ${
                  unlocked
                    ? "border-amber-300 bg-amber-50/70"
                    : "border-black/12 bg-[#FAF7F2] opacity-65"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#6B1D2F]">{b.name}</span>
                    {unlocked ? (
                      <ShieldCheck className="h-5 w-5 text-amber-600" strokeWidth={2} />
                    ) : (
                      <Lock className="h-4 w-4 text-[#52635F]" strokeWidth={1.75} />
                    )}
                  </div>
                  <p className="mt-1 text-xs text-[#52635F]">{b.desc}</p>
                </div>
                {unlocked ? (
                  <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                    <Check className="h-3.5 w-3.5" strokeWidth={2.25} /> Unlocked
                  </span>
                ) : (
                  <span className="mt-2 text-[11px] font-bold text-[#52635F]">Locked</span>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Trust-Gated Volunteer Guide Toggle */}
      <section className="rounded-2xl border border-[#E8E0D4] bg-white p-6">
        <div className="flex items-center gap-2">
          <UserCheck className="h-5 w-5 text-emerald-700" />
          <h2 className="font-display text-2xl font-bold text-[#6B1D2F]">
            Volunteer as a Local Guide (Trust-Gated)
          </h2>
        </div>
        <p className="mt-1 text-sm text-[#566151]">
          To prevent spam, only <strong>Field Scouts (100+ pts)</strong>,{" "}
          <strong>Regional Stewards (300+ pts)</strong>, or verified locals can enable guide status.
        </p>

        <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50/80 p-3.5 text-xs text-amber-950">
          <div className="flex items-center gap-1.5 font-bold text-[#6B1D2F]">
            <Info className="h-3.5 w-3.5" />
            <span>{VOLUNTEER_GUIDE_DISCLAIMERS.title}</span>
          </div>
          <ul className="mt-1.5 space-y-1">
            {VOLUNTEER_GUIDE_DISCLAIMERS.points.map((line) => (
              <li key={line}>• {line}</li>
            ))}
          </ul>
        </div>

        {!guideEligible ? (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
            You currently have <strong>{profile.trailblazerScore} pts</strong> ({getTierDisplayLabel(profile.tier)}). Earn{" "}
            <strong>{100 - profile.trailblazerScore} more points</strong> via discoveries &amp; vouches
            (or switch to Ananya/Biju/Kavya in Persona Switcher) to unlock Guide mode.
          </div>
        ) : (
          <form onSubmit={handleSaveGuide} className="mt-4 grid gap-4 sm:grid-cols-3">
            <label className="flex items-center gap-2.5 rounded-xl border border-[#E8E0D4] bg-[#FAF7F2] px-4 py-3 text-sm font-bold text-[#6B1D2F]">
              <input
                type="checkbox"
                checked={isGuide}
                onChange={(e) => setIsGuide(e.target.checked)}
                className="h-4 w-4 accent-[#6B1D2F]"
              />
              Volunteer as Guide
            </label>
            <select
              value={guideRegion}
              onChange={(e) => setGuideRegion(e.target.value)}
              className="rounded-xl border border-[#E8E0D4] bg-white px-3.5 py-2.5 text-sm"
            >
              {REGIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <input
              value={languagesText}
              onChange={(e) => setLanguagesText(e.target.value)}
              placeholder="Languages (comma-separated)"
              className="rounded-xl border border-[#E8E0D4] px-3.5 py-2.5 text-sm"
            />
            <button
              type="submit"
              className="rounded-xl bg-[#6B1D2F] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#C85A32] sm:col-span-3 sm:w-fit"
            >
              Save Guide Preferences
            </button>
          </form>
        )}
      </section>

      {/* Guide Requests */}
      <section className="rounded-2xl border border-[#E8E0D4] bg-white p-6">
        <h2 className="font-display text-2xl font-bold text-[#6B1D2F]">
          Guide Requests ({requests.length})
        </h2>
        {requests.length === 0 ? (
          <p className="mt-2 text-sm text-[#52635F]">No guide requests yet.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {requests.map((r) => (
              <div
                key={r.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#E8E0D4] bg-[#FAF7F2] p-4 text-sm"
              >
                <div>
                  <div className="font-bold text-[#6B1D2F]">
                    Date: {r.preferredDate || "Flexible"} ·{" "}
                    <Link href={`/place/${r.placeId}`} className="text-[#C85A32] underline">
                      View Place
                    </Link>
                  </div>
                  <p className="mt-1 text-xs text-[#52635F]">{r.notes}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      r.status === "Accepted"
                        ? "bg-emerald-100 text-emerald-900"
                        : "bg-amber-100 text-amber-900"
                    }`}
                  >
                    {r.status}
                  </span>
                  {r.guideId === profile.id && r.status === "Pending" && (
                    <button
                      type="button"
                      onClick={() => void handleAcceptRequest(r.id)}
                      className="rounded-lg bg-[#6B1D2F] px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700"
                    >
                      Accept
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Authored Destinations */}
      <section className="rounded-2xl border border-[#E8E0D4] bg-white p-6">
        <h2 className="font-display text-xl font-bold text-[#6B1D2F]">
          Your Discovered Spots ({authoredPlaces.length})
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {authoredPlaces.map((p) => (
            <Link
              key={p.id}
              href={`/place/${getPlaceSlug(p)}`}
              className="rounded-full border border-[#E8E0D4] bg-[#FAF7F2] px-4 py-1.5 text-xs font-semibold text-[#6B1D2F] hover:border-[#C85A32]"
            >
              {p.title} · Gem {p.hiddenGemScore}
            </Link>
          ))}
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#E8E0D4] bg-[#FAF7F2] px-5 py-4 text-xs text-[#61454D]">
        <span>Questions about Local Guides, verification tiers, or trail updates?</span>
        <div className="flex items-center gap-4 font-bold text-[#6B1D2F]">
          <Link href="/about" className="hover:underline">
            About Us
          </Link>
          <Link href="/contact" className="hover:underline">
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
}
