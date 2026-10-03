// Post-build checks on dist/. Run via `npm run check` after `npm run build`.
// Exports checkDist() for tests; the CLI wrapper exits 1 on any violation.
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, relative, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { XMLParser, XMLValidator } from 'fast-xml-parser';

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

function externalHost(url) {
  const m = /^(?:https?:)?\/\/([^/:?#\s]+)/i.exec(url.trim());
  return m ? m[1].toLowerCase() : null;
}

function hostAllowed(host, allowed) {
  return allowed.some((a) => host === a || host.endsWith('.' + a));
}

function attr(tag, name) {
  const m = new RegExp(`\\s${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i').exec(tag);
  return m ? (m[1] ?? m[2] ?? m[3]) : null;
}

// Personal data must never ship in the built site. Detected generically so no personal literal lives in the repo.
export const FORBIDDEN_STRINGS = ['tel:', 'mailto:', '@gmail.com', 'bit.ly'];
export const FORBIDDEN_PATTERNS = [
  {
    // Indian mobile number: optional +91, then 10 digits starting 6-9 (optionally split 5+5).
    // Lookarounds keep it off hashes, ids and longer numbers.
    name: 'Indian mobile number',
    regex: /(?<![\w.+-])(?:\+?91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}(?![\w-])/,
  },
];

export function checkDist(distDir, opts) {
  const { allowedHosts, forbidden, forbiddenPatterns = [], draftSlugs, requireSitemapAndRss = false } = opts;
  const violations = [];
  const files = walk(distDir);
  const rel = (f) => relative(distDir, f).split('\\').join('/');

  for (const f of files) {
    const ext = extname(f).toLowerCase();
    if (!['.html', '.txt', '.xml'].includes(ext)) continue;
    const text = readFileSync(f, 'utf8');

    // (1) forbidden strings
    for (const s of forbidden) {
      if (text.includes(s)) violations.push(`${rel(f)}: contains forbidden string "${s}"`);
    }
    for (const { name, regex } of forbiddenPatterns) {
      if (regex.test(text)) violations.push(`${rel(f)}: matches forbidden pattern (${name})`);
    }

    if (ext !== '.html') continue;

    // (2) external script/stylesheet/preconnect hosts
    for (const m of text.matchAll(/<(script|link)\b[^>]*>/gi)) {
      const tag = m[0];
      let url = null;
      if (m[1].toLowerCase() === 'script') url = attr(tag, 'src');
      else {
        const relAttr = (attr(tag, 'rel') ?? '').toLowerCase().split(/\s+/);
        if (relAttr.includes('stylesheet') || relAttr.includes('preconnect')) url = attr(tag, 'href');
      }
      if (!url) continue;
      const host = externalHost(url);
      if (host && !hostAllowed(host, allowedHosts)) {
        violations.push(`${rel(f)}: external host not allowed: ${host} (${url})`);
      }
    }

    // (6) exactly one h1 (404 exempt)
    if (rel(f) !== '404.html') {
      const count = (text.match(/<h1[\s>]/gi) ?? []).length;
      if (count !== 1) violations.push(`${rel(f)}: expected exactly one <h1>, found ${count}`);
    }
  }

  // (3) draft slugs must not be built
  for (const slug of draftSlugs) {
    if (existsSync(join(distDir, 'writing', slug))) {
      violations.push(`writing/${slug}/: draft post was built`);
    }
  }

  if (requireSitemapAndRss) {
    for (const f of ['sitemap-0.xml', 'sitemap-index.xml', 'sitemap.xml', 'rss.xml']) {
      if (!existsSync(join(distDir, f))) violations.push(`${f}: missing from dist`);
    }
  }

  // (4) sitemap-0.xml
  const sitemap = join(distDir, 'sitemap-0.xml');
  if (existsSync(sitemap)) {
    const xml = readFileSync(sitemap, 'utf8');
    if (xml.includes('/writing/tags/')) violations.push('sitemap-0.xml: contains /writing/tags/ URL');
    for (const slug of draftSlugs) {
      if (xml.includes(`/writing/${slug}/`)) violations.push(`sitemap-0.xml: contains draft slug ${slug}`);
    }
  }

  // (5) rss.xml parses
  const rss = join(distDir, 'rss.xml');
  if (existsSync(rss)) {
    const xml = readFileSync(rss, 'utf8');
    const valid = XMLValidator.validate(xml);
    if (valid !== true) {
      violations.push(`rss.xml: does not parse (${valid.err?.msg ?? 'invalid XML'})`);
    } else {
      try {
        new XMLParser().parse(xml);
      } catch (e) {
        violations.push(`rss.xml: does not parse (${e.message})`);
      }
    }
  }

  return violations;
}

// Frontmatter scan for draft posts; avoids needing Astro in the CLI.
// Mirrors the collection glob (`**/[^_]*.{md,mdx}`): recurses, skips names starting with `_`,
// and keys each slug on the collection id (path relative to blogDir, no extension, forward slashes).
// Only a boolean `draft: true` (optionally followed by a `# comment`) counts; the quoted string "true" does not.
export function readDraftSlugs(blogDir, base = blogDir) {
  if (!existsSync(blogDir)) return [];
  const slugs = [];
  for (const name of readdirSync(blogDir)) {
    if (name.startsWith('_')) continue;
    const p = join(blogDir, name);
    if (statSync(p).isDirectory()) {
      slugs.push(...readDraftSlugs(p, base));
      continue;
    }
    if (!/\.(mdx?)$/i.test(name)) continue;
    const fm = /^---\r?\n([\s\S]*?)\r?\n---/.exec(readFileSync(p, 'utf8'));
    if (fm && /^draft:[ \t]*true[ \t]*(#.*)?$/m.test(fm[1])) {
      slugs.push(relative(base, p).split('\\').join('/').replace(/\.mdx?$/i, ''));
    }
  }
  return slugs;
}

// Same code path as the CLI: scan drafts in srcBlogDir, then check distDir.
export function main(distDir, srcBlogDir) {
  return checkDist(distDir, {
    allowedHosts: ['plausible.io'],
    forbidden: FORBIDDEN_STRINGS,
    forbiddenPatterns: FORBIDDEN_PATTERNS,
    draftSlugs: readDraftSlugs(srcBlogDir),
    requireSitemapAndRss: true,
  });
}

const isCli = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isCli) {
  const root = resolve(fileURLToPath(import.meta.url), '..', '..');
  const distDir = join(root, 'dist');
  if (!existsSync(distDir)) {
    console.error('check: dist/ not found. Run `npm run build` first.');
    process.exit(1);
  }
  const violations = main(distDir, join(root, 'src', 'content', 'blog'));
  if (violations.length) {
    console.error(`check: ${violations.length} violation(s)`);
    for (const v of violations) console.error(`  - ${v}`);
    process.exit(1);
  }
  console.log('check: dist/ OK');
}
