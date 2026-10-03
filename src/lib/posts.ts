// Pure helpers: no runtime import from `astro:content` so Vitest can load this file.
export type PostLike = {
  id: string;
  body?: string;
  data: {
    title: string;
    description: string;
    date: Date;
    updated?: Date;
    tags: string[];
    series?: string;
    seriesOrder?: number;
    level?: 'beginner' | 'intermediate' | 'advanced';
    draft: boolean;
    canonicalUrl?: string;
    ogImage?: string;
    sources?: { title: string; url: string; publisher?: string }[];
    email: boolean;
    emailSubject?: string;
    emailPreview?: string;
  };
};

export function isPublished(post: PostLike, now: Date = new Date()): boolean {
  return !post.data.draft && post.data.date.getTime() <= now.getTime();
}

export function sortNewestFirst<T extends PostLike>(posts: T[]): T[] {
  return [...posts].sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export function tagSlug(tag: string): string {
  return tag
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function collectTags<T extends PostLike>(
  posts: T[],
): { tag: string; slug: string; count: number; posts: T[] }[] {
  const map = new Map<string, { tag: string; slug: string; count: number; posts: T[] }>();
  for (const post of posts) {
    const seen = new Set<string>();
    for (const raw of post.data.tags) {
      const slug = tagSlug(raw);
      if (!slug || seen.has(slug)) continue;
      seen.add(slug);
      let entry = map.get(slug);
      if (!entry) {
        entry = { tag: raw.trim(), slug, count: 0, posts: [] };
        map.set(slug, entry);
      }
      entry.count++;
      entry.posts.push(post);
    }
  }
  return [...map.values()].sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

export function relatedPosts<T extends PostLike>(post: T, all: T[], limit = 3): T[] {
  const mine = new Set(post.data.tags.map(tagSlug));
  return all
    .filter((p) => p.id !== post.id)
    .map((p) => ({
      p,
      shared: new Set(p.data.tags.map(tagSlug).filter((s) => mine.has(s))).size,
    }))
    .filter((x) => x.shared > 0)
    .sort((a, b) => b.shared - a.shared || b.p.data.date.getTime() - a.p.data.date.getTime())
    .slice(0, limit)
    .map((x) => x.p);
}

export function seriesPosts<T extends PostLike>(posts: T[], seriesId: string): T[] {
  return posts
    .filter((p) => p.data.series === seriesId)
    .sort((a, b) => (a.data.seriesOrder ?? 0) - (b.data.seriesOrder ?? 0));
}

export function assertSeriesIntegrity(posts: PostLike[], knownSeries: string[]): void {
  const errors: string[] = [];
  const seen = new Map<string, string>();
  for (const p of posts) {
    const s = p.data.series;
    if (!s) continue;
    if (!knownSeries.includes(s)) {
      errors.push(`Post "${p.id}" has unknown series "${s}"`);
      continue;
    }
    const key = `${s}#${p.data.seriesOrder}`;
    const other = seen.get(key);
    if (other) {
      errors.push(`Posts "${other}" and "${p.id}" share seriesOrder ${p.data.seriesOrder} in series "${s}"`);
    } else {
      seen.set(key, p.id);
    }
  }
  if (errors.length) throw new Error(`Series integrity check failed:\n${errors.join('\n')}`);
}

/** Fail the build when a post id would collide with /writing/page/N/, /writing/tags/... or be ambiguous. */
export function assertRoutablePostIds(posts: PostLike[]): void {
  const bad = posts
    .map((p) => p.id)
    .filter(
      (id) =>
        id === 'page' ||
        id === 'tags' ||
        id.startsWith('page/') ||
        id.startsWith('tags/') ||
        /^\d+$/.test(id) ||
        id.split('/').some((seg) => seg === ''),
    );
  if (bad.length) {
    throw new Error(
      `Post ids collide with reserved /writing/ routes or are malformed: ${bad.map((id) => `"${id}"`).join(', ')}. Rename the files.`,
    );
  }
}

export function readingMinutes(body: string): number {
  const text = body
    .replace(/^(```|~~~)[^\n]*\n[\s\S]*?^\1[ \t]*$/gm, ' ')
    .replace(/^\s*import\s.+$/gm, ' ');
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}
