import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
// @ts-expect-error plain ESM script without type declarations
import { SECTIONS, renderPost, slugify, writePost } from './new-post.mjs';

describe('slugify', () => {
  it('lowercases, drops punctuation and joins with hyphens', () => {
    expect(slugify('Rate Limiting: Token Bucket & Friends!')).toBe('rate-limiting-token-bucket-friends');
  });
});

describe('renderPost', () => {
  const out: string = renderPost('Test Post Title Here', '2026-10-03');
  it('is a draft with today date and the title', () => {
    expect(out).toContain('draft: true');
    expect(out).toContain('date: 2026-10-03');
    expect(out).toContain('title: "Test Post Title Here"');
  });
  it('contains all 11 section headings in order', () => {
    expect(SECTIONS).toHaveLength(11);
    expect(SECTIONS[0]).toBe('TL;DR');
    expect(SECTIONS[10]).toBe('Sources and further reading');
    let last = -1;
    for (const s of SECTIONS as string[]) {
      const i = out.indexOf(`## ${s}\n`);
      expect(i, s).toBeGreaterThan(last);
      last = i;
    }
  });
  it('escapes quotes in the title', () => {
    expect(renderPost('Say "hi" now please', '2026-10-03')).toContain('title: "Say \\"hi\\" now please"');
  });
  it('stays in sync with _template.mdx headings', () => {
    const tpl = readFileSync(new URL('../src/content/blog/_template.mdx', import.meta.url), 'utf8');
    for (const s of SECTIONS as string[]) expect(tpl).toContain(`## ${s}\n`);
  });
});

describe('writePost', () => {
  it('writes once and throws on the second call', () => {
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
