import { NextRequest, NextResponse } from "next/server";
import { verifyOrFlagSafetyAlert } from "@/lib/store";

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

    if (
      !body.userId ||
      typeof body.alertIndex !== "number" ||
      (body.action !== "verify" && body.action !== "flag")
    ) {
      return NextResponse.json(
        { error: "userId, alertIndex, and action ('verify' | 'flag') are required" },
        { status: 400 },
      );
    }

    const safetyAlerts = await verifyOrFlagSafetyAlert(
      id,
      body.alertIndex,
      body.userId,
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
