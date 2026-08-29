"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import AdminLogoutButton from "@/components/AdminLogoutButton";
import { uploadClientFile } from "@/lib/uploadClient";

type Tab =
  | "settings"
  | "certifications"
  | "achievements"
  | "experience"
  | "education"
  | "skills";

interface ToastNotification {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

export default function AdminContentPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [tab, setTab] = useState<Tab>("certifications");
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "visible" | "hidden">("all");

  // Settings state
  const [settings, setSettings] = useState<Record<string, unknown>>({});
  const [settingsLoading, setSettingsLoading] = useState(false);

  // List & Edit state
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [isNew, setIsNew] = useState(false);

  // Topic/Skill temporary input tag
  const [topicInput, setTopicInput] = useState("");
  const [focusInput, setFocusInput] = useState("");
  const [pointInput, setPointInput] = useState("");

  const addToast = useCallback((message: string, type: "success" | "error" | "info" = "success") => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/");
    }
  }, [status, router]);

  const loadSettings = useCallback(async () => {
    setSettingsLoading(true);
    try {
      const res = await fetch("/api/settings", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setSettings(data || {});
      }
    } catch {
      addToast("Failed to load settings", "error");
    } finally {
      setSettingsLoading(false);
    }
  }, [addToast]);

  const loadList = useCallback(
    async (endpoint: string) => {
      setListLoading(true);
      try {
        const res = await fetch(`${endpoint}?all=1`, { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setItems(data);
          } else {
            setItems([]);
          }
        } else {
          setItems([]);
        }
      } catch {
        addToast(`Failed to load ${tab}`, "error");
        setItems([]);
      } finally {
        setListLoading(false);
      }
    },
    [tab, addToast]
  );

  useEffect(() => {
    if (status !== "authenticated") return;
    setEditing(null);
    setSearchQuery("");
    setStatusFilter("all");
    if (tab === "settings") {
      loadSettings();
    } else {
      loadList(`/api/${tab}`);
    }
  }, [tab, status, loadSettings, loadList]);

  // Upload handler for Supabase Storage (Direct-to-Supabase, bypassing Vercel 4.5MB limit)
  const handleUpload = async (
    file: File,
    folder: string,
    onSuccess: (url: string) => void,
    fieldKey: string
  ) => {
    setUploadingField(fieldKey);
    try {
      const publicUrl = await uploadClientFile(file, folder);
      onSuccess(publicUrl);
      addToast("File uploaded successfully to Supabase!", "success");
    } catch (err: unknown) {
      addToast(
        err instanceof Error ? err.message : "Upload failed",
        "error"
      );
    } finally {
      setUploadingField(null);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        const updated = await res.json();
        setSettings(updated);
        addToast("Site settings saved successfully!", "success");
      } else {
        const err = await res.json().catch(() => ({}));
        addToast(err.error || "Failed to save settings.", "error");
      }
    } catch {
      addToast("Network error while saving settings.", "error");
    } finally {
      setSaving(false);
    }
  };

  const saveItem = async () => {
    if (!editing) return;
    setSaving(true);
    const endpoint = `/api/${tab}`;
    try {
      const method = isNew ? "POST" : "PUT";
      const payload = { ...editing };
      if (isNew) delete payload.id;

      // Clean up array fields
      if (Array.isArray(payload.topics)) {
        payload.topics = payload.topics.map((s) => String(s).trim()).filter(Boolean);
      }
      if (Array.isArray(payload.points)) {
        payload.points = payload.points.map((s) => String(s).trim()).filter(Boolean);
      }
      if (Array.isArray(payload.galleryUrls)) {
        payload.galleryUrls = payload.galleryUrls.map((s) => String(s).trim()).filter(Boolean);
      }

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        addToast(isNew ? "Created successfully!" : "Updated successfully!", "success");
        setEditing(null);
        setIsNew(false);
        await loadList(endpoint);
      } else {
        const err = await res.json().catch(() => ({}));
        addToast(err.error || "Save failed.", "error");
      }
    } catch {
      addToast("Network error while saving.", "error");
    } finally {
      setSaving(false);
    }
  };

  const removeItem = async (id: number) => {
    if (!confirm("Are you sure you want to delete this item? This action cannot be undone.")) return;
    try {
      const res = await fetch(`/api/${tab}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        setItems((prev) => prev.filter((x) => x.id !== id));
        addToast("Item deleted successfully.", "success");
      } else {
        addToast("Failed to delete item.", "error");
      }
    } catch {
      addToast("Network error during deletion.", "error");
    }
  };

  const toggleItemVisibility = async (item: Record<string, unknown>) => {
    const nextVisibility = !item.visible;
    try {
      const res = await fetch(`/api/${tab}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...item, visible: nextVisibility }),
      });

      if (res.ok) {
        setItems((prev) =>
          prev.map((x) => (x.id === item.id ? { ...x, visible: nextVisibility } : x))
        );
        addToast(
          nextVisibility ? "Item is now visible on site" : "Item hidden from site",
          "info"
        );
      } else {
        addToast("Failed to update visibility.", "error");
      }
    } catch {
      addToast("Network error updating visibility.", "error");
    }
  };

  const emptyFor = (t: Tab): Record<string, unknown> => {
    const highestOrder = items.length > 0 ? Math.max(...items.map((i) => Number(i.displayOrder) || 0)) + 1 : 0;
    switch (t) {
      case "certifications":
        return {
          title: "",
          provider: "",
          date: "",
          topics: [],
          description: "",
          story: "",
          certificateUrl: "",
          visible: true,
          displayOrder: highestOrder,
        };
      case "achievements":
        return {
          placement: "",
          title: "",
          subtitle: "",
          year: new Date().getFullYear().toString(),
          description: "",
          story: "",
          certificateUrl: "",
          visible: true,
          displayOrder: highestOrder,
        };
      case "experience":
        return {
          role: "",
          company: "",
          location: "",
          dateRange: "",
          points: [],
          visible: true,
          displayOrder: highestOrder,
        };
      case "education":
        return {
          degree: "",
          field: "",
          school: "",
          dateRange: "",
          gpa: "",
          visible: true,
          displayOrder: highestOrder,
        };
      case "skills":
        return {
          category: "frameworks",
          name: "",
          visible: true,
          displayOrder: highestOrder,
        };
      default:
        return {};
    }
  };

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: "certifications", label: "Certifications" },
    { id: "achievements", label: "Achievements" },
    { id: "experience", label: "Experience" },
    { id: "education", label: "Education" },
    { id: "skills", label: "Skills" },
    { id: "settings", label: "Profile & Settings" },
  ];

  // Filtered items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "visible"
          ? item.visible === true
          : item.visible === false;

      if (!matchesStatus) return false;

      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      const title = String(item.title || item.degree || item.role || item.name || item.placement || "").toLowerCase();
      const subtitle = String(item.subtitle || item.school || item.company || item.category || item.provider || "").toLowerCase();
      const topics = Array.isArray(item.topics) ? item.topics.join(" ").toLowerCase() : "";

      return title.includes(query) || subtitle.includes(query) || topics.includes(query);
    });
  }, [items, searchQuery, statusFilter]);

  if (status === "loading") {
    return (
      <main className="min-h-screen bg-bg text-primary flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-sm font-medium text-secondary">Loading console…</p>
        </div>
      </main>
    );
  }

  if (!session) return null;

  return (
    <main className="min-h-screen bg-bg text-primary pb-24">
      {/* Toast Notification Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none px-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-xl border text-sm shadow-xl backdrop-blur-md transition-all animate-in fade-in slide-in-from-bottom-3 duration-200 ${
              t.type === "error"
                ? "bg-red-950/90 border-red-800/80 text-red-200"
                : t.type === "info"
                ? "bg-zinc-900/90 border-zinc-700/80 text-zinc-200"
                : "bg-emerald-950/90 border-emerald-800/80 text-emerald-200"
            }`}
          >
            <div className="flex items-center gap-2">
              <span>{t.type === "error" ? "⚠️" : t.type === "info" ? "ℹ️" : "✓"}</span>
              <p className="font-medium">{t.message}</p>
            </div>
            <button
              type="button"
              onClick={() => removeToast(t.id)}
              className="text-xs opacity-60 hover:opacity-100 transition-opacity p-1"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Top Header */}
      <header className="sticky top-0 z-30 border-b border-border/80 bg-bg/85 backdrop-blur-md">
        <div className="container-main py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-strong-border bg-surface text-sm font-bold shadow-inner">
              HB
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-semibold tracking-tight">Content Management</h1>
                <span className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                  Live DB
                </span>
              </div>
              <p className="text-xs text-secondary">
                Signed in as <span className="text-primary font-mono">{session.user?.name || session.user?.email}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/admin/projects"
              className="text-xs font-medium text-secondary hover:text-primary px-3 py-2 rounded-lg border border-border hover:border-strong-border transition-colors bg-surface/50"
            >
              Projects
            </Link>
            <Link
              href="/"
              target="_blank"
              className="text-xs font-medium text-secondary hover:text-primary px-3 py-2 rounded-lg border border-border hover:border-strong-border transition-colors bg-surface/50"
            >
              View Site ↗
            </Link>
            <AdminLogoutButton />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="container-main pt-8">
        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto no-scrollbar gap-2 p-1.5 bg-surface/60 border border-border/80 rounded-2xl mb-8">
          {tabs.map((t) => {
            const isActive = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setTab(t.id);
                  setEditing(null);
                  setIsNew(false);
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "bg-text text-bg shadow-sm font-bold"
                    : "text-secondary hover:text-primary hover:bg-surface"
                }`}
              >
                <span>{t.label}</span>
                {t.id !== "settings" && items.length > 0 && tab === t.id && (
                  <span
                    className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] ${
                      isActive ? "bg-bg/20 text-bg" : "bg-border text-secondary"
                    }`}
                  >
                    {items.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ─── TAB: SETTINGS & PROFILE ─────────────────────────── */}
        {tab === "settings" && (
          <div className="space-y-8 max-w-4xl">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h2 className="text-xl font-semibold tracking-tight">Site Settings & Bio</h2>
                <p className="text-xs text-secondary mt-1">
                  Manage personal profile, about sections, resume, and contact links
                </p>
              </div>
              <button
                type="button"
                onClick={saveSettings}
                disabled={saving || settingsLoading}
                className="flex items-center gap-2 px-5 py-2.5 bg-text text-bg rounded-xl text-xs font-semibold hover:opacity-90 active:scale-95 disabled:opacity-50 transition-all cursor-pointer shadow-sm"
              >
                {saving ? "Saving Changes…" : "Save Settings"}
              </button>
            </div>

            {settingsLoading ? (
              <div className="p-12 text-center text-sm text-secondary">Loading settings…</div>
            ) : (
              <div className="space-y-8">
                {/* 1. Identity Card */}
                <div className="p-6 rounded-2xl border border-border bg-surface/40 space-y-6">
                  <div className="flex items-center gap-2 border-b border-border/60 pb-3">
                    <span className="text-sm">👤</span>
                    <h3 className="text-sm font-semibold tracking-wide uppercase text-primary">
                      Identity & Header Info
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field
                      label="Full Name"
                      value={String(settings.name ?? "")}
                      onChange={(v) => setSettings((s) => ({ ...s, name: v }))}
                      placeholder="e.g. Harshit Bhuju"
                    />
                    <Field
                      label="First Name (Display Highlight)"
                      value={String(settings.firstName ?? "")}
                      onChange={(v) => setSettings((s) => ({ ...s, firstName: v }))}
                      placeholder="e.g. Harshit"
                    />
                    <Field
                      label="Last Name (Display)"
                      value={String(settings.lastName ?? "")}
                      onChange={(v) => setSettings((s) => ({ ...s, lastName: v }))}
                      placeholder="e.g. Bhuju"
                    />
                    <Field
                      label="Location / Base"
                      value={String(settings.location ?? "")}
                      onChange={(v) => setSettings((s) => ({ ...s, location: v }))}
                      placeholder="e.g. Kathmandu, Nepal"
                    />
                    <Field
                      label="Primary Role"
                      value={String(settings.role ?? "")}
                      onChange={(v) => setSettings((s) => ({ ...s, role: v }))}
                      placeholder="e.g. Frontend Developer"
                    />
                    <Field
                      label="Secondary Role / Subtitle"
                      value={String(settings.secondaryRole ?? "")}
                      onChange={(v) => setSettings((s) => ({ ...s, secondaryRole: v }))}
                      placeholder="e.g. AI & Distributed Systems"
                    />
                  </div>

                  <FieldTextarea
                    label="Hero Tagline"
                    value={String(settings.tagline ?? "")}
                    onChange={(v) => setSettings((s) => ({ ...s, tagline: v }))}
                    rows={2}
                    placeholder="Short impactful one-liner on hero..."
                  />
                </div>

                {/* 2. Media & Uploads Card */}
                <div className="p-6 rounded-2xl border border-border bg-surface/40 space-y-6">
                  <div className="flex items-center gap-2 border-b border-border/60 pb-3">
                    <span className="text-sm">🖼️</span>
                    <h3 className="text-sm font-semibold tracking-wide uppercase text-primary">
                      Profile Image & Resume
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Profile Image Uploader */}
                    <div className="flex flex-col gap-3 p-4 rounded-xl border border-border/70 bg-bg/50">
                      <span className="text-xs font-semibold uppercase tracking-wider text-secondary">
                        Profile Avatar
                      </span>

                      {settings.profileImage ? (
                        <div className="flex items-center gap-4">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={String(settings.profileImage)}
                            alt="Profile"
                            className="w-20 h-20 rounded-xl object-cover border border-strong-border shadow-sm"
                          />
                          <div className="min-w-0 flex-1 space-y-1">
                            <p className="text-xs font-medium text-primary truncate">
                              {String(settings.profileImage).split("/").pop()}
                            </p>
                            <div className="flex gap-2">
                              <a
                                href={String(settings.profileImage)}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[11px] text-secondary hover:text-primary underline"
                              >
                                View Full ↗
                              </a>
                              <button
                                type="button"
                                onClick={() => setSettings((s) => ({ ...s, profileImage: null }))}
                                className="text-[11px] text-red-400 hover:text-red-300"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="py-3 text-center border border-dashed border-border rounded-lg text-xs text-muted">
                          No profile photo uploaded
                        </div>
                      )}

                      <SingleFileDropzone
                        accept="image/jpeg,image/png,image/webp,image/avif"
                        label="Upload New Photo"
                        isUploading={uploadingField === "profileImage"}
                        onFileSelected={(file) =>
                          handleUpload(
                            file,
                            "profile",
                            (url) => setSettings((s) => ({ ...s, profileImage: url })),
                            "profileImage"
                          )
                        }
                      />
                    </div>

                    {/* Resume PDF Uploader */}
                    <div className="flex flex-col gap-3 p-4 rounded-xl border border-border/70 bg-bg/50">
                      <span className="text-xs font-semibold uppercase tracking-wider text-secondary">
                        Resume Document (PDF)
                      </span>

                      {settings.resumePath ? (
                        <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-surface">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-400 font-bold text-xs border border-red-500/20">
                            PDF
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium text-primary truncate">
                              {String(settings.resumePath).split("/").pop()}
                            </p>
                            <div className="flex gap-2 mt-0.5">
                              <a
                                href={String(settings.resumePath)}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[11px] text-secondary hover:text-primary underline"
                              >
                                Open PDF ↗
                              </a>
                              <button
                                type="button"
                                onClick={() => setSettings((s) => ({ ...s, resumePath: null }))}
                                className="text-[11px] text-red-400 hover:text-red-300"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="py-3 text-center border border-dashed border-border rounded-lg text-xs text-muted">
                          No resume PDF uploaded
                        </div>
                      )}

                      <SingleFileDropzone
                        accept="application/pdf,.pdf"
                        label="Upload Resume PDF"
                        isUploading={uploadingField === "resumePath"}
                        onFileSelected={(file) =>
                          handleUpload(
                            file,
                            "resume",
                            (url) => setSettings((s) => ({ ...s, resumePath: url })),
                            "resumePath"
                          )
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* 3. About & Bio Card */}
                <div className="p-6 rounded-2xl border border-border bg-surface/40 space-y-6">
                  <div className="flex items-center gap-2 border-b border-border/60 pb-3">
                    <span className="text-sm">📝</span>
                    <h3 className="text-sm font-semibold tracking-wide uppercase text-primary">
                      About Section & Focus
                    </h3>
                  </div>

                  <FieldTextarea
                    label="About Statement (Short Intro)"
                    value={String(settings.aboutStatement ?? "")}
                    onChange={(v) => setSettings((s) => ({ ...s, aboutStatement: v }))}
                    rows={3}
                    placeholder="Short high-level introduction..."
                  />

                  <FieldTextarea
                    label="Detailed About Story"
                    value={String(settings.aboutBody ?? "")}
                    onChange={(v) => setSettings((s) => ({ ...s, aboutBody: v }))}
                    rows={5}
                    placeholder="Detailed bio narrative, journey, passions..."
                  />

                  {/* Focus Areas Pill Manager */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-secondary mb-2">
                      Focus Areas & Highlights
                    </label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {(Array.isArray(settings.aboutFocus) ? (settings.aboutFocus as string[]) : []).map(
                        (focus, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-surface border border-strong-border text-primary font-medium"
                          >
                            <span>{String(focus)}</span>
                            <button
                              type="button"
                              onClick={() => {
                                const list = Array.isArray(settings.aboutFocus)
                                  ? [...(settings.aboutFocus as string[])]
                                  : [];
                                list.splice(idx, 1);
                                setSettings((s) => ({ ...s, aboutFocus: list }));
                              }}
                              className="text-secondary hover:text-red-400"
                            >
                              ✕
                            </button>
                          </span>
                        )
                      )}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={focusInput}
                        onChange={(e) => setFocusInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            if (!focusInput.trim()) return;
                            const list = Array.isArray(settings.aboutFocus)
                              ? [...(settings.aboutFocus as string[])]
                              : [];
                            list.push(focusInput.trim());
                            setSettings((s) => ({ ...s, aboutFocus: list }));
                            setFocusInput("");
                          }
                        }}
                        placeholder="Add focus area (e.g. Distributed backend systems) and press Enter"
                        className="flex-1 rounded-xl bg-bg border border-border px-3.5 py-2 text-sm text-primary placeholder:text-muted focus:border-text focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!focusInput.trim()) return;
                          const list = Array.isArray(settings.aboutFocus)
                            ? [...(settings.aboutFocus as string[])]
                            : [];
                          list.push(focusInput.trim());
                          setSettings((s) => ({ ...s, aboutFocus: list }));
                          setFocusInput("");
                        }}
                        className="px-4 py-2 bg-surface hover:bg-elevated border border-border rounded-xl text-xs font-semibold text-primary transition-colors"
                      >
                        + Add Focus
                      </button>
                    </div>
                  </div>
                </div>

                {/* 4. Contact & Socials Card */}
                <div className="p-6 rounded-2xl border border-border bg-surface/40 space-y-6">
                  <div className="flex items-center gap-2 border-b border-border/60 pb-3">
                    <span className="text-sm">📬</span>
                    <h3 className="text-sm font-semibold tracking-wide uppercase text-primary">
                      Contact & Social Links
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field
                      label="Email Address"
                      value={String(settings.email ?? "")}
                      onChange={(v) => setSettings((s) => ({ ...s, email: v }))}
                      placeholder="e.g. harshit@example.com"
                    />
                    <Field
                      label="Phone Number"
                      value={String(settings.phone ?? "")}
                      onChange={(v) => setSettings((s) => ({ ...s, phone: v }))}
                      placeholder="e.g. +977 98XXXXXXXX"
                    />
                    <Field
                      label="WhatsApp (Numeric digits)"
                      value={String(settings.whatsapp ?? "")}
                      onChange={(v) => setSettings((s) => ({ ...s, whatsapp: v }))}
                      placeholder="e.g. 97798XXXXXXXX"
                    />
                    <Field
                      label="GitHub Profile URL"
                      value={String(settings.github ?? "")}
                      onChange={(v) => setSettings((s) => ({ ...s, github: v }))}
                      placeholder="https://github.com/username"
                    />
                    <Field
                      label="LinkedIn Profile URL"
                      value={String(settings.linkedin ?? "")}
                      onChange={(v) => setSettings((s) => ({ ...s, linkedin: v }))}
                      placeholder="https://linkedin.com/in/username"
                    />
                    <Field
                      label="Facebook URL"
                      value={String(settings.facebook ?? "")}
                      onChange={(v) => setSettings((s) => ({ ...s, facebook: v }))}
                      placeholder="https://facebook.com/username"
                    />
                    <Field
                      label="Instagram URL"
                      value={String(settings.instagram ?? "")}
                      onChange={(v) => setSettings((s) => ({ ...s, instagram: v }))}
                      placeholder="https://instagram.com/username"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={saveSettings}
                    disabled={saving}
                    className="flex items-center gap-2 px-8 py-3 bg-text text-bg rounded-xl text-sm font-semibold hover:opacity-90 active:scale-95 disabled:opacity-50 transition-all cursor-pointer shadow-lg"
                  >
                    {saving ? "Saving Changes…" : "Save All Settings"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── TAB: CERTIFICATIONS, ACHIEVEMENTS, EDUCATION, EXPERIENCE, SKILLS ── */}
        {tab !== "settings" && (
          <div className="space-y-6">
            {/* Top Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                {/* Search Bar */}
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted">
                    🔍
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={`Search ${tab}…`}
                    className="pl-8 pr-4 py-2 rounded-xl bg-surface border border-border text-xs text-primary placeholder:text-muted focus:border-text focus:outline-none w-56 sm:w-64"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted hover:text-primary"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Status Filter */}
                <div className="flex p-1 bg-surface border border-border rounded-xl text-xs">
                  {(["all", "visible", "hidden"] as const).map((filterVal) => (
                    <button
                      key={filterVal}
                      type="button"
                      onClick={() => setStatusFilter(filterVal)}
                      className={`px-3 py-1 rounded-lg capitalize font-medium transition-all ${
                        statusFilter === filterVal
                          ? "bg-bg text-primary shadow-xs font-semibold"
                          : "text-secondary hover:text-primary"
                      }`}
                    >
                      {filterVal}
                    </button>
                  ))}
                </div>
              </div>

              {/* Add New Button */}
              <button
                type="button"
                onClick={() => {
                  setEditing(emptyFor(tab));
                  setIsNew(true);
                }}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-text text-bg rounded-xl text-xs font-semibold hover:opacity-90 active:scale-95 transition-all cursor-pointer shadow-sm w-fit"
              >
                <span>+</span>
                <span>Add {tab === "certifications" ? "Certification" : tab === "skills" ? "Skill" : tab === "achievements" ? "Achievement" : tab === "experience" ? "Experience" : "Education"}</span>
              </button>
            </div>

            {/* Editing / Create Form Card (Modal / Inline Drawer) */}
            {editing && (
              <div className="p-6 md:p-8 rounded-2xl border border-strong-border bg-surface shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <h3 className="text-lg font-semibold tracking-tight text-primary">
                    {isNew ? `New ${tab.slice(0, -1)}` : `Edit ${tab.slice(0, -1)}`}
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(null);
                      setIsNew(false);
                    }}
                    className="text-xs border border-border px-3 py-1.5 hover:border-strong-border text-secondary hover:text-primary transition-colors"
                  >
                    Cancel
                  </button>
                </div>

                {/* ── Specific Form: CERTIFICATIONS ── */}
                {tab === "certifications" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Field
                        label="Course / Certificate Title"
                        value={String(editing.title ?? "")}
                        onChange={(v) => setEditing((s) => ({ ...s, title: v }))}
                        placeholder="e.g. AWS Certified Solutions Architect"
                        required
                      />
                      <Field
                        label="Issuing Organization / Provider"
                        value={String(editing.provider ?? "")}
                        onChange={(v) => setEditing((s) => ({ ...s, provider: v }))}
                        placeholder="e.g. Amazon Web Services / Coursera"
                      />
                      <Field
                        label="Date / Completion Period"
                        value={String(editing.date ?? "")}
                        onChange={(v) => setEditing((s) => ({ ...s, date: v }))}
                        placeholder="e.g. Jan 2024 or 2023 - 2024"
                      />
                      <Field
                        label="Display Order (Sort Index)"
                        type="number"
                        value={String(editing.displayOrder ?? "0")}
                        onChange={(v) =>
                          setEditing((s) => ({ ...s, displayOrder: Number(v) || 0 }))
                        }
                        placeholder="0"
                      />
                    </div>

                    {/* Topics / Skills Learned Manager */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-secondary mb-2">
                        Key Topics & Skills Learned
                      </label>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {(Array.isArray(editing.topics) ? (editing.topics as string[]) : []).map(
                          (topic, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-bg border border-strong-border text-primary font-medium"
                            >
                              <span>{String(topic)}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const list = Array.isArray(editing.topics)
                                    ? [...(editing.topics as string[])]
                                    : [];
                                  list.splice(idx, 1);
                                  setEditing((s) => ({ ...s, topics: list }));
                                }}
                                className="text-secondary hover:text-red-400"
                              >
                                ✕
                              </button>
                            </span>
                          )
                        )}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={topicInput}
                          onChange={(e) => setTopicInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              if (!topicInput.trim()) return;
                              const list = Array.isArray(editing.topics)
                                ? [...(editing.topics as string[])]
                                : [];
                              list.push(topicInput.trim());
                              setEditing((s) => ({ ...s, topics: list }));
                              setTopicInput("");
                            }
                          }}
                          placeholder="Type topic / skill (e.g. Cloud Architecture) and press Enter"
                          className="flex-1 rounded-xl bg-bg border border-border px-3.5 py-2 text-sm text-primary placeholder:text-muted focus:border-text focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (!topicInput.trim()) return;
                            const list = Array.isArray(editing.topics)
                              ? [...(editing.topics as string[])]
                              : [];
                            list.push(topicInput.trim());
                            setEditing((s) => ({ ...s, topics: list }));
                            setTopicInput("");
                          }}
                          className="px-4 py-2 bg-elevated hover:bg-bg border border-border rounded-xl text-xs font-semibold text-primary transition-colors"
                        >
                          + Add Topic
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FieldTextarea
                        label="What I Did / Core Summary"
                        value={String(editing.description ?? "")}
                        onChange={(v) => setEditing((s) => ({ ...s, description: v }))}
                        rows={4}
                        placeholder="Explain the coursework, major assignments, and hands-on work accomplished..."
                      />
                      <FieldTextarea
                        label="My Story / Takeaways"
                        value={String(editing.story ?? "")}
                        onChange={(v) => setEditing((s) => ({ ...s, story: v }))}
                        rows={4}
                        placeholder="Personal reflection, why you took the course, and how it shaped your engineering..."
                      />
                    </div>

                  </div>
                )}

                {/* ── Specific Form: ACHIEVEMENTS ── */}
                {tab === "achievements" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Field
                        label="Placement / Award Badge"
                        value={String(editing.placement ?? "")}
                        onChange={(v) => setEditing((s) => ({ ...s, placement: v }))}
                        placeholder="e.g. 1st Place / Winner / Finalist"
                        required
                      />
                      <Field
                        label="Competition / Event Title"
                        value={String(editing.title ?? "")}
                        onChange={(s) => setEditing((prev) => ({ ...prev, title: s }))}
                        placeholder="e.g. KU Hackfest 2024"
                        required
                      />
                      <Field
                        label="Organizer / Subtitle"
                        value={String(editing.subtitle ?? "")}
                        onChange={(v) => setEditing((s) => ({ ...s, subtitle: v }))}
                        placeholder="e.g. Kathmandu University & KUCC"
                      />
                      <Field
                        label="Year"
                        value={String(editing.year ?? "")}
                        onChange={(v) => setEditing((s) => ({ ...s, year: v }))}
                        placeholder="2024"
                      />
                      <Field
                        label="Display Order"
                        type="number"
                        value={String(editing.displayOrder ?? "0")}
                        onChange={(v) =>
                          setEditing((s) => ({ ...s, displayOrder: Number(v) || 0 }))
                        }
                      />
                    </div>

                    <FieldTextarea
                      label="Achievement Description"
                      value={String(editing.description ?? "")}
                      onChange={(v) => setEditing((s) => ({ ...s, description: v }))}
                      rows={3}
                      placeholder="Details about the hackathon/competition, project built, and outcome..."
                    />

                    <FieldTextarea
                      label="Detailed Story / Journey (Optional)"
                      value={String(editing.story ?? "")}
                      onChange={(v) => setEditing((s) => ({ ...s, story: v }))}
                      rows={3}
                      placeholder="Behind the scenes story, team collaboration, technical challenges overcome..."
                    />

                  </div>
                )}

                {/* ── Specific Form: EXPERIENCE ── */}
                {tab === "experience" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Field
                        label="Job Role / Position"
                        value={String(editing.role ?? "")}
                        onChange={(v) => setEditing((s) => ({ ...s, role: v }))}
                        placeholder="e.g. Senior Software Engineer"
                        required
                      />
                      <Field
                        label="Company / Organization"
                        value={String(editing.company ?? "")}
                        onChange={(v) => setEditing((s) => ({ ...s, company: v }))}
                        placeholder="e.g. Acme Labs"
                        required
                      />
                      <Field
                        label="Location"
                        value={String(editing.location ?? "")}
                        onChange={(v) => setEditing((s) => ({ ...s, location: v }))}
                        placeholder="e.g. San Francisco, CA (Remote)"
                      />
                      <Field
                        label="Date Range"
                        value={String(editing.dateRange ?? "")}
                        onChange={(v) => setEditing((s) => ({ ...s, dateRange: v }))}
                        placeholder="e.g. 2023 — Present"
                      />
                      <Field
                        label="Display Order"
                        type="number"
                        value={String(editing.displayOrder ?? "0")}
                        onChange={(v) =>
                          setEditing((s) => ({ ...s, displayOrder: Number(v) || 0 }))
                        }
                      />
                    </div>

                    {/* Bullet Points Builder */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-secondary mb-2">
                        Key Responsibilities & Achievements
                      </label>
                      <div className="space-y-2 mb-3">
                        {(Array.isArray(editing.points) ? (editing.points as string[]) : []).map(
                          (point, idx) => (
                            <div
                              key={idx}
                              className="flex items-start gap-2 p-2.5 rounded-xl border border-border bg-bg text-xs"
                            >
                              <span className="text-secondary mt-0.5">•</span>
                              <span className="flex-1 text-primary">{String(point)}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const list = Array.isArray(editing.points)
                                    ? [...(editing.points as string[])]
                                    : [];
                                  list.splice(idx, 1);
                                  setEditing((s) => ({ ...s, points: list }));
                                }}
                                className="text-secondary hover:text-red-400 px-1"
                              >
                                ✕
                              </button>
                            </div>
                          )
                        )}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={pointInput}
                          onChange={(e) => setPointInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              if (!pointInput.trim()) return;
                              const list = Array.isArray(editing.points)
                                ? [...(editing.points as string[])]
                                : [];
                              list.push(pointInput.trim());
                              setEditing((s) => ({ ...s, points: list }));
                              setPointInput("");
                            }
                          }}
                          placeholder="Add accomplishment bullet point and press Enter"
                          className="flex-1 rounded-xl bg-bg border border-border px-3.5 py-2 text-sm text-primary placeholder:text-muted focus:border-text focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (!pointInput.trim()) return;
                            const list = Array.isArray(editing.points)
                              ? [...(editing.points as string[])]
                              : [];
                            list.push(pointInput.trim());
                            setEditing((s) => ({ ...s, points: list }));
                            setPointInput("");
                          }}
                          className="px-4 py-2 bg-elevated hover:bg-bg border border-border rounded-xl text-xs font-semibold text-primary transition-colors"
                        >
                          + Add Point
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Specific Form: EDUCATION ── */}
                {tab === "education" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Field
                        label="Degree"
                        value={String(editing.degree ?? "")}
                        onChange={(v) => setEditing((s) => ({ ...s, degree: v }))}
                        placeholder="e.g. Bachelor of Engineering"
                        required
                      />
                      <Field
                        label="Field of Study / Major"
                        value={String(editing.field ?? "")}
                        onChange={(v) => setEditing((s) => ({ ...s, field: v }))}
                        placeholder="e.g. Computer Science"
                      />
                      <Field
                        label="Institution / University"
                        value={String(editing.school ?? "")}
                        onChange={(v) => setEditing((s) => ({ ...s, school: v }))}
                        placeholder="e.g. Kathmandu University"
                        required
                      />
                      <Field
                        label="Date Range"
                        value={String(editing.dateRange ?? "")}
                        onChange={(v) => setEditing((s) => ({ ...s, dateRange: v }))}
                        placeholder="e.g. 2020 — 2024"
                      />
                      <Field
                        label="GPA / Grade (Optional)"
                        value={String(editing.gpa ?? "")}
                        onChange={(v) => setEditing((s) => ({ ...s, gpa: v }))}
                        placeholder="e.g. 3.85 / 4.0"
                      />
                      <Field
                        label="Display Order"
                        type="number"
                        value={String(editing.displayOrder ?? "0")}
                        onChange={(v) =>
                          setEditing((s) => ({ ...s, displayOrder: Number(v) || 0 }))
                        }
                      />
                    </div>
                  </div>
                )}

                {/* ── Specific Form: SKILLS ── */}
                {tab === "skills" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Field
                        label="Skill / Technology Name"
                        value={String(editing.name ?? "")}
                        onChange={(v) => setEditing((s) => ({ ...s, name: v }))}
                        placeholder="e.g. Next.js, Python, PostgreSQL"
                        required
                      />
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-secondary mb-1.5">
                          Category
                        </label>
                        <select
                          value={String(editing.category ?? "frameworks")}
                          onChange={(e) =>
                            setEditing((s) => ({ ...s, category: e.target.value }))
                          }
                          className="w-full rounded-xl bg-bg border border-border px-3.5 py-2 text-sm text-primary focus:border-text focus:outline-none"
                        >
                          <option value="languages">Languages (JavaScript, Python, C++, etc.)</option>
                          <option value="frameworks">Frameworks & Libraries (React, Next.js, FastAPI)</option>
                          <option value="tools">Tools & Cloud (Docker, AWS, PostgreSQL, Git)</option>
                          <option value="soft">Concepts & Other (Distributed Systems, Architecture)</option>
                        </select>
                      </div>
                      <Field
                        label="Display Order"
                        type="number"
                        value={String(editing.displayOrder ?? "0")}
                        onChange={(v) =>
                          setEditing((s) => ({ ...s, displayOrder: Number(v) || 0 }))
                        }
                      />
                    </div>
                  </div>
                )}

                {/* Visibility Toggle & Action Footer */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border">
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={Boolean(editing.visible)}
                      onChange={(e) =>
                        setEditing((s) => ({ ...s, visible: e.target.checked }))
                      }
                      className="h-4 w-4 rounded accent-primary cursor-pointer"
                    />
                    <div>
                      <span className="text-sm font-medium text-primary">Publicly Visible</span>
                      <p className="text-[11px] text-muted">
                        When enabled, this item appears on the portfolio website.
                      </p>
                    </div>
                  </label>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(null);
                        setIsNew(false);
                      }}
                      className="px-5 py-2.5 rounded-xl border border-border hover:bg-elevated text-xs font-medium text-secondary hover:text-primary transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={saveItem}
                      disabled={saving}
                      className="flex items-center gap-2 px-6 py-2.5 bg-text text-bg rounded-xl text-xs font-semibold hover:opacity-90 active:scale-95 disabled:opacity-50 transition-all cursor-pointer shadow-md"
                    >
                      {saving ? "Saving…" : isNew ? "Create Item" : "Save Changes"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* List Cards View */}
            {listLoading ? (
              <div className="p-12 text-center text-sm text-secondary">
                <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-2" />
                Loading {tab}…
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="p-12 text-center rounded-2xl border border-dashed border-border bg-surface/30 space-y-3">
                <p className="text-sm text-muted">No items found.</p>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(emptyFor(tab));
                    setIsNew(true);
                  }}
                  className="text-xs px-4 py-2 border border-strong-border rounded-xl text-primary hover:bg-surface transition-colors"
                >
                  + Add first {tab.slice(0, -1)}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredItems.map((item) => {
                  const title = String(
                    item.title ||
                      item.degree ||
                      item.role ||
                      item.name ||
                      item.placement ||
                      `Item #${item.id}`
                  );
                  const subtitle = String(
                    item.subtitle ||
                      item.school ||
                      item.company ||
                      item.category ||
                      item.provider ||
                      ""
                  );
                  const dateInfo = String(item.date || item.dateRange || item.year || "");
                  const isVisible = item.visible !== false;

                  return (
                    <div
                      key={String(item.id)}
                      className="group flex flex-col justify-between p-5 rounded-2xl border border-border bg-surface/50 hover:border-strong-border hover:bg-surface transition-all shadow-xs"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-sm text-primary truncate">
                                {title}
                              </h4>
                              {!isVisible && (
                                <span className="inline-flex items-center rounded-full bg-zinc-800 border border-zinc-700 px-2 py-0.2 text-[10px] text-zinc-400 font-mono">
                                  Hidden
                                </span>
                              )}
                            </div>
                            {subtitle && (
                              <p className="text-xs text-secondary mt-0.5 truncate">
                                {subtitle}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => toggleItemVisibility(item)}
                              className="text-xs text-secondary hover:text-primary cursor-pointer px-2 py-1 border border-border hover:border-strong-border"
                            >
                              {isVisible ? "Hide" : "Show"}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditing({ ...item });
                                setIsNew(false);
                                window.scrollTo({ top: 180, behavior: "smooth" });
                              }}
                              className="text-xs font-semibold border border-strong-border px-2 py-1 hover:bg-[var(--color-text)] hover:text-[var(--color-bg)] cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => removeItem(Number(item.id))}
                              className="text-xs text-secondary hover:text-red-500 cursor-pointer px-2 py-1"
                            >
                              Delete
                            </button>
                          </div>
                        </div>

                        {/* Topics or Bullet preview */}
                        {Array.isArray(item.topics) && item.topics.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {(item.topics as string[]).slice(0, 4).map((t, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded-full text-[10px] bg-bg border border-border text-secondary"
                              >
                                {String(t)}
                              </span>
                            ))}
                            {item.topics.length > 4 ? (
                              <span className="text-[10px] text-muted self-center">
                                +{item.topics.length - 4} more
                              </span>
                            ) : null}
                          </div>
                        ) : null}

                        {/* Certificate document link preview if available */}
                        {item.certificateUrl ? (
                          <div className="flex items-center gap-2 pt-1 text-[11px] text-secondary">
                            <a
                              href={String(item.certificateUrl)}
                              target="_blank"
                              rel="noreferrer"
                              className="hover:text-primary underline truncate"
                            >
                              View certificate ↗
                            </a>
                          </div>
                        ) : null}

                        {/* Gallery photos count */}
                        {Array.isArray(item.galleryUrls) && item.galleryUrls.length > 0 ? (
                          <div className="pt-1">
                            <span className="text-[11px] text-muted">{item.galleryUrls.length} photo{item.galleryUrls.length > 1 ? "s" : ""}</span>
                          </div>
                        ) : null}
                      </div>

                      {/* Card Footer Info */}
                      <div className="flex items-center justify-between pt-3 mt-4 border-t border-border/60 text-[11px] text-muted">
                        <span className="font-mono">{dateInfo || "No date"}</span>
                        <span className="font-mono">Order #{String(item.displayOrder ?? 0)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

// ─── HELPER REUSABLE COMPONENTS ─────────────────────────────────

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold uppercase tracking-wider text-secondary flex items-center gap-1">
        {label}
        {required && <span className="text-red-400">*</span>}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-xl bg-bg border border-border px-3.5 py-2.5 text-sm text-primary placeholder:text-muted focus:border-text focus:outline-none transition-colors"
      />
    </label>
  );
}

