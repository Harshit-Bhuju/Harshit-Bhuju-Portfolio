"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { DEFAULT_SETTINGS } from "@/lib/portfolioFallback";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

type AboutData = {
  statement: string;
  body: string;
  focus: string[];
};

const defaultAbout: AboutData = {
  statement: DEFAULT_SETTINGS.aboutStatement || "I build interfaces where design and engineering meet.",
  body: DEFAULT_SETTINGS.aboutBody || "Frontend developer focused on crafting performant, accessible interfaces with modern React and Next.js.",
  focus: Array.isArray(DEFAULT_SETTINGS.aboutFocus) && DEFAULT_SETTINGS.aboutFocus.length
    ? DEFAULT_SETTINGS.aboutFocus
    : [
        "Frontend Development",
        "UI/UX & Accessibility",
        "Modern React / Next.js",
        "API Integration",
        "Competitive Project Building",
      ],
};

export default function About({
  initialSettings,
  initialProjectCount,
  initialWins,
}: {
  initialSettings?: any;
  initialProjectCount?: number;
  initialWins?: number;
} = {}) {
  const [about, setAbout] = useState<AboutData>(() => {
    const s = initialSettings || DEFAULT_SETTINGS;
    return {
      statement: s?.aboutStatement || defaultAbout.statement,
      body: s?.aboutBody || defaultAbout.body,
      focus: Array.isArray(s?.aboutFocus) && s.aboutFocus.length
        ? s.aboutFocus
        : defaultAbout.focus,
    };
  });
  const [location, setLocation] = useState(
    initialSettings?.location || DEFAULT_SETTINGS.location || "Banepa, Nepal"
  );
  const [projectCount, setProjectCount] = useState(
    initialProjectCount ?? 3
  );
  const [wins, setWins] = useState(initialWins ?? 3);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;
        setAbout({
          statement: data.aboutStatement || defaultAbout.statement,
          body: data.aboutBody || defaultAbout.body,
          focus: Array.isArray(data.aboutFocus) && data.aboutFocus.length ? data.aboutFocus : defaultAbout.focus,
        });
        if (data.location) setLocation(data.location);
      })
      .catch(() => {});
    fetch("/api/achievements")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!Array.isArray(data) || !data.length) return;
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
        if (Array.isArray(data) && data.length) setProjectCount(data.length);
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
      label: "1st Place Wins",
      value: String(Math.max(wins, 0)).padStart(2, "0"),
    },
    {
      label: "Location",
      value: location
        ? location.split(",")[0]?.trim() || location
        : "Banepa",
    },
  ];

  const activeAbout = {
    statement: about.statement || defaultAbout.statement,
    body: about.body || defaultAbout.body,
    focus: about.focus?.length ? about.focus : defaultAbout.focus,
  };

  if (!activeAbout.statement && !activeAbout.body) {
    return (
      <section id="about" className="section-padding border-t border-border" aria-label="About Harshit Bhuju">
        <div className="container-main">
          <div className="h-3 w-16 bg-neutral-800 animate-pulse rounded mb-8" />
          <div className="h-10 w-3/4 max-w-3xl bg-neutral-800 animate-pulse rounded mb-12" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-14">
            <div className="lg:col-span-7 space-y-3">
              <div className="h-4 w-full bg-neutral-800 animate-pulse rounded" />
              <div className="h-4 w-11/12 bg-neutral-800 animate-pulse rounded" />
              <div className="h-4 w-4/5 bg-neutral-800 animate-pulse rounded" />
            </div>
            <div className="lg:col-span-5 space-y-2">
              <div className="h-3 w-20 bg-neutral-800 animate-pulse rounded mb-4" />
              <div className="h-4 w-40 bg-neutral-800 animate-pulse rounded" />
              <div className="h-4 w-44 bg-neutral-800 animate-pulse rounded" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      id="about"
      aria-label="About Harshit Bhuju"
      className="section-padding border-t border-border"
    >
      <div className="container-main">
        {/*
          Static entity description block — visually hidden but always present in the DOM.
          Gives Google and AI systems (Perplexity, ChatGPT, Gemini) a clear, crawlable
          natural-language identity of Harshit Bhuju without keyword stuffing.
        */}
        <div className="sr-only" aria-hidden="true">
          <p>
            Harshit Bhuju is a frontend developer from Banepa, Kavrepalanchowk, Nepal.
            He builds web applications using React, Next.js, TypeScript, JavaScript, PostgreSQL,
            Prisma, Tailwind CSS, and Node.js. Harshit is a first year, first semester BTech in
            Artificial Intelligence student at Kathmandu University, with a background in
            competitive programming and hackathons. He is based in Banepa, Nepal.
          </p>
        </div>

        <p className="text-xs uppercase tracking-[0.2em] text-muted mb-8 md:mb-12">
          About
        </p>

        <h2
          ref={statementRef}
          className="heading-section max-w-4xl mb-10 md:mb-16"
        >
          {activeAbout.statement}
        </h2>

        <div
          ref={bodyRef}
          className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 mb-14 md:mb-20"
        >
          <div className="lg:col-span-7">
            <p className="body-text max-w-xl">{activeAbout.body}</p>
          </div>

          <div className="lg:col-span-5">
            <p className="text-xs uppercase tracking-[0.15em] text-muted mb-4">
              Focus
            </p>
            <ul className="space-y-2.5">
              {activeAbout.focus.map((item) => (
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
