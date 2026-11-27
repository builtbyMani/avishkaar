import { NextRequest, NextResponse } from "next/server";
import { getPlaceDetail } from "@/lib/store";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const viewerId = request.nextUrl.searchParams.get("viewerId") || undefined;
  const detail = await getPlaceDetail(id, viewerId);

  if (!detail.place) {
    return NextResponse.json({ error: "Place not found" }, { status: 404 });
  }
  return NextResponse.json(detail);
}
