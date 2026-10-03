// Usage: npm run new-post "Post title"
// Creates src/content/blog/<slug>.mdx as a dated draft with the 11-section skeleton.
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Heading text is verbatim; hints go in the body. Keep in sync with src/content/blog/_template.mdx.
const SKELETON = [
  ['TL;DR', 'TODO: 3 bullets.'],
  ['The problem it solves', 'TODO'],
  ['How it works', 'TODO: diagram and explanation.'],
  ['How to implement it', 'TODO: steps, code, config.'],
  ['When to use it / when NOT to use it', 'TODO'],
  ['Practical use cases', 'TODO'],
  [
    'Real-world example',
    'TODO: a named large company, the problem, and the result with efficiency gains. Every factual claim must have a source in the frontmatter `sources` list.',
  ],
  [
    'From the field',
    'TODO: your own trade-off or lesson. This section must be written by you, never auto-generated.',
  ],
  ['Failure modes and gotchas', 'TODO'],
  ['Key takeaways', 'TODO'],
  ['Sources and further reading', 'TODO'],
];

export const SECTIONS = SKELETON.map(([heading]) => heading);

export const EDITORIAL_NOTE =
  '{/* Synthesize in your own words; credit sources; never copy phrasing, structure, or diagrams from the source posts. Do not include confidential employer or client details. */}';

const MAX_SLUG = 80;

export function slugify(title) {
  let slug = String(title)
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  if (slug.length > MAX_SLUG) {
    const cut = slug.slice(0, MAX_SLUG + 1);
    // Trim at a hyphen boundary when there is one, otherwise hard-cut.
    slug = (cut[MAX_SLUG] === '-' ? cut.slice(0, MAX_SLUG) : cut.slice(0, cut.lastIndexOf('-')) || cut.slice(0, MAX_SLUG))
      .replace(/-+$/, '');
  }
  if (!slug) throw new Error(`Cannot build a file name from title "${title}".`);
  return slug;
}

export function renderPost(title, today) {
  const body = SKELETON.map(([heading, hint]) => `## ${heading}\n\n${hint}\n`).join('\n');
  return `---
title: ${JSON.stringify(title)}
description: "TODO: write a 80 to 160 character summary that tells a reader what they will learn from this post."
date: ${today}
draft: true
tags: ["todo-replace-me"]
# series: system-design
# seriesOrder: 1
# level: intermediate
# sources:
#   - title: "Source title"
#     url: "https://example.com/"
#     publisher: "Publisher"
---

${EDITORIAL_NOTE}

${body}`;
}

export function writePost(title, today, dir) {
  const file = join(dir, `${slugify(title)}.mdx`);
  const exists = () => new Error(`${file} already exists; refusing to overwrite.`);
  if (existsSync(file)) throw exists();
  mkdirSync(dir, { recursive: true });
  try {
    writeFileSync(file, renderPost(title, today), { flag: 'wx' });
  } catch (err) {
    if (err && err.code === 'EEXIST') throw exists();
    throw err;
  }
  return file;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const title = process.argv.slice(2).join(' ').trim();
  if (!title) {
    console.error('Usage: npm run new-post "Post title"');
    process.exit(1);
  }
  try {
    const dir = fileURLToPath(new URL('../src/content/blog/', import.meta.url));
    console.log(`Created ${writePost(title, new Date().toISOString().slice(0, 10), dir)}`);
  } catch (err) {
    console.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  }
}
