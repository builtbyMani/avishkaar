import { NextRequest, NextResponse } from "next/server";
import { verifyOrFlagSafetyAlert } from "@/lib/store";
import { resolveActorId } from "@/lib/supabase";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as {
      userId?: string;
      alertIndex?: number;
      action?: "verify" | "flag";
    };

    const actorId = await resolveActorId(request, body.userId);
    if (!actorId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    if (
      typeof body.alertIndex !== "number" ||
      (body.action !== "verify" && body.action !== "flag")
    ) {
      return NextResponse.json(
        { error: "alertIndex and action ('verify' | 'flag') are required" },
        { status: 400 },
      );
    }

    const safetyAlerts = await verifyOrFlagSafetyAlert(
      id,
      body.alertIndex,
      actorId,
      body.action,
    );
    return NextResponse.json({ safetyAlerts });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to vote on safety alert" },
      { status: 400 },
    );
  }
}
