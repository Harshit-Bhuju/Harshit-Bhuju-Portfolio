"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface LenisContextType {
  lenis: Lenis | null;
  stop: () => void;
  start: () => void;
  scrollTo: (
    target: string | number | HTMLElement,
    options?: Parameters<Lenis["scrollTo"]>[1],
  ) => void;
}

const LenisContext = createContext<LenisContextType>({
  lenis: null,
  stop: () => {},
  start: () => {},
  scrollTo: () => {},
});

export const useLenis = () => useContext(LenisContext);

export default function SmoothScroll({ children }: { children: ReactNode }) {
  const [lenisInstance, setLenisInstance] = useState<Lenis | null>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReduced) return;

    // Smooth, slightly longer duration for a premium feel
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 0.85,
      touchMultiplier: 1.25,
      infinite: false,
      autoResize: true,
    });

    setLenisInstance(lenis);
    (window as unknown as { __lenis?: Lenis }).__lenis = lenis;

    document.documentElement.classList.add("lenis", "lenis-smooth");

    // Keep GSAP ScrollTrigger in sync with Lenis
    lenis.on("scroll", ScrollTrigger.update);

    const ticker = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(ticker);
    gsap.ticker.lagSmoothing(0);

    // Refresh after layout settles
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    const t = setTimeout(refresh, 400);

    return () => {
      clearTimeout(t);
      window.removeEventListener("load", refresh);
      document.documentElement.classList.remove("lenis", "lenis-smooth");
      gsap.ticker.remove(ticker);
      lenis.destroy();
      setLenisInstance(null);
      delete (window as unknown as { __lenis?: Lenis }).__lenis;
    };
  }, []);

  const stop = () => {
    if (lenisInstance) {
      lenisInstance.stop();
    }
    document.documentElement.classList.add("lenis-stopped");
    document.body.style.overflow = "hidden";
  };

  const start = () => {
    if (lenisInstance) {
      lenisInstance.start();
    }
    document.documentElement.classList.remove("lenis-stopped");
    document.body.style.overflow = "";
  };

  const scrollTo = (
    target: string | number | HTMLElement,
    options?: Parameters<Lenis["scrollTo"]>[1],
  ) => {
    if (lenisInstance) {
      lenisInstance.scrollTo(target, options);
    } else if (typeof target === "string") {
      document.querySelector(target)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <LenisContext.Provider
      value={{ lenis: lenisInstance, stop, start, scrollTo }}>
      {children}
    </LenisContext.Provider>
  );
}
