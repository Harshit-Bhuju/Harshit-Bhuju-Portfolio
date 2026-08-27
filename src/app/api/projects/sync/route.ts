import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import {
  getMemoryProjects,
  slugify,
  upsertMemoryProject,
} from "@/lib/projectStore";

export async function POST(req: NextRequest) {
  const authed = await isAuthenticated(req);
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const username = process.env.GITHUB_USERNAME || "Harshit-Bhuju";

  try {
    const res = await fetch(
      `https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100&sort=updated&type=all`,
      {
        headers: {
          Accept: "application/vnd.github+json",
          "User-Agent": "harshit-bhuju-portfolio",
        },
        cache: "no-store",
      }
    );

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return NextResponse.json(
        {
          error: `GitHub API ${res.status}`,
          detail: text.slice(0, 200),
          synced: 0,
        },
        { status: 502 }
      );
    }

    const repos = (await res.json()) as Array<{
      name: string;
      html_url: string;
      description: string | null;
      homepage: string | null;
      language: string | null;
      topics?: string[];
      updated_at: string;
      fork: boolean;
      private: boolean;
    }>;

    const list = repos.filter((r) => !r.private);
    let created = 0;
    let updated = 0;
    const now = new Date();

    if (process.env.DATABASE_URL) {
      try {
        const { prisma } = await import("@/lib/prisma");
        for (const repo of list) {
          const slug = slugify(repo.name) || repo.name.toLowerCase();
          const tags =
            repo.topics && repo.topics.length
              ? repo.topics
              : repo.language
                ? [repo.language]
                : [];
          const existing = await prisma.project.findFirst({
            where: {
              OR: [{ slug }, { githubRepoName: repo.name }],
            },
          });

          if (existing) {
            await prisma.project.update({
              where: { id: existing.id },
              data: {
                githubUrl: repo.html_url,
                githubRepoName: repo.name,
                liveUrl: existing.liveUrl || repo.homepage || null,
                syncedAt: now,
              },
            });
            updated += 1;
          } else {
            await prisma.project.create({
              data: {
                slug,
                title: repo.name,
                shortDescription: repo.description || "",
                longDescription: repo.description || "",
                category: repo.language || "Repository",
                tags,
                githubUrl: repo.html_url,
                liveUrl: repo.homepage || null,
                githubRepoName: repo.name,
                visible: false,
                displayOrder: 200 + created,
                syncedAt: now,
              },
            });
            created += 1;
          }
        }

        return NextResponse.json({
          message: "Sync complete",
          created,
          updated,
          synced: created + updated,
          fetched: list.length,
          source: "database",
        });
      } catch (e) {
        console.error("Prisma sync error:", e);
        // fall through to memory
      }
    }

    // Memory store (works without DB)
    for (const repo of list) {
      const slug = slugify(repo.name) || repo.name.toLowerCase();
      const tags =
        repo.topics && repo.topics.length
          ? repo.topics
          : repo.language
            ? [repo.language]
            : [];
      const existing = getMemoryProjects().find(
        (p) => p.slug === slug || p.githubRepoName === repo.name
      );

      if (existing) {
        upsertMemoryProject({
          id: existing.id,
          slug: existing.slug,
          githubUrl: repo.html_url,
          githubRepoName: repo.name,
          liveUrl: existing.liveUrl || repo.homepage || null,
          syncedAt: now.toISOString(),
        });
        updated += 1;
      } else {
        upsertMemoryProject({
          slug,
          title: repo.name,
          shortDescription: repo.description || "",
          longDescription: repo.description || "",
          category: repo.language || "Repository",
          tags,
          githubUrl: repo.html_url,
          liveUrl: repo.homepage || null,
          githubRepoName: repo.name,
          visible: false,
          displayOrder: 200 + created,
          syncedAt: now.toISOString(),
        });
        created += 1;
      }
    }

    return NextResponse.json({
      message: "Sync complete",
      created,
      updated,
      synced: created + updated,
      fetched: list.length,
      source: process.env.DATABASE_URL ? "memory-fallback" : "memory",
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Sync failed", detail: String(e), synced: 0 },
      { status: 500 }
    );
  }
}
