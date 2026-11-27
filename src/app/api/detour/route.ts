import { NextRequest, NextResponse } from "next/server";
import { findDetourAlternatives } from "@/lib/detour";
import { listPlaces } from "@/lib/store";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      query?: string;
      viewerId?: string;
    };

    if (!body.query?.trim()) {
      return NextResponse.json(
        { error: "Enter a crowded destination (e.g. Ooty, Goa, Hampi)." },
        { status: 400 },
      );
    }

    const places = await listPlaces(body.viewerId);
    const result = await findDetourAlternatives(body.query, places);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Detour lookup failed" },
      { status: 500 },
    );
  }
}
