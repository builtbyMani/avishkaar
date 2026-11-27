import assert from "node:assert/strict";
import test from "node:test";
import { SEED_PLACES, SEED_PROFILES } from "../src/data/seed";
import {
  canVolunteerAsGuide,
  computeCheckInUpgradeDelta,
  computeHiddenGemScore,
  computeVouchPointsDelta,
  evaluateNewBadges,
  getTierFromScore,
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
    vouchedPlaces: [SEED_PLACES[4], SEED_PLACES[7]], // Regional Cuisine places
    existingBadges: [],
  });
  const keys = unlocked.map((b) => b.badgeKey).sort();
  assert.deepEqual(keys, ["first_discovery", "foodie_scout", "local_legend"]);
});

test("Gemini fallback extractor structures commute, food, activities, and safety tags", () => {
  const result = extractStructuredPlaceFallback(
    "Take the 6 AM bus to Sangla and walk 2 km. Try buckwheat thali and apricot tea. Avoid cliff road after dark and expect low mobile network.",
    "Chitkul",
    "Spiti & Kinnaur",
  );
  assert.equal(result.source, "fallback");
  assert.ok(result.structuredCards.commute.length >= 1);
  assert.ok(result.structuredCards.food.length >= 1);
  assert.ok(result.safetyAlerts.some((a) => a.tag === "Avoid After Dark"));
  assert.ok(result.safetyAlerts.some((a) => a.tag === "Low Network"));
});

test("Seed dataset meets 15-20 destinations, video clips, vendors, and Local Legend priority tie-break", () => {
  assert.ok(SEED_PLACES.length >= 15 && SEED_PLACES.length <= 20);
  const videoCount = SEED_PLACES.flatMap((p) => p.media).filter((m) => m.type === "video").length;
  assert.ok(videoCount >= 2);
  assert.ok(SEED_PLACES.every((p) => p.localVendors.length >= 1 && p.safetyAlerts.length >= 1));

  const profilesMap = new Map(SEED_PROFILES.map((p) => [p.id, p]));
  const sorted = sortFeedPlaces(SEED_PLACES, profilesMap, new Map());
  assert.ok(sorted[0].hiddenGemScore >= sorted[sorted.length - 1].hiddenGemScore);
});
