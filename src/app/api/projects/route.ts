import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import {
  deleteMemoryProject,
  getMemoryProjects,
  slugify,
  upsertMemoryProject,
  type ProjectRecord,
} from "@/lib/projectStore";

function mapPrisma(p: Record<string, unknown>): ProjectRecord {
  return {
    id: p.id as number,
    slug: p.slug as string,
    title: (p.title as string) ?? null,
    number: (p.number as string) ?? null,
    category: (p.category as string) ?? null,
    dateRange: (p.dateRange as string) ?? null,
    shortDescription: (p.shortDescription as string) ?? null,
    longDescription: (p.longDescription as string) ?? null,
    tags: (p.tags as string[]) || [],
    githubUrl: (p.githubUrl as string) ?? null,
    liveUrl: (p.liveUrl as string) ?? null,
    videoUrl: (p.videoUrl as string) ?? null,
    thumbnailUrl: (p.thumbnailUrl as string) ?? null,
    galleryUrls: (p.galleryUrls as string[]) || [],
    certificateUrls: (p.certificateUrls as string[]) || [],
    visible: Boolean(p.visible),
    displayOrder: (p.displayOrder as number) ?? 0,
    githubRepoName: (p.githubRepoName as string) ?? null,
    syncedAt: (p.syncedAt as string | Date) ?? null,
  };
}

export async function GET(req: NextRequest) {
  const all = req.nextUrl.searchParams.get("all") === "1";

  if (process.env.DATABASE_URL) {
    try {
      const { prisma } = await import("@/lib/prisma");
      const data = await prisma.project.findMany({
        where: all ? undefined : { visible: true },
        orderBy: { displayOrder: "asc" },
      });
      return NextResponse.json(data.map((p) => mapPrisma(p as unknown as Record<string, unknown>)), {
        headers: {
          "Cache-Control": all
            ? "no-store"
            : "s-maxage=60, stale-while-revalidate=300",
        },
      });
    } catch {
      // fall through
    }
  }

  const store = getMemoryProjects();
  const data = all
    ? [...store].sort((a, b) => a.displayOrder - b.displayOrder)
    : store
        .filter((p) => p.visible)
        .sort((a, b) => a.displayOrder - b.displayOrder);

  return NextResponse.json(data, {
    headers: {
      "Cache-Control": all
        ? "no-store"
        : "s-maxage=60, stale-while-revalidate=300",
    },
  });
}

export async function POST(req: NextRequest) {
  const authed = await isAuthenticated(req);
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const title = (body.title || "").trim();
  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const baseSlug = slugify(body.slug || title);
  let slug = baseSlug || `project-${Date.now()}`;

  const payload = {
    title,
    number: body.number || null,
    category: body.category || null,
    dateRange: body.dateRange || null,
    shortDescription: body.shortDescription || null,
    longDescription: body.longDescription || null,
    tags: Array.isArray(body.tags) ? body.tags : [],
    thumbnailUrl: body.thumbnailUrl || null,
    galleryUrls: Array.isArray(body.galleryUrls) ? body.galleryUrls : [],
    videoUrl: body.videoUrl || null,
    liveUrl: body.liveUrl || null,
    githubUrl: body.githubUrl || null,
    certificateUrls: Array.isArray(body.certificateUrls)
      ? body.certificateUrls
      : [],
    visible: Boolean(body.visible),
    displayOrder:
      typeof body.displayOrder === "number"
        ? body.displayOrder
        : getMemoryProjects().length + 1,
    githubRepoName: body.githubRepoName || null,
  };

  if (process.env.DATABASE_URL) {
    try {
      const { prisma } = await import("@/lib/prisma");
      // ensure unique slug
      let attempt = 0;
      while (attempt < 20) {
        const exists = await prisma.project.findUnique({ where: { slug } });
        if (!exists) break;
        attempt += 1;
        slug = `${baseSlug}-${attempt}`;
      }
      const created = await prisma.project.create({
        data: {
          slug,
          ...payload,
        },
      });
      return NextResponse.json(mapPrisma(created as unknown as Record<string, unknown>), {
        status: 201,
      });
    } catch (e) {
      console.error(e);
    }
  }

  // memory: unique slug
  const existing = getMemoryProjects().map((p) => p.slug);
  let attempt = 0;
  while (existing.includes(slug) && attempt < 20) {
    attempt += 1;
    slug = `${baseSlug}-${attempt}`;
  }

  const created = upsertMemoryProject({ slug, ...payload });
  return NextResponse.json(created, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const authed = await isAuthenticated(req);
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  if (!body?.slug && body?.id == null) {
    return NextResponse.json({ error: "Missing id/slug" }, { status: 400 });
  }

  const data = {
    title: body.title,
    number: body.number ?? null,
    shortDescription: body.shortDescription,
    longDescription: body.longDescription,
    category: body.category,
    dateRange: body.dateRange,
    tags: body.tags || [],
    thumbnailUrl: body.thumbnailUrl,
    galleryUrls: body.galleryUrls || [],
    videoUrl: body.videoUrl,
    liveUrl: body.liveUrl,
    githubUrl: body.githubUrl,
    certificateUrls: body.certificateUrls || [],
    visible: body.visible,
    displayOrder: body.displayOrder ?? 0,
    githubRepoName: body.githubRepoName ?? null,
  };

  if (process.env.DATABASE_URL) {
    try {
      const { prisma } = await import("@/lib/prisma");
      const updated = await prisma.project.update({
        where: body.id != null ? { id: body.id } : { slug: body.slug },
        data,
      });
      return NextResponse.json(
        mapPrisma(updated as unknown as Record<string, unknown>)
      );
    } catch (e) {
      console.error(e);
    }
  }

  const found = upsertMemoryProject({
    id: body.id,
    slug: body.slug,
    ...data,
  });
  return NextResponse.json(found);
}

export async function DELETE(req: NextRequest) {
  const authed = await isAuthenticated(req);
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const id = body.id ?? Number(req.nextUrl.searchParams.get("id"));
  const slug = body.slug ?? req.nextUrl.searchParams.get("slug");

  if (id == null && !slug) {
    return NextResponse.json({ error: "Missing id/slug" }, { status: 400 });
  }

  if (process.env.DATABASE_URL) {
    try {
      const { prisma } = await import("@/lib/prisma");
      await prisma.project.delete({
        where: id != null && !Number.isNaN(id) ? { id: Number(id) } : { slug: String(slug) },
      });
      return NextResponse.json({ ok: true });
    } catch (e) {
      console.error(e);
    }
  }

  const ok = deleteMemoryProject({
    id: id != null && !Number.isNaN(Number(id)) ? Number(id) : undefined,
    slug: slug ? String(slug) : undefined,
  });
  return NextResponse.json({ ok });
}
