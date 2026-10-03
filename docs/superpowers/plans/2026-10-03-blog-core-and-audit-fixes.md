# Blog Core + Audit Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a text blog (System Design series first) to the existing Astro portfolio, and apply the home-page, contact-privacy and legal-page fixes from the audit, with every monetisation and third-party piece left dormant behind config.

**Architecture:** Astro content collection (`blog`) feeds a pure helper layer (`src/lib/posts.ts`, unit-tested with Vitest) which every page, feed and sitemap reads through, so drafts and future-dated posts cannot leak. Shared `Nav`/`Footer` components replace the inline nav/footer in `index.astro`. A single `site.config.ts` holds the domain and the dormant analytics/ads/newsletter/contact fields. A post-build script (`scripts/check-dist.mjs`) asserts the privacy and no-leak rules on `dist/`.

**Tech Stack:** Astro 7, Tailwind 4, `@astrojs/mdx`, `@astrojs/sitemap`, `@astrojs/rss`, Shiki (built into Astro), Vitest, `@fontsource` fonts, GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-10-03-blog-core-and-audit-fixes-design.md`

## Global Constraints

- Node `>=22.12.0` (installed: 24.21). Astro `^7.3.5`, Tailwind `^4.3.3`. Check Astro APIs (content config, loaders, MDX, RSS) against https://docs.astro.build before use; do not rely on memory for Astro 7.
- Commit messages end with `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`.
- `trailingSlash: 'always'`. Existing anchors `#products`, `#skills`, `#experience`, `#faq` and URLs `/resume.pdf`, `/og.png`, `/llms.txt`, `/robots.txt`, `/sitemap.xml` keep working.
- The domain lives in exactly one place: `site.config.ts` → `siteUrl` (`https://importashutosh.github.io`). Nothing else hard-codes it.
- No metric, client name, award, date or claim text in `src/data/content.ts` may change, except the explicit field removals and FAQ edits in Task 10.
- Third-party requests in built HTML: only the existing Plausible script (`plausible.io`, owner decision pending; allowlisted in the check script). Google Fonts is replaced by self-hosted fonts. No cookies set. No ad or analytics code beyond that.
- Ads, newsletter, analytics, consent and search-console config fields exist in `site.config.ts` but nothing reads them this cycle. `Subscribe` always renders the RSS + LinkedIn fallback.
- Drafts (`draft: true`), future-dated posts and files starting with `_` never appear in `dist/`.
- Design tokens come from `src/styles/global.css` (`--bg #FAFAF8`, `--accent #10243E`, IBM Plex Serif headings, Inter body). No new visual language; blog pages reuse tokens and existing classes.
- Phone number and plain-text email removed from rendered pages, `llms.txt`, and JSON-LD. `person.blog` (bit.ly) removed everywhere.
- Post pages ship no third-party requests; client JS limited to TOC highlight, copy-code, copy-link, and the existing nav/reveal scripts.
- Responsive from 320px, no horizontal scroll, tap targets ≥ 44px, visible focus, `prefers-reduced-motion` respected.

## Review Focus

