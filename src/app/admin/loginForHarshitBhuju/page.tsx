"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin";
  const error = searchParams.get("error");

  return (
    <main className="min-h-screen bg-bg text-primary flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-10">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-strong-border bg-secondary/10">
            <span className="text-lg font-bold">A</span>
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">
            Admin access
          </h1>
          <p className="mt-3 text-sm text-secondary leading-6">
            Sign in with your authorized GitHub account to continue.
          </p>
        </div>

        {error && (
          <p className="mb-4 text-center text-sm text-red-500 border border-red-500/30 rounded-lg px-3 py-2">
            {error === "AccessDenied"
              ? "Access denied. Only the authorized GitHub account can sign in."
              : "Sign-in failed. Please try again."}
          </p>
        )}

        <div className="rounded-2xl border border-strong-border bg-secondary/5 p-6 shadow-sm">
          <button
            type="button"
            onClick={() =>
              signIn("github", {
                callbackUrl,
              })
            }
            className="group flex w-full items-center justify-center gap-3 rounded-xl bg-text px-5 py-3.5 text-sm font-semibold text-bg transition-all hover:opacity-90 active:scale-[0.98] cursor-pointer"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-[18px] w-[18px] fill-current"
              aria-hidden="true"
            >
              <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.85 10.91.57.1.78-.25.78-.55v-2.13c-3.19.69-3.86-1.35-3.86-1.35-.52-1.33-1.27-1.69-1.27-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.68 1.25 3.33.96.1-.74.4-1.25.73-1.54-2.55-.29-5.23-1.28-5.23-5.69 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.47.11-3.06 0 0 .96-.31 3.15 1.18a10.9 10.9 0 0 1 5.74 0c2.19-1.49 3.15-1.18 3.15-1.18.62 1.59.23 2.77.11 3.06.73.81 1.18 1.84 1.18 3.1 0 4.42-2.69 5.39-5.25 5.67.41.35.78 1.04.78 2.1v3.11c0 .3.21.65.79.54A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
            </svg>
            Continue with GitHub
          </button>

          <div className="mt-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-strong-border" />
            <span className="text-[11px] uppercase tracking-wider text-secondary">
              Secure access
            </span>
            <div className="h-px flex-1 bg-strong-border" />
          </div>

          <p className="mt-5 text-center text-xs leading-5 text-secondary">
            Only authorized accounts can access the administration panel.
          </p>
        </div>

        <p className="mt-8 text-center text-xs text-secondary">
          Protected administration area
        </p>
      </div>
    </main>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-bg text-primary flex items-center justify-center">
          <p className="text-sm text-secondary">Loading…</p>
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
