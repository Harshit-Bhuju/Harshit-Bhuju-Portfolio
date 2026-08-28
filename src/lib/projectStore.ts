
export type ProjectRecord = {
  id: number;
  slug: string;
  title: string | null;
  number: string | null;
  category: string | null;
  dateRange: string | null;
  shortDescription: string | null;
  longDescription: string | null;
  challenges?: string | null;
  solutions?: string | null;
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
  syncedAt?: string | Date | null;
};

let memoryStore: ProjectRecord[] = [];

let nextId =
  memoryStore.reduce((max, p) => Math.max(max, p.id || 0), 0) + 1;

export function getMemoryProjects(): ProjectRecord[] {
  return memoryStore;
}

export function setMemoryProjects(items: ProjectRecord[]) {
  memoryStore = items;
}

export function upsertMemoryProject(
  body: Partial<ProjectRecord> & { slug: string }
): ProjectRecord {
  const idx = memoryStore.findIndex(
    (p) => p.id === body.id || p.slug === body.slug
  );
  if (idx >= 0) {
    memoryStore[idx] = { ...memoryStore[idx], ...body } as ProjectRecord;
    return memoryStore[idx];
  }
  const created: ProjectRecord = {
    id: body.id ?? nextId++,
    slug: body.slug,
    title: body.title ?? body.slug,
    number: body.number ?? null,
    category: body.category ?? null,
    dateRange: body.dateRange ?? null,
    shortDescription: body.shortDescription ?? null,
    longDescription: body.longDescription ?? null,
    challenges: body.challenges ?? null,
    solutions: body.solutions ?? null,
    tags: body.tags || [],
    githubUrl: body.githubUrl ?? null,
    liveUrl: body.liveUrl ?? null,
    videoUrl: body.videoUrl ?? null,
    thumbnailUrl: body.thumbnailUrl ?? null,
    galleryUrls: body.galleryUrls || [],
    certificateUrls: body.certificateUrls || [],
    visible: body.visible ?? false,
    displayOrder: body.displayOrder ?? memoryStore.length + 1,
    githubRepoName: body.githubRepoName ?? null,
    syncedAt: body.syncedAt ?? null,
  };
  memoryStore = [...memoryStore, created];
  return created;
}

export function deleteMemoryProject(idOrSlug: {
  id?: number;
  slug?: string;
}): boolean {
  const before = memoryStore.length;
  memoryStore = memoryStore.filter(
    (p) =>
      !(
        (idOrSlug.id != null && p.id === idOrSlug.id) ||
        (idOrSlug.slug && p.slug === idOrSlug.slug)
      )
  );
  return memoryStore.length < before;
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}
