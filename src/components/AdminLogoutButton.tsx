"use client";

import { signOut } from "next-auth/react";

export default function AdminLogoutButton() {
  return (
    <button
      type="button"
      onClick={() =>
        signOut({
          callbackUrl: "/",
        })
      }
      className="text-sm font-semibold border border-strong-border px-5 py-2.5 hover:bg-[var(--color-text)] hover:text-[var(--color-bg)] transition-colors cursor-pointer"
    >
      Log out
    </button>
  );
}
