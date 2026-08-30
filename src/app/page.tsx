import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Projects from "@/components/Projects";
import Skills from "@/components/Skills";
import Achievements from "@/components/Achievements";
import Background from "@/components/Background";
import Education from "@/components/Education";
import Certification from "@/components/Certification";
import FAQ from "@/components/FAQ";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import PageTransitions from "@/components/PageTransitions";
import { getMemoryProjects } from "@/lib/projectStore";

export const revalidate = 60; // revalidate homepage every 60s

async function getInitialProjects() {
  if (process.env.DATABASE_URL) {
    try {
      const { prisma } = await import("@/lib/prisma");
      const rows = await prisma.project.findMany({
        where: { visible: true },
        orderBy: { displayOrder: "asc" },
      });
      return JSON.parse(JSON.stringify(rows));
    } catch {
      /* fallback to memory store below */
    }
  }
  return getMemoryProjects().filter((p) => p.visible).sort((a, b) => a.displayOrder - b.displayOrder);
}

export default async function HomePage() {
  const projects = await getInitialProjects();

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
        <Education />
        <Certification />
        <FAQ />
        <Contact />
      </main>
      <Footer />
      <PageTransitions />
    </>
  );
}
