"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

type AboutData = {
  statement: string;
  body: string;
  focus: string[];
};

export default function About() {
  const [about, setAbout] = useState<AboutData>({
    statement: "",
    body: "",
    focus: [],
  });
  const [location, setLocation] = useState("");
  const [projectCount, setProjectCount] = useState(0);
  const [wins, setWins] = useState(0);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;
        setAbout({
          statement: data.aboutStatement || "",
          body: data.aboutBody || "",
          focus: Array.isArray(data.aboutFocus) ? data.aboutFocus : [],
        });
        if (data.location) setLocation(data.location);
      })
      .catch(() => {});
    fetch("/api/achievements")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!Array.isArray(data)) return;
        setWins(
          data.filter((a: { placement?: string }) =>
            String(a.placement || "").toUpperCase().includes("1ST")
          ).length
        );
      })
      .catch(() => {});
    fetch("/api/projects")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (Array.isArray(data)) setProjectCount(data.length);
      })
      .catch(() => {});
  }, []);

  const sectionRef = useRef<HTMLElement>(null);
  const statementRef = useRef<HTMLHeadingElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const prefersReduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      const statement = statementRef.current;
      const body = bodyRef.current;
      const stats = statsRef.current;

      if (prefersReduced) {
        const targets = [statement, body, stats].filter(Boolean) as Element[];
        if (targets.length) gsap.set(targets, { opacity: 1, y: 0 });
        return;
      }

      if (statement) {
        gsap.fromTo(
          statement,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: { trigger: statement, start: "top 85%", once: true },
          }
        );
      }
      if (body) {
        gsap.fromTo(
          body.children,
          { opacity: 0, y: 28 },
          {
            opacity: 1,
            y: 0,
            duration: 0.75,
            stagger: 0.1,
            ease: "power3.out",
            scrollTrigger: { trigger: body, start: "top 85%", once: true },
          }
        );
      }
      if (stats) {
        gsap.fromTo(
          stats.children,
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            stagger: 0.08,
            ease: "power3.out",
            scrollTrigger: { trigger: stats, start: "top 90%", once: true },
          }
        );
      }
    }, sectionRef);
    return () => ctx.revert();
  }, [about, projectCount, wins, location]);

  const stats = [
    {
      label: "Projects",
      value: String(Math.max(projectCount, 0)).padStart(2, "0"),
    },
    {
      label: "Hackathon wins",
      value: String(Math.max(wins, 0)).padStart(2, "0"),
    },
    {
      label: "Location",
      value: location
        ? location.split(",")[0]?.trim() || location
        : "—",
    },
  ];

  if (!about.statement && !about.body) {
    return (
      <section id="about" className="section-padding border-t border-border">
        <div className="container-main">
          <p className="text-sm text-muted">Loading about…</p>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      id="about"
      className="section-padding border-t border-border"
    >
      <div className="container-main">
        <p className="text-xs uppercase tracking-[0.2em] text-muted mb-8 md:mb-12">
          About
        </p>

        <h2
          ref={statementRef}
          className="heading-section max-w-4xl mb-10 md:mb-16"
        >
          {about.statement}
        </h2>

        <div
          ref={bodyRef}
          className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 mb-14 md:mb-20"
        >
          <div className="lg:col-span-7">
            <p className="body-text max-w-xl">{about.body}</p>
          </div>

          <div className="lg:col-span-5">
            <p className="text-xs uppercase tracking-[0.15em] text-muted mb-4">
              Focus
            </p>
            <ul className="space-y-2.5">
              {about.focus.map((item) => (
                <li
                  key={item}
                  className="text-primary text-sm md:text-base flex items-center gap-3"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-muted shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div
          ref={statsRef}
          className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-5"
        >
          {stats.map((s) => (
            <div
              key={s.label}
              className="border border-border px-5 py-7 md:py-9 hover:border-strong-border transition-colors duration-300"
            >
              <p
                className={`font-semibold tracking-tighter mb-1.5 ${
                  s.label === "Location"
                    ? "text-xl md:text-2xl"
                    : "text-3xl md:text-4xl"
                }`}
              >
                {s.value}
              </p>
              <p className="text-xs uppercase tracking-[0.18em] text-muted">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
