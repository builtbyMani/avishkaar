import assert from "node:assert/strict";
import test from "node:test";
import { SEED_PLACES } from "../src/data/seed";
import { isDemoCheckInAllowed, isSafetyAlertPublic } from "../src/lib/domain";
import { detectFileKind } from "../src/lib/upload-validation";
import { validatePlaceInput } from "../src/lib/validation";
import { performVouch } from "../src/lib/store";

const VALID = {
  title: "Test Hidden Gem",
  region: "Kutch & Thar",
  category: "Hidden Village" as const,
  rawDescription: "A quiet test place description.",
  lat: 23.2,
  lng: 69.7,
};

test("Place validation rejects bad category, region, and out-of-range coordinates", () => {
  assert.equal(validatePlaceInput(VALID).ok, true);
  assert.equal(validatePlaceInput({ ...VALID, category: "NOT_A_CATEGORY" as never }).ok, false);
  assert.equal(validatePlaceInput({ ...VALID, region: "Nowhere" }).ok, false);
  assert.equal(validatePlaceInput({ ...VALID, lng: 9999 }).ok, false);
  assert.equal(validatePlaceInput({ ...VALID, lat: -91 }).ok, false);
  // Coordinates are required — never silently defaulted
  assert.equal(validatePlaceInput({ ...VALID, lat: undefined }).ok, false);
  assert.equal(validatePlaceInput({ ...VALID, lat: "not-a-number" }).ok, false);
});

test("Upload detection trusts magic bytes, not client claims", () => {
  const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]);
  assert.equal(detectFileKind(png)?.ext, ".png");
  const jpg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0, 0, 0]);
  assert.equal(detectFileKind(jpg)?.ext, ".jpg");
  const mp4 = new Uint8Array([0, 0, 0, 0x18, 0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6f, 0x6d]);
  assert.equal(detectFileKind(mp4)?.kind, "video");
  // Fake PNG: correct mime claim, wrong bytes -> rejected
  const fake = new TextEncoder().encode("this is not a png file at all");
  assert.equal(detectFileKind(fake), null);
  // SVG / HTML active content -> rejected
  const svg = new TextEncoder().encode('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>');
  assert.equal(detectFileKind(svg), null);
});

test("Demo check-in is allowed in deployment builds unless explicitly disabled", () => {
  assert.equal(isDemoCheckInAllowed({ NODE_ENV: "development" }), true);
  assert.equal(isDemoCheckInAllowed({ NODE_ENV: "production" }), true);
  assert.equal(isDemoCheckInAllowed({ NODE_ENV: "production", ALLOW_DEMO_CHECKIN: "false" }), false);
});

test("Safety alerts get no legacy exemption anymore", () => {
  const untagged = { tag: "Scam Alert" as const, message: "Untagged alert", verifiedBy: [], flaggedBy: [] };
  assert.equal(isSafetyAlertPublic(untagged), false);
  // ...but all seed alerts are tagged, so the seed set stays fully public
  assert.ok(SEED_PLACES.every((p) => p.safetyAlerts.every(isSafetyAlertPublic)));
});

test("Self-vouch is rejected in demo store", async () => {
  const place = SEED_PLACES[0];
  await assert.rejects(() => performVouch(place.id, place.authorId), /your own place/);
});
