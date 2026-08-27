"use client";

import { useEffect, useRef, useState, FormEvent } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Contact() {
  const [profile, setProfile] = useState<{
    name?: string;
    email?: string;
    phone?: string;
    whatsapp?: string;
    location?: string;
    linkedin?: string;
    github?: string;
    facebook?: string;
    instagram?: string;
    resumePath?: string;
  }>({});
  const socials = [
    { label: "LinkedIn", href: profile.linkedin },
    { label: "GitHub", href: profile.github },
    { label: "Facebook", href: profile.facebook },
    { label: "Instagram", href: profile.instagram },
    { label: "WhatsApp", href: profile.whatsapp ? `https://wa.me/${profile.whatsapp}` : "" },
  ].filter((s) => s.href);
  useEffect(() => {
    fetch("/api/settings")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;
        setProfile({
          name: data.name || undefined,
          email: data.email || undefined,
          phone: data.phone || undefined,
          whatsapp: data.whatsapp || undefined,
          location: data.location || undefined,
          linkedin: data.linkedin || undefined,
          github: data.github || undefined,
          facebook: data.facebook || undefined,
          instagram: data.instagram || undefined,
          resumePath: data.resumePath || undefined,
        });
      })
      .catch(() => {});
  }, []);

  const sectionRef = useRef<HTMLElement>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  useEffect(() => {
    const ctx = gsap.context(() => {
      const prefersReduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      if (prefersReduced) return;

      gsap.fromTo(
        Array.from(sectionRef.current?.querySelectorAll(".contact-reveal") ?? []),
        { opacity: 0, y: 36 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 70%",
            once: true,
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Failed");
      setStatus("success");
      setForm({ name: "", email: "", message: "" });
    } catch {
      setStatus("error");
    }
  };

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="section-padding border-t border-border"
    >
      <div className="container-main">
        <p className="contact-reveal text-xs uppercase tracking-[0.2em] text-muted mb-10 md:mb-16">
          Contact
        </p>

        <h2 className="contact-reveal heading-section mb-6 md:mb-8">
          Let&apos;s
          <br />
          build
          <br />
          something.
        </h2>

        <p className="contact-reveal body-text max-w-md mb-14 md:mb-20">
          Have an idea, project, or opportunity? Let&apos;s talk.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          <form
            onSubmit={handleSubmit}
            className="contact-reveal lg:col-span-7 space-y-6"
          >
            <div>
              <label htmlFor="name" className="text-xs uppercase tracking-[0.12em] text-muted block mb-1">
                Name
              </label>
              <input
                id="name"
                type="text"
                required
                placeholder="Name"
                autoComplete="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-transparent border-b border-border py-3 text-primary placeholder:text-muted focus:outline-none focus:border-strong-border transition-colors"
              />
            </div>
            <div>
              <label htmlFor="email" className="text-xs uppercase tracking-[0.12em] text-muted block mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                placeholder="Email"
                autoComplete="email"
                inputMode="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-transparent border-b border-border py-3 text-primary placeholder:text-muted focus:outline-none focus:border-strong-border transition-colors"
              />
            </div>
            <div>
              <label htmlFor="message" className="text-xs uppercase tracking-[0.12em] text-muted block mb-1">
                Message
              </label>
              <textarea
                id="message"
                required
                rows={4}
                placeholder="Message"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full bg-transparent border-b border-border py-3 text-primary placeholder:text-muted focus:outline-none focus:border-strong-border transition-colors resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={status === "loading"}
              className="mt-4 text-sm font-semibold tracking-wide text-primary border border-strong-border px-8 py-3 hover:bg-primary hover:text-bg transition-colors disabled:opacity-50 cursor-pointer"
            >
              {status === "loading"
                ? "Sending..."
                : status === "success"
                ? "Sent"
                : "Send"}
            </button>

            {status === "error" && (
              <p className="text-sm text-secondary">
                Something went wrong. Please email me directly.
              </p>
            )}
            {status === "success" && (
              <p className="text-sm text-secondary">
                Message received. I&apos;ll get back to you soon.
              </p>
            )}
          </form>

          <div className="contact-reveal lg:col-span-5 space-y-8">
            <div>
              <p className="text-xs uppercase tracking-[0.15em] text-muted mb-2">
                Email
              </p>
              <a
                href={`mailto:${profile.email}`}
                className="text-primary hover:opacity-70 transition-opacity"
              >
                {profile.email}
              </a>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.15em] text-muted mb-2">
                Phone
              </p>
              <a
                href={profile.phone ? `tel:${profile.phone.replace(/\s/g, "")}` : undefined}
                className="text-primary hover:opacity-70 transition-opacity"
              >
                {profile.phone}
              </a>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.15em] text-muted mb-2">
                Location
              </p>
              <p className="text-secondary">{profile.location}</p>
            </div>
            <div className="flex flex-wrap gap-5 pt-4">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-secondary hover:text-primary transition-colors"
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
