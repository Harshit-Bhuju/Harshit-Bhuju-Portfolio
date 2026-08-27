export const dynamic = "force-dynamic";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ProjectMedia from "@/components/ProjectMedia";

interface Props {
  params: Promise<{ slug: string }>;
}

type ProjectRow = {
  id: number;
  slug: string;
  title: string | null;
  number: string | null;
  category: string | null;
  dateRange: string | null;
  shortDescription: string | null;
  longDescription: string | null;
  tags: string[];
  githubUrl: string | null;
  liveUrl: string | null;
  videoUrl: string | null;
  thumbnailUrl: string | null;
  galleryUrls: string[];
  certificateUrls: string[];
  visible: boolean;
  displayOrder: number;
};

async function getProject(slug: string): Promise<ProjectRow | null> {
  if (!process.env.DATABASE_URL) return null;
  try {
    const { prisma } = await import("@/lib/prisma");
    const row = await prisma.project.findUnique({ where: { slug } });
    if (!row) return null;
    return {
      id: row.id,
      slug: row.slug,
      title: row.title,
      number: row.number,
      category: row.category,
      dateRange: row.dateRange,
      shortDescription: row.shortDescription,
      longDescription: row.longDescription,
      tags: row.tags || [],
      githubUrl: row.githubUrl,
      liveUrl: row.liveUrl,
      videoUrl: row.videoUrl,
      thumbnailUrl: row.thumbnailUrl,
      galleryUrls: row.galleryUrls || [],
      certificateUrls: row.certificateUrls || [],
      visible: row.visible,
      displayOrder: row.displayOrder,
    };
  } catch {
    return null;
  }
}

async function getAdjacent(slug: string) {
  if (!process.env.DATABASE_URL) return { prev: null, next: null };
  try {
    const { prisma } = await import("@/lib/prisma");
    const list = await prisma.project.findMany({
      where: { visible: true },
      orderBy: { displayOrder: "asc" },
      select: { slug: true, title: true },
    });
    const idx = list.findIndex((p) => p.slug === slug);
    return {
      prev: idx > 0 ? list[idx - 1] : null,
      next: idx >= 0 && idx < list.length - 1 ? list[idx + 1] : null,
    };
  } catch {
    return { prev: null, next: null };
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) return { title: "Project not found" };
  const title = project.title || "Project";
  const description = project.shortDescription || undefined;
  const images = project.thumbnailUrl
    ? [{ url: project.thumbnailUrl, alt: title }]
    : undefined;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: project.thumbnailUrl ? [project.thumbnailUrl] : undefined,
    },
    alternates: {
      canonical: `/projects/${slug}`,
    },
  };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) notFound();

  const { prev, next } = await getAdjacent(slug);

  return (
    <main className="min-h-screen bg-bg text-primary">
      <div className="container-main pt-28 pb-20">
        <Link
          href="/#work"
          className="inline-flex items-center gap-2 text-sm text-secondary hover:text-primary transition-colors mb-12 group"
        >
          <span className="group-hover:-translate-x-0.5 transition-transform">←</span>
          Back to Work
        </Link>

        <div className="mb-6 flex flex-wrap items-baseline gap-4">
          {project.number && (
            <span className="text-sm text-muted tracking-wider font-mono">
              {project.number}
            </span>
          )}
          {project.dateRange && (
            <span className="text-xs uppercase tracking-[0.15em] text-muted">
              {project.dateRange}
            </span>
          )}
        </div>

        <h1 className="heading-section mb-4">{project.title}</h1>
        {project.category && (
          <p className="heading-sub mb-12">{project.category}</p>
        )}

        <ProjectMedia
          thumbnailUrl={project.thumbnailUrl}
          galleryUrls={project.galleryUrls}
          videoUrl={project.videoUrl}
          title={project.title || "Project"}
          number={project.number || ""}
          certificateUrls={project.certificateUrls || []}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 mt-16">
          <div className="lg:col-span-8 space-y-10">
            <div>
              <h2 className="text-xs uppercase tracking-[0.15em] text-muted mb-4">
                Overview
              </h2>
              <p className="body-text whitespace-pre-line">
                {project.longDescription || project.shortDescription}
              </p>
            </div>
          </div>

          <aside className="lg:col-span-4 space-y-8">
            {project.tags?.length > 0 && (
              <div>
                <h2 className="text-xs uppercase tracking-[0.15em] text-muted mb-4">
                  Stack
                </h2>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-3 py-1.5 border border-border rounded-full text-secondary"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3">
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-primary text-bg text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  Live site ↗
                </a>
              )}
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 border border-border text-sm font-medium hover:border-strong-border transition-colors"
                >
                  Source code ↗
                </a>
              )}
            </div>
          </aside>
        </div>

        <nav className="mt-20 pt-10 border-t border-border flex flex-wrap justify-between gap-6">
          {prev ? (
            <Link
              href={`/projects/${prev.slug}`}
              className="group text-sm text-secondary hover:text-primary transition-colors"
            >
              <span className="block text-xs uppercase tracking-wider text-muted mb-1">
                Previous
              </span>
              <span className="group-hover:-translate-x-0.5 inline-block transition-transform">
                ← {prev.title}
              </span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              href={`/projects/${next.slug}`}
              className="group text-sm text-secondary hover:text-primary transition-colors text-right ml-auto"
            >
              <span className="block text-xs uppercase tracking-wider text-muted mb-1">
                Next
              </span>
              <span className="group-hover:translate-x-0.5 inline-block transition-transform">
                {next.title} →
              </span>
            </Link>
          ) : null}
        </nav>
      </div>
    </main>
  );
}
