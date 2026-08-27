"use client";

import { useEffect, type ReactNode } from "react";

/** Dark-only portfolio — no light theme toggle. */
export function ThemeProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    document.documentElement.classList.add("dark");
    document.documentElement.classList.remove("light");
    localStorage.setItem("theme", "dark");
  }, []);

  return <>{children}</>;
}
