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

  // Step 1: Attempt direct upload to Supabase Storage via signed URL
  try {
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
    if (signRes.ok && signData.signedUrl && signData.publicUrl) {
      const { signedUrl, publicUrl } = signData;

      const uploadRes = await fetch(signedUrl, {
        method: "PUT",
        headers: {
          "Content-Type": contentType,
        },
        body: file,
      });

      if (uploadRes.ok) {
        return publicUrl as string;
      }

      console.warn(
        `Direct Supabase Storage upload failed with status ${uploadRes.status}. Falling back to server upload route...`
      );
    }
  } catch (err) {
    console.warn(
      "Direct Supabase Storage upload network error. Falling back to server upload route:",
      err
    );
  }

  // Step 2: Automatic Server Fallback — Upload via FormData to /api/upload
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);

  const fallbackRes = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  const fallbackData = await fallbackRes.json().catch(() => ({}));
  if (!fallbackRes.ok || !fallbackData.url) {
    throw new Error(
      fallbackData.error || "Upload failed via server fallback route."
    );
  }

  return fallbackData.url as string;
}
