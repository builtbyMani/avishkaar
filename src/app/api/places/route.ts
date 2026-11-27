import { NextRequest, NextResponse } from "next/server";
import { createPlace, listPlaces } from "@/lib/store";
import { resolveActorId } from "@/lib/supabase";
import type { LocalVendor, MediaItem, PlaceCategory, SafetyAlert, StructuredCards } from "@/types/domain";
import { validatePlaceInput } from "@/lib/validation";

export async function GET(request: NextRequest) {
  const viewerId = (await resolveActorId(request, request.nextUrl.searchParams.get("viewerId") || undefined)) || undefined;
  const category = request.nextUrl.searchParams.get("category") || undefined;
  const region = request.nextUrl.searchParams.get("region") || undefined;

  let places = await listPlaces(viewerId);
  if (category && category !== "All") {
    places = places.filter((p) => p.category === category);
  }
  if (region && region !== "All") {
    places = places.filter((p) => p.region === region);
  }

  return NextResponse.json({ places });
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      authorId?: string;
      title?: string;
      region?: string;
      category?: PlaceCategory;
      rawDescription?: string;
      lat?: number;
      lng?: number;
      media?: MediaItem[];
      structuredCards?: StructuredCards;
      localVendors?: LocalVendor[];
      safetyAlerts?: SafetyAlert[];
    };

    const actorId = await resolveActorId(request, body.authorId);
    if (!actorId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const validation = validatePlaceInput(body);
    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Validation above guarantees these are present and within limits.
    const title = (body.title ?? "").trim();
    const result = await createPlace({
      authorId: actorId,
      title,
      region: validation.region,
      category: validation.category,
      rawDescription: (body.rawDescription ?? "").trim(),
      lat: validation.lat,
      lng: validation.lng,
      media: body.media?.length
        ? body.media
        : [
            {
              type: "image",
              url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=900&q=80",
              aspect: "portrait",
              caption: title,
            },
          ],
      structuredCards: body.structuredCards ?? { commute: [], food: [], activities: [] },
      localVendors: body.localVendors ?? [],
      safetyAlerts: body.safetyAlerts ?? [],
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create place" },
      { status: 500 },
    );
  }
}
