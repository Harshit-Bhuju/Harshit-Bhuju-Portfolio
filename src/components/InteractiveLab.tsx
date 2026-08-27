"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Modal from "./Modal";
import { useToast } from "@/context/ToastContext";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const EASING_OPTIONS = [
  {
    label: "Friday 4:59 PM Deploy",
    ease: "power3.out",
    desc: "Speedrunning straight to production before anyone notices",
    tag: "SPEEDRUN",
  },
  {
    label: "CSS Centering a DIV",
    ease: "bounce.out",
    desc: "Bouncing violently between margin:auto, flexbox and crying",
    tag: "CSS_TRAUMA",
  },
  {
    label: "Client 'One Quick Change'",
    ease: "elastic.out(1, 0.35)",
    desc: "That small tweak that oscillates forever into next month",
    tag: "SCOPE_CREEP",
  },
  {
    label: "StackOverflow Copy-Paste",
    ease: "back.out(2.5)",
    desc: "Overshoots expectations, breaks 2 things, somehow compiles",
    tag: "CTRL_C_CTRL_V",
  },
  {
    label: "AI Fixing My Bug",
    ease: "expo.inOut",
    desc: "Rewrites entire codebase in 200ms and introduces 3 new philosophies",
    tag: "AI_CHAOS",
  },
];

const MEME_FACTS = [
  {
    id: "1",
    title: "“It works on my machine”",
    category: "Facts",
    desc: "The gold-standard certification since 1995. We will simply ship your laptop to the client.",
  },
  {
    id: "2",
    title: "Centering a DIV horizontally & vertically",
    category: "CSS",
    desc: "Legend says senior engineers have spent 14 years trying to remember if it's place-items:center or justify-self:center.",
  },
  {
    id: "3",
    title: "“git push --force”",
    category: "Git",
    desc: "The ultimate power move to delete everyone else's weekend plans in a single keystroke.",
  },
  {
    id: "4",
    title: "TypeScript 'any' keyword",
    category: "Memes",
    desc: "The universal escape hatch when deadlines are in 10 minutes and types are just a philosophical construct.",
  },
  {
    id: "5",
    title: "TODO: Refactor this tomorrow",
    category: "Facts",
    desc: "Written on August 14, 2019. It is now load-bearing legacy code that will outlive human civilization.",
  },
  {
    id: "6",
    title: "console.log('here 123456')",
    category: "Memes",
    desc: "The pinnacle of high-tech browser debugging tools. No breakpoints required.",
  },
  {
    id: "7",
    title: "99 little bugs in the code...",
    category: "Memes",
    desc: "Take one down, patch it around... 147 critical bugs in the code.",
  },
  {
    id: "8",
    title: "Dark Mode = +200% Developer IQ",
    category: "Facts",
    desc: "Scientifically proven that dark theme makes code 10x faster and prevents your eyes from burning.",
  },
];

const FUNNY_SNIPPETS = [
  'git commit -m "fixed tiny bug, please do not review"',
  '// TODO: I have no idea why this works but do not delete',
  'const isProductionReady = Math.random() > 0.1;',
  'npm install everything-known-to-mankind',
];

