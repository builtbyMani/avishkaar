import { NextRequest, NextResponse } from "next/server";
import {
  acceptGuideRequest,
  createGuideRequest,
  listGuideRequests,
} from "@/lib/store";
import { resolveActorId } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const placeId = request.nextUrl.searchParams.get("placeId") || undefined;
  const actorId = await resolveActorId(request, request.nextUrl.searchParams.get("userId") || undefined);
  if (!actorId) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }
  // Callers can only ever see requests they are a party to, whatever they ask for.
  const guideRequests = await listGuideRequests({ placeId, userId: actorId });
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

    const requesterId = await resolveActorId(request, body.requesterId);
    if (!requesterId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    if (!body.placeId || !body.guideId || !body.notes?.trim()) {
      return NextResponse.json(
        { error: "placeId, guideId, and notes are required" },
        { status: 400 },
      );
    }

    const created = await createGuideRequest({
      placeId: body.placeId,
      guideId: body.guideId,
      requesterId,
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
    const guideId = await resolveActorId(request, body.guideId);
    if (!guideId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    if (!body.requestId) {
      return NextResponse.json(
        { error: "requestId is required" },
        { status: 400 },
      );
    }
    const updated = await acceptGuideRequest(body.requestId, guideId);
    return NextResponse.json({ guideRequest: updated });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to accept guide request" },
      { status: 404 },
    );
  }
}
