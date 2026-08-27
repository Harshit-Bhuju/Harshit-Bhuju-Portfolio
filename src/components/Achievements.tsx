"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

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
  certificateUrl?: string | null;
};

export default function Achievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const sectionRef = useRef<HTMLElement>(null);

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
            {achievements.map((a) => (
              <article
                key={a.id}
                className="ach-item grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-6 py-6 md:py-8 border-b border-border"
              >
                <div className="md:col-span-2">
                  <span className="text-xs font-semibold tracking-wider text-primary">
                    {a.placement}
                  </span>
                  {a.year && (
                    <p className="text-xs text-muted mt-1 font-mono">{a.year}</p>
                  )}
                </div>
                <div className="md:col-span-10">
                  <h3 className="text-base md:text-lg font-semibold text-primary">
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
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
