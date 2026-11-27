import { NextRequest, NextResponse } from "next/server";
import { structurePlaceWithGemini } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      rawDescription?: string;
      title?: string;
      region?: string;
    };

    if (body.rawDescription && body.rawDescription.length > 4000) {
      return NextResponse.json(
        { error: "rawDescription is limited to 4000 characters" },
        { status: 400 },
      );
    }

    if (!body.rawDescription?.trim()) {
      return NextResponse.json(
        { error: "rawDescription is required" },
        { status: 400 },
      );
    }

    const result = await structurePlaceWithGemini(
      body.rawDescription,
      body.title || "Hidden Gem",
      body.region || "India",
    );
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to structure text" },
      { status: 500 },
    );
  }
}
