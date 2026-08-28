"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Modal from "./Modal";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

type Achievement = {
  id: number;
  placement: string;
  title: string;
  subtitle?: string | null;
  year?: string | null;
  description?: string | null;
  story?: string | null;
  certificateUrl?: string | null;
  galleryUrls?: string[];
};

export default function Achievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [active, setActive] = useState<Achievement | null>(null);
  const [slideIndex, setSlideIndex] = useState(0);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    fetch("/api/achievements")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (Array.isArray(data)) setAchievements(data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || !achievements.length) return;
    const ctx = gsap.context(() => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      gsap.fromTo(
        section.querySelectorAll(".ach-item"),
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.65,
          stagger: 0.08,
          ease: "power3.out",
          scrollTrigger: { trigger: section, start: "top 80%", once: true },
        }
      );
    }, section);
    return () => ctx.revert();
  }, [achievements]);

  // Collect ordered unique photos for the active modal
  const activePhotos = useMemo(() => {
    if (!active) return [];
    const list: string[] = [];
    if (active.certificateUrl && active.certificateUrl.trim()) {
      list.push(active.certificateUrl.trim());
    }
    if (Array.isArray(active.galleryUrls)) {
      for (const u of active.galleryUrls) {
        if (u && u.trim() && !list.includes(u.trim())) {
          list.push(u.trim());
        }
      }
    }
    return list;
  }, [active]);

  const photoCount = activePhotos.length;
  const currentPhoto = photoCount > 0 ? activePhotos[Math.min(slideIndex, photoCount - 1)] : null;

  const nextSlide = useCallback(() => {
    if (photoCount <= 1) return;
    setSlideIndex((i) => (i + 1) % photoCount);
  }, [photoCount]);

  const prevSlide = useCallback(() => {
    if (photoCount <= 1) return;
    setSlideIndex((i) => (i - 1 + photoCount) % photoCount);
  }, [photoCount]);

  // Reset slide index when opening a new modal
  const openModal = (item: Achievement) => {
    setActive(item);
    setSlideIndex(0);
    setLightboxUrl(null);
  };

  const closeModal = () => {
    setActive(null);
    setLightboxUrl(null);
  };

  // Keyboard navigation for active modal carousel
  useEffect(() => {
    if (!active || photoCount <= 1) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        setSlideIndex((i) => (i + 1) % photoCount);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setSlideIndex((i) => (i - 1 + photoCount) % photoCount);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [active, photoCount]);

  return (
    <section
      ref={sectionRef}
      id="achievements"
      className="section-padding border-t border-border"
    >
      <div className="container-main">
        <p className="text-xs uppercase tracking-[0.2em] text-muted mb-3">
          Recognition
        </p>
        <h2 className="heading-section mb-10 md:mb-14">Achievements</h2>

        {achievements.length === 0 ? (
          <p className="text-sm text-muted">No achievements yet.</p>
        ) : (
          <div className="space-y-0 border-t border-border">
            {achievements.map((a) => {
              const allPhotos = [a.certificateUrl, ...(a.galleryUrls || [])].filter(
                (x): x is string => Boolean(x && x.trim())
              );
              const hasPhotos = allPhotos.length > 0;
              const hasDetail = hasPhotos || Boolean(a.story) || Boolean(a.description);

              return (
                <article
                  key={a.id}
                  className="ach-item group grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 py-6 md:py-8 border-b border-border hover:bg-surface/30 transition-colors"
                >
                  <div className="md:col-span-3 lg:col-span-2">
                    <span className="inline-block text-xs font-semibold tracking-wider text-primary px-2.5 py-1 rounded bg-surface border border-border">
                      {a.placement}
                    </span>
                    {a.year && (
                      <p className="text-xs text-muted mt-2 font-mono">{a.year}</p>
                    )}
                  </div>

                  <div className="md:col-span-9 lg:col-span-10 flex flex-col justify-between">
                    <div>
                      <h3 className="text-base md:text-lg font-semibold text-primary group-hover:text-primary transition-colors">
                        {a.title}
                      </h3>
                      {a.subtitle && (
                        <p className="text-sm text-secondary mt-0.5">{a.subtitle}</p>
                      )}
                      {a.description && (
                        <p className="text-sm text-secondary mt-2 leading-relaxed max-w-2xl">
                          {a.description}
                        </p>
                      )}
                    </div>

                    {/* Action & Mini Preview Strip */}
                    <div className="mt-4 pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-border/40">
                      {hasPhotos && (
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-muted flex items-center gap-1.5 font-mono">
                            <span>📸</span>
                            <span>{allPhotos.length} photo{allPhotos.length > 1 ? "s" : ""}</span>
                          </span>
                          <div className="flex items-center gap-1">
                            {allPhotos.slice(0, 3).map((url, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => {
                                  openModal(a);
                                  setSlideIndex(idx);
                                }}
                                className="relative w-7 h-7 rounded border border-border overflow-hidden hover:scale-110 transition-transform bg-surface"
                                title="Click to view full photo"
                              >
                                {/\.(pdf)(\?|$)/i.test(url) ? (
                                  <span className="text-[8px] font-bold text-red-400 flex items-center justify-center h-full">
                                    PDF
                                  </span>
                                ) : (
                                  <Image
                                    src={url}
                                    alt=""
                                    fill
                                    className="object-cover"
                                    sizes="28px"
                                  />
                                )}
                              </button>
                            ))}
                            {allPhotos.length > 3 && (
                              <span className="text-[10px] text-muted font-mono pl-0.5">
                                +{allPhotos.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {hasDetail && (
                        <button
                          type="button"
                          onClick={() => openModal(a)}
                          className="text-xs font-semibold tracking-[0.12em] uppercase text-primary border-b border-strong-border pb-0.5 hover:opacity-70 transition-opacity ml-auto"
                        >
                          {hasPhotos ? "View Gallery & Certificate ↗" : "View Details ↗"}
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Interactive Achievement Details & Photo Carousel Modal */}
      <Modal
        isOpen={!!active}
        onClose={closeModal}
        title={active?.title || "Achievement Details"}
        maxWidth="max-w-4xl"
        ariaLabel="Achievement photos and story"
      >
        {active && (
          <div className="space-y-6">
            {/* Header info chips */}
            <div className="flex flex-wrap items-center gap-2.5 pb-4 border-b border-border text-xs">
              <span className="px-2.5 py-1 rounded bg-primary/10 border border-primary/20 text-primary font-semibold">
                {active.placement}
              </span>
              {active.year && (
                <span className="font-mono text-muted px-2 py-1 rounded border border-border">
                  {active.year}
                </span>
              )}
              {active.subtitle && (
                <span className="text-secondary font-medium">{active.subtitle}</span>
              )}
            </div>

            {/* Photo Carousel & Gallery Section */}
            {photoCount > 0 && currentPhoto && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-[0.15em] text-muted font-medium flex items-center gap-2">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary" />
                    {slideIndex === 0 && active.certificateUrl === currentPhoto
                      ? "Official Award / Certificate"
                      : `Event Photo (${slideIndex + 1} of ${photoCount})`}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-muted tracking-wider">
                      {slideIndex + 1} / {photoCount}
                    </span>
                    <button
                      type="button"
                      onClick={() => setLightboxUrl(currentPhoto)}
                      className="text-[11px] uppercase tracking-wider text-secondary hover:text-primary px-2 py-0.5 border border-border hover:border-strong-border transition-colors cursor-pointer"
                      title="View full screen photo"
                    >
                      Zoom ⤢
                    </button>
                  </div>
                </div>

                {/* Main Carousel Display Box */}
                <div
                  className="relative w-full aspect-[16/10] sm:aspect-[16/9] bg-black/90 rounded-lg border border-border overflow-hidden select-none group"
                  onTouchStart={(e) => {
                    touchStartX.current = e.touches[0].clientX;
                  }}
                  onTouchEnd={(e) => {
                    if (touchStartX.current === null) return;
                    const diff = touchStartX.current - e.changedTouches[0].clientX;
                    if (Math.abs(diff) > 40) {
                      if (diff > 0) nextSlide();
                      else prevSlide();
                    }
                    touchStartX.current = null;
                  }}
                >
                  {/\.(pdf)(\?|$)/i.test(currentPhoto) ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center bg-surface">
                      <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 font-bold text-base">
                        PDF
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-primary">
                          Certificate Document (PDF)
                        </p>
                        <p className="text-xs text-muted mt-1">
                          Click below to open and inspect in full resolution
                        </p>
                      </div>
                      <a
                        href={currentPhoto}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 bg-primary text-bg text-xs font-semibold rounded hover:opacity-90 transition-opacity"
                      >
                        Open Certificate PDF ↗
                      </a>
                    </div>
                  ) : (
                    <>
                      <Image
                        src={currentPhoto}
                        alt={`${active.title} photo ${slideIndex + 1}`}
                        fill
                        className="object-contain"
                        sizes="(max-width: 1024px) 100vw, 896px"
                        priority
                      />
                      {/* Click overlay for zoom */}
                      <button
                        type="button"
                        onClick={() => setLightboxUrl(currentPhoto)}
                        className="absolute inset-0 w-full h-full cursor-zoom-in"
                        aria-label="Click to enlarge photo"
                      />
                    </>
                  )}

                  {/* Carousel Left / Right Navigation Buttons */}
                  {photoCount > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          prevSlide();
                        }}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-white/20 bg-black/60 hover:bg-black/90 text-white flex items-center justify-center text-base transition-all opacity-80 hover:opacity-100 hover:scale-110 z-10 cursor-pointer"
                        aria-label="Previous photo"
                      >
                        ←
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          nextSlide();
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-white/20 bg-black/60 hover:bg-black/90 text-white flex items-center justify-center text-base transition-all opacity-80 hover:opacity-100 hover:scale-110 z-10 cursor-pointer"
                        aria-label="Next photo"
                      >
                        →
                      </button>
                    </>
                  )}
                </div>

                {/* Thumbnails Navigation Strip */}
                {photoCount > 1 && (
                  <div className="flex items-center gap-2 overflow-x-auto py-2 px-1">
                    {activePhotos.map((url, idx) => {
                      const isSelected = idx === slideIndex;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSlideIndex(idx)}
                          className={`relative shrink-0 w-16 h-12 rounded border transition-all overflow-hidden cursor-pointer ${
                            isSelected
                              ? "border-primary ring-2 ring-primary/40 scale-105"
                              : "border-border opacity-60 hover:opacity-100"
                          }`}
                        >
                          {/\.(pdf)(\?|$)/i.test(url) ? (
                            <span className="text-[9px] font-bold text-red-400 flex items-center justify-center h-full bg-surface">
                              PDF
                            </span>
                          ) : (
                            <Image
                              src={url}
                              alt={`Thumbnail ${idx + 1}`}
                              fill
                              className="object-cover"
                              sizes="64px"
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Description / Summary */}
            {active.description && (
              <div className="pt-2">
                <h4 className="text-xs uppercase tracking-[0.15em] text-muted mb-2 font-medium">
                  Summary &amp; Project
                </h4>
                <p className="text-sm md:text-base text-secondary leading-relaxed whitespace-pre-line">
                  {active.description}
                </p>
              </div>
            )}

            {/* Detailed Story / Journey (if present) */}
            {active.story && (
              <div className="p-5 rounded-xl border border-border/80 bg-surface/50 space-y-2">
                <h4 className="text-xs uppercase tracking-[0.15em] text-primary font-semibold flex items-center gap-2">
                  <span>✨</span>
                  <span>The Journey &amp; Story</span>
                </h4>
                <p className="text-sm text-secondary leading-relaxed whitespace-pre-line">
                  {active.story}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Fullscreen High-Resolution Lightbox View */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 md:p-8"
          data-lenis-prevent
          role="dialog"
          aria-modal="true"
          aria-label="High resolution photo view"
          onClick={() => setLightboxUrl(null)}
        >
          <button
            type="button"
            className="absolute top-5 right-5 text-xs tracking-wider text-secondary hover:text-primary px-3 py-1.5 border border-border bg-bg/80 cursor-pointer"
            onClick={() => setLightboxUrl(null)}
          >
            CLOSE [ESC]
          </button>

          {photoCount > 1 && (
            <>
              <button
                type="button"
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full border border-white/20 bg-black/70 text-white flex items-center justify-center text-lg hover:scale-110 transition-all cursor-pointer z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  const curIdx = activePhotos.indexOf(lightboxUrl);
                  const nextIdx = (curIdx - 1 + photoCount) % photoCount;
                  setSlideIndex(nextIdx);
                  setLightboxUrl(activePhotos[nextIdx]);
                }}
                aria-label="Previous photo"
              >
                ←
              </button>
              <button
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full border border-white/20 bg-black/70 text-white flex items-center justify-center text-lg hover:scale-110 transition-all cursor-pointer z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  const curIdx = activePhotos.indexOf(lightboxUrl);
                  const nextIdx = (curIdx + 1) % photoCount;
                  setSlideIndex(nextIdx);
                  setLightboxUrl(activePhotos[nextIdx]);
                }}
                aria-label="Next photo"
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
              src={lightboxUrl}
              alt="Achievement full view"
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          </div>
        </div>
      )}
    </section>
  );
}

