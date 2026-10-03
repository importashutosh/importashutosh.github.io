import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
// @ts-expect-error plain .mjs module
import { checkDist, readDraftSlugs, main } from './check-dist.mjs';

const opts = {
  allowedHosts: ['plausible.io'],
  forbidden: ['tel:', 'mailto:', '8375855754', 'ashutosh.jha3006', 'bit.ly'],
  draftSlugs: ['secret-draft'],
};

const page = (body: string, head = '') =>
  `<!doctype html><html><head><title>t</title>${head}</head><body>${body}</body></html>`;

let dir: string;
function write(rel: string, content: string) {
  const p = join(dir, rel);
  mkdirSync(join(p, '..'), { recursive: true });
  writeFileSync(p, content);
}

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'check-dist-'));
  write('index.html', page('<h1>Home</h1>'));
});
afterEach(() => rmSync(dir, { recursive: true, force: true }));

describe('checkDist', () => {
  it('returns [] for a clean fixture', () => {
    write('404.html', page('<p>none</p>'));
    write('rss.xml', '<rss version="2.0"><channel><title>x</title></channel></rss>');
    write('sitemap-0.xml', '<urlset><url><loc>https://x.test/writing/a/</loc></url></urlset>');
    expect(checkDist(dir, opts)).toEqual([]);
  });

  it('flags a forbidden string (mailto:)', () => {
    write('contact/index.html', page('<h1>C</h1><a href="mailto:a@b.c">m</a>'));
    const v = checkDist(dir, opts);
    expect(v.some((m: string) => m.includes('mailto:'))).toBe(true);
  });

  it('flags a script from a non-allowed host but not plausible.io', () => {
    write('a/index.html', page('<h1>A</h1>', '<script defer src="https://evil.example/x.js"></script>'));
    write('b/index.html', page('<h1>B</h1>', '<script defer src="https://plausible.io/js/s.js"></script>'));
    const v = checkDist(dir, opts);
    expect(v.some((m: string) => m.includes('evil.example'))).toBe(true);
    expect(v.some((m: string) => m.includes('plausible.io'))).toBe(false);
  });

  it('flags an external stylesheet or preconnect link', () => {
    write('a/index.html', page('<h1>A</h1>', '<link rel="preconnect" href="https://fonts.evil.example">'));
    expect(checkDist(dir, opts).some((m: string) => m.includes('fonts.evil.example'))).toBe(true);
  });

  it('flags a page with two h1', () => {
    write('two/index.html', page('<h1>a</h1><h1>b</h1>'));
    expect(checkDist(dir, opts).some((m: string) => m.includes('two/index.html') && m.includes('h1'))).toBe(true);
  });

  it('exempts 404.html from the h1 rule', () => {
    write('404.html', page('<p>none</p>'));
    expect(checkDist(dir, opts)).toEqual([]);
  });

  it('flags a draft slug directory', () => {
    write('writing/secret-draft/index.html', page('<h1>D</h1>'));
    expect(checkDist(dir, opts).some((m: string) => m.includes('secret-draft'))).toBe(true);
  });

  it('flags tag URLs and draft slugs in sitemap-0.xml', () => {
    write(
      'sitemap-0.xml',
      '<urlset><url><loc>https://x.test/writing/tags/foo/</loc></url><url><loc>https://x.test/writing/secret-draft/</loc></url></urlset>',
    );
    const v = checkDist(dir, opts);
    expect(v.some((m: string) => m.includes('/writing/tags/'))).toBe(true);
    expect(v.some((m: string) => m.includes('secret-draft'))).toBe(true);
  });

  it('flags an rss.xml that does not parse', () => {
    write('rss.xml', '<rss><channel><title>x</channel>');
    expect(checkDist(dir, opts).some((m: string) => m.includes('rss.xml'))).toBe(true);
  });
});

describe('checkDist: sitemap/rss requirement and slug matching', () => {
  const full = (d: string) => {
    for (const f of ['sitemap-0.xml', 'sitemap-index.xml', 'sitemap.xml']) {
      writeFileSync(join(d, f), '<urlset></urlset>');
    }
    writeFileSync(join(d, 'rss.xml'), '<rss version="2.0"><channel><title>x</title></channel></rss>');
  };

  it('missing sitemap/rss files are violations when requireSitemapAndRss is true', () => {
    const v = checkDist(dir, { ...opts, requireSitemapAndRss: true });
    for (const f of ['sitemap-0.xml', 'sitemap-index.xml', 'sitemap.xml', 'rss.xml']) {
      expect(v.some((m: string) => m.startsWith(f) && m.includes('missing'))).toBe(true);
    }
  });

  it('passes when all required files exist', () => {
    full(dir);
    expect(checkDist(dir, { ...opts, requireSitemapAndRss: true })).toEqual([]);
  });

  it('is fixture-friendly when the option is off (default)', () => {
    expect(checkDist(dir, opts)).toEqual([]);
  });

  it('draft slug "foo" does not match published "foo-bar" in the sitemap', () => {
    writeFileSync(join(dir, 'sitemap-0.xml'), '<urlset><url><loc>https://x.test/writing/foo-bar/</loc></url></urlset>');
    expect(checkDist(dir, { ...opts, draftSlugs: ['foo'] })).toEqual([]);
    writeFileSync(join(dir, 'sitemap-0.xml'), '<urlset><url><loc>https://x.test/writing/foo/</loc></url></urlset>');
    expect(checkDist(dir, { ...opts, draftSlugs: ['foo'] }).length).toBe(1);
  });
});

describe('readDraftSlugs and main (CLI code path)', () => {
  const post = (draft: string) => `---\ntitle: "t"\ndate: 2026-01-01\ndraft: ${draft}\n---\n\nbody\n`;
  let src: string;
  beforeEach(() => {
    src = join(dir, 'src-blog');
    mkdirSync(join(src, 'series', 'deep'), { recursive: true });
    writeFileSync(join(src, 'plain.mdx'), post('true'));
    writeFileSync(join(src, 'commented.md'), post('true # wip'));
    writeFileSync(join(src, 'published.mdx'), post('false'));
    writeFileSync(join(src, 'quoted.mdx'), post('"true"'));
    writeFileSync(join(src, '_template.mdx'), post('true'));
    writeFileSync(join(src, 'series', 'nested.mdx'), post('true'));
    writeFileSync(join(src, 'series', 'deep', 'deeper.mdx'), post('true'));
    mkdirSync(join(src, '_private'));
    writeFileSync(join(src, '_private', 'x.mdx'), post('true'));
  });

  it('finds boolean drafts recursively, keyed by collection id', () => {
    expect(readDraftSlugs(src).sort()).toEqual(['commented', 'plain', 'series/deeper'.replace('series/', 'series/deep/'), 'series/nested'].sort());
  });

  it('ignores draft: false, quoted "true" (not a boolean), and _-prefixed files/dirs', () => {
    const s = readDraftSlugs(src);
    for (const n of ['published', 'quoted', '_template', '_private/x']) expect(s).not.toContain(n);
  });

  it('main() flags a built nested draft and missing sitemap/rss', () => {
    write('writing/series/nested/index.html', page('<h1>N</h1>'));
    const v = main(dir, src);
    expect(v.some((m: string) => m.includes('series/nested'))).toBe(true);
    expect(v.some((m: string) => m.startsWith('rss.xml') && m.includes('missing'))).toBe(true);
  });
});
