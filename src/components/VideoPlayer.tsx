"use client";

import { useState } from "react";

interface Props {
  videoUrl: string;
  thumbnailUrl?: string | null;
  title: string;
}

function toDrivePreview(url: string): string | null {
  try {
    const fileMatch = url.match(/\/file\/d\/([^/]+)/);
    if (fileMatch) return `https://drive.google.com/file/d/${fileMatch[1]}/preview`;
    const idMatch = url.match(/[?&]id=([^&]+)/);
    if (idMatch && url.includes("drive.google.com"))
      return `https://drive.google.com/file/d/${idMatch[1]}/preview`;
  } catch {
    return null;
  }
  return null;
}

function getEmbedUrl(url: string): string | null {
  const drive = toDrivePreview(url);
  if (drive) return drive;
  try {
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      const id = url.includes("youtu.be")
        ? url.split("youtu.be/")[1]?.split("?")[0]
        : new URL(url).searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}?rel=0` : null;
    }
    if (url.includes("vimeo.com")) {
      const id = url.split("vimeo.com/")[1]?.split("?")[0];
      return id ? `https://player.vimeo.com/video/${id}` : null;
    }
  } catch {
    return null;
  }
  return null;
}

export default function VideoPlayer({ videoUrl, thumbnailUrl, title }: Props) {
  const [playing, setPlaying] = useState(false);

  const isFile =
    /\.(mp4|webm|mov)(\?|$)/i.test(videoUrl) ||
    videoUrl.includes("/storage/") ||
    videoUrl.includes("supabase");

  const embed = isFile ? null : getEmbedUrl(videoUrl);

  if (isFile) {
    return (
      <div className="border border-border overflow-hidden">
        <video
          className="w-full aspect-video bg-black"
          controls
          playsInline
          preload="metadata"
          poster={thumbnailUrl || undefined}
        >
          <source
            src={videoUrl}
            type={
              videoUrl.includes(".webm")
                ? "video/webm"
                : videoUrl.includes(".mov")
                ? "video/quicktime"
                : "video/mp4"
            }
          />
          Your browser does not support the video tag.
        </video>
      </div>
    );
  }

  if (embed) {
    if (!playing) {
      return (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          className="w-full aspect-video border border-border bg-surface flex flex-col items-center justify-center gap-3 text-secondary hover:text-primary hover:border-strong-border transition-all group cursor-pointer"
          aria-label={`Play ${title} walkthrough video`}
        >
          <div className="w-12 h-12 rounded-full border border-border group-hover:border-primary group-hover:scale-110 transition-all flex items-center justify-center text-primary bg-bg/80">
            ▶
          </div>
          <span className="text-xs font-medium tracking-wide uppercase">
            Play Walkthrough
          </span>
        </button>
      );
    }
    return (
      <div className="aspect-video relative border border-border overflow-hidden">
        <iframe
          src={embed}
          title={`${title} walkthrough video`}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  // Fallback: plain link
  return (
    <a
      href={videoUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 text-sm border border-border px-4 py-3 hover:border-strong-border transition-colors"
    >
      Watch Video ↗
    </a>
  );
}
