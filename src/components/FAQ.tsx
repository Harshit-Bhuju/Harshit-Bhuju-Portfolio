"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const faqs = [
  {
    question: "What web development services does Harshit Bhuju provide?",
    answer: (
      <>
        Harshit Bhuju specializes in building modern full-stack web applications, interactive user interfaces, and responsive digital products. From database architecture and backend APIs to polished frontend components, he delivers scalable software tailored for businesses and clients worldwide.
      </>
    ),
  },
  {
    question: "What technology stack and frameworks do you use for web development?",
    answer: (
      <>
        Harshit primarily builds applications using{" "}
        <a
          href="https://nextjs.org"
          target="_blank"
          rel="noopener noreferrer"
          className="underline text-primary hover:text-secondary transition-colors"
        >
          Next.js
        </a>
        ,{" "}
        <a
          href="https://react.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="underline text-primary hover:text-secondary transition-colors"
        >
          React
        </a>
        , and{" "}
        <a
          href="https://www.typescriptlang.org"
          target="_blank"
          rel="noopener noreferrer"
          className="underline text-primary hover:text-secondary transition-colors"
        >
          TypeScript
        </a>
        . For data storage and management, he utilizes{" "}
        <a
          href="https://www.postgresql.org"
          target="_blank"
          rel="noopener noreferrer"
          className="underline text-primary hover:text-secondary transition-colors"
        >
          PostgreSQL
        </a>{" "}
        and Prisma ORM along with modern CSS frameworks like Tailwind CSS.
      </>
    ),
  },
  {
    question: "Where is Harshit Bhuju based and how can I collaborate?",
    answer: (
      <>
        Harshit is based in Banepa, Nepal, and is currently pursuing his BTech in Artificial Intelligence at{" "}
        <a
          href="https://ku.edu.np"
          target="_blank"
          rel="noopener noreferrer"
          className="underline text-primary hover:text-secondary transition-colors"
        >
          Kathmandu University
        </a>
        . He collaborates with remote teams and international clients. You can get in touch via email or through LinkedIn and GitHub.
      </>
    ),
  },
  {
    question: "How do you ensure performance and web accessibility standards?",
    answer: (
      <>
        All applications are developed following{" "}
        <a
          href="https://www.w3.org/TR/WCAG21/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline text-primary hover:text-secondary transition-colors"
        >
          W3C WCAG 2.1
        </a>{" "}
        accessibility guidelines and optimized for{" "}
        <a
          href="https://web.dev/vitals/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline text-primary hover:text-secondary transition-colors"
        >
          Google Web Vitals
        </a>
        . This guarantees fast page load speeds, screen reader compatibility, and seamless mobile responsiveness across all devices.
      </>
    ),
  },
];

export default function FAQ() {
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const prefersReduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      if (prefersReduced || !containerRef.current) return;

      gsap.fromTo(
        containerRef.current.children,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.85,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 80%",
            once: true,
          },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="faq"
      className="section-padding border-t border-border"
      aria-label="Frequently Asked Questions"
    >
      <div className="container-main">
        <p className="text-xs uppercase tracking-[0.2em] text-muted mb-4">
          Questions & Insights
        </p>
        <h2 className="heading-section mb-12 md:mb-16">
          Frequently Asked Questions
        </h2>

        <div ref={containerRef} className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="p-6 md:p-8 border border-border bg-surface/40 hover:border-strong transition-colors flex flex-col justify-between"
            >
              <div>
                <h3 className="text-lg md:text-xl font-semibold tracking-tight text-primary mb-3">
                  {faq.question}
                </h3>
                <p className="text-sm md:text-base text-secondary leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
