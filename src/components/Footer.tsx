"use client";
import { useEffect, useState } from "react";

export default function Footer() {
  const [profile, setProfile] = useState<{
    name?: string;
    email?: string;
    phone?: string;
    whatsapp?: string;
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
    { label: "Email", href: profile.email ? `mailto:${profile.email}` : "" },
    { label: "Phone", href: profile.phone ? `tel:${String(profile.phone).replace(/\s/g, "")}` : "" },
  ].filter((s) => s.href);
  useEffect(() => {
    fetch("/api/settings")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;
        setProfile({ ...data, resumePath: data.resumePath || undefined });
      })
      .catch(() => {});
  }, []);

  return (
    <footer role="contentinfo" className="border-t border-border py-12 md:py-16">
      <div className="container-main flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <p className="text-sm font-semibold tracking-wide text-primary mb-1">
            HARSHIT BHUJU
          </p>
          <p className="text-xs text-muted">
            Frontend Developer · Competitive Tech Builder
          </p>
        </div>

        <div className="flex flex-wrap gap-5 text-xs text-secondary">
          {socials.map((s) => {
            const href = s.href || "#";
            return (
              <a
                key={s.label}
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="hover:text-primary transition-colors"
              >
                {s.label}
              </a>
            );
          })}
        </div>

        <p className="text-xs text-muted">
          © {new Date().getFullYear()} Harshit Bhuju
        </p>
      </div>
    </footer>
  );
}
