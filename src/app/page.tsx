import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Projects from "@/components/Projects";
import Skills from "@/components/Skills";
import Achievements from "@/components/Achievements";
import Background from "@/components/Background";
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
      const [projects, experiences, educations, certifications] = await Promise.all([
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
      ]);
      return {
        projects: JSON.parse(JSON.stringify(projects)),
        experiences: JSON.parse(JSON.stringify(experiences)),
        educations: JSON.parse(JSON.stringify(educations)),
        certifications: JSON.parse(JSON.stringify(certifications)),
      };
    } catch {
      /* fallback below */
    }
  }
  return {
    projects: getMemoryProjects().filter((p) => p.visible).sort((a, b) => a.displayOrder - b.displayOrder),
    experiences: [],
    educations: [],
    certifications: [],
  };
}

export default async function HomePage() {
  const { projects, experiences, educations, certifications } = await getInitialData();

  return (
    <>
      <Navbar />
      <main id="main-content">
        <Hero />
        <About />
        <Projects initialProjects={projects} />
        <Skills />
        <Achievements />
        <Background />
        <Education initialEducation={educations} />
        <Experience initialExperience={experiences} />
        <Certification initialCertifications={certifications} />
        <FAQ />
        <Contact />
      </main>
      <Footer />
      <PageTransitions />
    </>
  );
}
