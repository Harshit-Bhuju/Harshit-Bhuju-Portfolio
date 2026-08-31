export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-neutral-800/80 rounded ${className}`}
      aria-hidden="true"
    />
  );
}

export function SectionSkeleton({ title = "Loading" }: { title?: string }) {
  return (
    <section className="section-padding border-t border-border" aria-label={title}>
      <div className="container-main">
        <div className="h-3 w-20 bg-neutral-800 animate-pulse rounded mb-4" />
        <div className="h-8 w-64 bg-neutral-800 animate-pulse rounded mb-10" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-32 bg-neutral-800 animate-pulse rounded" />
          <div className="h-32 bg-neutral-800 animate-pulse rounded" />
          <div className="h-32 bg-neutral-800 animate-pulse rounded" />
        </div>
      </div>
    </section>
  );
}
