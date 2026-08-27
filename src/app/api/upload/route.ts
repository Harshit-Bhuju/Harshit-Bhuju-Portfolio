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
            "Supabase not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
        },
        { status: 503 }
      );
    }

    const bucket = getStorageBucket();
    const contentTypeHeader = req.headers.get("content-type") || "";

    // ─── Direct Signed URL Generation (JSON payload) ───
    // This allows the browser to upload directly to Supabase, bypassing Vercel's 4.5MB limit
    if (contentTypeHeader.includes("application/json")) {
      const body = await req.json().catch(() => ({}));
      const filename = String(body.filename || `file-${Date.now()}`);
      const folder = String(body.folder || "projects");

      const ext =
        filename.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") ||
        "bin";

      let contentType =
        body.contentType || MIME_MAP[ext] || "application/octet-stream";
      if (contentType === "image/jpg") contentType = "image/jpeg";

      const safeFolder =
        folder.replace(/[^a-zA-Z0-9/_-]/g, "").slice(0, 60) || "projects";
      const path = `${safeFolder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUploadUrl(path);

      if (error || !data?.signedUrl) {
        console.error("Supabase createSignedUploadUrl error:", error);
        return NextResponse.json(
          { error: error?.message || "Failed to create signed upload URL" },
          { status: 500 }
        );
      }

      const publicUrl = publicObjectUrl(path);

      return NextResponse.json({
        signedUrl: data.signedUrl,
        publicUrl,
        path,
        bucket,
        contentType,
      });
    }

    // ─── Standard FormData Fallback (For small files) ───
    const form = await req.formData();
    const file = form.get("file");
    const folder = String(form.get("folder") || "projects");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // 50MB max file size
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

    let contentType = MIME_MAP[ext] || file.type || "application/octet-stream";
    if (contentType === "image/jpg") contentType = "image/jpeg";

    const safeFolder =
      folder.replace(/[^a-zA-Z0-9/_-]/g, "").slice(0, 60) || "projects";
    const path = `${safeFolder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const buffer = Buffer.from(await file.arrayBuffer());

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
