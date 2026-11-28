import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { SEED_PLACES, SEED_PROFILES } from "../src/data/seed";
import { findDetourAlternativesFallback } from "../src/lib/detour";
import {
  applySafetyVote,
  buildGoogleMapsUrl,
  canVolunteerAsGuide,
  computeCheckInUpgradeDelta,
  computeHiddenGemScore,
  computeVouchPointsDelta,
  evaluateNewBadges,
  extractYouTubeEmbedId,
  filterPlaces,
  formatUpiHandle,
  getGemScoreBreakdown,
  getPlaceSlug,
  getTierDisplayLabel,
  getTierFromScore,
  isSafetyAlertPublic,
  isUuid,
  matchPlaceByIdOrSlug,
  PLACE_CATEGORIES,
  REGIONS,
  sortFeedPlaces,
  VOLUNTEER_GUIDE_DISCLAIMERS,
} from "../src/lib/domain";
import { extractStructuredPlaceFallback } from "../src/lib/gemini";
import { detectFileKind } from "../src/lib/upload-validation";
import { validatePlaceInput } from "../src/lib/validation";

test("Hidden Gem Score matches exact blueprint formula", () => {
  assert.equal(computeHiddenGemScore(10, 4, 90), 20);
  assert.deepEqual(
    getGemScoreBreakdown({ vouchesCount: 10, verifiedCheckinsCount: 4, mainstreamPopularityIndex: 90 }),
    { vouchesPoints: 20, checkinsPoints: 20, crowdPenalty: 2, score: 20 },
  );
});

test("Trailblazer tiers and volunteer guide trust gate match web rules", () => {
  assert.equal(getTierFromScore(0), "Wanderer");
  assert.equal(getTierFromScore(99), "Wanderer");
  assert.equal(getTierFromScore(100), "Pathfinder");
  assert.equal(getTierFromScore(300), "Local Legend");
  assert.equal(getTierDisplayLabel("Local Legend"), "Regional Steward");

  assert.equal(canVolunteerAsGuide({ trailblazerScore: 40, isVerifiedLocal: false }), false);
  assert.equal(canVolunteerAsGuide({ trailblazerScore: 100, isVerifiedLocal: false }), true);
  assert.equal(canVolunteerAsGuide({ trailblazerScore: 20, isVerifiedLocal: true }), true);
});

test("Vouch and Verified Visit Vouch delta calculations", () => {
  const first = computeVouchPointsDelta(undefined);
  assert.equal(first.pointsDelta, 10);
  assert.equal(first.isVerifiedVisit, false);

  const afterCheckIn = computeVouchPointsDelta({
    checkedInAt: "2026-11-27T10:00:00Z",
    vouchedAt: null,
    pointsAwarded: 0,
  });
  assert.equal(afterCheckIn.pointsDelta, 25);
  assert.equal(afterCheckIn.isVerifiedVisit, true);

  const checkInUpgrade = computeCheckInUpgradeDelta({
    checkedInAt: null,
    vouchedAt: "2026-11-27T09:00:00Z",
    pointsAwarded: 10,
  });
  assert.equal(checkInUpgrade.pointsDelta, 15);
  assert.equal(checkInUpgrade.isFirstCheckIn, true);
});

test("Milestone badges award cleanly", () => {
  const profile = { ...SEED_PROFILES[5], trailblazerScore: 310 };
  const unlocked = evaluateNewBadges({
    profile,
    authoredPlacesCount: 1,
    vouchedPlaces: [SEED_PLACES[4], SEED_PLACES[7]],
    existingBadges: [],
  });
  assert.deepEqual(
    unlocked.map((b) => b.badgeKey).sort(),
    ["first_discovery", "foodie_scout", "local_legend"],
  );
});

