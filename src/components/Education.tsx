"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Education() {
  const [education, setEducation] = useState<Array<{
    id?: number;
    degree: string;
    field?: string | null;
    school?: string | null;
    dateRange?: string | null;
    gpa?: string | null;
  }>>([]);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    fetch("/api/education")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length)
          setEducation(data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const ctx = gsap.context(() => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      gsap.fromTo(
        section.querySelectorAll(".edu-item"),
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
  }, [education]);

  return (
    <section
      ref={sectionRef}
      id="education"
      className="section-padding border-t border-border"
    >
      <div className="container-main">
        <p className="text-xs uppercase tracking-[0.2em] text-muted mb-3">
          Education
        </p>
        <h2 className="heading-section mb-10 md:mb-14">Academic Background</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {education.map((item, i) => (
            <article
              key={item.id ?? i}
              className="edu-item border border-border p-6 md:p-7 hover:border-strong-border transition-colors duration-300 flex flex-col"
            >
              <p className="text-xs font-mono text-muted mb-3">
                {item.dateRange}
              </p>
              <h3 className="text-base md:text-lg font-semibold text-primary mb-1">
                {item.degree}
              </h3>
              {item.field && (
                <p className="text-sm text-secondary mb-2">{item.field}</p>
              )}
              <p className="text-sm text-muted mt-auto pt-4">
                {item.school}
                {item.gpa ? ` · GPA ${item.gpa}` : ""}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
