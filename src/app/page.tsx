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

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main id="main-content">
        <Hero />
        <About />
        <Projects />
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
