"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Hero() {
  // Profile image: static default ensures LCP image is immediately known to the browser.
  // The settings fetch only updates tagline; profile image update is deferred to avoid
  // causing a reflow / LCP element delay (Lighthouse flagged 1.79s render delay).
  const [profileSrc, setProfileSrc] = useState("/profile.jpg");
  const [tagline, setTagline] = useState(
    "I build clean, scalable and thoughtful digital experiences with modern web technologies."
  );

  useEffect(() => {
    let cancelled = false;
    // Low-priority fetch — we don't block the hero render on this
    const id = requestIdleCallback
      ? requestIdleCallback(() => {
          fetch("/api/settings")
            .then((r) => (r.ok ? r.json() : null))
            .then((data) => {
              if (cancelled || !data) return;
              // Only update tagline immediately (text, no reflow)
              if (data.tagline) setTagline(data.tagline);
              // Defer profile image swap — only if different, avoids double paint
              if (data.profileImage && data.profileImage !== "/profile.jpg") {
                setProfileSrc(data.profileImage);
              }
            })
            .catch(() => {});
        })
      : setTimeout(() => {
          fetch("/api/settings")
            .then((r) => (r.ok ? r.json() : null))
            .then((data) => {
              if (cancelled || !data) return;
              if (data.tagline) setTagline(data.tagline);
              if (data.profileImage && data.profileImage !== "/profile.jpg") {
                setProfileSrc(data.profileImage);
              }
            })
            .catch(() => {});
        }, 2000);
    return () => {
      cancelled = true;
      if (typeof id === "number") cancelIdleCallback(id);
      else clearTimeout(id as ReturnType<typeof setTimeout>);
    };
  }, []);

  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const photoRef = useRef<HTMLDivElement>(null);
  const descRef = useRef<HTMLDivElement>(null);
  const metaRef = useRef<HTMLParagraphElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // Skip all animations on mobile — they don't look good on small screens
    const isMobile = window.innerWidth < 768;

    // Defer GSAP context setup by one rAF to avoid forced synchronous reflow
    // during the critical rendering path (improves LCP + TBT metrics)
    let raf: number;
    const setup = () => {
      const ctx = gsap.context(() => {
        const title = titleRef.current;
        const photo = photoRef.current;
        const desc = descRef.current;
        const meta = metaRef.current;
        const scroll = scrollRef.current;
        const grid = gridRef.current;
        const section = sectionRef.current;

        const present = (...els: (Element | null)[]) =>
          els.filter((el): el is Element => el != null);

        // On mobile or reduced-motion: skip all animations, show everything immediately
        if (prefersReduced || isMobile) {
          const targets = present(title, photo, desc, meta, scroll);
          if (targets.length) {
            gsap.set(targets, { opacity: 1, y: 0, x: 0, scale: 1 });
          }
          return;
        }

        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

        if (meta) {
          tl.fromTo(
            meta,
            { opacity: 0, y: 10 },
            { opacity: 1, y: 0, duration: 0.5 },
            0.05
          );
        }

        const words = title
          ? Array.from(title.querySelectorAll(".title-word"))
          : [];
        if (words.length) {
          tl.fromTo(
            words,
            { opacity: 0, y: 80, rotateX: -10 },
            {
              opacity: 1,
              y: 0,
              rotateX: 0,
              duration: 0.95,
              stagger: 0.12,
            },
            0.15
          );
        }

        if (photo) {
          tl.fromTo(
            photo,
            { opacity: 0, y: 40, scale: 0.94 },
            { opacity: 1, y: 0, scale: 1, duration: 1.05 },
            0.3
          );
        }

        if (desc) {
          tl.fromTo(
            desc,
            { opacity: 0, y: 18 },
            { opacity: 1, y: 0, duration: 0.65 },
            0.65
          );
        }

        if (scroll) {
          tl.fromTo(
            scroll,
            { opacity: 0 },
            { opacity: 1, duration: 0.45 },
            0.9
          );
        }

        // Scroll parallax exit (desktop only)
        if (section) {
          ScrollTrigger.create({
            trigger: section,
            start: "top top",
            end: "+=150%",
            pin: true,
            scrub: 0.9,
            onUpdate: (self) => {
              const p = self.progress;
              const e = p * p;

              if (title) {
                gsap.set(title, {
                  y: -e * 100,
                  scale: 1 - e * 0.12,
                  opacity: Math.max(0, 1 - e * 1.15),
                });
              }
              if (photo) {
                gsap.set(photo, {
                  y: -e * 40,
                  x: e * 60,
                  scale: 1 - e * 0.06,
                  opacity: Math.max(0, 1 - e * 1.2),
                });
              }
              const group = present(desc, meta, scroll);
              if (group.length) {
                gsap.set(group, {
                  y: -e * 50,
                  opacity: Math.max(0, 1 - e * 1.4),
                });
              }
              if (grid) {
                gsap.set(grid, {
                  opacity: Math.max(0, 0.5 - e * 0.5),
                });
              }
            },
          });
        }
      }, sectionRef);

      return ctx;
    };

    let ctx: ReturnType<typeof gsap.context>;
    raf = requestAnimationFrame(() => {
      ctx = setup();
    });

    return () => {
      cancelAnimationFrame(raf);
      ctx?.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative min-h-screen flex flex-col justify-center overflow-hidden"
    >
      {/* Subtle grid background */}
      <div
        ref={gridRef}
        className="pointer-events-none absolute inset-0 opacity-[0.28]"
        aria-hidden
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Cpath d='M64 0H0V64' fill='none' stroke='%23262626' stroke-width='1'/%3E%3C/svg%3E")`,
          backgroundSize: "64px 64px",
        }}
      />

      <div className="container-main relative z-10 w-full pt-14 pb-16 md:pt-20 md:pb-20">

        {/* Eyebrow label — consolidated single line */}
        <p
          ref={metaRef}
          className="text-[10px] md:text-xs uppercase tracking-[0.3em] text-muted mb-8 md:mb-10"
        >
          Banepa, Nepal
        </p>

        {/* Main composition: Big title + portrait side by side */}
        <div className="relative mb-12 md:mb-16">
          <h1
            ref={titleRef}
            className="font-semibold tracking-[-0.04em] leading-[0.88] text-primary"
            style={{
              fontSize: "clamp(3rem, 11vw, 9.5rem)",
              perspective: "900px",
            }}
          >
            <span className="title-word block">FRONTEND</span>
            <span className="title-word block">DEVELOPER</span>
          </h1>

          {/* Portrait — anchored to the right, clean border, no label */}
          <div
            ref={photoRef}
            className={`
              relative mt-8
              md:mt-0 md:absolute md:right-0 md:top-0
              w-[min(72vw,260px)] sm:w-[280px] md:w-[300px] lg:w-[340px]
              aspect-[3/4]
              border border-border/50 bg-surface overflow-hidden z-10
            `}
          >
            <Image
              src={profileSrc}
              alt="Harshit Bhuju — Frontend Developer"
              fill
              priority
              sizes="(max-width: 768px) 72vw, 340px"
              className="object-cover object-top opacity-90"
            />
          </div>
        </div>

        {/* Bottom row: Description only */}
        <div
          ref={descRef}
          className="relative z-20"
        >
          <p className="text-sm md:text-base text-secondary leading-relaxed max-w-lg uppercase tracking-[0.05em]">
            {tagline}
          </p>
        </div>

        {/* Scroll Down — true viewport bottom-right, outside all boxes */}
        <div
          ref={scrollRef}
          className="absolute bottom-6 right-0 flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-muted z-20"
        >
          <span>Scroll Down</span>
          <span className="animate-bounce" aria-hidden>↓</span>
        </div>

      </div>
    </section>
  );
}
