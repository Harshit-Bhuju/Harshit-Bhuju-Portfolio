import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  let projectEntries: MetadataRoute.Sitemap = [];

  if (process.env.DATABASE_URL) {
    try {
      const { prisma } = await import("@/lib/prisma");
      const rows = await prisma.project.findMany({
        where: { visible: true },
        select: { slug: true, updatedAt: true },
      });
      projectEntries = rows.map((p) => ({
        url: `${base}/projects/${p.slug}`,
        lastModified: p.updatedAt,
        changeFrequency: "monthly" as const,
        priority: 0.7,
      }));
    } catch {
      /* empty */
    }
  }

  return [
    {
      url: base,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    ...projectEntries,
  ];
}
