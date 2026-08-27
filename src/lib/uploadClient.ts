/**
 * Client-side helper for uploading files directly to Supabase Storage.
 *
 * Architecture:
 * 1. Requests a short-lived Signed Upload URL from Next.js (/api/upload).
 * 2. Directly streams the file from the browser to Supabase Storage via HTTP PUT.
 *
 * This completely bypasses Vercel's 4.5MB Serverless Function payload limit,
 * enabling uploads up to 50MB (Supabase Free tier limit) including videos,
 * PDFs, and high-res gallery images.
 */

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

export async function uploadClientFile(
  file: File,
  folder = "projects"
): Promise<string> {
  // 50MB limit check (Supabase Free Tier max)
  const maxBytes = 50 * 1024 * 1024;
  if (file.size > maxBytes) {
    throw new Error(
      `File size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds the 50 MB limit allowed by Supabase Free tier.`
    );
  }

  const ext =
    file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") ||
    "bin";

  let contentType = MIME_MAP[ext] || file.type || "application/octet-stream";
  if (contentType === "image/jpg") contentType = "image/jpeg";

  // Step 1: Request signed upload URL from Next.js backend (< 1KB payload)
  const signRes = await fetch("/api/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      filename: file.name,
      folder,
      contentType,
    }),
  });

  const signData = await signRes.json().catch(() => ({}));
  if (!signRes.ok) {
    throw new Error(
      signData.error || "Failed to obtain upload authorization from server."
    );
  }

  const { signedUrl, publicUrl } = signData;
  if (!signedUrl || !publicUrl) {
    throw new Error("Invalid signed URL returned from server.");
  }

  // Step 2: Stream file directly from browser to Supabase Storage
  const uploadRes = await fetch(signedUrl, {
    method: "PUT",
    headers: {
      "Content-Type": contentType,
    },
    body: file,
  });

  if (!uploadRes.ok) {
    const errorText = await uploadRes.text().catch(() => "");
    throw new Error(
      `Direct upload to Supabase failed (${uploadRes.status}): ${
        errorText || "Storage upload error"
      }`
    );
  }

  return publicUrl as string;
}
