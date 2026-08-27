"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import { useModalScrollLock } from "@/hooks/useModalScrollLock";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  ariaLabel?: string;
  ariaLabelledBy?: string;
  maxWidth?: string; // e.g. "max-w-2xl", "max-w-4xl"
  children: ReactNode;
  showCloseButton?: boolean;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  ariaLabel,
  ariaLabelledBy,
  maxWidth = "max-w-2xl",
  children,
  showCloseButton = true,
}: ModalProps) {
  const [mounted, setMounted] = useState(false);
  const backdropRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Hook handles Lenis stop/start, document.body scroll lock, and ESC key
  useModalScrollLock(isOpen, onClose);

  useEffect(() => {
    if (!isOpen || !mounted) return;

    const panel = panelRef.current;
    const backdrop = backdropRef.current;
    if (!panel || !backdrop) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReduced) {
      gsap.set(backdrop, { opacity: 1 });
      gsap.set(panel, { opacity: 1, scale: 1, y: 0 });
      return;
    }

    gsap.fromTo(
      backdrop,
      { opacity: 0 },
      { opacity: 1, duration: 0.25, ease: "power2.out" }
    );

    gsap.fromTo(
      panel,
      { opacity: 0, scale: 0.94, y: 12 },
      { opacity: 1, scale: 1, y: 0, duration: 0.35, ease: "power3.out" }
    );
  }, [isOpen, mounted]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      ref={backdropRef}
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel || title}
      aria-labelledby={ariaLabelledBy}
      data-lenis-prevent
      onClick={onClose}
      className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto"
      style={{ margin: 0, top: 0, left: 0, width: "100vw", height: "100vh" }}
    >
      <div
        ref={panelRef}
        data-lenis-prevent
        onClick={(e) => e.stopPropagation()}
        className={`w-full ${maxWidth} border border-strong bg-surface text-primary p-6 sm:p-8 md:p-10 max-h-[88vh] overflow-y-auto shadow-2xl relative my-auto`}
      >
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-border">
            {title ? (
              <h3
                id={ariaLabelledBy}
                className="text-xl sm:text-2xl font-semibold tracking-tight text-primary"
              >
                {title}
              </h3>
            ) : (
              <div />
            )}
            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className="text-xs font-semibold tracking-wider text-secondary hover:text-primary hover:bg-elevated px-3 py-1.5 border border-border hover:border-strong transition-all duration-150 shrink-0 cursor-pointer"
                aria-label="Close modal"
              >
                CLOSE [ESC]
              </button>
            )}
          </div>
        )}
        {children}
      </div>
    </div>,
    document.body
  );
}
