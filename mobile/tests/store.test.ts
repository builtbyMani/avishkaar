import assert from "node:assert/strict";
import test from "node:test";
import { SEED_PLACES, SEED_PROFILES } from "../src/data/seed";
import { isSafetyAlertPublic } from "../src/lib/domain";
import {
  acceptGuideRequest,
  createGuideRequest,
  createPlace,
  getPlaceDetail,
  getUserProfileOverview,
  listPlaces,
  performCheckIn,
  performVouch,
  structurePlaceNotes,
  updateGuideProfile,
  uploadMediaAsset,
  verifyOrFlagSafetyAlert,
} from "../src/lib/store";

test("Demo store lists 58 sorted destinations and rejects self-vouch", async () => {
  const { places } = await listPlaces(SEED_PROFILES[5].id, { demoMode: true });
  assert.equal(places.length, 58);
  assert.ok(places[0].hiddenGemScore >= places[places.length - 1].hiddenGemScore);

  const ownPlace = SEED_PLACES[0];
  await assert.rejects(
    () => performVouch(ownPlace.id, ownPlace.authorId, { demoMode: true }),
    /cannot vouch for your own place/,
  );
});

test("Demo store executes Check-In + Verified Visit Vouch (+25) + Safety Verify/Flag", async () => {
  const actorId = SEED_PROFILES[5].id;
  const target = SEED_PLACES[2];

  // Distance > 25 km without simulate fails
  await assert.rejects(
    () =>
      performCheckIn(
        {
          placeId: target.id,
          placeTitle: target.title,
          placeLat: target.lat,
          placeLng: target.lng,
          userId: actorId,
          demoCheckIn: false,
          lat: 28.6139,
          lng: 77.209,
        },
        { demoMode: true },
      ),
    /must be within 25 km/,
  );

  // Simulate GPS Check-In succeeds, then Vouch awards +25 Verified Visit points
  const chk = await performCheckIn(
    {
      placeId: target.id,
      placeTitle: target.title,
      placeLat: target.lat,
      placeLng: target.lng,
      userId: actorId,
      demoCheckIn: true,
    },
    { demoMode: true },
  );
  assert.equal(chk.checkedIn, true);

  const vouch = await performVouch(target.id, actorId, { demoMode: true });
  assert.equal(vouch.isVerifiedVisit, true);
  assert.equal(vouch.pointsAwarded, 25);

  const alertsAfterVerify = await verifyOrFlagSafetyAlert(target.id, 0, actorId, "verify", {
    demoMode: true,
  });
  assert.ok((alertsAfterVerify[0].verifiedBy ?? []).includes(actorId));
});

test("Demo store enforces guide trust gate, creates place & awards First Discovery badge", async () => {
  const wanderer = SEED_PROFILES[5];
  await assert.rejects(
    () =>
      updateGuideProfile(
        {
          userId: wanderer.id,
          isGuide: true,
          guideRegion: "Spiti & Kinnaur",
          languages: ["English"],
        },
        { demoMode: true },
      ),
    /Trust gate/,
  );

  const extracted = await structurePlaceNotes(
    "Subah bus lo aur 2 km walk. Try buckwheat roti. Raat ko trail avoid karo.",
    "Sangla Cedar Bridge",
    "Spiti & Kinnaur",
  );
  // Note: wanderer already authored seed places and earned first_discovery during vouch test;
  // check badge persistence + test a fresh author (arjun_kutch) unlocking first_discovery on createPlace.
  const freshAuthor = SEED_PROFILES[3];
  const created = await createPlace(
    {
      authorId: freshAuthor.id,
      title: "Sangla Cedar Bridge",
      region: "Spiti & Kinnaur",
      category: "Hidden Village",
      rawDescription: "Subah bus lo aur 2 km walk. Try buckwheat roti.",
      lat: 31.42,
      lng: 78.26,
      media: [{ type: "image", url: "/images/places/kalpa.jpg", aspect: "portrait" }],
      structuredCards: extracted.structuredCards,
      localVendors: [],
      safetyAlerts: extracted.safetyAlerts,
    },
    { demoMode: true },
  );
  assert.ok(created.unlockedBadges.some((b) => b.badgeKey === "first_discovery"));

  const detail = await getPlaceDetail(created.place.id, wanderer.id, { demoMode: true });
  assert.equal(detail.place?.title, "Sangla Cedar Bridge");

  // Guide request workflow
  const guide = SEED_PROFILES[0];
  const req = await createGuideRequest(
    {
      placeId: created.place.id,
      guideId: guide.id,
      requesterId: wanderer.id,
      preferredDate: "2026-12-15",
      notes: "Morning orchard heritage walk",
    },
    { demoMode: true },
  );
  assert.equal(req.status, "Pending");

  const accepted = await acceptGuideRequest(req.id, guide.id, { demoMode: true });
  assert.equal(accepted.status, "Accepted");

  const overview = await getUserProfileOverview(freshAuthor.id, { demoMode: true });
  assert.ok(overview.authoredPlaces.some((p) => p.id === created.place.id));
  assert.ok(overview.badges.some((b) => b.badgeKey === "first_discovery"));
});

