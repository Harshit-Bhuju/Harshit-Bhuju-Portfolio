import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../prisma/generated/prisma/client";
import "dotenv/config";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // ── 1. Projects ──────────────────────────────────────────────────────────────
  await prisma.project.update({
    where: { slug: "antarprerana" },
    data: {
      myRole: "Lead Frontend Developer",
      contributions: [
        "Architected responsive multi-role dashboards (Super Admin, Admin, Participant) in Next.js 15 & TypeScript.",
        "Integrated RTK Query with REST APIs for automated cache invalidation and efficient client state management.",
        "Built participant KPI data tables with advanced filtering, sorting, and automated Excel report exports.",
        "Developed cohort lifecycle tracking modules, milestone forms, and analytics data visualizations.",
        "Implemented role-scoped access control and protected route architecture across all user roles.",
      ],
      stackFrontend: ["Next.js 15", "React 19", "TypeScript", "Tailwind CSS", "Redux Toolkit", "RTK Query"],
      stackBackend: ["NestJS", "REST APIs"],
      stackDatabase: ["PostgreSQL", "Prisma ORM"],
      stackTools: ["Git", "Vercel"],
    },
  });

  await prisma.project.update({
    where: { slug: "rapireport" },
    data: {
      myRole: "Frontend Developer",
      longDescription: `RapiReport is an AI-powered healthcare platform designed to make medical information more accessible and actionable. It uses OCR and AI to extract and interpret information from physical and handwritten medical reports, transforming complex clinical data into understandable health insights.

The platform combines automated medical report analysis with personalized health monitoring, risk assessment, medication planning, telemedicine, and family health management. Users can track health metrics, receive personalized recommendations, book doctor consultations, manage health records for family members, and interact with AI-powered healthcare features.

My primary contribution focused on designing and building the frontend user interface using React, Next.js, TypeScript, and Tailwind CSS, integrating REST APIs, and building interactive health data visualization components.`,
      contributions: [
        "Designed and built the responsive medical document upload and OCR report analysis interface.",
        "Engineered interactive health risk visualization charts and biomarker status indicators using Recharts.",
        "Developed patient consultation booking flow and family health records dashboard.",
        "Integrated Gemini API response rendering with structured medical data display components.",
      ],
      stackFrontend: ["Next.js 15", "React 19", "TypeScript", "Tailwind CSS", "Recharts"],
      stackBackend: ["Node.js", "REST APIs"],
      stackDatabase: ["PostgreSQL", "Supabase"],
      stackTools: ["Tesseract.js OCR", "Gemini API"],
    },
  });

  await prisma.project.update({
    where: { slug: "cultureconnect" },
    data: {
      myRole: "Frontend Developer",
      contributions: [
        "Built responsive cultural marketplace product catalog and artisan showcase interfaces.",
        "Implemented client-side shopping cart state management, checkout flows, and order confirmation UI.",
        "Developed e-learning course module with video player, progress tracking, and enrollment components.",
        "Optimized layout responsiveness and asset delivery across mobile and desktop breakpoints.",
      ],
      stackFrontend: ["Next.js 15", "React 19", "TypeScript", "Tailwind CSS", "Redux Toolkit"],
      stackBackend: ["Node.js", "Express"],
      stackDatabase: ["MongoDB", "Prisma ORM"],
      stackTools: ["Git", "Vercel"],
    },
  });

  // ── 2. Experience ─────────────────────────────────────────────────────────────
  const exp = await prisma.experience.findFirst();
  if (exp) {
    await prisma.experience.update({
      where: { id: exp.id },
      data: {
        points: [
          "Architected a scalable multi-role frontend (Super Admin, Admin, User) using Next.js and TypeScript while integrating with NestJS REST APIs.",
          "Implemented RTK Query for automatic cache invalidation, reducing redundant network requests and optimizing data fetching performance.",
          "Engineered complex data table workflows with automated report generation and Excel export capabilities for participant KPI tracking.",
          "Developed cohort management modules, dashboard visualizations, and role-scoped access control for an end-to-end incubation platform.",
        ],
      },
    });
  }

  // ── 3. Skills ─────────────────────────────────────────────────────────────────
  // Remove MySQL, Supabase & PHP from skills if present
  await prisma.skill.deleteMany({
    where: { name: { in: ["MySQL", "Supabase", "PHP"] } },
  });

  // Add C to skills if not present
  const cSkill = await prisma.skill.findFirst({ where: { name: "C" } });
  if (!cSkill) {
    await prisma.skill.create({
      data: { category: "languages", name: "C", visible: true, displayOrder: 3 },
    });
  }

  console.log("✓ Updated Projects, Experience, and Skills in PostgreSQL DB.");
}

main().catch(console.error).finally(() => process.exit(0));
