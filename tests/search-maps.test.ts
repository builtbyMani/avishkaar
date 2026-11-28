import assert from "node:assert/strict";
import test from "node:test";
import { SEED_PLACES } from "../src/data/seed";
import {
  buildGoogleMapsUrl,
  filterPlaces,
  getPlaceSlug,
  isUuid,
  matchPlaceByIdOrSlug,
  VOLUNTEER_GUIDE_DISCLAIMERS,
} from "../src/lib/domain";

test("buildGoogleMapsUrl formats exact place coordinates", () => {
  assert.equal(
    buildGoogleMapsUrl(25.2586, 91.8559),
    "https://www.google.com/maps/search/?api=1&query=25.2586%2C91.8559",
  );
});

test("filterPlaces filters live by title, region, category, and author", () => {
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

  const empty = filterPlaces(SEED_PLACES, { query: "nonexistent-destination-xyz-999" });
  assert.equal(empty.length, 0);
});

test("VOLUNTEER_GUIDE_DISCLAIMERS includes safety and non-commercial volunteer notices", () => {
  assert.ok(VOLUNTEER_GUIDE_DISCLAIMERS.points.length >= 3);
  assert.ok(
    VOLUNTEER_GUIDE_DISCLAIMERS.points.some((d) => /not licensed tour operators/i.test(d)),
  );
});

test("getPlaceSlug and matchPlaceByIdOrSlug resolve readable slugs and UUIDs uniquely", () => {
  const kongthong = SEED_PLACES.find((p) => p.id === "22222222-2222-4222-8222-222222222002")!;
  assert.equal(getPlaceSlug(kongthong), "kongthong-the-whistling-village");
  assert.equal(isUuid(kongthong.id), true);
  assert.equal(isUuid("kongthong-the-whistling-village"), false);
  assert.equal(matchPlaceByIdOrSlug(SEED_PLACES, "kongthong-the-whistling-village")?.id, kongthong.id);
  assert.equal(matchPlaceByIdOrSlug(SEED_PLACES, kongthong.id)?.id, kongthong.id);

  const slugs = new Set(SEED_PLACES.map((p) => getPlaceSlug(p)));
  assert.equal(slugs.size, SEED_PLACES.length);
});
