import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-bg text-primary px-6">
      <p className="text-xs uppercase tracking-[0.2em] text-muted mb-4">404</p>
      <h1 className="text-3xl md:text-5xl font-semibold tracking-tight mb-4">
        Page not found
      </h1>
      <p className="text-secondary text-sm mb-8 text-center max-w-md">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="text-sm font-semibold border border-strong-border px-6 py-2.5 hover:bg-[var(--color-text)] hover:text-[var(--color-bg)] transition-colors"
      >
        Back home
      </Link>
    </main>
  );
}
