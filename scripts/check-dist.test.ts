import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
// @ts-expect-error plain .mjs module
import { checkDist } from './check-dist.mjs';

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
