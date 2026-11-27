import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase";

export async function GET() {
  return NextResponse.json({
    ok: true,
    mode: isSupabaseConfigured() ? "supabase" : "demo",
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
  });
}
