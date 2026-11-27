import { NextRequest, NextResponse } from "next/server";
import { haversineDistanceKm, isDemoCheckInAllowed } from "@/lib/domain";
import { getPlaceDetail, performCheckIn } from "@/lib/store";
import { resolveActorId } from "@/lib/supabase";

const MAX_CHECKIN_RADIUS_KM = 25;

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as {
      userId?: string;
      demoCheckIn?: boolean;
      lat?: number;
      lng?: number;
    };

    const actorId = await resolveActorId(request, body.userId);
    if (!actorId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { place } = await getPlaceDetail(id, actorId);
    if (!place) {
      return NextResponse.json({ error: "Place not found" }, { status: 404 });
    }

    if (body.demoCheckIn && !isDemoCheckInAllowed(process.env)) {
      return NextResponse.json(
        { error: "Demo Check-in is disabled in production. Set ALLOW_DEMO_CHECKIN=true on a judging deployment, or check in with real geolocation." },
        { status: 403 },
      );
    }

    if (!body.demoCheckIn) {
      if (!Number.isFinite(body.lat) || !Number.isFinite(body.lng)) {
        return NextResponse.json(
          { error: "Geolocation coordinates are required unless Demo Check-in is enabled." },
          { status: 400 },
        );
      }
      const distanceKm = haversineDistanceKm(
        Number(body.lat),
        Number(body.lng),
        place.lat,
        place.lng,
      );
      if (distanceKm > MAX_CHECKIN_RADIUS_KM) {
        return NextResponse.json(
          {
            error: `You are ${distanceKm.toFixed(1)} km away from ${place.title} (must be within ${MAX_CHECKIN_RADIUS_KM} km, or enable the Demo Check-in toggle for live judging).`,
            distanceKm: Number(distanceKm.toFixed(1)),
          },
          { status: 400 },
        );
      }
    }

    const result = await performCheckIn(id, actorId);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Check-in failed";
    return NextResponse.json(
      { error: message },
      { status: message.includes("your own place") ? 403 : 500 },
    );
  }
}
