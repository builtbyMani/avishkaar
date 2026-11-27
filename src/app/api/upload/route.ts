import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase";

const MAX_IMAGE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB for photos
const MAX_VIDEO_SIZE_BYTES = 8 * 1024 * 1024; // <8 MB for short hover clips

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const isVideo = file.type.startsWith("video/");
    const isImage = file.type.startsWith("image/");
    if (!isVideo && !isImage) {
      return NextResponse.json(
        { error: "Only image and short video files are supported" },
        { status: 400 },
      );
    }

    if (isVideo && file.size > MAX_VIDEO_SIZE_BYTES) {
      return NextResponse.json(
        { error: "Short video clip exceeds the 8 MB limit (or paste a YouTube Shorts URL instead)." },
        { status: 400 },
      );
    }
    if (isImage && file.size > MAX_IMAGE_SIZE_BYTES) {
      return NextResponse.json(
        { error: "Photo exceeds 25 MB limit" },
        { status: 400 },
      );
    }

    const ext = path.extname(file.name) || (isVideo ? ".mp4" : ".jpg");
    const safeName = `${crypto.randomUUID()}${ext}`;
    const bytes = Buffer.from(await file.arrayBuffer());

    if (isSupabaseConfigured()) {
      const sb = getSupabaseServerClient();
      if (!sb) {
        return NextResponse.json({ error: "Supabase storage client unavailable" }, { status: 500 });
      }
      const { error } = await sb.storage
        .from("place-media")
        .upload(safeName, bytes, { contentType: file.type, upsert: false });
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
