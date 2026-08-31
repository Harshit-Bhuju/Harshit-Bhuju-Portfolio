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
import {
  DEFAULT_PROJECTS,
  DEFAULT_ACHIEVEMENTS,
  DEFAULT_EXPERIENCES,
  DEFAULT_EDUCATIONS,
  DEFAULT_CERTIFICATIONS,
  DEFAULT_SKILLS,
  DEFAULT_SETTINGS,
} from "@/lib/portfolioFallback";

export const revalidate = 60; // revalidate homepage every 60s

async function getInitialData() {
  let dbProjects: any[] = [];
  let dbExperiences: any[] = [];
  let dbEducations: any[] = [];
  let dbCertifications: any[] = [];
  let dbSkills: any[] = [];
  let dbAchievements: any[] = [];
  let dbSettings: any = null;

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

      dbProjects = JSON.parse(JSON.stringify(projects));
      dbExperiences = JSON.parse(JSON.stringify(experiences));
      dbEducations = JSON.parse(JSON.stringify(educations));
      dbCertifications = JSON.parse(JSON.stringify(certifications));
      dbSkills = JSON.parse(JSON.stringify(skills));
      dbAchievements = JSON.parse(JSON.stringify(achievements));
      dbSettings = settings ? JSON.parse(JSON.stringify(settings)) : null;
    } catch {
      /* fallback below */
    }
  }

  const finalProjects = dbProjects.length > 0 ? dbProjects : DEFAULT_PROJECTS;
  const finalExperiences = dbExperiences.length > 0 ? dbExperiences : DEFAULT_EXPERIENCES;
  const finalEducations = dbEducations.length > 0 ? dbEducations : DEFAULT_EDUCATIONS;
  const finalCertifications = dbCertifications.length > 0 ? dbCertifications : DEFAULT_CERTIFICATIONS;
  const finalSkills = dbSkills.length > 0 ? dbSkills : DEFAULT_SKILLS;
  const finalAchievements = dbAchievements.length > 0 ? dbAchievements : DEFAULT_ACHIEVEMENTS;
  const finalSettings = dbSettings || DEFAULT_SETTINGS;

  const winsCount = finalAchievements.filter((a: any) =>
    String(a.placement || "").toUpperCase().includes("1ST")
  ).length;

  return {
    projects: finalProjects,
    experiences: finalExperiences,
    educations: finalEducations,
    certifications: finalCertifications,
    skills: finalSkills,
    achievements: finalAchievements,
    settings: finalSettings,
    projectCount: finalProjects.length,
    winsCount,
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
