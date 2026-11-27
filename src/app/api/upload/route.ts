import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase";

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB for short clips & photos

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: "File exceeds 25 MB short-clip/photo limit" },
        { status: 400 },
      );
    }

    const isVideo = file.type.startsWith("video/");
    const isImage = file.type.startsWith("image/");
    if (!isVideo && !isImage) {
      return NextResponse.json(
        { error: "Only image and short video files are supported" },
        { status: 400 },
      );
    }

    const ext = path.extname(file.name) || (isVideo ? ".mp4" : ".jpg");
    const safeName = `${crypto.randomUUID()}${ext}`;
    const bytes = Buffer.from(await file.arrayBuffer());

    if (isSupabaseConfigured()) {
      const sb = getSupabaseServerClient();
      if (sb) {
        const { error } = await sb.storage
          .from("place-media")
          .upload(safeName, bytes, { contentType: file.type, upsert: false });
        if (!error) {
          const { data } = sb.storage.from("place-media").getPublicUrl(safeName);
          return NextResponse.json({
            type: isVideo ? "video" : "image",
            url: data.publicUrl,
          });
        }
      }
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
