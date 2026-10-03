// Usage: npm run new-post "Post title"
// Creates src/content/blog/<slug>.mdx as a dated draft with the 11-section skeleton.
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const SECTIONS = [
  'TL;DR',
  'Why this matters',
  'Core concepts',
  'How it works',
  'Worked example',
  'Trade-offs and alternatives',
  'When not to use it',
  'Common pitfalls',
  'Scaling and failure modes',
  'Key takeaways',
  'Sources and further reading',
];

const EDITORIAL_NOTE =
  'Editorial rules: synthesize in your own words, credit every source in the frontmatter `sources` list, ' +
  'do not copy phrasing, structure or diagrams from a source, and leave out confidential employer or client details.';

export function slugify(title) {
  return String(title)
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function renderPost(title, today) {
  const body = SECTIONS.map((s) => `## ${s}\n\nTODO\n`).join('\n');
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

{/* ${EDITORIAL_NOTE} */}

${body}`;
}

export function writePost(title, today, dir) {
  const slug = slugify(title);
  if (!slug) throw new Error(`Cannot build a file name from title "${title}".`);
  const file = join(dir, `${slug}.mdx`);
  if (existsSync(file)) throw new Error(`${file} already exists; refusing to overwrite.`);
  mkdirSync(dir, { recursive: true });
  writeFileSync(file, renderPost(title, today), { flag: 'wx' });
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
