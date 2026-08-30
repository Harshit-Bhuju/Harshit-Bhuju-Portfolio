"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import Image from "next/image";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

function ProjectBlock({
  project,
  index,
}: {
  project: any;
  index: number;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const numberRef = useRef<HTMLSpanElement>(null);

  const [challengeExpanded, setChallengeExpanded] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const prefersReduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      if (prefersReduced || !sectionRef.current) {
        const reducedTargets = [visualRef.current, contentRef.current].filter(
          (el): el is HTMLDivElement => el != null
        );
        if (reducedTargets.length) {
          gsap.set(reducedTargets, {
            opacity: 1,
            y: 0,
            scale: 1,
          });
        }
        return;
      }

      // Visual clip + scale
      if (visualRef.current) {
        gsap.fromTo(
          visualRef.current,
          { opacity: 0, y: 60, scale: 0.93, clipPath: "inset(8% 4% 8% 4%)" },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            clipPath: "inset(0% 0% 0% 0%)",
            duration: 1.15,
            ease: "power3.out",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 75%",
              once: true,
            },
          }
        );
      }

      // Content stagger
      gsap.fromTo(
        Array.from(contentRef.current?.children ?? []),
        { opacity: 0, y: 28 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.09,
          ease: "power3.out",
          scrollTrigger: {
            trigger: contentRef.current,
            start: "top 80%",
            once: true,
          },
        }
      );

      // Big number parallax
      if (numberRef.current) {
        gsap.fromTo(
          numberRef.current,
          { y: 30, opacity: 0.15 },
          {
            y: -20,
            opacity: 0.35,
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <article
      ref={sectionRef}
      className={`py-16 md:py-24 ${index > 0 ? "border-t border-border" : ""}`}
    >
      <div className="container-main">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          {/* Content Column */}
          <div className="lg:col-span-6 order-2 lg:order-1" ref={contentRef}>
            <div className="flex items-baseline gap-4 mb-4">
              <span className="text-sm text-muted tracking-wider">
                {project.number}
              </span>
              <span className="text-xs uppercase tracking-[0.15em] text-muted">
                {project.dateRange}
              </span>
            </div>

            <h3 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight mb-2">
              {project.title}
            </h3>

            <p className="text-secondary text-sm md:text-base mb-5">
              {project.category}
            </p>

            <p className="body-text mb-6 max-w-xl">
              {project.shortDescription}
            </p>

            {/* Role & Contributions breakdown */}
            {(project.myRole || ((project.contributions as string[] | undefined)?.length ?? 0) > 0) && (
              <div className="mb-6 p-4 border border-border/80 bg-surface/30 space-y-3">
                {project.myRole && (
                  <p className="text-xs font-medium text-primary tracking-wide uppercase">
                    Role: <span className="text-secondary font-normal">{project.myRole}</span>
                  </p>
                )}
                {((project.contributions as string[] | undefined)?.length ?? 0) > 0 && (
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-muted mb-2">
                      My Contributions
                    </p>
                    <ul className="space-y-1.5">
                      {(project.contributions as string[]).slice(0, 3).map((item: string, i: number) => (
                        <li key={i} className="text-xs text-secondary flex items-start gap-2.5">
                          <span className="w-1 h-1 rounded-full bg-primary/50 shrink-0 mt-1.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Tags — full project stack, not personal skills */}
            {((project.tags as string[] | undefined)?.length ?? 0) > 0 && (
              <div className="mb-8">
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted mb-2.5">
                  Project Stack
                </p>
                <div className="flex flex-wrap gap-2">
                  {(project.tags as string[]).map((tag: string) => (
                    <span
                      key={tag}
                      className="text-xs px-3 py-1.5 border border-border bg-surface text-secondary hover:border-strong hover:text-primary transition-all duration-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Embedded Engineering Challenge Deep-Dive */}
            {(project.challenges || project.solutions) && (
              <div className="mb-8 border border-border bg-surface p-4 sm:p-5 transition-colors hover:border-strong">
                <button
                  type="button"
                  onClick={() => setChallengeExpanded(!challengeExpanded)}
                  className="w-full flex items-center justify-between gap-3 text-left cursor-pointer group"
                  aria-expanded={challengeExpanded}
                >
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-muted block mb-1">
                      Engineering Deep-Dive
                    </span>
                    <p className="text-sm font-semibold text-primary group-hover:opacity-75 transition-opacity">
                      Challenges & Technical Solutions
                    </p>
                  </div>
                  <span className="text-xs font-mono text-muted border border-border px-2 py-1 group-hover:border-strong group-hover:text-primary transition-colors shrink-0">
                    {challengeExpanded ? "HIDE −" : "EXPLORE +"}
                  </span>
                </button>

                {challengeExpanded && (
                  <div className="mt-4 pt-4 border-t border-border/60 space-y-3 text-xs leading-relaxed animate-in fade-in duration-200">
                    {project.challenges && (
                      <div>
                        <span className="font-semibold text-primary block mb-0.5">
                          The Challenge:
                        </span>
                        <p className="text-secondary whitespace-pre-line">{project.challenges}</p>
                      </div>
                    )}
                    {project.solutions && (
                      <div>
                        <span className="font-semibold text-primary block mb-0.5">
                          Architectural Solution:
                        </span>
                        <p className="text-secondary whitespace-pre-line">{project.solutions}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-6 pt-2">
              <Link
                href={`/projects/${project.slug}`}
                className="text-sm font-semibold text-primary border-b border-strong-border pb-0.5 hover:opacity-70 transition-opacity"
              >
                Case Study & Media →
              </Link>
              {project.githubUrl && project.githubUrl.trim() && project.githubUrl !== "null" && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-secondary hover:text-primary transition-colors"
                >
                  GitHub
                </a>
              )}
              {project.liveUrl && project.liveUrl.trim() && project.liveUrl !== "null" && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-secondary hover:text-primary transition-colors"
                >
                  Live Demo
                </a>
              )}
            </div>
          </div>

          {/* Visual Column */}
          <div ref={visualRef} className="lg:col-span-6 order-1 lg:order-2 relative">
            <div className="aspect-[16/10] bg-black/60 border border-border flex items-center justify-center overflow-hidden relative group">
              {project.thumbnailUrl ? (
                <Image
                  src={project.thumbnailUrl}
                  alt={project.title}
                  fill
                  className="object-contain p-2"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              ) : (
                <>
                  <span
                    ref={numberRef}
                    className="absolute text-[8rem] md:text-[12rem] font-semibold text-border tracking-tighter select-none pointer-events-none leading-none"
                    style={{ opacity: 0.25 }}
                  >
                    {project.number}
                  </span>
                  <div className="relative z-10 text-center p-8">
                    <p className="text-sm text-muted tracking-wider uppercase mb-2">
                      {project.title}
                    </p>
                    <p className="text-xs text-secondary max-w-xs mx-auto">
                      {project.category}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function Projects({
  initialProjects,
}: {
  initialProjects?: any[];
} = {}) {
  const headerRef = useRef<HTMLDivElement>(null);
  const [list, setList] = useState<any[]>(initialProjects || []);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetch("/api/projects")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length) {
          setList(
            data
              .filter((p: { visible?: boolean }) => p.visible !== false)
              .sort(
                (a: { displayOrder: number }, b: { displayOrder: number }) =>
                  a.displayOrder - b.displayOrder
              )
          );
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced || !headerRef.current) return;

    gsap.fromTo(
      headerRef.current.children,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.85,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: headerRef.current,
          start: "top 80%",
          once: true,
        },
      }
    );
  }, []);

  const visibleProjects = showAll ? list : list.slice(0, 3);

  return (
    <section id="work" className="section-padding border-t border-border">
      <div ref={headerRef} className="container-main mb-12 md:mb-16">
        <p className="text-xs uppercase tracking-[0.2em] text-muted mb-4">
          Selected Work & Engineering
        </p>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="heading-section">Featured Projects</h2>
          {list.length > 3 && (
            <span className="text-xs font-mono text-muted tracking-wider">
              Showing {visibleProjects.length} of {list.length}
            </span>
          )}
        </div>
      </div>

      <div>
        {visibleProjects.map((project, i) => (
          <ProjectBlock key={project.id ?? project.slug} project={project} index={i} />
        ))}
      </div>

      {list.length > 3 && (
        <div className="container-main mt-12 md:mt-16 text-center">
          <button
            type="button"
            onClick={() => {
              const next = !showAll;
              setShowAll(next);
              if (!next) {
                const el = document.getElementById("work");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }
            }}
            className="inline-flex items-center gap-3 px-8 py-3.5 border border-strong-border bg-surface/60 hover:bg-surface text-primary text-sm font-semibold tracking-wide transition-all duration-200 hover:border-text group cursor-pointer"
          >
            <span>
              {showAll
                ? "Show Fewer Projects ↑"
                : `Show More Projects (${list.length - 3} more) ↓`}
            </span>
            <span className="text-xs text-muted font-mono group-hover:text-primary transition-colors">
              {showAll ? `[ 1 - ${list.length} ]` : `[ 3 / ${list.length} ]`}
            </span>
          </button>
        </div>
      )}
    </section>
  );
}
