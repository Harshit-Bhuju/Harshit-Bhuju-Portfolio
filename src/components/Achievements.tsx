"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
  const [lightboxPhoto, setLightboxPhoto] = useState<string | null>(null);
  const sectionRef = useRef<HTMLElement>(null);

  const preloadPhoto = (url?: string | null) => {
    if (!url || typeof window === "undefined" || /\.(pdf)(\?|$)/i.test(url)) return;
    const img = new window.Image();
    img.src = url;
  };

  const preloadAchievementPhotos = (item: Achievement) => {
    if (item.certificateUrl) preloadPhoto(item.certificateUrl);
    if (Array.isArray(item.galleryUrls)) {
      item.galleryUrls.forEach((u) => preloadPhoto(u));
    }
  };

  useEffect(() => {
    fetch("/api/achievements")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (Array.isArray(data)) {
          setAchievements(data);
          // Preload all certificate & gallery photos into browser cache immediately
          data.forEach((item: Achievement) => preloadAchievementPhotos(item));
        }
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

  // Separate featured official award certificate from event gallery photos
  const featuredCertificate = useMemo(() => {
    if (!active?.certificateUrl) return null;
    const trimmed = active.certificateUrl.trim();
    return trimmed ? trimmed : null;
  }, [active]);

  const galleryPhotos = useMemo(() => {
    if (!active || !Array.isArray(active.galleryUrls)) return [];
    const list: string[] = [];
    for (const u of active.galleryUrls) {
      if (u && u.trim() && u.trim() !== featuredCertificate && !list.includes(u.trim())) {
        list.push(u.trim());
      }
    }
    return list;
  }, [active, featuredCertificate]);

  const openModal = (item: Achievement) => {
    setActive(item);
  };

  const closeModal = () => {
    setActive(null);
    setLightboxPhoto(null);
  };

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
                  onMouseEnter={() => preloadAchievementPhotos(a)}
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

                    {/* Action */}
                    {hasDetail && (
                      <div className="mt-4 pt-3 flex items-center justify-end border-t border-border/40">
                        <button
                          type="button"
                          onClick={() => openModal(a)}
                          className="text-xs font-semibold tracking-[0.12em] uppercase text-primary border-b border-strong-border pb-0.5 hover:opacity-70 transition-opacity cursor-pointer"
                        >
                          {hasPhotos ? "View Gallery & Certificate ↗" : "View Details ↗"}
                        </button>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Interactive Achievement Details & Photo Modal */}
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

            {/* Featured Official Award / Certificate (BIG) */}
            {featuredCertificate && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-[0.15em] text-primary font-semibold flex items-center gap-2">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary" />
                    <span>Official Award / Certificate</span>
                  </span>
                  <span className="text-[11px] text-muted font-mono">Click image to expand full resolution</span>
                </div>

                {/\.(pdf)(\?|$)/i.test(featuredCertificate) ? (
                  <a
                    href={featuredCertificate}
                    target="_blank"
                    rel="noreferrer"
                    className="block p-6 rounded-2xl border border-border bg-surface hover:border-primary transition-colors text-center space-y-2"
                  >
                    <div className="text-red-400 font-bold text-base">Certificate Document (PDF)</div>
                    <p className="text-xs text-muted">Click to open and view PDF document ↗</p>
                  </a>
                ) : (
                  <div
                    onClick={() => setLightboxPhoto(featuredCertificate)}
                    className="group relative aspect-[16/10] sm:aspect-[16/9] w-full rounded-2xl border border-border bg-black/90 overflow-hidden cursor-pointer hover:border-primary transition-all duration-300 shadow-xl"
                  >
                    <Image
                      src={featuredCertificate}
                      alt={`${active.title} award certificate`}
                      fill
                      priority
                      className="object-contain p-2"
                      sizes="(max-width: 768px) 100vw, 896px"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-xs font-semibold text-white px-4 py-2 rounded-full bg-black/75 border border-white/20 backdrop-blur-md shadow-lg">
                        Expand Full Resolution ↗
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Event & Project Photos Gallery Grid */}
            {galleryPhotos.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-[0.15em] text-muted font-medium flex items-center gap-2">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary" />
                    <span>Event &amp; Project Photos ({galleryPhotos.length})</span>
                  </span>
                  <span className="text-[11px] text-muted font-mono">Click photo to expand</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                  {galleryPhotos.map((src, i) => {
                    const isPdf = /\.(pdf)(\?|$)/i.test(src);

                    if (isPdf) {
                      return (
                        <a
                          key={src}
                          href={src}
                          target="_blank"
                          rel="noreferrer"
                          className="relative aspect-[4/3] rounded-xl border border-border bg-surface hover:border-primary/60 transition-all p-4 flex flex-col items-center justify-center text-center gap-2 group"
                        >
                          <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 font-bold text-xs">
                            PDF
                          </div>
                          <span className="text-xs font-semibold text-primary group-hover:underline">
                            Document PDF
                          </span>
                          <span className="text-[10px] text-muted">Open ↗</span>
                        </a>
                      );
                    }

                    return (
                      <div
                        key={src}
                        onClick={() => setLightboxPhoto(src)}
                        className="group relative aspect-[4/3] rounded-xl border border-border bg-black/40 overflow-hidden cursor-pointer hover:border-primary hover:shadow-lg transition-all duration-300"
                      >
                        <Image
                          src={src}
                          alt={`${active.title} photo ${i + 1}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-xs font-semibold text-white px-3 py-1.5 rounded-full bg-black/70 border border-white/20 backdrop-blur-md">
                            Expand Photo
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
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
                <h4 className="text-xs uppercase tracking-[0.15em] text-primary font-semibold">
                  The Journey &amp; Story
                </h4>
                <p className="text-sm text-secondary leading-relaxed whitespace-pre-line">
                  {active.story}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* High-Res Lightbox Modal via Portal (z-[250] overlay) */}
      {lightboxPhoto && typeof window !== "undefined" && createPortal(
        <div
          className="fixed inset-0 z-[250] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 cursor-pointer"
          onClick={() => setLightboxPhoto(null)}
        >
          <button
            type="button"
            onClick={() => setLightboxPhoto(null)}
            className="absolute top-4 right-4 text-white text-xs font-bold uppercase tracking-wider bg-white/10 hover:bg-white/20 border border-white/20 rounded-full px-4 py-2 transition-colors cursor-pointer z-10"
            aria-label="Close photo preview"
          >
            CLOSE ✕
          </button>
          <div
            className="relative max-w-6xl max-h-[90vh] w-full h-full flex items-center justify-center p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightboxPhoto}
              alt="Expanded full resolution preview"
              className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl border border-white/10"
            />
          </div>
        </div>,
        document.body
      )}

    </section>
  );
}