1. **Boundary date:** a post dated today (`date: 2026-10-03`, parsed as 00:00 UTC) is published once the build runs at or after that instant; a post dated tomorrow is not. Tested in Task 3.
2. **Empty collection:** with zero published posts `/writing/`, `/series/system-design/`, the home page and `rss.xml` still build (Astro's `paginate()` with an empty array emits no page 1). Tested in Task 4 and the check script.
3. **Tag normalisation:** tags `System Design`, `system-design` and `System-Design ` map to one slug `system-design`; tags with spaces, capitals or `&` produce URL-safe slugs and one tag page. Tested in Task 3.
4. **Series integrity:** two posts with the same `seriesOrder` in one series, or a `series` id that is not in `series.ts`, fails the build with the file names in the message. Tested in Task 3.
5. **Escaping and overrides:** a title or description containing `&`, `<`, quotes renders correctly in `<title>`, meta, Open Graph and `rss.xml`; a `canonicalUrl` in frontmatter overrides the canonical tag. Tested in Tasks 5 and 6.

---

### Task 1: Tooling, config, and layout foundation

**Files:**
- Create: `site.config.ts`, `src/lib/url.ts`, `vitest.config.ts`, `src/lib/url.test.ts`
- Modify: `astro.config.mjs`, `package.json`, `src/layouts/Layout.astro`, `src/styles/global.css:1-30`, `public/robots.txt`
- Delete: `public/sitemap.xml`
- Create: `src/pages/sitemap.xml.ts`

**Interfaces:**
- Produces: `siteConfig` (default export of `site.config.ts`) with fields `siteUrl`, `siteName`, `analytics.ga4MeasurementId`, `searchConsole.verificationToken`, `ads.{enabled,adsensePublisherId,slots,showOnPages,minWordsForAds}`, `newsletter.{provider,workerUrl,turnstileSiteKey,audienceId,fromName,fromEmail,replyTo,testRecipient,sendMode,cadence,autoSend,requireApproval,footerAddress}`, `consent.{region,showBanner}`, `contact.formEndpoint` — exact shape and defaults as in brief §7.1, all strings `""`.
- Produces: `absoluteUrl(path: string): string` in `src/lib/url.ts` (joins `siteConfig.siteUrl` and a path, exactly one slash between, preserves trailing slash).
- Produces: `Layout.astro` props `{ title?: string; description?: string; ogImage?: string; canonicalPath?: string; canonicalUrl?: string; ogType?: 'website' | 'article'; noindex?: boolean }` and a named slot `head` inside `<head>`. `canonicalUrl` (absolute) wins over `canonicalPath`; default is the current `Astro.url.pathname`.

- [ ] **Step 1: Install dependencies.** `npm i @astrojs/mdx @astrojs/sitemap @astrojs/rss @fontsource/ibm-plex-serif @fontsource-variable/inter` and `npm i -D vitest fast-xml-parser`. Add scripts `"test": "vitest run"`, `"check": "node scripts/check-dist.mjs"`.
- [ ] **Step 2: Write failing tests** in `src/lib/url.test.ts`: `absoluteUrl('/writing/')` → `https://importashutosh.github.io/writing/`; `absoluteUrl('writing/')` gives the same; `absoluteUrl('/')` → `https://importashutosh.github.io/`.
- [ ] **Step 3: Run** `npx vitest run` → FAIL (module missing).
- [ ] **Step 4: Create `site.config.ts` and `absoluteUrl`.** `vitest.config.ts` just sets `test.include` to `src/**/*.test.ts` and `scripts/**/*.test.ts`. Run tests → PASS.
- [ ] **Step 5: `astro.config.mjs`:** import `siteConfig`, set `site: siteConfig.siteUrl`, `trailingSlash: 'always'`, integrations `mdx()` and `sitemap({ filter: (page) => !page.includes('/writing/tags/') })` (tag archives are excluded from the sitemap wholesale; this is a superset of the "noindex pages" rule).
- [ ] **Step 6: `Layout.astro`:** replace `person.siteUrl` usage with `absoluteUrl`; add the props above; emit `<meta name="robots" content="noindex">` when `noindex`; `og:type` from `ogType`; remove the Google Fonts `<link>` tags and import `@fontsource/ibm-plex-serif/{500,600,700}.css` and `@fontsource-variable/inter` in the frontmatter; keep the Plausible script unchanged; move the `Person` JSON-LD out of Layout into the `head` slot of `index.astro` (Task 7) and drop its `email`, `telephone` and `person.blog` entries now. Add `<link rel="alternate" type="application/rss+xml" href="/rss.xml">` and `<slot name="head" />`.
- [ ] **Step 7: `global.css`:** change `--font-body` first family to `'Inter Variable'` (keep `'Inter'` after it). No other visual change.
- [ ] **Step 8: Leave `content.ts` fields in place for now** (`person.email`, `phone`, `blog`, `siteUrl` are still referenced by `index.astro` until Tasks 2, 9 and 10 replace those references). Only stop *using* them in `Layout.astro`. Task 10 deletes them.
- [ ] **Step 9: Delete `public/sitemap.xml`; create `src/pages/sitemap.xml.ts`** (`GET`) emitting a `<sitemapindex>` with a single `<sitemap><loc>` pointing at `absoluteUrl('/sitemap-0.xml')`, so the existing `/sitemap.xml` URL keeps working. Update `public/robots.txt` Sitemap line to `https://importashutosh.github.io/sitemap-index.xml`.
- [ ] **Step 10: Verify.** `npm run build` succeeds; `dist/sitemap.xml`, `dist/sitemap-0.xml` exist; view-source of `dist/index.html` has no `fonts.googleapis.com`. Run `npm run dev` (background mode per CLAUDE.md) and confirm the home page looks identical (fonts render).
- [ ] **Step 11: Commit** `feat: add site config, vitest, self-hosted fonts, per-page layout props`.

---

### Task 2: Shared Nav and Footer components

**Files:**
- Create: `src/components/Nav.astro`, `src/components/Footer.astro`
- Modify: `src/pages/index.astro:27-46,244-257`, `src/styles/global.css` (add `.text-link`, footer legal row)

**Interfaces:**
- Consumes: `person`, `siteConfig`, `Layout.astro` (mobile-nav script keys off ids `nav-toggle`, `nav-links`; keep them).
- Produces: `<Nav current?: 'home' | 'writing' | 'other' />` and `<Footer />`. Nav items in order: Products, Stack, Career, Writing, FAQ, LinkedIn ↗, Book a Call (class `nav-cta`). In-page anchors are `#products` etc. on `/` and `/#products` elsewhere (derive from `Astro.url.pathname`). Writing → `/writing/`. Footer: Contact (`/contact/`), LinkedIn, GitHub, Book a Call (btn-primary btn-sm), Privacy, Cookies, Disclaimer links; line "Views expressed here are my own and do not represent my employer."; "Last updated {build date, YYYY-MM-DD}"; existing copyright line. No `tel:`/`mailto:`.

- [ ] **Step 1:** Extract the existing nav markup into `Nav.astro` and footer into `Footer.astro`, applying the contents above (this also delivers audit items 2 [nav rename/Writing link], 5-footer, 6, 12, 15 for the footer/nav portions). Use `<Nav current="home" />` and `<Footer />` in `index.astro`.
- [ ] **Step 2:** Add `.text-link` (underlined muted link, min-height 44px tap area) and footer legal-row styles to `global.css` using existing tokens.
- [ ] **Step 3: Verify.** `npm run build`; grep `dist/index.html` for `tel:` and `mailto:` → none; "Writing" and "FAQ" present, "AEO / FAQ" absent; mobile nav still toggles (browser check at 375px).
- [ ] **Step 4: Commit** `feat: extract shared Nav and Footer, remove phone and email from footer`.

---

### Task 3: Content collection, post helpers, series data

**Files:**
- Create: `src/content.config.ts`, `src/lib/posts.ts`, `src/lib/posts.test.ts`, `src/lib/collection.ts`, `src/data/series.ts`
- Create: `src/content/blog/.gitkeep` (directory must exist)

**Interfaces:**
- Produces in `src/lib/posts.ts` (pure, no `astro:content` runtime import; use `import type`):
  - `type PostLike = { id: string; body?: string; data: { title: string; description: string; date: Date; updated?: Date; tags: string[]; series?: string; seriesOrder?: number; level?: 'beginner'|'intermediate'|'advanced'; draft: boolean; canonicalUrl?: string; ogImage?: string; sources?: {title:string;url:string;publisher?:string}[]; email: boolean; emailSubject?: string; emailPreview?: string } }`
  - `isPublished(post: PostLike, now?: Date): boolean`
  - `sortNewestFirst<T extends PostLike>(posts: T[]): T[]`
  - `tagSlug(tag: string): string`
  - `collectTags<T extends PostLike>(posts: T[]): { tag: string; slug: string; count: number; posts: T[] }[]` (sorted by count desc, then name)
  - `relatedPosts<T extends PostLike>(post: T, all: T[], limit = 3): T[]` (by shared tag-slug count desc, then newest; excludes self)
  - `seriesPosts<T extends PostLike>(posts: T[], seriesId: string): T[]` (sorted by `seriesOrder` asc)
  - `assertSeriesIntegrity(posts: PostLike[], knownSeries: string[]): void` (throws `Error` naming offending post ids)
  - `readingMinutes(body: string): number` (200 wpm, minimum 1, ignores fenced code blocks and MDX import lines)
- Produces in `src/lib/collection.ts`: `getPublishedPosts(now?: Date): Promise<CollectionEntry<'blog'>[]>` (loads collection, filters with `isPublished`, calls `assertSeriesIntegrity` against `Object.keys(series)`, sorts newest first).
- Produces in `src/data/series.ts`: `type SeriesTopic = { order: number; title: string }`; `series: Record<string, { id: string; title: string; description: string; topics: SeriesTopic[] }>` with the key `'system-design'`. Seed `topics` with only the topics named in the brief (Rate limiting, Consistent hashing, Kafka and message queues, Sharding, CQRS, Saga pattern, CDN, Caching), numbered 1–8, with a `// OWNER: add remaining topics to reach 30` comment. "Part N of M" uses `topics.length`, not a literal 30.

- [ ] **Step 1: Write failing tests** in `posts.test.ts`:
  - `isPublished` false for `draft: true`; true for `date` equal to `now`; true for date before `now`; false for date one day after `now`. (Review Focus 1)
  - `tagSlug('System Design')`, `tagSlug('system-design')`, `tagSlug(' System-Design ')` all equal `'system-design'`; `tagSlug('CQRS & Saga')` is `'cqrs-saga'`. `collectTags` merges the three spellings into one entry with count 3. (Review Focus 3)
  - `relatedPosts` returns at most 3, excludes the post itself, ranks by shared tags.
  - `seriesPosts` orders by `seriesOrder`.
  - `assertSeriesIntegrity` throws when two posts share `(series, seriesOrder)` (message contains both ids) and when `series` is not in `knownSeries`; does not throw for posts without `series`. (Review Focus 4)
  - `readingMinutes('word '.repeat(400))` is 2; empty body is 1; a 1000-word fenced code block adds nothing.
- [ ] **Step 2:** `npx vitest run src/lib/posts.test.ts` → FAIL.
- [ ] **Step 3: Implement `posts.ts`** to satisfy the tests.
- [ ] **Step 4:** Run tests → PASS.
- [ ] **Step 5: `src/content.config.ts`:** `blog` collection, glob loader over `src/content/blog` with pattern `**/[^_]*.{md,mdx}`; zod schema per spec: `title` 10–70 chars, `description` 80–160 chars, `date` via `z.coerce.date()`, `tags` non-empty string array, optional fields as in `PostLike`, `draft` default `false`, `email` default `true`, `sources` items with `url` validated as URL. Confirm loader and `z` import paths in the Astro 7 docs first.
- [ ] **Step 6: Implement `collection.ts` and `series.ts`.**
- [ ] **Step 7: Verify.** `npm run build` still passes with an empty collection (a content-collection "no entries" warning is acceptable; an error is not: resolve it by keeping `.gitkeep` and checking the loader's base path).
- [ ] **Step 8: Commit** `feat: blog content collection, post helpers with tests, series data`.

---

### Task 4: Blog index, pagination, tag archives

**Files:**
- Create: `src/pages/writing/[...page].astro`, `src/pages/writing/tags/[tag].astro`, `src/components/PostCard.astro`, `src/components/Subscribe.astro`
- Modify: `src/styles/global.css` (blog list styles, `.tag-chip`, `.level-badge`)

**Interfaces:**
- Consumes: `getPublishedPosts`, `collectTags`, `readingMinutes`, `absoluteUrl`, `Nav`, `Footer`, `Layout`.
- Produces: `<PostCard post={CollectionEntry<'blog'>} />` (title link to `/writing/{id}/`, description, date, tag chips linking to `/writing/tags/{slug}/`, reading time, level badge). `<Subscribe source?: string />` renders the fallback panel "Follow along: RSS feed · LinkedIn" (links `/rss.xml` and `person.linkedin`) and, in its markup, nothing that reads `siteConfig.newsletter` yet beyond a comment noting Cycle 4 swaps this.
- Page contract: `/writing/` is always generated, even when there are no posts. With posts, 10 per page at `/writing/page/N/` (page 1 is `/writing/`). Tag pages at `/writing/tags/{slug}/` get `noindex` when the tag has fewer than 2 posts.

- [ ] **Step 1: Index route.** Because `paginate()` emits nothing for an empty list (Review Focus 2), build the route so `/writing/` exists regardless: use a rest-param route that returns one page with empty `data` when there are no posts. Show an empty state ("First posts are on the way") with the RSS link and the series hub link.
- [ ] **Step 2:** Tag index chips at the top of `/writing/` (all tags with counts), `PostCard` list, prev/next pagination links, RSS link, `Subscribe` panel.
- [ ] **Step 3: Tag archive route** using `collectTags`; `noindex` prop on `Layout` when count < 2.
- [ ] **Step 4: Temporary verification content.** Create two throwaway posts in `src/content/blog/` (dated yesterday, valid frontmatter, tags `System Design` and `caching`) and one dated tomorrow. `npm run build` → `dist/writing/index.html` lists the two; the future one is absent; tag pages exist for `system-design` and `caching`; `caching` page contains `noindex`. Delete the throwaway posts afterwards.
- [ ] **Step 5: Verify empty state.** With no posts, build succeeds and `dist/writing/index.html` contains the empty-state text.
- [ ] **Step 6: Commit** `feat: blog index, pagination, tag archives, subscribe fallback`.

---

### Task 5: Post page, typography, meta tags

**Files:**
- Create: `src/layouts/PostLayout.astro`, `src/pages/writing/[...slug].astro`, `src/components/{AuthorBox,Sources,ShareLinks}.astro`, `src/lib/meta.ts`, `src/lib/meta.test.ts`
- Modify: `src/styles/global.css` (prose styles, code blocks, tables, print), `astro.config.mjs` (Shiki theme, `rehype-autolink-headings` + `rehype-slug` if not built in)

**Interfaces:**
- Produces in `src/lib/meta.ts`: `postCanonical(post: PostLike): string` (returns `data.canonicalUrl` if set, else `absoluteUrl('/writing/{id}/')`).
- Produces: `<PostLayout post={CollectionEntry<'blog'>} headings={MarkdownHeading[]}>` with slots: default (rendered MDX), plus it renders, in order: header (title H1, dates "Published …"/"Updated …", reading time, tag chips, level badge), the TOC slot (Task 6), intro `Subscribe`, body, `Sources`, end `Subscribe`, `AuthorBox`, `ShareLinks`, then `SeriesNav`/`RelatedPosts` slots (Task 6). Calls `Layout` with `ogType="article"`, `canonicalUrl`.
- `<Sources sources={...} />` renders nothing when empty. `<AuthorBox />` has bio, links to `/about/`, LinkedIn, GitHub, and the employer disclaimer sentence. `<ShareLinks title url />` has plain anchors for LinkedIn and X plus a copy-link button (`data-copy-link`), no widgets.

- [ ] **Step 1: Write failing tests** in `meta.test.ts`: `postCanonical` returns the override when `canonicalUrl` is set, and the site URL form otherwise. (Review Focus 5)
- [ ] **Step 2:** Run → FAIL. **Step 3:** implement `meta.ts`. **Step 4:** Run → PASS.
- [ ] **Step 5: Routes and layout.** `[...slug].astro` builds one page per published post with `render(post)` headings. Prose width ~70ch; heading anchors; Shiki highlighting with a theme whose contrast passes AA on the code background; responsive tables; print stylesheet hides nav, share, subscribe.
- [ ] **Step 6: Copy buttons.** One small module script: add a "Copy" button to each `pre` (accessible name, keyboard focusable, `aria-live` "Copied") and wire `[data-copy-link]`. No third-party code.
- [ ] **Step 7: Temporary verification post** with a title containing `&` and `"`, a description with `<` and `&`, a code block, a table, `sources` entries and a `canonicalUrl`. Build; check `dist/writing/<slug>/index.html`: `<title>` and meta tags are correctly escaped, canonical equals the override, `og:type` is `article`, code is highlighted without client JS, Sources block present. Delete the throwaway post.
- [ ] **Step 8: Commit** `feat: post page layout, prose styles, author box, sources, share links`.

---

### Task 6: TOC, callouts, series navigation, related posts

**Files:**
- Create: `src/components/{TOC,Callout,SeriesNav,RelatedPosts}.astro`
- Modify: `src/layouts/PostLayout.astro`, `src/styles/global.css`

**Interfaces:**
- Consumes: `relatedPosts`, `seriesPosts`, `series`, `PostCard`, `MarkdownHeading`.
- Produces: `<TOC headings={MarkdownHeading[]} />` (H2/H3 only; `<details>` collapsed on mobile, sidebar on ≥ 1100px; current-section highlight via IntersectionObserver with `aria-current="true"`; renders nothing with fewer than 3 headings). `<Callout type="note"|"tradeoff"|"field"|"avoid"|"pitfall" title?: string>` plus MDX-friendly named exports `Note`, `Tradeoff`, `FromTheField`, `WhenNotToUse`, `Pitfall` (thin wrappers, each with an icon-free text label so colour is not the only cue). `<SeriesNav post allPosts />` shows "Part {seriesOrder} of {topics.length}", previous/next published posts in the same series, link to `/series/{id}/`; renders nothing for posts without `series`. `<RelatedPosts post allPosts />` shows up to 3 cards, nothing when empty.

- [ ] **Step 1:** Build the four components and wire them into `PostLayout`.
- [ ] **Step 2: Temporary verification posts** (two posts in series `system-design`, orders 1 and 2, sharing tags, one using each callout via MDX import). Build and check: post 1 has "Part 1 of 8" and a "next" link only; post 2 has "previous" only; related list shows the other post; callouts render labelled text. Browser check: TOC highlights on scroll; keyboard Tab order reaches TOC links; at 320px TOC is collapsed and nothing scrolls horizontally. Delete throwaway posts.
- [ ] **Step 3: Commit** `feat: table of contents, callouts, series nav, related posts`.

---

### Task 7: Build-time diagrams (spike, then commit to one path)

**Files:**
- Modify: `astro.config.mjs`, `.github/workflows/deploy.yml`, `package.json`
- Create (fallback path only): `src/components/Diagram.astro`

**Interfaces:**
- Produces: authors can write a fenced ```` ```mermaid ```` block in a post and get inline SVG with no client JS (primary path), or `<Diagram src="…svg" alt="…" />` with required `alt` (fallback path).

- [ ] **Step 1: Spike (time-box one hour).** Install `rehype-mermaid` and Playwright Chromium (`npx playwright install chromium`); configure it with `strategy: 'inline-svg'` and make Mermaid code blocks skip Shiki. Build a throwaway post with a flowchart. Pass criteria: `npm run build` succeeds, the post's HTML contains an inline `<svg>` and no `mermaid` script.
- [ ] **Step 2: CI check.** Replace `withastro/action@v3` in `deploy.yml` with explicit steps (`actions/checkout@v4`, `actions/setup-node@v4` node 22 with npm cache, `npm ci`, `npx playwright install --with-deps chromium`, `npm test`, `npm run build`, `npm run check`, `actions/upload-pages-artifact@v3` with `path: dist`); keep the `deploy` job unchanged. Push to a branch and confirm the build job passes with added time under 3 minutes.
- [ ] **Step 3: Decide.** If both pass criteria hold, keep the primary path. If either fails, remove `rehype-mermaid`, restore `withastro/action@v3` (adding `npm test` and `npm run check` via a preceding job instead), and implement the fallback `Diagram` component (required `alt` enforced by throwing at build when missing). Record the outcome in `CHANGELOG.md`.
- [ ] **Step 4:** Delete the throwaway post. **Step 5: Commit** `feat: build-time diagrams` (or `feat: SVG diagram component`).

---

### Task 8: Series hub, RSS, authoring template, sample post, daily rebuild

**Files:**
- Create: `src/pages/series/[id].astro`, `src/pages/rss.xml.ts`, `src/content/blog/_template.mdx`, `src/content/blog/rate-limiting.mdx`, `scripts/new-post.mjs`, `scripts/new-post.test.ts`
- Modify: `package.json` (`"new-post": "node scripts/new-post.mjs"`), `.github/workflows/deploy.yml` (add `schedule: - cron: '30 0 * * *'`)

**Interfaces:**
- Produces in `scripts/new-post.mjs` (ESM, exports for tests): `slugify(title: string): string`; `renderPost(title: string, today: string): string` (frontmatter with `title`, empty-but-valid-looking placeholders, `date: today`, `draft: true`, `tags: []`, plus the 11-section body from the template); CLI: `node scripts/new-post.mjs "Title"` writes `src/content/blog/<slug>.mdx`, refuses to overwrite and exits non-zero with a message.
- Series hub contract: `/series/{id}/` lists every topic in `series[id].topics` by order; topics with a published post (matched by `series` + `seriesOrder`) are links with title and reading time, others are greyed with "Coming soon" and no link; page works with zero posts.
- RSS contract: `/rss.xml` items are published posts only, newest first, summary (title, description, link, pubDate, categories from tags); well-formed XML with `&`/`<` escaped.

- [ ] **Step 1: Write failing tests** in `new-post.test.ts`: `slugify('Rate Limiting: Token Bucket & Friends!')` → `rate-limiting-token-bucket-friends`; `renderPost` output contains `draft: true`, today's date, and all 11 section headings (TL;DR through Sources and further reading); running the writer twice for the same title throws on the second call.
- [ ] **Step 2:** Run → FAIL. **Step 3:** implement. **Step 4:** Run → PASS.
- [ ] **Step 5: `_template.mdx`** with the 11 sections from the brief §4.4 and the editorial HTML comment (synthesize in own words, credit sources, no copied phrasing/structure/diagrams, no confidential employer or client details). It must not be built (leading `_` excluded by the loader pattern; verify absent from `dist/`).
- [ ] **Step 6: `rate-limiting.mdx`:** `draft: true`, `series: system-design`, `seriesOrder: 1`, valid-length title/description, clearly marked placeholder body, no statistics or company claims.
- [ ] **Step 7: Series hub and RSS routes.** For RSS, escape via the `@astrojs/rss` API, not string concatenation.
- [ ] **Step 8: Verify.** Build with zero published posts: `dist/series/system-design/index.html` shows 8 greyed topics; `dist/rss.xml` parses with `fast-xml-parser` and has zero items; no `rate-limiting` path in `dist/`. Run `npm run new-post "Test Post Title Here"`, confirm the file validates when `draft: true` is kept and the build passes, then delete it.
- [ ] **Step 9: Commit** `feat: series hub, RSS, post template, new-post script, daily rebuild cron`.

---

### Task 9: Home page changes

**Files:**
- Modify: `src/pages/index.astro`, `src/data/content.ts` (hero CTA data only), `src/components/` (create `LatestWriting.astro`), `src/styles/global.css`, `public/llms.txt`

**Interfaces:**
- Consumes: `getPublishedPosts`, `PostCard`, `Subscribe`, `Nav`, `Footer`, `Layout` `head` slot.
- Produces: `<LatestWriting posts={CollectionEntry<'blog'>[]} />` (3 newest; returns nothing when empty; includes a link to `/series/system-design/`).

- [ ] **Step 1: Hero.** `View Case Studies →` stays the only `.btn.btn-primary`; "Download Resume (PDF)" and "Book a Call" become `.text-link`s (keep `download` attribute, `target="_blank" rel="noopener"` and element ids `hero-cta-resume`, `hero-cta-call`). Replace the profile card's "Blog ↗" with `Writing →` linking `/writing/` (internal, no `target`).
- [ ] **Step 2: Labels.** Section tag "AEO — Answer Engine Optimization" → "FAQ". Keep the section's heading and description text unchanged.
- [ ] **Step 3: Sections.** Insert `LatestWriting` after the FAQ-preceding sections (before `#faq`) and a `Subscribe` panel after `#faq`, before the footer.
- [ ] **Step 4: JSON-LD.** Put the `Person` schema (no email, no telephone, `sameAs` = LinkedIn + GitHub only) and a `WebSite` schema in the `head` slot of `index.astro`.
- [ ] **Step 5: `llms.txt`:** remove the Email line and the bit.ly Blog line; add `Writing: https://importashutosh.github.io/writing/`. Leave all other lines untouched.
- [ ] **Step 6: Verify.** `npm run build`; with no published posts `dist/index.html` has no "Latest writing" markup; with one throwaway published post it shows that post; run `npm run check` (it detects the owner's phone number and email local-part generically, plus `bit.ly`, `tel:`, `mailto:`) → no violations (delete the throwaway post afterwards). Visual check at 1280px and 375px.
- [ ] **Step 7: Commit** `feat: home page CTA hierarchy, latest writing strip, JSON-LD, privacy cleanup`.

---

### Task 10: FAQ edits (requires owner approval before applying)

**Files:**
- Modify: `src/data/content.ts` (`faq` array)

- [ ] **Step 1: Draft and present.** Write the replacement for `faq[7]` ("How can I contact or hire…") as: *"The quickest way is to book a 30-minute call on Calendly or send a message through the contact page. Kumar is also on LinkedIn and GitHub."* Draft 3–4 new Q&As (system design, real-time data architecture, CDP) using only facts already present in `content.ts` (products, stats, stack, experience). Show the full text to the owner and **stop until they approve or edit it**.
- [ ] **Step 2:** Apply the approved text, then delete `email`, `phone`, `blog` and `siteUrl` from `person` in `content.ts` (all references are gone by now; the build must still pass). Keep answers factual, consistent with the page's numbers, and sourced to existing fields (use `person.*` template values where numbers repeat).
- [ ] **Step 3: Verify.** Build; `dist/index.html` FAQPage JSON-LD contains the new questions; no email in any FAQ answer; the page still lists every question.
- [ ] **Step 4: Commit** `content: update contact FAQ answer and add expertise questions`.

---

### Task 11: Contact, About, and legal pages; 404 update

**Files:**
- Create: `src/pages/contact.astro`, `src/pages/about.astro`, `src/pages/privacy.astro`, `src/pages/cookies.astro`, `src/pages/disclaimer.astro`, `src/components/{ContactForm,DraftBanner}.astro`
- Modify: `src/pages/404.astro`, `src/data/content.ts` (add `testimonials: []`, `featuredIn: []`), `src/styles/global.css`

**Interfaces:**
- Produces: `<ContactForm />` — reads `siteConfig.contact.formEndpoint`; when empty renders only Calendly and LinkedIn links (no `<form>`); when set renders a `<form method="post" action={endpoint}>` with labelled name, email, message fields, a hidden honeypot input named `_gotcha`, and a submit button. `<DraftBanner />` — visible banner "Draft: review before publishing".
- About page: bio built only from existing `person`/`hero`/`experience` data; photo slot uses `/profile.jpg` only if `import.meta.glob('/public/profile.*')` finds a file, otherwise the "KA" initials badge. Testimonials and featured-in strips render only when the arrays have items.
- Privacy draft states: data collected (email address, signup time, source), Cloudflare and Resend as processors, retention, deletion requests via the contact page, analytics (Plausible now; GA4 later) and ads planned. Cookies draft: no cookies set today; planned categories (analytics, advertising). Disclaimer: the employer sentence plus "educational content, not professional or legal advice".
- All five pages: unique title/description, one H1, `Nav` and `Footer`; legal pages carry `DraftBanner`; none carry ads (no ad code exists).

- [ ] **Step 1:** Build components and the five pages; update `404.astro` to add `Nav`/`Footer`, the latest-posts list (when any) and the `Subscribe` fallback.
- [ ] **Step 2: Verify contact form states.** With `formEndpoint: ""` the built `/contact/` has no `<form>`; temporarily set it to `https://example.com/f`, rebuild, confirm the form and honeypot render and each input has a `<label>`; revert the config.
- [ ] **Step 3: Verify.** Build; each page has exactly one H1 and a distinct `<title>`; links in the footer reach all five pages; About shows initials with no photo file present.
- [ ] **Step 4: Commit** `feat: contact, about, privacy, cookies, disclaimer pages and 404 update`.

---

### Task 12: Check script, docs, final verification

**Files:**
- Create: `scripts/check-dist.mjs`, `scripts/check-dist.test.ts`, `README.md` (replace), `CHANGELOG.md`
- Modify: `.github/workflows/deploy.yml` (ensure `npm test` and `npm run check` run before upload)

**Interfaces:**
- Produces in `scripts/check-dist.mjs` (exports `checkDist(distDir: string, opts: { allowedHosts: string[]; forbidden: string[]; draftSlugs: string[] }): string[]` returning a list of violations; CLI exits 1 when non-empty): rules — (1) no forbidden string (`tel:`, `mailto:`, `@gmail.com`, `bit.ly`, plus a generic Indian-mobile-number pattern, so the owner's phone number and email local-part are never written into the repo) in any `.html`, `.txt`, `.xml` file; (2) every `src`/`href` pointing at an external host on `<script>` or `<link rel=stylesheet|preconnect>` tags is in `allowedHosts` (default `['plausible.io']`); (3) no `dist/writing/<draftSlug>/` directory; (4) `sitemap-0.xml` contains no `/writing/tags/` URL and no draft slug; (5) `rss.xml` parses with `fast-xml-parser`; (6) every `.html` page except `404.html` has exactly one `<h1>`.

- [ ] **Step 1: Write failing tests** in `check-dist.test.ts` using a temp directory fixture: a page containing `mailto:` yields a violation; a script from `evil.example` yields a violation while `plausible.io` does not; a page with two `<h1>` yields a violation; a clean fixture yields `[]`.
- [ ] **Step 2:** Run → FAIL. **Step 3:** implement. **Step 4:** Run → PASS.
- [ ] **Step 5: `npm run build && npm run check`** on the real site; fix any violation found at its source (not by loosening the check).
- [ ] **Step 6: README.** Sections: add a post (`npm run new-post "Title"`, fill frontmatter, set `draft: false`, push); schedule a post (future `date`, daily 00:30 UTC rebuild); preview locally (`npm run dev`); deploy; config fields and which are live now vs. built in later cycles; custom-domain switch (change `siteUrl`, add `public/CNAME`, DNS); the owner checklist below. A non-developer must be able to publish in under 5 minutes.
- [ ] **Step 7: `CHANGELOG.md`** entries for Cycle 1 and Cycle 2, including the Task 7 diagram outcome and the sitemap decision (tag archives excluded from sitemap; `/sitemap.xml` kept as an index).
- [ ] **Step 8: Manual QA.** Lighthouse mobile on `/`, `/writing/`, and one throwaway published post (delete after): record scores before (run once against the current production site) and after; target ≥ 95 each, LCP < 2.5s, CLS < 0.1. Keyboard-only pass over nav, TOC, copy button, contact form. 320px width on `/`, `/writing/`, a post: no horizontal scroll. Confirm `public/og.png` renders (1200×630, already verified) and note `resume.pdf` (250 KB) filename/content for the owner (the PDF may still contain the phone number and cannot be edited here).
- [ ] **Step 9: Verify the scheduled-post path.** Push a throwaway post dated tomorrow, confirm it is absent from the deployed site; remove it. (The cron itself fires at 00:30 UTC; confirm the `schedule` trigger appears in the Actions tab.)
- [ ] **Step 10: Commit** `docs: README, changelog, dist checks`.

**Owner checklist to put at the end of the README and final report:** supply the full 30-topic System Design list (only 8 are seeded); review `content.ts` claims (team size/tenure vs LinkedIn and resume, revenue and ARR figures, client brand names, "reports to CEO", internal stack detail, "Atlantis/Logra" naming); decide whether Plausible stays until GA4 + consent land in Cycle 3; contact-form endpoint; professional photo (`public/profile.jpg`), testimonials, featured-in items; `resume.pdf` content and filename; review privacy/cookie/disclaimer drafts (ideally with a lawyer) before removing the draft banner; custom domain before AdSense or newsletter sending.
