"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useModalScrollLock } from "@/hooks/useModalScrollLock";

interface Props {
  thumbnailUrl?: string | null;
  galleryUrls?: string[];
  videoUrl?: string | null;
  title: string;
  number: string;
  certificateUrls?: string[];
  /** When true (default), the video block is hidden — use this when the parent renders the video separately */
  hideVideo?: boolean;
}

/** Convert Google Drive share/view links to embeddable preview */
function toDrivePreview(url: string): string | null {
  try {
    const fileMatch = url.match(/\/file\/d\/([^/]+)/);
    if (fileMatch) {
      return `https://drive.google.com/file/d/${fileMatch[1]}/preview`;
    }
    const idMatch = url.match(/[?&]id=([^&]+)/);
    if (idMatch && url.includes("drive.google.com")) {
      return `https://drive.google.com/file/d/${idMatch[1]}/preview`;
    }
  } catch {
    return null;
  }
  return null;
}

function getEmbedUrl(url: string): string | null {
  try {
    const drive = toDrivePreview(url);
    if (drive) return drive;

    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      const id = url.includes("youtu.be")
        ? url.split("youtu.be/")[1]?.split("?")[0]
        : new URL(url).searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : null;
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

export default function ProjectMedia({
  thumbnailUrl,
  galleryUrls = [],
  videoUrl,
  title,
  number,
  certificateUrls = [],
  hideVideo = false,
}: Props) {
  const [playing, setPlaying] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const embed = videoUrl ? getEmbedUrl(videoUrl) : null;

  // Unique ordered slides: thumbnail first, then gallery (skip duplicates)
  const slides = useMemo(() => {
    const urls: string[] = [];
    const push = (u?: string | null) => {
      if (!u || !u.trim()) return;
      if (!urls.includes(u)) urls.push(u);
    };
    push(thumbnailUrl);
    for (const g of galleryUrls || []) push(g);
    return urls;
  }, [thumbnailUrl, galleryUrls]);

  const count = slides.length;
  const current = count > 0 ? slides[Math.min(index, count - 1)] : null;

  const go = useCallback(
    (dir: -1 | 1) => {
      if (count < 2) return;
      setIndex((i) => (i + dir + count) % count);
    },
    [count]
  );

  const goTo = useCallback(
    (i: number) => {
      if (i >= 0 && i < count) setIndex(i);
    },
    [count]
  );

  // Keyboard when carousel focused / on page
  useEffect(() => {
    if (count < 2 && !lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (lightbox) return; // modal handles esc via lock
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, count, lightbox]);

  useModalScrollLock(playing || !!lightbox, () => {
    setPlaying(false);
    setLightbox(null);
  });

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current == null || count < 2) return;
    const dx = (e.changedTouches[0]?.clientX ?? 0) - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) < 40) return;
    go(dx < 0 ? 1 : -1);
  };

  return (
    <div className="space-y-6">
      {/* Main carousel */}
      <div
        className="aspect-[16/10] md:aspect-[16/9] bg-black/95 border border-border relative overflow-hidden group flex items-center justify-center"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        role="region"
        aria-roledescription="carousel"
        aria-label={`${title} media`}
      >
        {current ? (
          <>
            <button
              type="button"
              className="absolute inset-0 z-0 cursor-zoom-in flex items-center justify-center"
              onClick={() => setLightbox(current)}
              aria-label="Open full size"
            >
              <Image
                key={current}
                src={current}
                alt={`${title} — image ${index + 1} of ${count}`}
                fill
                className="object-contain transition-opacity duration-300"
                sizes="(max-width: 1200px) 100vw, 1100px"
                priority={index === 0}
              />
            </button>

            {/* Gradient edges for controls */}
            {count > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => go(-1)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-11 md:h-11 flex items-center justify-center border border-border/80 bg-bg/70 backdrop-blur-sm text-primary hover:bg-bg transition-colors"
                  aria-label="Previous image"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-11 md:h-11 flex items-center justify-center border border-border/80 bg-bg/70 backdrop-blur-sm text-primary hover:bg-bg transition-colors"
                  aria-label="Next image"
                >
                  →
                </button>

                {/* Counter */}
                <div className="absolute bottom-3 right-3 z-10 text-[10px] uppercase tracking-[0.15em] text-primary bg-bg/70 backdrop-blur-sm border border-border/80 px-2.5 py-1">
                  {String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
                </div>
              </>
            )}

            {/* Number watermark */}
            {number && (
              <span className="absolute top-3 left-3 z-10 text-xs font-mono text-muted tracking-wider">
                {number}
              </span>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted text-sm">
            No media yet
          </div>
        )}
      </div>

      {/* Thumbnail strip */}
      {count > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {slides.map((url, i) => (
            <button
              key={url + i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Go to image ${i + 1}`}
              aria-current={i === index ? "true" : undefined}
              className={`relative shrink-0 w-16 h-12 md:w-20 md:h-14 border overflow-hidden transition-colors ${
                i === index
                  ? "border-strong-border opacity-100"
                  : "border-border opacity-60 hover:opacity-100"
              }`}
            >
              <Image
                src={url}
                alt=""
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}

      {/* Dot indicators (mobile-friendly alternative) */}
      {count > 1 && count <= 12 && (
        <div className="flex justify-center gap-1.5 -mt-2 md:hidden">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-5 bg-primary" : "w-1.5 bg-border"
              }`}
            />
          ))}
        </div>
      )}

      {/* Video — only shown here if not hidden by parent (parent renders it separately below overview) */}
      {videoUrl && !hideVideo && (
        <div className="pt-2">
          <div className="max-w-xl md:max-w-2xl border border-border bg-surface/40 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/80 bg-surface/80">
              <span className="text-[11px] uppercase tracking-[0.15em] text-muted font-medium flex items-center gap-2">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary/60" />
                Walkthrough / Demo Video
              </span>
              <span className="text-[10px] font-mono text-muted tracking-wider">
                16:9
              </span>
            </div>

            <div className="p-2 sm:p-3">
              {(() => {
                const isFile =
                  /\.(mp4|webm|mov)(\?|$)/i.test(videoUrl) ||
                  videoUrl.includes("/storage/") ||
                  videoUrl.includes("supabase");
                if (isFile) {
                  return (
                    <video
                      className="w-full aspect-video bg-black border border-border/60"
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
                  );
                }
                if (embed && !playing) {
                  return (
                    <button
                      type="button"
                      onClick={() => setPlaying(true)}
                      className="w-full aspect-video bg-surface border border-border/60 flex flex-col items-center justify-center gap-2 text-sm text-secondary hover:text-primary transition-all group cursor-pointer"
                    >
                      <div className="w-11 h-11 rounded-full border border-border group-hover:border-strong-border group-hover:scale-105 transition-all flex items-center justify-center text-primary bg-bg/80">
                        ▶
                      </div>
                      <span className="text-xs font-medium tracking-wide">Play Walkthrough Video</span>
                    </button>
                  );
                }
                if (embed && playing) {
                  return (
                    <div className="aspect-video relative border border-border/60">
                      <iframe
                        src={embed}
                        title={`${title} video`}
                        className="absolute inset-0 w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  );
                }
                return (
                  <a
                    href={videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full py-4 text-center text-sm text-secondary hover:text-primary"
                  >
                    Open video ↗
                  </a>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Certificates */}
      {certificateUrls.length > 0 && (
        <div>
          <p className="text-xs uppercase tracking-[0.15em] text-muted mb-3">
            Certificates
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {certificateUrls.map((url) => (
              <button
                key={url}
                type="button"
                onClick={() => setLightbox(url)}
                className="relative aspect-[4/3] border border-border overflow-hidden hover:border-strong-border transition-colors"
              >
                <Image
                  src={url}
                  alt="Certificate"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 300px"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[200] bg-bg/95 backdrop-blur-sm flex items-center justify-center p-4 md:p-10"
          data-lenis-prevent
          role="dialog"
          aria-modal="true"
          aria-label="Full size image"
          onClick={() => setLightbox(null)}
        >
          <button
            type="button"
            className="absolute top-5 right-5 text-sm tracking-wider text-secondary hover:text-primary"
            onClick={() => setLightbox(null)}
          >
            CLOSE [ESC]
          </button>

          {/* Lightbox nav when multiple slides */}
          {count > 1 && slides.includes(lightbox) && (
            <>
              <button
                type="button"
                className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 w-11 h-11 border border-border bg-bg/80 text-primary"
                onClick={(e) => {
                  e.stopPropagation();
                  const i = slides.indexOf(lightbox);
                  const next = (i - 1 + count) % count;
                  setIndex(next);
                  setLightbox(slides[next]);
                }}
                aria-label="Previous"
              >
                ←
              </button>
              <button
                type="button"
                className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 w-11 h-11 border border-border bg-bg/80 text-primary"
                onClick={(e) => {
                  e.stopPropagation();
                  const i = slides.indexOf(lightbox);
                  const next = (i + 1) % count;
                  setIndex(next);
                  setLightbox(slides[next]);
                }}
                aria-label="Next"
              >
                →
              </button>
            </>
          )}

          <div
            className="relative w-full max-w-5xl aspect-[16/10] max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={lightbox}
              alt={title}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          </div>
        </div>
      )}
    </div>
  );
}
