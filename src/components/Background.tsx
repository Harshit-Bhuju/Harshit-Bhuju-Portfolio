"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Background() {
  const [experience, setExperience] = useState<Array<{
    id?: number;
    role: string;
    company: string;
    location?: string | null;
    dateRange?: string | null;
    points?: string[];
  }>>([]);

  useEffect(() => {
    fetch("/api/experience")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length)
          setExperience(data);
      })
      .catch(() => {});
  }, []);

  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const ctx = gsap.context(() => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const header = section.querySelector(".bg-header");
      if (header) {
        gsap.fromTo(
          header.children,
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            stagger: 0.08,
            ease: "power3.out",
            scrollTrigger: { trigger: section, start: "top 80%", once: true },
          }
        );
      }
      const items = section.querySelectorAll(".exp-item");
      if (items.length) {
        gsap.fromTo(
          items,
          { opacity: 0, y: 28 },
          {
            opacity: 1,
            y: 0,
            duration: 0.65,
            stagger: 0.1,
            ease: "power3.out",
            scrollTrigger: { trigger: items[0], start: "top 85%", once: true },
          }
        );
      }
    }, section);
    return () => ctx.revert();
  }, [experience]);

  return (
    <section
      ref={sectionRef}
      id="experience"
      className="section-padding border-t border-border"
    >
      <div className="container-main">
        <div className="bg-header mb-10 md:mb-14">
          <p className="text-xs uppercase tracking-[0.2em] text-muted mb-3">
            Experience
          </p>
          <h2 className="heading-section">Professional Experience</h2>
        </div>

        <div className="space-y-0 border-t border-border">
          {experience.map((job, i) => (
            <article
              key={job.id ?? i}
              className="exp-item grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 py-8 md:py-10 border-b border-border"
            >
              <div className="md:col-span-4">
                <p className="text-sm font-semibold text-primary">{job.role}</p>
                <p className="text-sm text-secondary mt-1">{job.company}</p>
                {job.location && (
                  <p className="text-xs text-muted mt-1">{job.location}</p>
                )}
                <p className="text-xs font-mono text-muted mt-2">
                  {job.dateRange}
                </p>
              </div>
              <div className="md:col-span-8">
                <ul className="space-y-2.5">
                  {(job.points || []).map((point: string, j: number) => (
                    <li
                      key={j}
                      className="text-sm text-secondary leading-relaxed flex gap-3"
                    >
                      <span className="text-muted shrink-0 mt-1.5">▸</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
