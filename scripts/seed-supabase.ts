import {
  SEED_BADGES,
  SEED_GUIDE_REQUESTS,
  SEED_PLACES,
  SEED_PROFILES,
  SEED_VOUCHES,
} from "../src/data/seed";
import { toSupabasePlaceRow } from "../src/lib/store";
import { getSupabaseServerClient } from "../src/lib/supabase";

async function main() {
  const sb = getSupabaseServerClient();
  if (!sb) {
    console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before running npm run seed.");
    process.exit(1);
  }

  console.log("Seeding profiles...");
  const { error: profErr } = await sb.from("profiles").upsert(
    SEED_PROFILES.map((p) => ({
      id: p.id,
      username: p.username,
      display_name: p.displayName,
      trailblazer_score: p.trailblazerScore,
      is_guide: p.isGuide,
      is_verified_local: p.isVerifiedLocal,
      guide_region: p.guideRegion,
      languages: p.languages,
    })),
  );
  if (profErr) throw profErr;

  console.log(`Seeding ${SEED_PLACES.length} offbeat destinations...`);
  const { error: placeErr } = await sb
    .from("places")
    .upsert(SEED_PLACES.map(toSupabasePlaceRow));
  if (placeErr) throw placeErr;

  const { error: vouchErr } = await sb.from("vouches").upsert(
    SEED_VOUCHES.map((v) => ({
      id: v.id,
      place_id: v.placeId,
      user_id: v.userId,
      checked_in_at: v.checkedInAt,
      vouched_at: v.vouchedAt,
      is_verified_visit: v.isVerifiedVisit,
      points_awarded: v.pointsAwarded,
    })),
  );
  if (vouchErr) throw vouchErr;

  const { error: badgeErr } = await sb.from("user_badges").upsert(
    SEED_BADGES.map((b) => ({
      id: b.id,
      user_id: b.userId,
      badge_key: b.badgeKey,
      badge_name: b.badgeName,
      description: b.description,
      awarded_at: b.awardedAt,
    })),
  );
  if (badgeErr) throw badgeErr;

  const { error: guideErr } = await sb.from("guide_requests").upsert(
    SEED_GUIDE_REQUESTS.map((g) => ({
      id: g.id,
      place_id: g.placeId,
      guide_id: g.guideId,
      requester_id: g.requesterId,
      preferred_date: g.preferredDate,
      notes: g.notes,
      status: g.status,
      created_at: g.createdAt,
    })),
  );
  if (guideErr) throw guideErr;

  console.log("Seed complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