function FieldTextarea({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold uppercase tracking-wider text-secondary">
        {label}
      </span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full rounded-xl bg-bg border border-border px-3.5 py-2.5 text-sm text-primary placeholder:text-muted focus:border-text focus:outline-none transition-colors leading-relaxed"
      />
    </label>
  );
}

function SingleFileDropzone({
  accept,
  label,
  isUploading,
  onFileSelected,
}: {
  accept: string;
  label: string;
  isUploading: boolean;
  onFileSelected: (file: File) => void;
}) {
  const [isDragOver, setIsDragOver] = useState(false);

  return (
    <label
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) onFileSelected(file);
      }}
      className={`group relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
        isDragOver
          ? "border-primary bg-primary/5"
          : "border-border hover:border-strong-border bg-bg/40 hover:bg-bg/60"
      }`}
    >
      <input
        type="file"
        accept={accept}
        disabled={isUploading}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFileSelected(file);
          e.target.value = "";
        }}
        className="sr-only"
      />
      {isUploading ? (
        <div className="flex flex-col items-center gap-2 py-2">
          <div className="w-5 h-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-xs font-medium text-secondary">Uploading to Supabase…</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-1.5 text-center">
          <span className="text-xl">📁</span>
          <p className="text-xs font-semibold text-primary">{label}</p>
          <p className="text-[11px] text-muted">
            Drag and drop or <span className="underline text-secondary">browse file</span>
          </p>
        </div>
      )}
    </label>
  );
}
