export const dynamic = "force-dynamic";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ProjectMedia from "@/components/ProjectMedia";
import VideoPlayer from "@/components/VideoPlayer";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://www.harshitbhuju.com.np";

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
  challenges: string | null;
  solutions: string | null;
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
      challenges: row.challenges,
      solutions: row.solutions,
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
  
  const title = `${project.title || "Project"} | Harshit Bhuju`;
  const description =
    project.shortDescription ||
    (project.longDescription ? project.longDescription.slice(0, 155) + "..." : undefined);
  const ogImages = project.thumbnailUrl
    ? [{ url: project.thumbnailUrl, alt: project.title || "Project" }]
    : [{ url: `${siteUrl}/profile.jpg`, alt: "Harshit Bhuju — Web Developer" }];

  const projectKeywords = [
    project.title || "",
    `${project.title} project`,
    `${project.title} Harshit Bhuju`,
    `${project.title} web application`,
    "Harshit Bhuju project",
    "Harshit Bhuju portfolio",
    ...(project.tags || []),
    project.category || "",
  ].filter(Boolean);

  return {
    title,
    description,
    keywords: projectKeywords,
    openGraph: {
      title,
      description,
      type: "article",
      url: `${siteUrl}/projects/${slug}`,
      siteName: "Harshit Bhuju",
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: project.thumbnailUrl ? [project.thumbnailUrl] : [`${siteUrl}/profile.jpg`],
    },
    alternates: {
      canonical: `${siteUrl}/projects/${slug}`,
    },
  };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) notFound();

  const { prev, next } = await getAdjacent(slug);

  const projectJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: project.title || "Project",
    description: project.shortDescription || project.longDescription || "",
    applicationCategory: project.category || "DeveloperApplication",
    operatingSystem: "Web",
    datePublished: "2024-01-01T00:00:00+05:45",
    dateModified: "2026-08-30T00:00:00+05:45",
    author: {
      "@type": "Person",
      name: "Harshit Bhuju",
      url: siteUrl,
    },
    url: `${siteUrl}/projects/${slug}`,
    ...(project.thumbnailUrl ? { image: project.thumbnailUrl } : {}),
    ...(project.liveUrl ? { sameAs: project.liveUrl } : {}),
  };

  return (
    <main className="min-h-screen bg-bg text-primary">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(projectJsonLd) }}
      />
      <div className="container-main pt-28 pb-20">
        <Link
          href="/"
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
          hideVideo={true}
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

            {/* Video below overview */}
            {project.videoUrl && (
              <div>
                <h2 className="text-xs uppercase tracking-[0.15em] text-muted mb-4">
                  Walkthrough
                </h2>
                <VideoPlayer
                  videoUrl={project.videoUrl}
                  thumbnailUrl={project.thumbnailUrl}
                  title={project.title || "Project"}
                />
              </div>
            )}
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
              {project.githubUrl && project.githubUrl.trim() && project.githubUrl !== "null" && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 border border-border text-sm font-medium hover:border-strong-border transition-colors"
                >
                  GitHub ↗
                </a>
              )}
            </div>
          </aside>
        </div>

        {/* Challenges & Solutions Deep-Dive Section */}
        {(project.challenges || project.solutions) && (
          <section className="mt-16 pt-12 border-t border-border">
            <div className="mb-8">
              <span className="text-xs uppercase tracking-[0.2em] text-muted block mb-2">
                Engineering Deep-Dive
              </span>
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
                Challenges & Solutions
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
              {project.challenges && (
                <div className="p-6 md:p-8 border border-border bg-surface/40 hover:border-strong transition-colors relative">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="flex h-7 w-7 items-center justify-center border border-border text-xs font-mono text-primary bg-bg">
                      01
                    </span>
                    <h3 className="text-sm font-semibold tracking-wide uppercase text-primary">
                      Key Challenges & Constraints
                    </h3>
                  </div>
                  <p className="text-sm md:text-base leading-relaxed text-secondary whitespace-pre-line">
                    {project.challenges}
                  </p>
                </div>
              )}

              {project.solutions && (
                <div className="p-6 md:p-8 border border-border bg-surface/40 hover:border-strong transition-colors relative">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="flex h-7 w-7 items-center justify-center border border-border text-xs font-mono text-primary bg-bg">
                      02
                    </span>
                    <h3 className="text-sm font-semibold tracking-wide uppercase text-primary">
                      Engineering Approach & Solutions
                    </h3>
                  </div>
                  <p className="text-sm md:text-base leading-relaxed text-secondary whitespace-pre-line">
                    {project.solutions}
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

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
