import { NextRequest, NextResponse } from "next/server";
import { createPlace, listPlaces } from "@/lib/store";
import type { LocalVendor, MediaItem, PlaceCategory, SafetyAlert, StructuredCards } from "@/types/domain";

export async function GET(request: NextRequest) {
  const viewerId = request.nextUrl.searchParams.get("viewerId") || undefined;
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

    if (!body.authorId || !body.title?.trim() || !body.region?.trim() || !body.rawDescription?.trim()) {
      return NextResponse.json(
        { error: "authorId, title, region, and rawDescription are required." },
        { status: 400 },
      );
    }

    const result = await createPlace({
      authorId: body.authorId,
      title: body.title.trim(),
      region: body.region.trim(),
      category: body.category || "Hidden Village",
      rawDescription: body.rawDescription.trim(),
      lat: Number.isFinite(body.lat) ? Number(body.lat) : 20.5937,
      lng: Number.isFinite(body.lng) ? Number(body.lng) : 78.9629,
      media: body.media?.length
        ? body.media
        : [
            {
              type: "image",
              url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=900&q=80",
              aspect: "portrait",
              caption: body.title.trim(),
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
