import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Fade + lift reveal */
export function revealElement(
  element: gsap.TweenTarget,
  options: gsap.TweenVars = {}
) {
  if (prefersReducedMotion()) {
    gsap.set(element, { opacity: 1, y: 0 });
    return null;
  }
  return gsap.fromTo(
    element,
    { opacity: 0, y: 28 },
    {
      opacity: 1,
      y: 0,
      duration: 0.9,
      ease: "power3.out",
      ...options,
    }
  );
}

/** Staggered children reveal */
export function staggerReveal(
  elements: gsap.TweenTarget,
  options: gsap.TweenVars = {}
) {
  if (prefersReducedMotion()) {
    gsap.set(elements, { opacity: 1, y: 0 });
    return null;
  }
  return gsap.fromTo(
    elements,
    { opacity: 0, y: 22 },
    {
      opacity: 1,
      y: 0,
      duration: 0.75,
      stagger: 0.07,
      ease: "power3.out",
      ...options,
    }
  );
}

/** Clip-path image / block reveal (from bottom) */
export function createImageReveal(element: HTMLElement | null) {
  if (!element || prefersReducedMotion()) {
    if (element) gsap.set(element, { clipPath: "inset(0% 0 0 0)", opacity: 1 });
    return null;
  }
  return gsap.fromTo(
    element,
    { clipPath: "inset(100% 0 0 0)", opacity: 0.7 },
    {
      clipPath: "inset(0% 0 0 0)",
      opacity: 1,
      duration: 1.15,
      ease: "power3.inOut",
      scrollTrigger: {
        trigger: element,
        start: "top 88%",
        once: true,
      },
    }
  );
}

/** Horizontal clip reveal */
export function createHorizontalReveal(element: HTMLElement | null) {
  if (!element || prefersReducedMotion()) {
    if (element) gsap.set(element, { clipPath: "inset(0 0 0 0)", opacity: 1 });
    return null;
  }
  return gsap.fromTo(
    element,
    { clipPath: "inset(0 100% 0 0)", opacity: 0.8 },
    {
      clipPath: "inset(0 0% 0 0)",
      opacity: 1,
      duration: 1.05,
      ease: "power3.inOut",
      scrollTrigger: {
        trigger: element,
        start: "top 85%",
        once: true,
      },
    }
  );
}

/** Project block scroll sequence */
export function createProjectScroll(
  section: HTMLElement,
  visual: HTMLElement,
  content: HTMLElement
) {
  if (prefersReducedMotion()) {
    gsap.set([visual, content], { opacity: 1, y: 0, scale: 1 });
    return null;
  }

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: "top 72%",
      end: "top 25%",
      scrub: 0.9,
    },
  });

  tl.fromTo(
    visual,
    { opacity: 0, y: 56, scale: 0.92 },
    { opacity: 1, y: 0, scale: 1, duration: 1.1, ease: "power2.out" }
  ).fromTo(
    content.children,
    { opacity: 0, y: 28 },
    {
      opacity: 1,
      y: 0,
      duration: 0.85,
      stagger: 0.08,
      ease: "power2.out",
    },
    "-=0.55"
  );

  return tl;
}

/** Large number / achievement scale-in */
export function createNumberReveal(elements: gsap.TweenTarget) {
  if (prefersReducedMotion()) {
    gsap.set(elements, { opacity: 1, scale: 1, y: 0 });
    return null;
  }
  return gsap.fromTo(
    elements,
    { opacity: 0, scale: 0.85, y: 24 },
    {
      opacity: 1,
      scale: 1,
      y: 0,
      duration: 0.95,
      stagger: 0.12,
      ease: "power3.out",
    }
  );
}

/** Soft parallax on an element */
export function createParallax(element: HTMLElement | null, amount = 40) {
  if (!element || prefersReducedMotion()) return null;
  return gsap.to(element, {
    y: amount,
    ease: "none",
    scrollTrigger: {
      trigger: element,
      start: "top bottom",
      end: "bottom top",
      scrub: true,
    },
  });
}

export function cleanupScrollTriggers() {
  ScrollTrigger.getAll().forEach((t) => t.kill());
}