test("Multilingual fallback extraction handles Hinglish + safety cues", () => {
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

test("YouTube Shorts & UPI formatting helpers", () => {
  assert.equal(extractYouTubeEmbedId("https://www.youtube.com/shorts/abc123XYZ"), "abc123XYZ");
  assert.equal(extractYouTubeEmbedId("https://youtu.be/xyz987"), "xyz987");
  assert.equal(extractYouTubeEmbedId("https://example.com/clip.mp4"), null);
  assert.equal(formatUpiHandle("Kago Stay Ziro", "kagostayziro@upi"), "kagostayziro@upi");
  assert.equal(formatUpiHandle("Mei Siew Kitchen & Stay"), "meisiewkitch@upi");
});

test("Community Safety Verify/Flag gate", () => {
  const alert = {
    tag: "Scam Alert" as const,
    message: "Watch out for fake boat touts.",
    authorTier: "Wanderer" as const,
    verifiedBy: [],
    flaggedBy: [],
  };
  assert.equal(isSafetyAlertPublic(alert), false);
  const v1 = applySafetyVote(alert, "u1", "verify", "Wanderer");
  assert.equal(isSafetyAlertPublic(v1), false);
  const v2 = applySafetyVote(v1, "u2", "verify", "Wanderer");
  assert.equal(isSafetyAlertPublic(v2), true);
  const p1 = applySafetyVote(alert, "p1", "verify", "Pathfinder");
  assert.equal(isSafetyAlertPublic(p1), true);
});

test("All 58 seed destinations and local bundled image assets exist", () => {
  assert.equal(SEED_PLACES.length, 58);
  assert.equal(REGIONS.length, 9);
  assert.equal(PLACE_CATEGORIES.length, 5);

  const localImages = SEED_PLACES.flatMap((p) => p.media)
    .map((m) => m.url)
    .filter((u) => u.startsWith("/images/places/"));
  assert.equal(localImages.length, 20);

  for (const rel of localImages) {
    const fileName = rel.replace("/images/places/", "");
    const absPath = path.join(process.cwd(), "assets", "places", fileName);
    assert.ok(fs.existsSync(absPath), `Missing bundled place asset: ${absPath}`);
  }
  for (let i = 1; i <= 6; i++) {
    const absPath = path.join(process.cwd(), "assets", "preloader", `place-${i}.jpg`);
    assert.ok(fs.existsSync(absPath), `Missing preloader asset: ${absPath}`);
  }
});

test("Place validation and upload magic bytes cover mobile URIs and reject invalid inputs", () => {
  const valid = {
    title: "Chitkul Stone Mill",
    region: "Spiti & Kinnaur",
    category: "Hidden Village" as const,
    rawDescription: "Quiet walk above Sangla valley.",
    lat: 31.35,
    lng: 78.43,
    media: [{ type: "image" as const, url: "file:///var/mobile/photo.jpg" }],
  };
  assert.equal(validatePlaceInput(valid).ok, true);
  assert.equal(validatePlaceInput({ ...valid, title: "Hi" }).ok, false);
  assert.equal(validatePlaceInput({ ...valid, lat: 95 }).ok, false);
  assert.equal(validatePlaceInput({ ...valid, lng: -200 }).ok, false);

  const mp4 = new Uint8Array([0, 0, 0, 0x18, 0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6f, 0x6d]);
  assert.equal(detectFileKind(mp4)?.kind, "video");
  const svg = new TextEncoder().encode("<svg></svg>");
  assert.equal(detectFileKind(svg), null);
});

test("Google Maps links, live place search, and volunteer disclaimers work cleanly", () => {
  assert.equal(
    buildGoogleMapsUrl(25.2586, 91.8559),
    "https://www.google.com/maps/search/?api=1&query=25.2586%2C91.8559",
  );

  const whistlers = filterPlaces(SEED_PLACES, { query: "kongthong" });
  assert.ok(whistlers.some((p) => p.id === "22222222-2222-4222-8222-222222222002"));

  const malabarFood = filterPlaces(SEED_PLACES, {
    region: "Malabar & Konkan",
    category: "Regional Cuisine",
  });
  assert.ok(malabarFood.length > 0);
  assert.ok(
    malabarFood.every(
      (p) => p.region === "Malabar & Konkan" && p.category === "Regional Cuisine",
    ),
  );

  assert.equal(
    filterPlaces(SEED_PLACES, { query: "nonexistent-destination-xyz-999" }).length,
    0,
  );
  assert.ok(VOLUNTEER_GUIDE_DISCLAIMERS.points.length >= 3);
  assert.ok(
    VOLUNTEER_GUIDE_DISCLAIMERS.points.some((d) => /not licensed tour operators/i.test(d)),
  );

  const kongthong = SEED_PLACES.find((p) => p.id === "22222222-2222-4222-8222-222222222002")!;
  assert.equal(getPlaceSlug(kongthong), "kongthong-the-whistling-village");
  assert.equal(isUuid(kongthong.id), true);
  assert.equal(isUuid("kongthong-the-whistling-village"), false);
  assert.equal(matchPlaceByIdOrSlug(SEED_PLACES, "kongthong-the-whistling-village")?.id, kongthong.id);
  assert.equal(matchPlaceByIdOrSlug(SEED_PLACES, kongthong.id)?.id, kongthong.id);

  const slugs = new Set(SEED_PLACES.map((p) => getPlaceSlug(p)));
  assert.equal(slugs.size, SEED_PLACES.length);
});
