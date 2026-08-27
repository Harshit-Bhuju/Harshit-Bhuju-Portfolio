import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  getStorageBucket,
  getSupabaseAdmin,
  publicObjectUrl,
} from "@/lib/supabase";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

  const form = await req.formData();
  const file = form.get("file");
  const folder = String(form.get("folder") || "projects");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file" }, { status: 400 });
  }

  // 80MB for project videos; images/PDF still fine under this
  const maxBytes = 80 * 1024 * 1024;
  if (file.size > maxBytes) {
    return NextResponse.json(
      { error: "File too large (max 80MB)" },
      { status: 400 }
    );
  }

  const allowed = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/avif",
    "video/mp4",
    "video/webm",
    "video/quicktime",
    "application/pdf",
  ];

  const ext =
    file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") ||
    "bin";

  const typeOk =
    !file.type ||
    allowed.includes(file.type) ||
    (ext === "pdf" &&
      (!file.type ||
        file.type === "application/pdf" ||
        file.type === "application/octet-stream")) ||
    (["mp4", "webm", "mov"].includes(ext) &&
      (!file.type || file.type.startsWith("video/") || file.type === "application/octet-stream"));

  if (!typeOk) {
    return NextResponse.json(
      { error: `Unsupported type: ${file.type || ext}` },
      { status: 400 }
    );
  }

  const safeFolder =
    folder.replace(/[^a-zA-Z0-9/_-]/g, "").slice(0, 60) || "projects";
  const path = `${safeFolder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const buffer = Buffer.from(await file.arrayBuffer());
  const bucket = getStorageBucket();

  let contentType = file.type || "application/octet-stream";
  if (ext === "pdf") contentType = "application/pdf";
  if (ext === "mp4") contentType = "video/mp4";
  if (ext === "webm") contentType = "video/webm";
  if (ext === "mov") contentType = "video/quicktime";

  const { error } = await supabase.storage.from(bucket).upload(path, buffer, {
    contentType,
    upsert: true,
  });

  if (error) {
    console.error(error);
    return NextResponse.json(
      { error: error.message || "Upload failed" },
      { status: 500 }
    );
  }

  const url = publicObjectUrl(path);
  return NextResponse.json({ url, path, bucket, contentType });
}
