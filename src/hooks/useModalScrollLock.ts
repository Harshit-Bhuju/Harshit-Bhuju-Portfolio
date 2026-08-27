"use client";

import { useEffect } from "react";
import { useLenis } from "@/components/SmoothScroll";

export function useModalScrollLock(isOpen: boolean, onClose?: () => void) {
  const { stop, start } = useLenis();

  useEffect(() => {
    if (!isOpen) return;

    // Lock scroll via Lenis & DOM
    stop();
    document.documentElement.classList.add("lenis-stopped");
    document.body.style.overflow = "hidden";

    // Global keyboard Escape handler
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && onClose) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      start();
      document.documentElement.classList.remove("lenis-stopped");
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose, stop, start]);
}
