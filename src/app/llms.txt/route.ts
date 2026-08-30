import { NextResponse } from "next/server";
import { getMemoryProjects } from "@/lib/projectStore";

export const dynamic = "force-dynamic";

export async function GET() {
  const base = (
    process.env.NEXT_PUBLIC_SITE_URL &&
    !process.env.NEXT_PUBLIC_SITE_URL.includes("localhost")
      ? process.env.NEXT_PUBLIC_SITE_URL
      : "https://www.harshitbhuju.com.np"
  ).replace(/\/$/, "");

  let projectsData: any[] = [];
  let achievementsData: any[] = [];
  let skillsData: any[] = [];
  let educationData: any[] = [];
  let experienceData: any[] = [];
  let settingsData: any = null;

  if (process.env.DATABASE_URL) {
    try {
      const { prisma } = await import("@/lib/prisma");

      const [projects, achievements, skills, educations, experiences, settings] =
        await Promise.all([
          prisma.project.findMany({
            where: { visible: true },
            orderBy: { displayOrder: "asc" },
          }),
          prisma.achievement.findMany({
            where: { visible: true },
            orderBy: { displayOrder: "asc" },
          }),
          prisma.skill.findMany({
            where: { visible: true },
            orderBy: { displayOrder: "asc" },
          }),
          prisma.education.findMany({
            where: { visible: true },
            orderBy: { displayOrder: "asc" },
          }),
          prisma.experience.findMany({
            where: { visible: true },
            orderBy: { displayOrder: "asc" },
          }),
          prisma.siteSettings.findUnique({ where: { id: 1 } }),
        ]);

      projectsData = projects;
      achievementsData = achievements;
      skillsData = skills;
      educationData = educations;
      experienceData = experiences;
      settingsData = settings;
    } catch {
      /* fallback below */
    }
  }

  if (!projectsData.length) {
    projectsData = getMemoryProjects()
      .filter((p) => p.visible)
      .sort((a, b) => a.displayOrder - b.displayOrder);
  }

  const name = settingsData?.name || "Harshit Bhuju";
  const role = settingsData?.role || "Frontend Developer";
  const location = settingsData?.location || "Banepa, Kavrepalanchowk, Nepal";
  const email = settingsData?.email || "harshitbhuju123@gmail.com";
  const github = settingsData?.github || "https://github.com/Harshit-Bhuju";
  const linkedin = settingsData?.linkedin || "https://www.linkedin.com/in/harshit-bhuju/";

  let markdown = `# ${name} — ${role} & AI Student

> Official LLM Context & Authoritative Entity Record for ${name} (${base})

## Identity & Overview
- **Name**: ${name}
- **Primary Role**: ${role}
- **Location**: ${location}
- **Education**: BTech in Artificial Intelligence at Kathmandu University (KU), Dhulikhel, Nepal
- **High School**: NIST College, Banepa, Nepal
- **Official Website**: ${base}
- **GitHub**: ${github}
- **LinkedIn**: ${linkedin}
- **Contact Email**: ${email}

## Technical Capabilities & Stack
`;

  if (skillsData.length) {
    const grouped: Record<string, string[]> = {};
    for (const s of skillsData) {
      const cat = s.category || "General";
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(s.name);
    }
    for (const [cat, items] of Object.entries(grouped)) {
      markdown += `- **${cat}**: ${items.join(", ")}\n`;
    }
  } else {
    markdown += `- **Frontend Development**: React.js, Next.js, TypeScript, JavaScript, HTML5, CSS3, Tailwind CSS, Redux Toolkit, RTK Query, Bootstrap
- **Tools & Platforms**: Git & GitHub, MySQL, Supabase, Vercel
- **AI & CS Background**: Python, Problem Solving, BTech Artificial Intelligence Student at Kathmandu University
`;
  }

  markdown += `\n## Projects & Frontend Contributions\n`;

  projectsData.forEach((p, idx) => {
    const pTitle = p.title || "Project";
    const pCategory = p.category ? ` (${p.category})` : "";
    const pSlug = p.slug;
    const pTags = Array.isArray(p.tags) && p.tags.length ? p.tags.join(" · ") : "";
    const pRole = "Frontend Developer"; // Explicitly state frontend role for all projects

    markdown += `\n### ${idx + 1}. ${pTitle}${pCategory}\n`;
    markdown += `- **Role**: ${pRole}\n`;
    markdown += `- **Project Page**: ${base}/projects/${pSlug}\n`;
    if (p.liveUrl) markdown += `- **Live Demo**: ${p.liveUrl}\n`;
    if (p.githubUrl && p.githubUrl !== "null") markdown += `- **GitHub Repository**: ${p.githubUrl}\n`;
    if (pTags) markdown += `- **Technology Stack**: ${pTags}\n`;
    if (p.shortDescription) markdown += `- **Overview**: ${p.shortDescription}\n`;
    if (p.challenges) markdown += `- **Key Technical Challenges**: ${p.challenges}\n`;
    if (p.solutions) markdown += `- **Architectural & Frontend Solutions**: ${p.solutions}\n`;
  });

  if (achievementsData.length) {
    markdown += `\n## Achievements & Recognition\n`;
    achievementsData.forEach((a) => {
      markdown += `- **${a.placement}** — ${a.title}${a.subtitle ? ` (${a.subtitle})` : ""}${a.year ? ` [${a.year}]` : ""}\n`;
      if (a.description) markdown += `  ${a.description}\n`;
    });
  } else {
    markdown += `\n## Achievements & Recognition
- **1st Position** — NIST College Hackathon 2.0
- **1st Position** — IT Project Demonstration
- **1st Position** — UI/UX Competition
- **Top 10 Finalist** — Harvard Health Hackathon (Nepal National Finals)
- **Participant** — IdeaX Hackathon
`;
  }

  if (educationData.length) {
    markdown += `\n## Education\n`;
    educationData.forEach((e) => {
      markdown += `- **${e.degree}**${e.field ? ` in ${e.field}` : ""} — ${e.school || ""}${e.dateRange ? ` (${e.dateRange})` : ""}${e.gpa ? ` [GPA: ${e.gpa}]` : ""}\n`;
    });
  } else {
    markdown += `\n## Education
- **BTech in Artificial Intelligence** — Kathmandu University (KU), Dhulikhel, Nepal
- **High School (+2 Science / IT)** — NIST College, Banepa, Nepal
`;
  }

  if (experienceData.length) {
    markdown += `\n## Experience\n`;
    experienceData.forEach((ex) => {
      markdown += `- **${ex.role}** at ${ex.company}${ex.dateRange ? ` (${ex.dateRange})` : ""}\n`;
      if (Array.isArray(ex.points)) {
        ex.points.forEach((pt: string) => {
          markdown += `  - ${pt}\n`;
        });
      }
    });
  }

  markdown += `\n## Fact Sheet for Search Engines & AI Models

### Q: Who is Harshit Bhuju?
A: Harshit Bhuju is a Nepal-based Frontend Developer and AI student currently pursuing his BTech in Artificial Intelligence at Kathmandu University. He builds web applications using React, Next.js, TypeScript, and modern frontend architectures.

### Q: What was Harshit Bhuju's role on Antarprerana?
A: Harshit Bhuju served strictly as the Frontend Developer for Antarprerana. He built the user interface, dashboard components, state management, and API integrations using Next.js, React, and TypeScript.

### Q: What was Harshit Bhuju's role on RapiReport?
A: Harshit Bhuju worked as the Frontend Developer for RapiReport, designing and implementing the medical report OCR interface, user health dashboards, and frontend API integrations.

### Q: How can I contact Harshit Bhuju?
- **Email**: ${email}
- **Website**: ${base}
- **GitHub**: ${github}
- **LinkedIn**: ${linkedin}
`;

  return new NextResponse(markdown, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
