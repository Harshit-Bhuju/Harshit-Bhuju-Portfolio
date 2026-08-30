import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../prisma/generated/prisma/client";
import "dotenv/config";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // ── Antarprerana ─────────────────────────────────────────────────────────────
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

  // ── RapiReport ───────────────────────────────────────────────────────────────
  await prisma.project.update({
    where: { slug: "rapireport" },
    data: {
      myRole: "Frontend Developer",
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

  // ── CultureConnect ───────────────────────────────────────────────────────────
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

  console.log("✓ Updated categorized stacks (Frontend, Backend, Database, Tools) in PostgreSQL DB.");

  const updated = await prisma.project.findMany({
    where: { slug: { in: ["antarprerana", "rapireport", "cultureconnect"] } },
    select: {
      slug: true,
      myRole: true,
      stackFrontend: true,
      stackBackend: true,
      stackDatabase: true,
      stackTools: true,
    },
  });
  console.log("Verification:", JSON.stringify(updated, null, 2));
}

main().catch(console.error).finally(() => process.exit(0));
