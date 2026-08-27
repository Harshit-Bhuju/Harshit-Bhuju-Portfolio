"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useModalScrollLock } from "@/hooks/useModalScrollLock";
import { useLenis } from "./SmoothScroll";

const links = [
  { number: "01", label: "ABOUT", href: "#about" },
  { number: "02", label: "WORK", href: "#work" },
  { number: "03", label: "SKILLS", href: "#skills" },
  { number: "04", label: "RECOGNITION", href: "#achievements" },
  { number: "05", label: "EXPERIENCE", href: "#experience" },
  { number: "06", label: "EDUCATION", href: "#education" },
  { number: "07", label: "CERTIFICATES", href: "#certifications" },
  { number: "08", label: "CONTACT", href: "#contact" },
];

interface MenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Menu({ isOpen, onClose }: MenuProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const { scrollTo } = useLenis();

  // Handle Lenis stop/start, document.body scroll lock, and ESC key
  useModalScrollLock(isOpen, onClose);

  useEffect(() => {
    const overlay = overlayRef.current;
    const list = listRef.current;
    const closeBtn = closeRef.current;
    if (!overlay || !list) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (isOpen) {
      if (prefersReduced) {
        gsap.set(overlay, { autoAlpha: 1 });
        gsap.set(list.children, { opacity: 1, y: 0 });
        if (closeBtn) gsap.set(closeBtn, { opacity: 1 });
        return;
      }

      const tl = gsap.timeline();
      tl.set(overlay, {
        autoAlpha: 1,
        clipPath: "inset(0 0 100% 0)",
      }).to(overlay, {
        clipPath: "inset(0 0 0% 0)",
        duration: 0.55,
        ease: "power3.inOut",
      });
      if (closeBtn) {
        tl.fromTo(
          closeBtn,
          { opacity: 0, y: -10 },
          { opacity: 1, y: 0, duration: 0.4 },
          "-=0.3"
        );
      }
      tl.fromTo(
        list.children,
        { opacity: 0, y: 36, rotateX: -8 },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          duration: 0.5,
          stagger: 0.045,
          ease: "power3.out",
        },
        "-=0.25"
      );
    } else {
      if (prefersReduced) {
        gsap.set(overlay, { autoAlpha: 0 });
        return;
      }

      gsap.to(overlay, {
        clipPath: "inset(0 0 100% 0)",
        duration: 0.45,
        ease: "power3.inOut",
        onComplete: () => {
          gsap.set(overlay, { autoAlpha: 0 });
        },
      });
    }
  }, [isOpen]);

  const handleLink = (href: string) => {
    onClose();
    setTimeout(() => {
      scrollTo(href, { offset: -20, duration: 1.2 });
    }, 380);
  };

  return (
    <div
      ref={overlayRef}
      id="main-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Navigation menu"
      data-lenis-prevent
      className={`fixed inset-0 z-[100] bg-bg flex items-center justify-center overflow-y-auto transition-opacity duration-200 ${
        isOpen
          ? "pointer-events-auto"
          : "pointer-events-none invisible"
      }`}
      style={{ visibility: "hidden" }}
      aria-hidden={!isOpen}
    >
      <button
        ref={closeRef}
        type="button"
        onClick={onClose}
        className="absolute top-6 right-6 md:top-8 md:right-10 text-sm font-semibold tracking-wider text-primary hover:opacity-70 px-3 py-1.5 border border-transparent hover:border-border transition-all duration-150 cursor-pointer"
        aria-label="Close menu"
      >
        CLOSE [ESC]
      </button>

      <nav aria-label="Main navigation" className="py-20 px-6">
        <ul
          ref={listRef}
          className="flex flex-col gap-3 md:gap-5"
          style={{ perspective: "600px" }}
        >
          {links.map((link) => (
            <li key={link.href}>
              <button
                type="button"
                onClick={() => handleLink(link.href)}
                className="group flex items-baseline gap-4 md:gap-6 text-left cursor-pointer p-1"
              >
                <span className="text-sm text-muted font-normal tracking-wider group-hover:text-primary transition-colors">
                  {link.number}
                </span>
                <span className="text-2xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-primary group-hover:opacity-60 transition-opacity duration-200">
                  {link.label}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
