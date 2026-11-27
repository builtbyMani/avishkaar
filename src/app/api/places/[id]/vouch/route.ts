import { NextRequest, NextResponse } from "next/server";
import { performVouch } from "@/lib/store";
import { resolveActorId } from "@/lib/supabase";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as { userId?: string };
    const actorId = await resolveActorId(request, body.userId);
    if (!actorId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    const result = await performVouch(id, actorId);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Vouch failed";
    return NextResponse.json(
      { error: message },
      { status: message.includes("your own place") ? 403 : 500 },
    );
  }
}
