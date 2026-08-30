"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Modal from "@/components/Modal";
import AdminLogoutButton from "@/components/AdminLogoutButton";
import { uploadClientFile } from "@/lib/uploadClient";

type Project = {
  id: number;
  slug: string;
  title: string | null;
  number: string | null;
  category: string | null;
  dateRange: string | null;
  shortDescription: string | null;
  longDescription: string | null;
  challenges: string | null;
  solutions: string | null;
  tags: string[];
  githubUrl: string | null;
  liveUrl: string | null;
  videoUrl: string | null;
  thumbnailUrl: string | null;
  galleryUrls: string[];
  certificateUrls: string[];
  visible: boolean;
  displayOrder: number;
  githubRepoName?: string | null;
};

const emptyProject = (): Project => ({
  id: 0,
  slug: "",
  title: "",
  number: "",
  category: "",
  dateRange: "",
  shortDescription: "",
  longDescription: "",
  challenges: "",
  solutions: "",
  tags: [],
  githubUrl: "",
  liveUrl: "",
  videoUrl: "",
  thumbnailUrl: "",
  galleryUrls: [],
  certificateUrls: [],
  visible: false,
  displayOrder: 0,
});

export default function AdminProjectsPage() {
  const [items, setItems] = useState<Project[]>(
    [] as Project[]
  );
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Project | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [preview, setPreview] = useState<Project | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState<"all" | "visible" | "hidden">("all");
  const [query, setQuery] = useState("");

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/projects?all=1", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length) setItems(data);
      }
    } catch {
      /* keep seed */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    let list = [...items].sort((a, b) => a.displayOrder - b.displayOrder);
    if (filter === "visible") list = list.filter((p) => p.visible);
    if (filter === "hidden") list = list.filter((p) => !p.visible);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (p) =>
          (p.title || "").toLowerCase().includes(q) ||
          (p.slug || "").toLowerCase().includes(q) ||
          (p.category || "").toLowerCase().includes(q) ||
          (p.tags || []).some((t) => t.toLowerCase().includes(q))
      );
    }
    return list;
  }, [items, filter, query]);

  const startEdit = (p: Project) => {
    setIsNew(false);
    setEditing({
      ...p,
      galleryUrls: [...(p.galleryUrls || [])],
      certificateUrls: [...(p.certificateUrls || [])],
      tags: [...(p.tags || [])],
    });
    setMessage("");
  };

  const startCreate = () => {
    setIsNew(true);
    setEditing({
      ...emptyProject(),
      displayOrder: items.length + 1,
      number: String(items.length + 1).padStart(2, "0"),
    });
    setMessage("");
  };

  const save = async () => {
    if (!editing) return;
    if (!(editing.title || "").trim()) {
      setMessage("Title is required.");
      return;
    }
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/projects", {
        method: isNew ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data) {
        if (isNew) {
          setItems((prev) => [...prev, data]);
          setMessage("Project created.");
        } else {
          setItems((prev) =>
            prev.map((p) =>
              p.id === data.id || p.slug === data.slug ? { ...p, ...data } : p
            )
          );
          setMessage("Saved.");
        }
        setEditing(null);
        setIsNew(false);
      } else {
        setMessage(data?.error || "Could not save. Try again.");
      }
    } catch {
      setMessage("Network error. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (p: Project) => {
    if (!confirm(`Delete “${p.title || p.slug}”? This cannot be undone.`))
      return;
    try {
      const res = await fetch("/api/projects", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: p.id, slug: p.slug }),
      });
      if (res.ok) {
        setItems((prev) =>
          prev.filter((x) => x.id !== p.id && x.slug !== p.slug)
        );
        setMessage("Deleted.");
        if (editing && (editing.id === p.id || editing.slug === p.slug)) {
          setEditing(null);
        }
      } else {
        setMessage("Could not delete.");
      }
    } catch {
      setMessage("Network error.");
    }
  };

  const toggleVisible = async (p: Project) => {
    const next = { ...p, visible: !p.visible };
    setItems((prev) =>
      prev.map((x) => (x.id === p.id || x.slug === p.slug ? next : x))
    );
    try {
      await fetch("/api/projects", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
    } catch {
      setItems((prev) =>
        prev.map((x) => (x.id === p.id || x.slug === p.slug ? p : x))
      );
    }
  };

  return (
    <main className="min-h-screen bg-bg text-primary">
      <div className="container-main py-12 md:py-16">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
            <p className="text-sm text-secondary mt-1">
              {items.length} total · {items.filter((p) => p.visible).length}{" "}
              visible
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/admin"
              className="text-sm text-secondary hover:text-primary transition-colors"
            >
              ← Admin
            </Link>
            <AdminLogoutButton />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-6">
          <input
            type="search"
            placeholder="Search title, slug, tag…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 min-w-[180px] bg-transparent border border-border px-3 py-2 text-sm focus:outline-none focus:border-strong-border"
          />
          <div className="flex border border-border text-xs">
            {(["all", "visible", "hidden"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`px-3 py-2 capitalize cursor-pointer ${
                  filter === f
                    ? "bg-[var(--color-text)] text-[var(--color-bg)]"
                    : "text-secondary hover:text-primary"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={startCreate}
            className="text-sm font-semibold border border-strong-border px-5 py-2.5 hover:bg-[var(--color-text)] hover:text-[var(--color-bg)] transition-colors cursor-pointer"
          >
            + Add project
          </button>
        </div>

        {message && (
          <p className="text-sm text-secondary border border-border px-4 py-3 mb-6">
            {message}
          </p>
        )}

        {loading ? (
          <p className="text-sm text-secondary">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-secondary border border-border p-8 text-center">
            No projects match. Add one or clear filters.
          </p>
        ) : (
          <div className="space-y-3">
            {filtered.map((p) => (
              <div
                key={`${p.id}-${p.slug}`}
                className="border border-border p-4 md:p-5 flex flex-col sm:flex-row gap-4"
              >
                <div className="w-full sm:w-28 h-20 shrink-0 bg-secondary/10 border border-border overflow-hidden relative">
                  {p.thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.thumbnailUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] uppercase tracking-wider text-muted">
                      No image
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="text-xs text-muted">
                      {p.number || String(p.displayOrder).padStart(2, "0")}
                    </span>
                    <h2 className="font-semibold truncate">
                      {p.title || p.slug}
                    </h2>
                    <span
                      className={`text-[10px] uppercase tracking-wider px-2 py-0.5 border ${
                        p.visible
                          ? "border-strong-border text-primary"
                          : "border-border text-muted"
                      }`}
                    >
                      {p.visible ? "Visible" : "Hidden"}
                    </span>
                  </div>
                  <p className="text-xs text-muted mt-1 truncate">
                    {p.category || "—"} · {p.slug}
                  </p>
                  <p className="text-sm text-secondary mt-2 line-clamp-2">
                    {p.shortDescription || "No description"}
                  </p>
                </div>
                <div className="flex flex-wrap sm:flex-col gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setPreview(p)}
                    className="text-xs font-semibold border border-border px-3 py-2 hover:border-strong-border cursor-pointer"
                  >
                    Preview
                  </button>
                  <button
                    type="button"
                    onClick={() => startEdit(p)}
                    className="text-xs font-semibold border border-strong-border px-3 py-2 hover:bg-[var(--color-text)] hover:text-[var(--color-bg)] cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleVisible(p)}
                    className="text-xs text-secondary hover:text-primary cursor-pointer px-3 py-1"
                  >
                    {p.visible ? "Hide" : "Show"}
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(p)}
                    className="text-xs text-secondary hover:text-red-500 cursor-pointer px-3 py-1"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit / Create modal */}
      {editing && (
        <Modal
          isOpen={!!editing}
          onClose={() => {
            setEditing(null);
            setIsNew(false);
          }}
          title={isNew ? "New project" : `Edit: ${editing.title || editing.slug}`}
          maxWidth="max-w-3xl"
        >
          <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field
                label="Title *"
                value={editing.title || ""}
                onChange={(v) => setEditing({ ...editing, title: v })}
              />
              <Field
                label="Slug"
                value={editing.slug || ""}
                onChange={(v) => setEditing({ ...editing, slug: v })}
                hint={isNew ? "Leave blank to auto-generate from title" : undefined}
              />
              <Field
                label="Number"
                value={editing.number || ""}
                onChange={(v) => setEditing({ ...editing, number: v })}
              />
              <Field
                label="Display order"
                value={String(editing.displayOrder ?? 0)}
                onChange={(v) =>
                  setEditing({
                    ...editing,
                    displayOrder: parseInt(v, 10) || 0,
                  })
                }
              />
              <Field
                label="Category"
                value={editing.category || ""}
                onChange={(v) => setEditing({ ...editing, category: v })}
              />
              <Field
                label="Date range"
                value={editing.dateRange || ""}
                onChange={(v) => setEditing({ ...editing, dateRange: v })}
              />
            </div>
            <Field
              label="Short Description"
              value={editing.shortDescription || ""}
              onChange={(v) =>
                setEditing({ ...editing, shortDescription: v })
              }
              multiline
              hint="Shown on the homepage project cards. Keep it concise — 1–2 sentences."
            />
            <Field
              label="Long Description"
              value={editing.longDescription || ""}
              onChange={(v) =>
                setEditing({ ...editing, longDescription: v })
              }
              multiline
              hint="Shown inside the project detail page under 'Overview'. Write the full story — background, architecture, what was built."
            />
            <Field
              label="Challenges (Key Problems, Bottlenecks & Constraints)"
              value={editing.challenges || ""}
              onChange={(v) => setEditing({ ...editing, challenges: v })}
              multiline
              hint="Describe technical hurdles, scalability, architectural challenges faced"
            />
            <Field
              label="Solutions (Engineering Approach & Technical Implementation)"
              value={editing.solutions || ""}
              onChange={(v) => setEditing({ ...editing, solutions: v })}
              multiline
              hint="Describe how the challenges were solved, architectural decisions, results"
            />
            <Field
              label="Tags (comma-separated)"
              value={(editing.tags || []).join(", ")}
              onChange={(v) =>
                setEditing({
                  ...editing,
                  tags: v
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean),
                })
              }
            />
            <Field
              label="Thumbnail URL"
              value={editing.thumbnailUrl || ""}
              onChange={(v) =>
                setEditing({ ...editing, thumbnailUrl: v || null })
              }
            />
            <UploadButton
              label="Upload thumbnail photo"
              onUploaded={(url) =>
                setEditing((prev) =>
                  prev ? { ...prev, thumbnailUrl: url } : prev
                )
              }
            />
            {editing.thumbnailUrl ? (
              <div className="h-32 border border-border overflow-hidden bg-black/40 flex items-center justify-center p-2 rounded">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={editing.thumbnailUrl}
                  alt="Thumbnail"
                  className="h-full w-auto object-contain"
                />
              </div>
            ) : null}

            {/* Gallery Upload Section */}
            <div className="space-y-2 pt-2 border-t border-border/60">
              <div className="flex items-center justify-between">
                <label className="text-xs uppercase tracking-[0.12em] text-muted block">
                  Project Gallery Photos ({(editing.galleryUrls || []).length} attached)
                </label>
              </div>

              <MultiUploadButton
                label="Select & Upload Multiple Photos at Once"
                folder="projects/gallery"
                onUploadedMany={(newUrls) =>
                  setEditing((prev) =>
                    prev
                      ? {
                          ...prev,
                          galleryUrls: [...(prev.galleryUrls || []), ...newUrls],
                        }
                      : prev
                  )
                }
              />

              {/* Gallery Grid Preview & Individual Delete */}
              {(editing.galleryUrls || []).length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 pt-2">
                  {editing.galleryUrls?.map((url, idx) => (
                    <div
                      key={idx}
                      className="group relative aspect-video rounded border border-border overflow-hidden bg-black/40 flex items-center justify-center"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={url}
                        alt={`Gallery ${idx + 1}`}
                        className="w-full h-full object-contain"
                      />
                      <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-1">
                        <button
                          type="button"
                          onClick={() => {
                            const next = [...(editing.galleryUrls || [])];
                            next.splice(idx, 1);
                            setEditing({ ...editing, galleryUrls: next });
                          }}
                          className="px-2 py-1 rounded bg-red-600 hover:bg-red-700 text-white text-[11px] font-semibold cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                      <span className="absolute bottom-1 left-1 px-1 py-0.2 rounded bg-black/80 text-[9px] font-mono text-white pointer-events-none">
                        #{idx + 1}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <Field
                label="Gallery URLs (raw text edit)"
                value={(editing.galleryUrls || []).join(", ")}
                onChange={(v) =>
                  setEditing({
                    ...editing,
                    galleryUrls: v
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean),
                  })
                }
              />
            </div>

            <Field
              label="Video URL (or upload below)"
              value={editing.videoUrl || ""}
              onChange={(v) =>
                setEditing({ ...editing, videoUrl: v || null })
              }
            />
            <UploadButton
              label="Upload video (mp4 / webm)"
              accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
              folder="projects/videos"
              onUploaded={(url) =>
                setEditing((prev) =>
                  prev ? { ...prev, videoUrl: url } : prev
                )
              }
            />
            
            <Field
              label="Live URL"
              value={editing.liveUrl || ""}
              onChange={(v) =>
                setEditing({ ...editing, liveUrl: v || null })
              }
            />
            <Field
              label="GitHub URL"
              value={editing.githubUrl || ""}
              onChange={(v) =>
                setEditing({ ...editing, githubUrl: v || null })
              }
            />
            <label className="flex items-center gap-3 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={!!editing.visible}
                onChange={(e) =>
                  setEditing({ ...editing, visible: e.target.checked })
                }
                className="accent-current"
              />
              Visible on public site
            </label>
          </div>

          <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t border-border">
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="text-sm font-semibold border border-strong-border px-6 py-2.5 hover:bg-[var(--color-text)] hover:text-[var(--color-bg)] transition-colors disabled:opacity-50 cursor-pointer"
            >
              {saving ? "Saving…" : isNew ? "Create" : "Save"}
            </button>
            <button
              type="button"
              onClick={() => setPreview(editing)}
              className="text-sm border border-border px-5 py-2.5 hover:border-strong-border cursor-pointer"
            >
              Preview
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(null);
                setIsNew(false);
              }}
              className="text-sm text-secondary hover:text-primary cursor-pointer px-3"
            >
              Cancel
            </button>
          </div>
        </Modal>
      )}

      {/* Preview modal */}
      {preview && (
        <Modal
          isOpen={!!preview}
          onClose={() => setPreview(null)}
          title="Preview"
          maxWidth="max-w-3xl"
        >
          <article className="space-y-5">
            {preview.thumbnailUrl && (
              <div className="aspect-video border border-border overflow-hidden bg-secondary/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview.thumbnailUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="text-xs text-muted tracking-wider">
                {preview.number ||
                  String(preview.displayOrder).padStart(2, "0")}
              </span>
              <span className="text-xs uppercase tracking-[0.12em] text-muted">
                {preview.dateRange || "—"}
              </span>
              <span
                className={`text-[10px] uppercase tracking-wider px-2 py-0.5 border ${
                  preview.visible
                    ? "border-strong-border"
                    : "border-border text-muted"
                }`}
              >
                {preview.visible ? "Visible" : "Hidden"}
              </span>
            </div>
            <h2 className="text-2xl font-semibold tracking-tight">
              {preview.title || preview.slug}
            </h2>
            <p className="text-sm text-secondary">{preview.category}</p>
            <p className="text-sm leading-relaxed text-secondary">
              {preview.shortDescription}
            </p>
            {preview.longDescription && (
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {preview.longDescription}
              </p>
            )}
            {(preview.challenges || preview.solutions) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-border">
                {preview.challenges && (
                  <div className="p-3 border border-border bg-surface/50 text-xs">
                    <span className="font-semibold text-primary block mb-1">
                      Challenges &amp; Constraints
                    </span>
                    <p className="text-secondary whitespace-pre-wrap">
                      {preview.challenges}
                    </p>
                  </div>
                )}
                {preview.solutions && (
                  <div className="p-3 border border-border bg-surface/50 text-xs">
                    <span className="font-semibold text-primary block mb-1">
                      Solutions &amp; Architecture
                    </span>
                    <p className="text-secondary whitespace-pre-wrap">
                      {preview.solutions}
                    </p>
                  </div>
                )}
              </div>
            )}
            {(preview.tags || []).length > 0 && (
              <div className="flex flex-wrap gap-2">
                {(preview.tags || []).map((t: string) => (
                  <span
                    key={t}
                    className="text-[11px] border border-border px-2.5 py-1 text-secondary"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
            <div className="flex flex-wrap gap-4 text-sm">
              {preview.liveUrl && (
                <a
                  href={preview.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-4 hover:text-primary text-secondary"
                >
                  Live site
                </a>
              )}
              {preview.githubUrl && (
                <a
                  href={preview.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-4 hover:text-primary text-secondary"
                >
                  GitHub
                </a>
              )}
              {preview.videoUrl && (
                <a
                  href={preview.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-4 hover:text-primary text-secondary"
                >
                  Video
                </a>
              )}
            </div>
            {(preview.galleryUrls || []).length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {preview.galleryUrls.map((url) => (
                  <div
                    key={url}
                    className="aspect-video border border-border overflow-hidden bg-black/40 flex items-center justify-center rounded"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt=""
                      className="w-full h-full object-contain"
                    />
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-3 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => {
                  setPreview(null);
                  startEdit(preview);
                }}
                className="text-sm font-semibold border border-strong-border px-5 py-2.5 hover:bg-[var(--color-text)] hover:text-[var(--color-bg)] cursor-pointer"
              >
                Edit this project
              </button>
              <button
                type="button"
                onClick={() => setPreview(null)}
                className="text-sm text-secondary hover:text-primary cursor-pointer"
              >
                Close
              </button>
            </div>
          </article>
        </Modal>
      )}
    </main>
  );
}


async function uploadFile(file: File, folder = "projects"): Promise<string> {
  return uploadClientFile(file, folder);
}

function MultiUploadButton({
  label,
  onUploadedMany,
  accept = "image/*",
  folder = "projects/gallery",
}: {
  label: string;
  onUploadedMany: (urls: string[]) => void;
  accept?: string;
  folder?: string;
}) {
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
  const [err, setErr] = useState("");

  const handleFiles = async (fileList: FileList | File[]) => {
    const files = Array.from(fileList);
    if (!files.length) return;
    setProgress({ current: 0, total: files.length });
    setErr("");
    const uploadedUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      try {
        const url = await uploadFile(files[i], folder);
        uploadedUrls.push(url);
      } catch (ex) {
        console.error("Upload error for file", files[i].name, ex);
      }
      setProgress({ current: i + 1, total: files.length });
    }

    if (uploadedUrls.length > 0) {
      onUploadedMany(uploadedUrls);
    }
    if (uploadedUrls.length < files.length) {
      setErr(`Uploaded ${uploadedUrls.length} of ${files.length} photos.`);
    }
    setProgress(null);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <label className="text-xs font-semibold border border-dashed border-border px-4 py-2.5 cursor-pointer hover:border-strong-border bg-surface/50 hover:bg-surface flex items-center gap-2 transition-colors">
        {progress ? (
          <span className="flex items-center gap-2 text-primary">
            <span className="w-3 h-3 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
            Uploading {progress.current} of {progress.total} photos…
          </span>
        ) : (
          <>
            <span>{label}</span>
          </>
        )}
        <input
          type="file"
          accept={accept}
          multiple
          className="hidden"
          disabled={progress !== null}
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleFiles(e.target.files);
            }
            e.target.value = "";
          }}
        />
      </label>
      {err && <span className="text-[11px] text-red-400">{err}</span>}
    </div>
  );
}

function UploadButton({
  label,
  onUploaded,
  accept = "image/*,video/mp4,video/webm",
  folder = "projects",
}: {
  label: string;
  onUploaded: (url: string) => void;
  accept?: string;
  folder?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  return (
    <div className="flex flex-wrap items-center gap-2">
      <label className="text-xs font-semibold border border-border px-3 py-2 cursor-pointer hover:border-strong-border">
        {busy ? "Uploading…" : label}
        <input
          type="file"
          accept={accept}
          className="hidden"
          disabled={busy}
          onChange={async (e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (!file) return;
            setBusy(true);
            setErr("");
            try {
              const url = await uploadFile(file, folder);
              onUploaded(url);
            } catch (ex) {
              setErr(ex instanceof Error ? ex.message : "Upload failed");
            } finally {
              setBusy(false);
            }
          }}
        />
      </label>
      {err && <span className="text-[11px] text-red-500">{err}</span>}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  multiline,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  hint?: string;
}) {
  return (
    <div>
      <label className="text-xs uppercase tracking-[0.12em] text-muted block mb-1.5">
        {label}
      </label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          className="w-full bg-transparent border border-border px-3 py-2 text-sm text-primary focus:outline-none focus:border-strong-border resize-y"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent border border-border px-3 py-2 text-sm text-primary focus:outline-none focus:border-strong-border"
        />
      )}
      {hint && <p className="text-[11px] text-muted mt-1">{hint}</p>}
    </div>
  );
}
