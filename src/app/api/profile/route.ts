import { NextRequest, NextResponse } from "next/server";
import {
  getProfileById,
  listGuideRequests,
  listPlaces,
  listProfiles,
  listUserBadges,
  updateGuideProfile,
} from "@/lib/store";

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId");
  const profiles = await listProfiles();

  if (!userId) {
    return NextResponse.json({ profiles });
  }

  const profile = (await getProfileById(userId)) ?? profiles[0] ?? null;
  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const [badges, guideRequests, places] = await Promise.all([
    listUserBadges(profile.id),
    listGuideRequests({ userId: profile.id }),
    listPlaces(profile.id),
  ]);

  const authoredPlaces = places.filter((p) => p.authorId === profile.id);
  return NextResponse.json({
    profile,
    profiles,
    badges,
    guideRequests,
    authoredPlaces,
  });
}

export async function PATCH(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      userId?: string;
      isGuide?: boolean;
      guideRegion?: string | null;
      languages?: string[];
    };

    if (!body.userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const updated = await updateGuideProfile({
      userId: body.userId,
      isGuide: Boolean(body.isGuide),
      guideRegion: body.guideRegion ?? null,
      languages: Array.isArray(body.languages) ? body.languages : [],
    });

    return NextResponse.json({ profile: updated });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update guide profile" },
      { status: 403 },
    );
  }
}
