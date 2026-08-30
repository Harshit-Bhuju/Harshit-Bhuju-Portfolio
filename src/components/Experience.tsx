"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const defaultExperience = [
  {
    id: 1,
    role: "Frontend Developer Intern",
    company: "Next Step",
    location: "Banepa, Nepal",
    dateRange: "07/2026 — Present",
    points: [
      "Architected a scalable multi-role frontend (Super Admin, Admin, User) using Next.js, TypeScript, and NestJS REST APIs.",
      "Implemented RTK Query for automatic cache invalidation, reducing redundant network requests and optimizing data fetching performance.",
      "Engineered complex data table workflows with automated report generation and Excel export capabilities for participant KPI tracking.",
      "Developed cohort management modules, dashboard visualizations, and role-scoped access control for an end-to-end incubation platform.",
    ],
  },
];

export default function Experience({
  initialExperience,
}: {
  initialExperience?: any[];
} = {}) {
  const [experience, setExperience] = useState<
    {
      id?: number;
      role: string;
      company: string;
      location?: string | null;
      dateRange?: string | null;
      points?: string[];
    }[]
  >(
    initialExperience && initialExperience.length
      ? initialExperience
      : defaultExperience
  );
  useEffect(() => {
    fetch("/api/experience")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length) setExperience(data);
      })
      .catch(() => {});
  }, []);

  const sectionRef = useRef<HTMLElement>(null);
  const itemsRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const label = section.querySelector(".exp-label");
      if (label) {
        gsap.fromTo(
          label,
          { opacity: 0, y: 16 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            scrollTrigger: {
              trigger: section,
              start: "top 80%",
              once: true,
            },
          }
        );
      }

      const line = lineRef.current;
      const itemsEl = itemsRef.current;
      if (line && itemsEl) {
        gsap.fromTo(
          line,
          { scaleY: 0 },
          {
            scaleY: 1,
            duration: 1.2,
            ease: "power2.out",
            transformOrigin: "top",
            scrollTrigger: {
              trigger: itemsEl,
              start: "top 75%",
              once: true,
            },
          }
        );
      }

      if (itemsEl) {
        itemsEl.querySelectorAll(".exp-item").forEach((item, i) => {
          gsap.fromTo(
            item,
            { opacity: 0, x: i % 2 === 0 ? -24 : 24 },
            {
              opacity: 1,
              x: 0,
              duration: 0.85,
              ease: "power3.out",
              scrollTrigger: {
                trigger: item,
                start: "top 85%",
                once: true,
              },
            }
          );
        });
      }
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="experience"
      className="section-padding border-t border-border"
    >
      <div className="container-main">
        <div className="sr-only" aria-hidden="true">
          <h2>Professional Experience of Harshit Bhuju</h2>
          <p>
            Harshit Bhuju works as a Frontend Developer and Web Developer building responsive React &amp; Next.js web applications, UI/UX components, and integrating frontend interfaces with APIs and database systems.
          </p>
        </div>
        <p className="exp-label text-xs uppercase tracking-[0.2em] text-muted mb-10 md:mb-16">
          Experience
        </p>

        <div ref={itemsRef} className="relative space-y-16 md:space-y-24">
          <div
            ref={lineRef}
            className="hidden md:block absolute left-[calc(33.333%-1px)] top-2 bottom-2 w-px bg-border origin-top"
            aria-hidden
          />

          {experience.map((job) => (
            <article
              key={job.id}
              className="exp-item grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-12"
            >
              <div className="md:col-span-4">
                <p className="text-xs text-muted tracking-wider mb-2">
                  {job.dateRange}
                </p>
                <p className="text-sm text-secondary">{job.location}</p>
              </div>

              <div className="md:col-span-8">
                <h3 className="text-2xl md:text-3xl font-semibold tracking-tight mb-1">
                  {job.role}
                </h3>
                <p className="text-secondary mb-6">{job.company}</p>

                <ul className="space-y-3">
                  {(job.points as string[] | undefined)?.map((point: string, i: number) => (
                    <li key={i} className="body-text flex gap-3">
                      <span className="text-muted mt-1.5 shrink-0">—</span>
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