test("uploadMediaAsset enforces size limits and preserves demo URIs", async () => {
  const actorId = SEED_PROFILES[5].id;

  await assert.rejects(
    () =>
      uploadMediaAsset({
        uri: "file:///var/mobile/clip.mp4",
        mimeType: "video/mp4",
        kind: "video",
        fileSize: 8 * 1024 * 1024 + 1,
        userId: actorId,
        demoMode: true,
      }),
    /exceeds the 8 MB limit/,
  );

  await assert.rejects(
    () =>
      uploadMediaAsset({
        uri: "file:///var/mobile/raw.jpg",
        mimeType: "image/jpeg",
        kind: "image",
        fileSize: 25 * 1024 * 1024 + 1,
        userId: actorId,
        demoMode: true,
      }),
    /exceeds 25 MB limit/,
  );

  const demoUpload = await uploadMediaAsset({
    uri: "content://media/external/images/media/42",
    mimeType: "image/jpeg",
    fileSize: 1_250_000,
    userId: actorId,
    demoMode: true,
  });
  assert.deepEqual(demoUpload, {
    type: "image",
    url: "content://media/external/images/media/42",
  });
});

test("verifyOrFlagSafetyAlert hides alerts when flags >= 2 exceed verifies", async () => {
  const { places } = await listPlaces(undefined, { demoMode: true });
  const target = places.find((p) => p.safetyAlerts.length > 0 && p.id !== SEED_PLACES[2].id);
  assert.ok(target, "Expected a seed place with safety alerts");

  const u1 = SEED_PROFILES[1].id;
  const u2 = SEED_PROFILES[2].id;
  const u3 = SEED_PROFILES[3].id;
  const u4 = SEED_PROFILES[4].id;

  await verifyOrFlagSafetyAlert(target.id, 0, u1, "flag", { demoMode: true });
  const afterTwoFlags = await verifyOrFlagSafetyAlert(target.id, 0, u2, "flag", { demoMode: true });
  const flaggedCount = afterTwoFlags[0].flaggedBy?.length ?? 0;
  const verifiedCount = afterTwoFlags[0].verifiedBy?.length ?? 0;
  assert.ok(flaggedCount >= 2 && flaggedCount > verifiedCount);
  assert.equal(isSafetyAlertPublic(afterTwoFlags[0]), false);

  await verifyOrFlagSafetyAlert(target.id, 0, u3, "verify", { demoMode: true });
  const afterThreeVerifies = await verifyOrFlagSafetyAlert(target.id, 0, u4, "verify", {
    demoMode: true,
  });
  // Verify u1 flips from flag -> verify so verifies strictly outnumber flags
  const afterFlip = await verifyOrFlagSafetyAlert(target.id, 0, u1, "verify", { demoMode: true });
  assert.equal(
    (afterFlip[0].verifiedBy?.length ?? 0) > (afterThreeVerifies[0].flaggedBy?.length ?? 0) - 1,
    true,
  );
  assert.equal(isSafetyAlertPublic(afterFlip[0]), true);
});
