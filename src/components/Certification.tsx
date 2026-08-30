"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Modal from "./Modal";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

type Cert = {
  id?: number;
  title: string;
  provider?: string | null;
  date?: string | null;
  topics?: string[];
  description?: string | null;
  story?: string | null;
  certificateUrl?: string | null;
};

export default function Certification() {
  const [items, setItems] = useState<Cert[]>([]);
  const [active, setActive] = useState<Cert | null>(null);
  const sectionRef = useRef<HTMLElement>(null);

  const preloadCertificate = (url?: string | null) => {
    if (!url || typeof window === "undefined" || /\.(pdf)(\?|$)/i.test(url)) return;
    const img = new window.Image();
    img.src = url;
  };

  useEffect(() => {
    fetch("/api/certifications")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        let certs: Cert[] = [];
        if (Array.isArray(data) && data.length) certs = data;
        else if (data && !Array.isArray(data) && data.title) certs = [data];
        setItems(certs);

        // Preload certificate images into browser cache immediately
        certs.forEach((c) => preloadCertificate(c.certificateUrl));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const ctx = gsap.context(() => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      gsap.fromTo(
        section.querySelectorAll(".cert-card"),
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.65,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: { trigger: section, start: "top 80%", once: true },
        }
      );
    }, section);
    return () => ctx.revert();
  }, [items]);

  return (
    <section
      ref={sectionRef}
      id="certifications"
      className="section-padding border-t border-border"
    >
      <div className="container-main">
        <p className="text-xs uppercase tracking-[0.2em] text-muted mb-3">
          Certifications
        </p>
        <h2 className="heading-section mb-10 md:mb-14">Courses & Certificates</h2>

        {items.length === 0 ? (
          <p className="text-sm text-muted">No certifications yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
            {items.map((c, i) => {
              const hasDetail =
                Boolean(c.story) ||
                Boolean(c.description) ||
                (c.topics && c.topics.length > 0) ||
                Boolean(c.certificateUrl);

              return (
                <article
                  key={c.id ?? i}
                  onMouseEnter={() => preloadCertificate(c.certificateUrl)}
                  className="cert-card border border-border p-6 md:p-8 hover:border-strong-border transition-colors duration-300 flex flex-col"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
                    <h3 className="text-base md:text-lg font-semibold text-primary">
                      {c.title}
                    </h3>
                    {c.date && (
                      <span className="text-xs font-mono text-muted">
                        {c.date}
                      </span>
                    )}
                  </div>
                  {c.provider && (
                    <p className="text-sm text-secondary mb-4">{c.provider}</p>
                  )}

                  {c.topics && c.topics.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-5">
                      {c.topics.slice(0, 5).map((t) => (
                        <span
                          key={t}
                          className="text-xs px-2.5 py-1 border border-border text-secondary rounded-full"
                        >
                          {t}
                        </span>
                      ))}
                      {c.topics.length > 5 && (
                        <span className="text-xs text-muted self-center">
                          +{c.topics.length - 5}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="mt-auto pt-2">
                    {hasDetail ? (
                      <button
                        type="button"
                        onClick={() => setActive(c)}
                        className="text-xs font-semibold tracking-[0.12em] uppercase text-primary border-b border-strong-border pb-0.5 hover:opacity-70 transition-opacity"
                      >
                        View story &amp; certificate
                      </button>
                    ) : (
                      <span className="text-xs text-muted">Details coming soon</span>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      <Modal
        isOpen={!!active}
        onClose={() => setActive(null)}
        title={active?.title || "Certificate"}
        maxWidth="max-w-3xl"
        ariaLabel="Certificate details"
      >
        {active && (
          <div className="space-y-6">
            <div className="flex flex-wrap gap-3 text-sm text-secondary">
              {active.provider && <span>{active.provider}</span>}
              {active.provider && active.date && <span aria-hidden>·</span>}
              {active.date && (
                <span className="font-mono text-xs text-muted">{active.date}</span>
              )}
            </div>

            {active.description && (
              <div>
                <h4 className="text-xs uppercase tracking-[0.15em] text-muted mb-2">
                  What I did
                </h4>
                <p className="text-sm text-secondary leading-relaxed whitespace-pre-line">
                  {active.description}
                </p>
              </div>
            )}

            {active.story && (
              <div>
                <h4 className="text-xs uppercase tracking-[0.15em] text-muted mb-2">
                  My story
                </h4>
                <p className="text-sm text-secondary leading-relaxed whitespace-pre-line">
                  {active.story}
                </p>
              </div>
            )}

            {active.topics && active.topics.length > 0 && (
              <div>
                <h4 className="text-xs uppercase tracking-[0.15em] text-muted mb-3">
                  What I learned
                </h4>
                <div className="flex flex-wrap gap-2">
                  {active.topics.map((t) => (
                    <span
                      key={t}
                      className="text-xs px-3 py-1.5 border border-border text-secondary rounded-full"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {active.certificateUrl && (
              <div>
                <h4 className="text-xs uppercase tracking-[0.15em] text-muted mb-3">
                  Certificate
                </h4>
                <a
                  href={active.certificateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block relative aspect-[4/3] max-w-lg border border-border overflow-hidden hover:border-strong-border transition-colors"
                >
                  {/* PDF link fallback if not image */}
                  {/\.(pdf)(\?|$)/i.test(active.certificateUrl) ? (
                    <div className="absolute inset-0 flex items-center justify-center text-sm text-secondary">
                      Open certificate PDF ↗
                    </div>
                  ) : (
                    <Image
                      src={active.certificateUrl}
                      alt={`${active.title} certificate`}
                      fill
                      priority
                      className="object-contain bg-surface"
                      sizes="(max-width: 768px) 100vw, 512px"
                    />
                  )}
                </a>
                <a
                  href={active.certificateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-3 text-xs font-semibold tracking-wider uppercase text-primary border-b border-strong-border pb-0.5"
                >
                  Open full certificate ↗
                </a>
              </div>
            )}
          </div>
        )}
      </Modal>
    </section>
  );
}
