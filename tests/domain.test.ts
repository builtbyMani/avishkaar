import assert from "node:assert/strict";
import test from "node:test";
import { SEED_PLACES, SEED_PROFILES } from "../src/data/seed";
import { extractYouTubeEmbedId } from "../src/components/MediaCardPlayer";
import { findDetourAlternativesFallback } from "../src/lib/detour";
import {
  applySafetyVote,
  canVolunteerAsGuide,
  computeCheckInUpgradeDelta,
  computeHiddenGemScore,
  computeVouchPointsDelta,
  evaluateNewBadges,
  formatUpiHandle,
  getGemScoreBreakdown,
  getTierFromScore,
  isSafetyAlertPublic,
  PLACE_CATEGORIES,
  REGIONS,
  sortFeedPlaces,
} from "../src/lib/domain";
import { extractStructuredPlaceFallback } from "../src/lib/gemini";

test("Hidden Gem Score matches exact blueprint formula", () => {
  // ((10 * 2) + (4 * 5)) / log10(90 + 10) = 40 / 2 = 20
  const score = computeHiddenGemScore(10, 4, 90);
  assert.equal(score, 20);
});

test("Trailblazer tiers unlock at 100 and 300 points", () => {
  assert.equal(getTierFromScore(0), "Wanderer");
  assert.equal(getTierFromScore(99), "Wanderer");
  assert.equal(getTierFromScore(100), "Pathfinder");
  assert.equal(getTierFromScore(299), "Pathfinder");
  assert.equal(getTierFromScore(300), "Local Legend");
});

test("Volunteer guide toggle is trust-gated", () => {
  assert.equal(canVolunteerAsGuide({ trailblazerScore: 40, isVerifiedLocal: false }), false);
  assert.equal(canVolunteerAsGuide({ trailblazerScore: 100, isVerifiedLocal: false }), true);
  assert.equal(canVolunteerAsGuide({ trailblazerScore: 20, isVerifiedLocal: true }), true);
});

test("Vouch and Verified Visit Vouch award +10 and +25 points cleanly", () => {
  const firstVouch = computeVouchPointsDelta(undefined);
  assert.equal(firstVouch.pointsDelta, 10);
  assert.equal(firstVouch.isVerifiedVisit, false);

  const afterCheckIn = computeVouchPointsDelta({
    checkedInAt: "2026-11-27T10:00:00Z",
    vouchedAt: null,
    pointsAwarded: 0,
  });
  assert.equal(afterCheckIn.pointsDelta, 25);
  assert.equal(afterCheckIn.isVerifiedVisit, true);

  const checkInAfterRegularVouch = computeCheckInUpgradeDelta({
    checkedInAt: null,
    vouchedAt: "2026-11-27T09:00:00Z",
    pointsAwarded: 10,
  });
  assert.equal(checkInAfterRegularVouch.pointsDelta, 15);
  assert.equal(checkInAfterRegularVouch.isFirstCheckIn, true);
});

test("Milestone badges auto-award for First Discovery, Foodie Scout, and Local Legend", () => {
  const profile = { ...SEED_PROFILES[5], trailblazerScore: 310 };
  const unlocked = evaluateNewBadges({
    profile,
    authoredPlacesCount: 1,
    vouchedPlaces: [SEED_PLACES[4], SEED_PLACES[7]],
    existingBadges: [],
  });
  const keys = unlocked.map((b) => b.badgeKey).sort();
  assert.deepEqual(keys, ["first_discovery", "foodie_scout", "local_legend"]);
});

test("Multilingual Hinglish/English fallback extracts 4 cards including Living Heritage & safety tags", () => {
  const result = extractStructuredPlaceFallback(
    "Subah 6 AM local bus lo Sangla se aur walk 2 km. Try buckwheat khana aur chai. Mandir me respect local parampara. Raat ko cliff road avoid karo, network zero hai.",
    "Chitkul",
    "Spiti & Kinnaur",
  );
  assert.equal(result.source, "fallback");
  assert.ok(result.structuredCards.commute.length >= 1);
  assert.ok(result.structuredCards.food.length >= 1);
  assert.ok((result.structuredCards.livingHeritage ?? []).length >= 1);
  assert.ok(result.safetyAlerts.some((a) => a.tag === "Avoid After Dark"));
  assert.ok(result.safetyAlerts.some((a) => a.tag === "Low Network"));
  assert.ok(result.safetyAlerts.some((a) => a.tag === "Cultural Etiquette"));
});

