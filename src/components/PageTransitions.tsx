"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Entrance-only section reveals.
 * NO exit opacity/color changes — scrolling up must never gray out text.
 */
export default function PageTransitions() {
  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) return;

    const sectionIds = [
      "#about",
      "#work",
      "#skills",
      "#achievements",
      "#background",
      "#contact",
    ];

    const ctx = gsap.context(() => {
      sectionIds.forEach((id) => {
        const el = document.querySelector(id) as HTMLElement | null;
        if (!el) return;

        // One-time entrance only — stays fully opaque after reveal
        gsap.fromTo(
          el,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 88%",
              once: true, // critical: never reverse opacity on scroll up
            },
          }
        );
      });
    });

    return () => ctx.revert();
  }, []);

  return null;
}
