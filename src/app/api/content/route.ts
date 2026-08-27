import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "DATABASE_URL not configured" }, { status: 503 });
  }
  try {
    const { prisma } = await import("@/lib/prisma");
    const [
      settings,
      projects,
      experience,
      education,
      skills,
      achievements,
      certifications,
      challenges,
      techNotes,
    ] = await Promise.all([
      prisma.siteSettings.findUnique({ where: { id: 1 } }),
      prisma.project.findMany({ where: { visible: true }, orderBy: { displayOrder: "asc" } }),
      prisma.experience.findMany({ where: { visible: true }, orderBy: { displayOrder: "asc" } }),
      prisma.education.findMany({ where: { visible: true }, orderBy: { displayOrder: "asc" } }),
      prisma.skill.findMany({ where: { visible: true }, orderBy: { displayOrder: "asc" } }),
      prisma.achievement.findMany({ where: { visible: true }, orderBy: { displayOrder: "asc" } }),
      prisma.certification.findMany({ where: { visible: true }, orderBy: { displayOrder: "asc" } }),
      prisma.engineeringChallenge.findMany({ where: { visible: true }, orderBy: { displayOrder: "asc" } }),
      prisma.techNote.findMany({ where: { visible: true }, orderBy: { displayOrder: "asc" } }),
    ]);

    const s = settings;
    return NextResponse.json(
      {
        profile: s
          ? {
              name: s.name,
              firstName: s.firstName,
              lastName: s.lastName,
              role: s.role,
              secondaryRole: s.secondaryRole,
              tagline: s.tagline,
              email: s.email,
              phone: s.phone,
              whatsapp: s.whatsapp,
              location: s.location,
              linkedin: s.linkedin,
              github: s.github,
              facebook: s.facebook,
              instagram: s.instagram,
              resumePath: s.resumePath,
              profileImage: s.profileImage,
            }
          : null,
        about: s
          ? {
              statement: s.aboutStatement,
              body: s.aboutBody,
              focus: s.aboutFocus || [],
            }
          : null,
        projects,
        experience,
        education,
        skills,
        achievements,
        certifications,
        challenges,
        techNotes,
        source: "database",
      },
      {
        headers: {
          "Cache-Control": "s-maxage=30, stale-while-revalidate=120",
        },
      }
    );
  } catch (e) {
    console.error("content API", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
