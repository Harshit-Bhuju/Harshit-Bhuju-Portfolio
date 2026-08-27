"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import AdminLogoutButton from "@/components/AdminLogoutButton";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState("");
  const [counts, setCounts] = useState({ total: 0, visible: 0 });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/");
    }
  }, [status, router]);

  useEffect(() => {
    fetch("/api/projects?all=1", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (Array.isArray(data)) {
          setCounts({
            total: data.length,
            visible: data.filter((p: { visible?: boolean }) => p.visible)
              .length,
          });
        }
      })
      .catch(() => {});
  }, [syncResult]);

  const runSync = async () => {
    setSyncing(true);
    setSyncResult("");
    try {
      const res = await fetch("/api/projects/sync", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setSyncResult(
          data.error
            ? `Sync failed: ${data.error}${data.detail ? ` — ${data.detail}` : ""}`
            : "Sync failed."
        );
      } else {
        setSyncResult(
          `Fetched ${data.fetched ?? 0} repos · created ${data.created ?? 0} · updated ${data.updated ?? 0}`
        );
      }
    } catch {
      setSyncResult("Network error during sync.");
    } finally {
      setSyncing(false);
    }
  };

  if (status === "loading") {
    return (
      <main className="min-h-screen bg-bg text-primary flex items-center justify-center">
        <p className="text-sm text-secondary">Loading…</p>
      </main>
    );
  }

  if (!session) return null;

  return (
    <main className="min-h-screen bg-bg text-primary">
      <div className="container-main py-16 md:py-20">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-12">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Admin</h1>
            <p className="text-sm text-secondary mt-1">
              {session.user?.name || session.user?.email}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/"
              className="text-sm text-secondary hover:text-primary transition-colors"
            >
              ← Site
            </Link>
            <AdminLogoutButton />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="border border-border p-6 flex flex-col hover:border-strong-border transition-colors">
            <h2 className="text-lg font-semibold mb-2">Projects</h2>
            <p className="text-sm text-secondary mb-4 flex-1">
              Create, edit, preview, upload media (images &amp; video), and
              publish. Visible projects appear on the homepage and case studies.
            </p>
            <p className="text-xs text-muted mb-4">
              {counts.visible} visible · {counts.total} total
            </p>
            <Link
              href="/admin/projects"
              className="text-sm font-semibold border border-strong-border px-5 py-2.5 hover:bg-[var(--color-text)] hover:text-[var(--color-bg)] transition-colors inline-block w-fit"
            >
              Manage projects
            </Link>
          </div>

          <div className="border border-border p-6 flex flex-col hover:border-strong-border transition-colors">
            <h2 className="text-lg font-semibold mb-2">Site content</h2>
            <p className="text-sm text-secondary mb-4 flex-1">
              Profile, contact, about, education, experience, skills,
              achievements, certifications — all from the database.
            </p>
            <Link
              href="/admin/content"
              className="text-sm font-semibold border border-strong-border px-5 py-2.5 hover:bg-[var(--color-text)] hover:text-[var(--color-bg)] transition-colors inline-block w-fit"
            >
              Manage content
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="border border-border p-6 flex flex-col">
            <h2 className="text-lg font-semibold mb-2">GitHub sync</h2>
            <p className="text-sm text-secondary mb-4 flex-1">
              Pulls public repos. New ones start hidden so you can edit and
              publish when ready.
            </p>
            <button
              type="button"
              onClick={runSync}
              disabled={syncing}
              className="text-sm font-semibold border border-strong-border px-6 py-2.5 hover:bg-[var(--color-text)] hover:text-[var(--color-bg)] transition-colors disabled:opacity-50 cursor-pointer w-fit"
            >
              {syncing ? "Syncing…" : "Sync from GitHub"}
            </button>
            {syncResult && (
              <p className="text-xs text-secondary mt-4 border border-border px-3 py-2">
                {syncResult}
              </p>
            )}
          </div>

          <div className="border border-border p-6">
            <h2 className="text-lg font-semibold mb-3">Media</h2>
            <p className="text-sm text-secondary mb-2">
              Upload thumbnails, gallery images, and project videos from the
              project editor. Profile photo and resume PDF from{" "}
              <Link href="/admin/content" className="underline hover:text-primary">
                Site content
              </Link>
              .
            </p>
            <p className="text-xs text-muted">
              Files go to Supabase Storage bucket <code>portfolio</code>. Allow
              image/*, video/mp4, video/webm, application/pdf MIME types.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