test("Detour Bar finds top 3 lower-crowd alternatives for Ooty, Goa, and Hampi", () => {
  const profilesMap = new Map(SEED_PROFILES.map((p) => [p.id, p]));
  const enriched = sortFeedPlaces(SEED_PLACES, profilesMap, new Map());

  for (const hub of ["Ooty", "Goa", "Hampi"]) {
    const res = findDetourAlternativesFallback(hub, enriched);
    assert.equal(res.alternatives.length, 3);
    assert.ok(res.alternatives.every((alt) => alt.crowdReductionPercent >= 35));
    assert.ok(res.alternatives.every((alt) => alt.commuteSummary.length > 0));
  }
});

test("YouTube Shorts URL parser handles Shorts, youtu.be, and non-YouTube URLs", () => {
  assert.equal(extractYouTubeEmbedId("https://www.youtube.com/shorts/abc123XYZ"), "abc123XYZ");
  assert.equal(extractYouTubeEmbedId("https://youtu.be/xyz987"), "xyz987");
  assert.equal(extractYouTubeEmbedId("https://example.com/clip.mp4"), null);
});

test("Community Safety Verify/Flag gate enforces Pathfinder+ or 2+ user verification", () => {
  const wandererAlert = {
    tag: "Scam Alert" as const,
    message: "Watch out for fake boat touts.",
    authorTier: "Wanderer" as const,
    verifiedBy: [],
    flaggedBy: [],
  };
  assert.equal(isSafetyAlertPublic(wandererAlert), false);

  // 1 Wanderer verify is not enough
  const oneVerify = applySafetyVote(wandererAlert, "u1", "verify", "Wanderer");
  assert.equal(isSafetyAlertPublic(oneVerify), false);

  // 2nd Wanderer verify publishes publicly
  const twoVerifies = applySafetyVote(oneVerify, "u2", "verify", "Wanderer");
  assert.equal(isSafetyAlertPublic(twoVerifies), true);

  // 1 Pathfinder verify immediately publishes publicly
  const pathfinderVerified = applySafetyVote(wandererAlert, "p1", "verify", "Pathfinder");
  assert.equal(isSafetyAlertPublic(pathfinderVerified), true);

  // 2 flags hide an unverified/outnumbered alert
  const flaggedOnce = applySafetyVote(wandererAlert, "f1", "flag", "Wanderer");
  const flaggedTwice = applySafetyVote(flaggedOnce, "f2", "flag", "Wanderer");
  assert.equal(isSafetyAlertPublic(flaggedTwice), false);
});

test("Seed dataset has 58 destinations including Pandavula Gutta, Chettinad, Ziro Valley & public alerts", () => {
  assert.equal(SEED_PLACES.length, 58);
  const titles = SEED_PLACES.map((p) => p.title);
  assert.ok(titles.some((t) => t.includes("Pandavula Gutta")));
  assert.ok(titles.some((t) => t.includes("Chettinad")));
  assert.ok(titles.some((t) => t.includes("Ziro Valley")));

  const videoCount = SEED_PLACES.flatMap((p) => p.media).filter((m) => m.type === "video").length;
  assert.ok(videoCount >= 2);
  assert.ok(SEED_PLACES.every((p) => (p.structuredCards.livingHeritage ?? []).length >= 1));
  assert.ok(SEED_PLACES.every((p) => p.safetyAlerts.every(isSafetyAlertPublic)));

  const profilesMap = new Map(SEED_PROFILES.map((p) => [p.id, p]));
  const sorted = sortFeedPlaces(SEED_PLACES, profilesMap, new Map());
  assert.ok(sorted[0].hiddenGemScore >= sorted[sorted.length - 1].hiddenGemScore);
  assert.ok(
    SEED_PLACES.flatMap((p) => p.media).every(
      (m) => !m.url.includes("mixkit.co") && !m.url.includes("1513519245088"),
    ),
  );
});

test("Shared domain constants, UPI formatting, and Gem Score breakdown match canonical values", () => {
  assert.equal(REGIONS.length, 9);
  assert.equal(PLACE_CATEGORIES.length, 5);
  assert.equal(formatUpiHandle("Kago Stay Ziro", "kagostayziro@upi"), "kagostayziro@upi");
  assert.equal(formatUpiHandle("Mei Siew Kitchen & Stay"), "meisiewkitch@upi");

  const breakdown = getGemScoreBreakdown({
    vouchesCount: 10,
    verifiedCheckinsCount: 4,
    mainstreamPopularityIndex: 90,
  });
  assert.deepEqual(breakdown, {
    vouchesPoints: 20,
    checkinsPoints: 20,
    crowdPenalty: 2,
    score: 20,
  });
});