export default function InteractiveLab() {
  const sectionRef = useRef<HTMLElement>(null);
  const magneticBtnRef = useRef<HTMLButtonElement>(null);
  const physicsBoxRef = useRef<HTMLDivElement>(null);
  const chipsRef = useRef<HTMLDivElement>(null);

  const { showToast } = useToast();

  // States
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"expect" | "reality" | "rules">("expect");
  const [selectedEase, setSelectedEase] = useState(EASING_OPTIONS[0]);
  const [deployState, setDeployState] = useState<"idle" | "loading" | "success">("idle");
  const [snippetIndex, setSnippetIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [understandEffect, setUnderstandEffect] = useState(false);

  // Entrance reveal
  useEffect(() => {
    const ctx = gsap.context(() => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      gsap.fromTo(
        Array.from(sectionRef.current?.querySelectorAll(".lab-reveal") ?? []),
        { opacity: 0, y: 28 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.07,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            once: true,
          },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  // Magnetic Button Effect
  useEffect(() => {
    const btn = magneticBtnRef.current;
    if (!btn || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const xTo = gsap.quickTo(btn, "x", { duration: 0.3, ease: "power3.out" });
    const yTo = gsap.quickTo(btn, "y", { duration: 0.3, ease: "power3.out" });

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { left, top, width, height } = btn.getBoundingClientRect();
      const x = clientX - (left + width / 2);
      const y = clientY - (top + height / 2);
      xTo(x * 0.4);
      yTo(y * 0.4);
    };

    const handleMouseLeave = () => {
      xTo(0);
      yTo(0);
    };

    btn.addEventListener("mousemove", handleMouseMove);
    btn.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      btn.removeEventListener("mousemove", handleMouseMove);
      btn.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  // Run Physics Simulator
  const playPhysicsDemo = () => {
    if (!physicsBoxRef.current) return;
    gsap.killTweensOf(physicsBoxRef.current);
    gsap.fromTo(
      physicsBoxRef.current,
      { x: 0, scale: 0.9, rotate: -6 },
      {
        x: () => {
          const parent = physicsBoxRef.current?.parentElement;
          return parent ? parent.clientWidth - 85 : 220;
        },
        scale: 1,
        rotate: 0,
        duration: 1.1,
        ease: selectedEase.ease,
      }
    );
  };

  const resetPhysicsDemo = () => {
    if (!physicsBoxRef.current) return;
    gsap.killTweensOf(physicsBoxRef.current);
    gsap.to(physicsBoxRef.current, {
      x: 0,
      scale: 1,
      rotate: 0,
      duration: 0.4,
      ease: "power2.out",
    });
  };

  // Morphing deploy button handler
  const handleDeploy = () => {
    if (deployState !== "idle") return;
    setDeployState("loading");
    showToast("Deploying to Prod on Friday...", "info", "Praying to server deities that tests don't fail.");

    setTimeout(() => {
      setDeployState("success");
      showToast("🚀 Production is ALIVE!", "success", "Zero bugs detected (mostly because we didn't write unit tests).");

      setTimeout(() => {
        setDeployState("idle");
      }, 2800);
    }, 1900);
  };

  // Copy code snippet
  const handleCopy = () => {
    const current = FUNNY_SNIPPETS[snippetIndex];
    navigator.clipboard.writeText(current);
    setCopied(true);
    showToast("Copied questionable code to clipboard", "success", current);
    setTimeout(() => setCopied(false), 2000);
    // Cycle to next funny snippet
    setSnippetIndex((prev) => (prev + 1) % FUNNY_SNIPPETS.length);
  };

  // Filtered facts
  const filteredFacts = useMemo(() => {
    return MEME_FACTS.filter((item) => {
      const matchesQuery =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.desc.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "All" || item.category === selectedCategory;
      return matchesQuery && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const categories = ["All", "Facts", "Memes", "CSS", "Git"];

  // Stagger chips animation
  const playStagger = () => {
    if (!chipsRef.current) return;
    const items = chipsRef.current.querySelectorAll(".demo-chip");
    gsap.fromTo(
      items,
      { opacity: 0, y: 16, scale: 0.9 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.4,
        stagger: 0.05,
        ease: "back.out(1.5)",
      }
    );
    showToast("Developer Mindstate Shuffled", "info", "Reorganizing 300 tabs in Chrome.");
  };

  return (
    <section
      ref={sectionRef}
      id="lab"
      className="section-padding border-t border-border"
    >
      <div className="container-main">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4 mb-12 md:mb-16">
          <div>
            <p className="lab-reveal text-xs uppercase tracking-[0.2em] text-muted mb-4">
              Interactive Lab · Dev Sandbox
            </p>
            <h2 className="lab-reveal heading-section max-w-3xl">
              UI Playground
            </h2>
          </div>
          <p className="lab-reveal body-text max-w-md text-sm md:text-base">
            Click random buttons, trigger Friday 5:00 PM deployments, simulate CSS
            centering trauma, and discover unverified developer facts.
          </p>
        </div>

        {/* 6-Grid Bento Architecture */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* 1. Dev Panic Physics Simulator (Span 7) */}
          <div className="lab-reveal lg:col-span-7 border border-border bg-surface p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <span className="text-xs uppercase tracking-[0.15em] text-muted">
                  Panic Physics Simulator · Easing Curves
                </span>
                <span className="text-xs text-primary font-mono border border-border bg-bg px-2 py-0.5">
                  {selectedEase.tag}
                </span>
              </div>
              <p className="text-sm text-secondary mb-6 leading-relaxed">
                Pick a developer scenario to simulate its real-world physical trajectory.
              </p>

              {/* Curve Selectors */}
              <div className="flex flex-wrap gap-2 mb-6">
                {EASING_OPTIONS.map((opt) => (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => setSelectedEase(opt)}
                    className={`text-xs px-3 py-1.5 border transition-all duration-150 cursor-pointer ${
                      selectedEase.label === opt.label
                        ? "border-strong bg-elevated text-primary font-semibold"
                        : "border-border text-secondary hover:border-strong hover:text-primary"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Trajectory Stage */}
              <div className="relative h-24 bg-bg border border-border p-3 flex items-center overflow-hidden mb-6">
                {/* Guide lines */}
                <div className="absolute inset-0 flex items-center justify-between px-6 opacity-20 pointer-events-none">
                  <div className="h-full w-px bg-white border-dashed" />
                  <div className="h-full w-px bg-white border-dashed" />
                  <div className="h-full w-px bg-white border-dashed" />
                </div>

                <div
                  ref={physicsBoxRef}
                  className="w-16 h-12 bg-elevated border border-strong flex items-center justify-center text-primary font-mono text-xs font-semibold shadow-lg select-none px-2 text-center"
                >
                  {selectedEase.tag}
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border/50">
              <span className="text-xs text-secondary italic">“{selectedEase.desc}”</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={resetPhysicsDemo}
                  className="btn-secondary text-xs px-3.5 py-2"
                >
                  Rewind
                </button>
                <button
                  type="button"
                  onClick={playPhysicsDemo}
                  className="btn-primary text-xs px-4 py-2"
                >
                  Launch Event →
                </button>
              </div>
            </div>
          </div>

          {/* 2. Production Chaos Toaster (Span 5) */}
          <div className="lab-reveal lg:col-span-5 border border-border bg-surface p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs uppercase tracking-[0.15em] text-muted">
                  Chaos Notification Center
                </span>
                <span className="text-[10px] uppercase tracking-wider text-muted border border-border px-2 py-0.5">
                  Top-Right Stack
                </span>
              </div>
              <p className="text-sm text-secondary mb-6 leading-relaxed">
                Dispatch realistic developer emergency notifications to the top-right corner.
              </p>

              <div className="flex flex-col gap-2.5 mb-6">
                <button
                  type="button"
                  onClick={() =>
                    showToast(
                      "Deploy Succeeded on Friday 5:00 PM",
                      "success",
                      "Server is on fire, but in a very aesthetic monochrome way."
                    )
                  }
                  className="btn-secondary text-xs px-4 py-2.5 justify-start text-left"
                >
                  <span className="text-white mr-2">🔥</span>
                  Friday 5 PM Deploy Trigger
                </button>
                <button
                  type="button"
                  onClick={() =>
                    showToast(
                      "Emergency Caffeine Level: 100%",
                      "info",
                      "StackOverflow tabs condensed from 48 down to 47."
                    )
                  }
                  className="btn-secondary text-xs px-4 py-2.5 justify-start text-left"
                >
                  <span className="text-secondary mr-2">☕</span>
                  Inject Developer Fuel
                </button>
                <button
                  type="button"
                  onClick={() =>
                    showToast(
                      "Client: 'Just one small tweak'",
                      "warning",
                      "Minor scope change: Completely rewrite database schema by 9 AM tomorrow."
                    )
                  }
                  className="btn-secondary text-xs px-4 py-2.5 justify-start text-left"
                >
                  <span className="text-muted mr-2">🚨</span>
                  Receive Client 'Quick Feedback'
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border/50 text-xs text-muted">
              <span>Auto-dismisses in 4s</span>
              <span>100% Panic Resistant</span>
            </div>
          </div>

          {/* 3. Verified Developer Fact-Checks & Memes (Span 6) */}
          <div className="lab-reveal lg:col-span-6 border border-border bg-surface p-6 sm:p-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs uppercase tracking-[0.15em] text-muted">
                Developer Truths & Meme Encyclopedia
              </span>
              <span className="text-[10px] font-mono text-muted border border-border px-1.5 py-0.5">
                FACT_CHECK
              </span>
            </div>

            {/* Input Search */}
            <div className="relative mb-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search memes (e.g. 'machine', 'CSS', 'TODO', 'any')..."
                className="w-full bg-bg border border-border px-3.5 py-2.5 text-sm text-primary placeholder:text-muted focus:outline-none focus:border-strong-border transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted hover:text-primary cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Category Tags */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-[11px] px-2.5 py-1 border transition-colors cursor-pointer ${
                    selectedCategory === cat
                      ? "border-strong bg-elevated text-primary font-semibold"
                      : "border-border text-secondary hover:text-primary"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Filter Results */}
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {filteredFacts.length > 0 ? (
                filteredFacts.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => showToast(`Truth verified: ${item.title}`, "info", item.desc)}
                    className="p-3 border border-border bg-bg hover:border-strong hover:bg-elevated transition-all duration-150 cursor-pointer flex items-start justify-between gap-3"
                  >
                    <div>
                      <p className="text-xs font-semibold text-primary">{item.title}</p>
                      <p className="text-[11px] text-secondary mt-1 leading-relaxed">{item.desc}</p>
                    </div>
                    <span className="text-[10px] text-muted border border-border px-1.5 py-0.5 shrink-0">
                      {item.category}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted text-center py-6">
                  No memes found for &quot;{searchQuery}&quot;. Have you tried turning it off and on again?
                </p>
              )}
            </div>
          </div>

          {/* 4. Morphing Micro-Interactions & Panic Controls (Span 6) */}
          <div className="lab-reveal lg:col-span-6 border border-border bg-surface p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs uppercase tracking-[0.15em] text-muted">
                  Interactive Panic Controls
                </span>
                <span className="text-xs text-muted">Don't Panic</span>
              </div>
              <p className="text-sm text-secondary mb-6 leading-relaxed">
                Stateful Friday deployer, cursor-dodging magnetic button, and emergency commit message generator.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {/* Morphing Deploy Button */}
                <div className="border border-border bg-bg p-4 flex flex-col justify-between">
                  <span className="text-[11px] text-muted mb-2 block">State Morphing</span>
                  <button
                    type="button"
                    onClick={handleDeploy}
                    disabled={deployState === "loading"}
                    className={`btn-primary text-xs px-4 py-2.5 w-full ${
                      deployState === "success" ? "!bg-surface !border-white !text-white" : ""
                    }`}
                  >
                    {deployState === "idle" && "Deploy on Friday"}
                    {deployState === "loading" && (
                      <span className="inline-flex items-center gap-2">
                        <span className="animate-spin text-xs">⟳</span>
                        Praying to Cloud...
                      </span>
                    )}
                    {deployState === "success" && "✓ Miraculously Live"}
                  </button>
                </div>

                {/* Magnetic Hover Button */}
                <div className="border border-border bg-bg p-4 flex flex-col justify-between">
                  <span className="text-[11px] text-muted mb-2 block">Magnetic Pull</span>
                  <button
                    ref={magneticBtnRef}
                    type="button"
                    onClick={() => showToast("🎯 Target Locked!", "success", "You managed to click the runaway button.")}
                    className="btn-secondary text-xs px-4 py-2.5 w-full cursor-pointer select-none"
                  >
                    Catch Me If You Can
                  </button>
                </div>
              </div>

              {/* Copy Snippet Bar */}
              <div>
                <span className="text-[11px] text-muted mb-1.5 block">Suspicious Git Commit Generator</span>
                <div className="border border-border bg-bg p-3 flex items-center justify-between gap-3">
                  <code className="text-xs font-mono text-secondary truncate">
                    {FUNNY_SNIPPETS[snippetIndex]}
                  </code>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="btn-secondary text-xs px-3 py-1.5 shrink-0"
                  >
                    {copied ? "COPIED ✓" : "COPY NEXT"}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border/50 text-xs text-muted mt-4">
              <span>StackOverflow Powered</span>
              <span>100% Bug-Free Promise*</span>
            </div>
          </div>

          {/* 5. Developer Mindstate Chips & Modal (Span 12) */}
          <div className="lab-reveal lg:col-span-12 border border-border bg-surface p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <span className="text-xs uppercase tracking-[0.15em] text-muted block mb-1">
                  Developer Reality Modal · Center Dialog
                </span>
                <p className="text-sm text-secondary">
                  Open the centered modal for an honest, unfiltered look at software engineering theory vs reality.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={playStagger}
                  className="btn-secondary text-xs sm:text-sm px-4 py-2"
                >
                  Shuffle Thoughts
                </button>
                <button
                  type="button"
                  onClick={() => setModalOpen(true)}
                  className="btn-primary text-xs sm:text-sm px-5 py-2"
                >
                  Open Honest Modal →
                </button>
              </div>
            </div>

            {/* Interactive chips */}
            <div ref={chipsRef} className="flex flex-wrap gap-2.5 pt-4 border-t border-border/50">
              {[
                "Ctrl+Z",
                "StackOverflow",
                "Coffee.js",
                "git blame someone_else",
                "404 Sleep Not Found",
                "It's a feature, not a bug",
                "console.log('why')",
                "Dark Mode = +50 IQ",
                "npm i everything",
                "Works on Localhost",
              ].map((chip) => (
                <span
                  key={chip}
                  onClick={() => showToast(`Mindstate: ${chip}`, "info", "Extremely relatable engineering condition.")}
                  className="demo-chip text-xs px-3 py-1.5 border border-border bg-bg text-secondary hover:border-strong hover:text-primary transition-all duration-150 cursor-pointer select-none"
                >
                  {chip}
                </span>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Honest Developer Modal (Dead Center via createPortal) */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Software Engineering: Theory vs Reality"
        maxWidth="max-w-2xl"
      >
        <div className="space-y-6">
          {/* Modal Tabs */}
          <div className="flex gap-2 border-b border-border pb-3">
            {[
              { id: "expect", label: "The Theory (Dream)" },
              { id: "reality", label: "The Reality (Truth)" },
              { id: "rules", label: "The Unwritten Laws" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`text-xs sm:text-sm px-3.5 py-1.5 border transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? "border-strong bg-elevated text-primary font-semibold"
                    : "border-transparent text-secondary hover:text-primary"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === "expect" && (
            <div className="space-y-3 text-sm text-secondary leading-relaxed">
              <p className="text-primary font-semibold">How we plan the project in sprint planning:</p>
              <ul className="list-disc pl-5 space-y-1 text-xs text-secondary">
                <li>Clean, modular microservices architecture with decoupled layers.</li>
                <li>100% unit test coverage with automated CI/CD pipeline.</li>
                <li>Complete, immaculate documentation before writing a single line of code.</li>
                <li>Everyone goes home by 5:00 PM and servers never crash.</li>
              </ul>
            </div>
          )}

          {activeTab === "reality" && (
            <div className="space-y-3 text-sm text-secondary leading-relaxed">
              <p className="text-primary font-semibold">How it actually looks 2 hours before deadline:</p>
              <ul className="list-disc pl-5 space-y-1 text-xs text-secondary">
                <li>One monolithic component with 14 useState calls and a 600-line useEffect.</li>
                <li>43 console.log(&apos;here&apos;), console.log(&apos;pls work&apos;), console.log(&apos;why God why&apos;).</li>
                <li>A StackOverflow answer from 2011 is holding the entire authentication system together.</li>
                <li>If you delete that one comment on line 42, the CSS collapses completely.</li>
              </ul>
            </div>
          )}

          {activeTab === "rules" && (
            <div className="space-y-3 text-xs text-secondary leading-relaxed">
              <div className="p-3 border border-border bg-bg">
                <strong className="text-primary block mb-1">Law 1: The First Rule of Code</strong>
                <span>If it works, do NOT touch it. Do not look at it. Do not breathe on it.</span>
              </div>
              <div className="p-3 border border-border bg-bg">
                <strong className="text-primary block mb-1">Law 2: The Blame Protocol</strong>
                <span>Always check <code className="text-primary">git blame</code> before complaining. (Warning: It might be past you).</span>
              </div>
              <div className="p-3 border border-border bg-bg">
                <strong className="text-primary block mb-1">Law 3: The Dark Mode Mandate</strong>
                <span>Light theme users are not to be trusted in production environments.</span>
              </div>
            </div>
          )}

          {/* Switch in Modal */}
          <div className="pt-4 border-t border-border flex items-center justify-between">
            <span className="text-xs text-secondary">
              I acknowledge that I have no idea why my code works
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={understandEffect}
              onClick={() => {
                setUnderstandEffect(!understandEffect);
                showToast(
                  understandEffect ? "Honesty revoked" : "Honesty acknowledged",
                  "info",
                  "You have accepted the chaotic nature of web development."
                );
              }}
              className={`relative w-10 h-5 border border-strong-border transition-colors cursor-pointer ${
                understandEffect ? "bg-primary" : "bg-transparent"
              }`}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 bg-secondary transition-transform duration-200 ${
                  understandEffect ? "left-0.5 translate-x-5 !bg-bg" : "left-0.5"
                }`}
              />
            </button>
          </div>

          {/* Action Footer */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="btn-secondary text-xs px-4 py-2"
            >
              Close [ESC]
            </button>
            <button
              type="button"
              onClick={() => {
                setModalOpen(false);
                showToast("Chaos Accepted", "success", "Ready to ship more bugs to production!");
              }}
              className="btn-primary text-xs px-5 py-2"
            >
              Accept Chaos & Ship
            </button>
          </div>
        </div>
      </Modal>
    </section>
  );
}
