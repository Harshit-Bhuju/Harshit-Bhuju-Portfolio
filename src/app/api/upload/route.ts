import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import {
  getStorageBucket,
  getSupabaseAdmin,
  publicObjectUrl,
} from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MIME_MAP: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  avif: "image/avif",
  svg: "image/svg+xml",
  pdf: "application/pdf",
  mp4: "video/mp4",
  webm: "video/webm",
  mov: "video/quicktime",
};

export async function POST(req: NextRequest) {
  try {
    const authed = await isAuthenticated(req);
    if (!authed) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in to admin." },
        { status: 401 }
      );
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json(
        {
          error:
            "Supabase not configured. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your Vercel Environment Variables.",
        },
        { status: 503 }
      );
    }

    const form = await req.formData();
    const file = form.get("file");
    const folder = String(form.get("folder") || "projects");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // 50MB limit (compatible with Supabase storage)
    const maxBytes = 50 * 1024 * 1024;
    if (file.size > maxBytes) {
      return NextResponse.json(
        { error: "File too large (max allowed size is 50MB)" },
        { status: 400 }
      );
    }

    const ext =
      file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") ||
      "bin";

    // Normalize MIME type
    let contentType = MIME_MAP[ext] || file.type || "application/octet-stream";
    if (contentType === "image/jpg") contentType = "image/jpeg";

    const allowedMimes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/avif",
      "image/svg+xml",
      "video/mp4",
      "video/webm",
      "video/quicktime",
      "application/pdf",
    ];

    if (!allowedMimes.includes(contentType) && !allowedMimes.includes(file.type)) {
      return NextResponse.json(
        { error: `Unsupported file format: .${ext} (${file.type || contentType})` },
        { status: 400 }
      );
    }

    const safeFolder =
      folder.replace(/[^a-zA-Z0-9/_-]/g, "").slice(0, 60) || "projects";
    const path = `${safeFolder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const buffer = Buffer.from(await file.arrayBuffer());
    const bucket = getStorageBucket();

    const { error } = await supabase.storage.from(bucket).upload(path, buffer, {
      contentType,
      upsert: true,
    });

    if (error) {
      console.error("Supabase upload error:", error);
      return NextResponse.json(
        { error: `Upload error: ${error.message || "Storage error"}` },
        { status: 500 }
      );
    }

    const url = publicObjectUrl(path);
    return NextResponse.json({ url, path, bucket, contentType });
  } catch (err: unknown) {
    console.error("API /upload unexpected error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal Server Error during upload" },
      { status: 500 }
    );
  }
}
