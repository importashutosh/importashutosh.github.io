// Pure helpers: no runtime import from `astro:content` so Vitest can load this file.
import { slugCore } from '../../scripts/lib/slug.mjs';

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
  return slugCore(tag);
}

/** Tag labels deduplicated by slug (first spelling wins, trimmed); tags with an empty slug are dropped. */
export function uniqueTags(tags: string[]): { label: string; slug: string }[] {
  const seen = new Set<string>();
  const out: { label: string; slug: string }[] = [];
  for (const t of tags) {
    const slug = tagSlug(t);
    if (!slug || seen.has(slug)) continue;
    seen.add(slug);
    out.push({ label: t.trim(), slug });
  }
  return out;
}

// Spellings that differ only by case, surrounding whitespace, or space/underscore vs hyphen are one tag.
const tagVariantKey = (tag: string) => tag.trim().toLowerCase().replace(/[\s_-]+/g, '-');

export function collectTags<T extends PostLike>(
  posts: T[],
): { tag: string; slug: string; count: number; posts: T[] }[] {
  const map = new Map<string, { tag: string; slug: string; count: number; posts: T[] }>();
  const variants = new Map<string, Map<string, string>>(); // slug -> variantKey -> first raw spelling
  const errors: string[] = [];
  for (const post of posts) {
    for (const raw of post.data.tags) {
      const slug = tagSlug(raw);
      if (!slug) {
        errors.push(`Tag "${raw}" (post "${post.id}") produces an empty URL slug; use ASCII letters or digits`);
        continue;
      }
      let byKey = variants.get(slug);
      if (!byKey) variants.set(slug, (byKey = new Map()));
      byKey.set(tagVariantKey(raw), byKey.get(tagVariantKey(raw)) ?? raw.trim());
    }
    for (const { label, slug } of uniqueTags(post.data.tags)) {
      let entry = map.get(slug);
      if (!entry) {
        entry = { tag: label, slug, count: 0, posts: [] };
        map.set(slug, entry);
      }
      entry.count++;
      entry.posts.push(post);
    }
  }
  for (const [slug, byKey] of variants) {
    if (byKey.size > 1) {
      errors.push(`Tags ${[...byKey.values()].map((v) => `"${v}"`).join(' and ')} both map to the URL slug "${slug}"; use one spelling`);
    }
  }
  if (errors.length) throw new Error(`Tag check failed:\n${errors.join('\n')}`);
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

/** Previous/next published post in the same series (by seriesOrder). */
export function seriesNeighbours<T extends PostLike>(
  posts: T[],
  post: T,
): { prev: T | undefined; next: T | undefined } {
  const id = post.data.series;
  if (!id) return { prev: undefined, next: undefined };
  const list = seriesPosts(posts, id);
  const i = list.findIndex((p) => p.id === post.id);
  if (i === -1) return { prev: undefined, next: undefined };
  return { prev: list[i - 1], next: list[i + 1] };
}

/** H2/H3 headings for the table of contents; empty (no TOC) with fewer than 3. */
export function tocHeadings<H extends { depth: number }>(headings: H[]): H[] {
  const usable = headings.filter((h) => h.depth === 2 || h.depth === 3);
  return usable.length >= 3 ? usable : [];
}

export function assertSeriesIntegrity(
  posts: PostLike[],
  knownSeries: Record<string, { topics: { order: number }[] }>,
): void {
  const errors: string[] = [];
  const seen = new Map<string, string>();
  for (const p of posts) {
    const s = p.data.series;
    if (!s) continue;
    const known = knownSeries[s];
    if (!known) {
      errors.push(`Post "${p.id}" has unknown series "${s}"`);
      continue;
    }
    const order = p.data.seriesOrder;
    if (order === undefined) {
      errors.push(`Post "${p.id}" is in series "${s}" but has no seriesOrder`);
      continue;
    }
    if (!known.topics.some((t) => t.order === order)) {
      errors.push(
        `Post "${p.id}" has seriesOrder ${order} but series "${s}" has no topic ${order}; add the topic to src/data/series.ts`,
      );
      continue;
    }
    const key = `${s}#${order}`;
    const other = seen.get(key);
    if (other) {
      errors.push(`Posts "${other}" and "${p.id}" share seriesOrder ${order} in series "${s}"`);
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

const PLACEHOLDER_TAG = 'todo-replace-me';
const TODO_WORD = /\bTODO\b/;

/**
 * Fail the build when a non-draft post still carries template placeholder text. Drafts are
 * exempt (they are allowed to be unfinished); everything else would go live unattended.
 */
export function assertNoPlaceholders(posts: PostLike[]): void {
  const errors: string[] = [];
  for (const p of posts) {
    if (p.data.draft) continue;
    const reasons: string[] = [];
    if (p.data.tags.some((t) => tagSlug(t) === PLACEHOLDER_TAG)) reasons.push(`tag "${PLACEHOLDER_TAG}"`);
    for (const field of ['title', 'description'] as const) {
      const v = p.data[field];
      if (TODO_WORD.test(v) || v.includes('PLACEHOLDER')) reasons.push(`${field} contains TODO/PLACEHOLDER`);
    }
    if (p.body && (/^[ \t]*TODO\b/m.test(p.body) || p.body.includes('PLACEHOLDER'))) {
      reasons.push('body contains TODO/PLACEHOLDER');
    }
    if (reasons.length) errors.push(`"${p.id}": ${reasons.join('; ')}`);
  }
  if (errors.length) {
    throw new Error(
      `Placeholder text in published posts (finish them or set draft: true):\n${errors.join('\n')}`,
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
