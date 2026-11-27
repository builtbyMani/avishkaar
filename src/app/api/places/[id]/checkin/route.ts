import { NextRequest, NextResponse } from "next/server";
import { haversineDistanceKm } from "@/lib/domain";
import { getPlaceDetail, performCheckIn } from "@/lib/store";

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

    if (!body.userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const { place } = await getPlaceDetail(id, body.userId);
    if (!place) {
      return NextResponse.json({ error: "Place not found" }, { status: 404 });
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

    const result = await performCheckIn(id, body.userId);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Check-in failed" },
      { status: 500 },
    );
  }
}
