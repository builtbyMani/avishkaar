import { NextRequest, NextResponse } from "next/server";
import { performVouch } from "@/lib/store";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as { userId?: string };
    if (!body.userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }
    const result = await performVouch(id, body.userId);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Vouch failed" },
      { status: 500 },
    );
  }
}
