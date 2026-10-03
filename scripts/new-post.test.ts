import { mkdtempSync, readFileSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
// @ts-expect-error plain ESM script without type declarations
import { EDITORIAL_NOTE, SECTIONS, renderPost, slugify, writePost } from './new-post.mjs';

const HEADINGS = [
  'TL;DR',
  'The problem it solves',
  'How it works',
  'How to implement it',
  'When to use it / when NOT to use it',
  'Practical use cases',
  'Real-world example',
  'From the field',
  'Failure modes and gotchas',
  'Key takeaways',
  'Sources and further reading',
];

const NOTE =
  '{/* Synthesize in your own words; credit sources; never copy phrasing, structure, or diagrams from the source posts. Do not include confidential employer or client details. */}';

function headingsIn(text: string): string[] {
  return [...text.matchAll(/^## (.+)$/gm)].map((m) => m[1]);
}

describe('slugify', () => {
  it('lowercases, drops punctuation and joins with hyphens', () => {
    expect(slugify('Rate Limiting: Token Bucket & Friends!')).toBe('rate-limiting-token-bucket-friends');
  });
  it('throws on empty and symbol-only titles', () => {
    expect(() => slugify('')).toThrow();
    expect(() => slugify('   ')).toThrow();
    expect(() => slugify('!!! ???')).toThrow();
  });
  it('folds accented characters', () => {
    expect(slugify('Café Résumé Naïve')).toBe('cafe-resume-naive');
  });
  it('shares one implementation with tag slugs (plus/sharp)', () => {
    expect(slugify('C++ vs C# for Systems Work')).toBe('c-plus-plus-vs-c-sharp-for-systems-work');
  });
  it('never produces dots or slashes', () => {
    const s: string = slugify('../x');
    expect(s).toBe('x');
    expect(s).not.toMatch(/[./\\]/);
  });
  it('caps length at 80 and trims at a hyphen boundary', () => {
    const s: string = slugify('word '.repeat(40));
    expect(s.length).toBeLessThanOrEqual(80);
    expect(s).toMatch(/^(word-)*word$/);
    expect(slugify('a'.repeat(200)).length).toBe(80);
  });
});

describe('post skeleton', () => {
  it('SECTIONS is exactly the 11 required headings in order', () => {
    expect(SECTIONS).toEqual(HEADINGS);
  });
  it('renderPost has draft, date, title, the exact note and the headings in order', () => {
    const out: string = renderPost('Test Post Title Here', '2026-10-03');
    expect(out).toContain('draft: true');
    expect(out).toContain('date: 2026-10-03');
    expect(out).toContain('title: "Test Post Title Here"');
    expect(EDITORIAL_NOTE).toBe(NOTE);
    expect(out).toContain(`\n${NOTE}\n`);
    expect(out.indexOf(NOTE)).toBeGreaterThan(out.indexOf('\n---\n', 4));
    expect(headingsIn(out)).toEqual(HEADINGS);
  });
  it('_template.mdx has the same headings in order and the exact note', () => {
    const tpl = readFileSync(new URL('../src/content/blog/_template.mdx', import.meta.url), 'utf8');
    expect(headingsIn(tpl)).toEqual(HEADINGS);
    expect(tpl).toContain(`\n${NOTE}\n`);
  });
  it('keeps From the field as author-written text', () => {
    const out: string = renderPost('Test Post Title Here', '2026-10-03');
    expect(out).toMatch(/## From the field\n\n[^\n]*written by you[^\n]*never auto-generated/i);
  });
  it('escapes quotes in the title', () => {
    expect(renderPost('Say "hi" now please', '2026-10-03')).toContain('title: "Say \\"hi\\" now please"');
  });
});

describe('writePost', () => {
  it('writes once and throws "already exists" on the second call', () => {
    const dir = mkdtempSync(join(tmpdir(), 'new-post-'));
    const file = writePost('Test Post Title Here', '2026-10-03', dir);
    expect(file).toBe(join(dir, 'test-post-title-here.mdx'));
    expect(readFileSync(file, 'utf8')).toContain('draft: true');
    expect(() => writePost('Test Post Title Here', '2026-10-03', dir)).toThrow(/already exists/);
  });
  it('rejects titles that produce an empty slug', () => {
    const dir = mkdtempSync(join(tmpdir(), 'new-post-'));
    expect(() => writePost('!!!', '2026-10-03', dir)).toThrow();
  });
});

describe('title length (schema is 10-70 characters)', () => {
  const fresh = () => mkdtempSync(join(tmpdir(), 'new-post-'));
  it('rejects a title shorter than 10 characters and writes nothing', () => {
    const dir = fresh();
    expect(() => writePost('CQRS', '2026-10-03', dir)).toThrow(/10.*70|between 10 and 70/);
    expect(readdirSync(dir)).toEqual([]);
  });
  it('rejects a title longer than 70 characters and writes nothing', () => {
    const dir = fresh();
    expect(() => writePost('w'.repeat(71), '2026-10-03', dir)).toThrow(/shorten/i);
    expect(readdirSync(dir)).toEqual([]);
  });
  it('measures length after trimming', () => {
    expect(() => writePost('   CQRS      ', '2026-10-03', fresh())).toThrow(/lengthen/i);
  });
  it('accepts exactly 10 and exactly 70 characters', () => {
    expect(() => writePost('a'.repeat(10), '2026-10-03', fresh())).not.toThrow();
    expect(() => writePost('b'.repeat(70), '2026-10-03', fresh())).not.toThrow();
  });
});
