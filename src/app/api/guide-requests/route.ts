import { NextRequest, NextResponse } from "next/server";
import {
  acceptGuideRequest,
  createGuideRequest,
  listGuideRequests,
} from "@/lib/store";

export async function GET(request: NextRequest) {
  const placeId = request.nextUrl.searchParams.get("placeId") || undefined;
  const userId = request.nextUrl.searchParams.get("userId") || undefined;
  const guideRequests = await listGuideRequests({ placeId, userId });
  return NextResponse.json({ guideRequests });
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      placeId?: string;
      guideId?: string;
      requesterId?: string;
      preferredDate?: string;
      notes?: string;
    };

    if (!body.placeId || !body.guideId || !body.requesterId || !body.notes?.trim()) {
      return NextResponse.json(
        { error: "placeId, guideId, requesterId, and notes are required" },
        { status: 400 },
      );
    }

    const created = await createGuideRequest({
      placeId: body.placeId,
      guideId: body.guideId,
      requesterId: body.requesterId,
      preferredDate: body.preferredDate || "",
      notes: body.notes.trim(),
    });
    return NextResponse.json({ guideRequest: created }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create guide request" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      requestId?: string;
      guideId?: string;
    };
    if (!body.requestId || !body.guideId) {
      return NextResponse.json(
        { error: "requestId and guideId are required" },
        { status: 400 },
      );
    }
    const updated = await acceptGuideRequest(body.requestId, body.guideId);
    return NextResponse.json({ guideRequest: updated });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to accept guide request" },
      { status: 404 },
    );
  }
}
