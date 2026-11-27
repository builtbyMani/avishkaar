import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient, isSupabaseConfigured, resolveActorId } from "@/lib/supabase";
import { detectFileKind } from "@/lib/upload-validation";

const MAX_IMAGE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB for photos
const MAX_VIDEO_SIZE_BYTES = 8 * 1024 * 1024; // <8 MB for short hover clips

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Auth required (Issues 2/11). In Demo Mode the fallback id is the
    // form's userId field; in Supabase mode it is the verified Bearer token.
    const actorId = await resolveActorId(request, String(formData.get("userId") ?? ""));
    if (!actorId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const bytes = Buffer.from(await file.arrayBuffer());

    // Real type comes from magic bytes — never from file.type or file.name.
    // SVG/HTML and every other active/unknown format is rejected here.
    const detected = detectFileKind(bytes);
    if (!detected) {
      return NextResponse.json(
        { error: "Only JPEG, PNG, WebP or GIF images and MP4/WebM short videos are supported" },
        { status: 400 },
      );
    }
    const isVideo = detected.kind === "video";

    if (isVideo && file.size > MAX_VIDEO_SIZE_BYTES) {
      return NextResponse.json(
        { error: "Short video clip exceeds the 8 MB limit (or paste a YouTube Shorts URL instead)." },
        { status: 400 },
      );
    }
    if (!isVideo && file.size > MAX_IMAGE_SIZE_BYTES) {
      return NextResponse.json(
        { error: "Photo exceeds 25 MB limit" },
        { status: 400 },
      );
    }

    // Extension is derived from the detected type, never the uploaded name.
    const safeName = `${crypto.randomUUID()}${detected.ext}`;

    if (isSupabaseConfigured()) {
      const sb = getSupabaseServerClient();
      if (!sb) {
        return NextResponse.json({ error: "Supabase storage client unavailable" }, { status: 500 });
      }
      const { error } = await sb.storage
        .from("place-media")
        .upload(safeName, bytes, { contentType: detected.contentType, upsert: false });
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      const { data } = sb.storage.from("place-media").getPublicUrl(safeName);
      return NextResponse.json({
        type: isVideo ? "video" : "image",
        url: data.publicUrl,
      });
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    fs.mkdirSync(uploadDir, { recursive: true });
    fs.writeFileSync(path.join(uploadDir, safeName), bytes);

    return NextResponse.json({
      type: isVideo ? "video" : "image",
      url: `/uploads/${safeName}`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 },
    );
  }
}
