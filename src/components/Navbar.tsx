"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import Menu from "./Menu";

export default function Navbar() {
  const [resumePath, setResumePath] = useState<string | undefined>(undefined);
  const [resumeReady, setResumeReady] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.resumePath) {
          setResumePath(data.resumePath);
        }
        setResumeReady(true);
      })
      .catch(() => setResumeReady(true));
  }, []);

  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const el = navRef.current;
    if (!el) return;
    gsap.fromTo(
      el,
      { y: -12 },
      { y: 0, duration: 0.5, ease: "power2.out", delay: 0.02 }
    );
  }, []);

  return (
    <>
      <header
        ref={navRef}
        style={{ opacity: 1 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 backdrop-blur-md ${
          scrolled
            ? "border-b border-border/80 bg-bg/85 py-3.5 shadow-sm"
            : "border-b border-border/30 bg-bg/60 py-4.5"
        }`}
      >
        <nav
          className="container-main flex items-center justify-between gap-4"
          aria-label="Primary"
        >
          <a
            href="#hero"
            className="text-xs sm:text-sm font-bold tracking-[0.15em] uppercase text-primary hover:opacity-70 transition-opacity shrink-0"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            HARSHIT BHUJU
          </a>

          <div className="flex items-center gap-5 sm:gap-8">

            {resumeReady && resumePath ? (
              <a
                href={resumePath}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold tracking-[0.15em] uppercase text-secondary hover:text-primary transition-colors"
              >
                RESUME
              </a>
            ) : null}

            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="text-xs font-semibold tracking-[0.15em] uppercase text-primary hover:opacity-70 transition-opacity cursor-pointer"
              aria-label="Open navigation menu"
              aria-expanded={menuOpen}
              aria-controls="main-menu"
            >
              MENU
            </button>
          </div>
        </nav>
      </header>

      <Menu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
