import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Projects from "@/components/Projects";
import Skills from "@/components/Skills";
import Achievements from "@/components/Achievements";
import Education from "@/components/Education";
import Experience from "@/components/Experience";
import Certification from "@/components/Certification";
import FAQ from "@/components/FAQ";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import PageTransitions from "@/components/PageTransitions";
import { getMemoryProjects } from "@/lib/projectStore";

export const revalidate = 60; // revalidate homepage every 60s

async function getInitialData() {
  if (process.env.DATABASE_URL) {
    try {
      const { prisma } = await import("@/lib/prisma");
      const [
        projects,
        experiences,
        educations,
        certifications,
        skills,
        achievements,
        settings,
      ] = await Promise.all([
        prisma.project.findMany({
          where: { visible: true },
          orderBy: { displayOrder: "asc" },
        }),
        prisma.experience.findMany({
          where: { visible: true },
          orderBy: { displayOrder: "asc" },
        }),
        prisma.education.findMany({
          where: { visible: true },
          orderBy: { displayOrder: "asc" },
        }),
        prisma.certification.findMany({
          where: { visible: true },
          orderBy: { displayOrder: "asc" },
        }),
        prisma.skill.findMany({
          where: { visible: true },
          orderBy: [{ category: "asc" }, { displayOrder: "asc" }],
        }),
        prisma.achievement.findMany({
          where: { visible: true },
          orderBy: { displayOrder: "asc" },
        }),
        prisma.siteSettings.findUnique({
          where: { id: 1 },
        }),
      ]);

      const winsCount = achievements.filter((a) =>
        String(a.placement || "").toUpperCase().includes("1ST")
      ).length;

      return {
        projects: JSON.parse(JSON.stringify(projects)),
        experiences: JSON.parse(JSON.stringify(experiences)),
        educations: JSON.parse(JSON.stringify(educations)),
        certifications: JSON.parse(JSON.stringify(certifications)),
        skills: JSON.parse(JSON.stringify(skills)),
        achievements: JSON.parse(JSON.stringify(achievements)),
        settings: settings ? JSON.parse(JSON.stringify(settings)) : null,
        projectCount: projects.length,
        winsCount,
      };
    } catch {
      /* fallback below */
    }
  }
  const fallbackProjects = getMemoryProjects()
    .filter((p) => p.visible)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  return {
    projects: fallbackProjects,
    experiences: [],
    educations: [],
    certifications: [],
    skills: [],
    achievements: [],
    settings: null,
    projectCount: fallbackProjects.length,
    winsCount: 3,
  };
}

export default async function HomePage() {
  const {
    projects,
    experiences,
    educations,
    certifications,
    skills,
    achievements,
    settings,
    projectCount,
    winsCount,
  } = await getInitialData();

  return (
    <>
      <Navbar />
      <main id="main-content">
        <Hero />
        <About
          initialSettings={settings}
          initialProjectCount={projectCount}
          initialWins={winsCount}
        />
        <Projects initialProjects={projects} />
        <Skills initialSkills={skills} />
        <Achievements initialAchievements={achievements} />
        <Experience initialExperience={experiences} />
        <Education initialEducation={educations} />
        <Certification initialCertifications={certifications} />
        <FAQ />
        <Contact />
      </main>
      <Footer />
      <PageTransitions />
    </>
  );
}
