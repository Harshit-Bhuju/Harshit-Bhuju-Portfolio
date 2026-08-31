"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { DEFAULT_SKILLS } from "@/lib/portfolioFallback";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

type SkillGroups = {
  languages: string[];
  frameworks: string[];
  tools: string[];
  soft: string[];
  [key: string]: string[];
};

function groupSkills(data: any[]): SkillGroups {
  const grouped: SkillGroups = {
    languages: [],
    frameworks: [],
    tools: [],
    soft: [],
  };
  for (const row of data) {
    if (row.name && row.category) {
      const cat = String(row.category);
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(row.name);
    }
  }
  return grouped;
}

const defaultGroupedSkills: SkillGroups = groupSkills(DEFAULT_SKILLS);

export default function Skills({
  initialSkills,
}: {
  initialSkills?: any[];
} = {}) {
  const [skills, setSkills] = useState<SkillGroups>(() => {
    if (Array.isArray(initialSkills) && initialSkills.length) {
      return groupSkills(initialSkills);
    }
    return defaultGroupedSkills;
  });
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/skills")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!Array.isArray(data) || !data.length) return;
        setSkills(groupSkills(data));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    const grid = gridRef.current;
    if (!section) return;
    const ctx = gsap.context(() => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const label = section.querySelector(".skills-header");
      if (label) {
        gsap.fromTo(
          label.children,
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
      if (grid) {
        const cards = grid.querySelectorAll(".skill-category-card");
        if (cards.length) {
          gsap.fromTo(
            cards,
            { opacity: 0, y: 24 },
            {
              opacity: 1,
              y: 0,
              duration: 0.65,
              stagger: 0.1,
              ease: "power3.out",
              scrollTrigger: { trigger: grid, start: "top 80%", once: true },
            }
          );
        }
      }
    }, section);
    return () => ctx.revert();
  }, [skills]);

  const activeSkills =
    Object.values(skills).some((arr) => arr.length > 0) ? skills : defaultGroupedSkills;

  const categories = [
    { key: "languages", label: "Languages" },
    { key: "frameworks", label: "Frameworks" },
    { key: "tools", label: "Tools" },
    { key: "soft", label: "Soft skills" },
  ].filter((c) => (activeSkills[c.key] || []).length > 0);

  // Also show any extra categories from DB
  for (const key of Object.keys(activeSkills)) {
    if (!categories.find((c) => c.key === key) && activeSkills[key]?.length) {
      categories.push({ key, label: key });
    }
  }

  return (
    <section
      ref={sectionRef}
      id="skills"
      className="section-padding border-t border-border"
      aria-label="Skills and technical capabilities of Harshit Bhuju"
    >
      <div className="container-main">
      
        <div className="sr-only" aria-hidden="true">
          <h2>Technical Skills of Harshit Bhuju</h2>
          <p>
            Harshit Bhuju&apos;s personal technical skills: JavaScript, TypeScript, Python, HTML5, CSS3 (languages);
            React, Next.js, Redux Toolkit, RTK Query, Tailwind CSS, Bootstrap (frontend frameworks);
            Git, GitHub, MySQL, Supabase (tools). He studies Artificial Intelligence at Kathmandu University
            and works as a Frontend Developer building production-ready web applications.
          </p>
        </div>

        <div className="skills-header mb-10 md:mb-14">
          <p className="text-xs uppercase tracking-[0.2em] text-muted mb-3">
            Skills
          </p>
          <h2 className="heading-section">Capabilities</h2>
        </div>

        {categories.length === 0 ? (
          <p className="text-sm text-muted">No skills yet — add them in admin.</p>
        ) : (
          <div
            ref={gridRef}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5"
          >
            {categories.map((cat) => (
              <div
                key={cat.key}
                className="skill-category-card border border-border p-5 md:p-6 hover:border-strong-border transition-colors"
              >
                <p className="text-xs uppercase tracking-[0.15em] text-muted mb-4">
                  {cat.label}
                </p>
                <ul className="space-y-2">
                  {(activeSkills[cat.key] || []).map((name) => (
                    <li key={name} className="text-sm text-primary">
                      {name}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
