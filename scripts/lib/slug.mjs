// Single slug implementation shared by scripts/new-post.mjs (plain Node) and src/lib/posts.ts (Astro/Vitest).
// Kept as plain ESM with no imports so both can load it.

/**
 * Lowercase ASCII slug: accents fold (NFKD), "+" reads as "plus" and "#" as "sharp"
 * (so "C++" and "C#" stay distinct), everything else non-alphanumeric becomes a hyphen.
 * Returns "" when nothing usable is left (callers decide whether that is an error).
 * @param {string} text
 * @returns {string}
 */
export function slugCore(text) {
  return String(text)
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\+/g, ' plus ')
    .replace(/#/g, ' sharp ')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
