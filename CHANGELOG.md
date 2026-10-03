# Changelog

## Cycle 2: blog core

- Blog content collection (`src/content/blog`) with typed frontmatter, drafts, and future-dated scheduling (hidden until their date; daily 00:30 UTC rebuild plus manual dispatch).
- Routes: `/writing/` (paginated index), `/writing/<slug>/`, tag archives under `/writing/tags/`, series hubs under `/series/`, `/rss.xml`.
- Post page: prose styles, author box, sources list, share links, table of contents, callouts (Note, Tradeoff, From the field, When not to use, Pitfall), series navigation, related posts, copy-code and copy-link buttons.
- `npm run new-post "Title"` creates a draft from the 11-section skeleton; `_template.mdx` mirrors it.
- Build-time diagrams (Task 7 outcome): primary path kept. Mermaid fences render to inline SVG at build time via `rehype-mermaid`, using the `unified` Markdown processor (not Satteri) and Playwright Chromium. Zero client JavaScript; works in `.md` and `.mdx`. Chromium is required for any build that contains a mermaid fence (`npx playwright install chromium`). CI installs it with explicit steps. The CI run to confirm the added build time (estimated 1 to 1.5 minutes) was not done here and is deferred to the owner. Known limits: SVGs have no built-in alt text and the default Mermaid theme is light only; the only visible rendering difference between processors found was smartypants turning `--` into an em dash.
- Sitemap decision: tag archives (`/writing/tags/`) are excluded from the sitemap wholesale (thin, duplicate-prone pages); drafts and future posts are never listed. `/sitemap.xml` is kept as a `<sitemapindex>` that points to `/sitemap-0.xml`, so the long-standing URL still works; the integration also emits `sitemap-index.xml`.
- `scripts/check-dist.mjs` (`npm run check`, run in CI before upload): forbidden strings, allowed third-party hosts (`plausible.io` only), no built drafts, sitemap and RSS sanity, one `<h1>` per page. Covered by fixture tests.
- QA fixes found in the final pass: preloaded the latin Inter and IBM Plex Serif 600 fonts (layout shift from font swap measured 0.097 on `/` and 0.155 on a post before, 0 and 0.058 after); fixed 320px horizontal overflow on the home stats grid; raised footer links, logo, and mobile menu toggle to 44px tap targets; made the post "Writing" breadcrumb link a 44px target.

## Cycle 1: audit fixes and site foundation

- `site.config.ts` with all later-cycle fields stubbed (most are not wired yet), Vitest, self-hosted fonts, per-page layout props.
- Shared Nav and Footer components. Phone number and personal email removed from the footer.
- Home page: CTA hierarchy, latest-writing strip, JSON-LD, privacy cleanup.
- New pages: About, Contact (form hidden until `contact.formEndpoint` is set), Privacy, Cookies, Disclaimer (drafts, with a visible draft banner), and an updated 404.
- 44px tap targets for profile card, footer buttons, and legal links; semantic legal navigation.

## Lighthouse (mobile emulation, default throttling)

Run with `npx lighthouse` against `npm run preview`-style static serving (`astro preview`) of this branch, using the Playwright Chromium. Scores are Performance / Accessibility / Best practices / SEO.

| Page | Before | After |
| :-- | :-- | :-- |
| Production `/` (https://importashutosh.github.io/) | Not measurable: the URL returned HTTP 404 at the time of the run, so Lighthouse aborted | n/a |
| `/` (local) | 95 / 95 / 100 / 100, LCP 2.1 s, CLS 0.097 (before the font-preload fix) | 99 / 95 / 100 / 100, LCP 1.8 s, CLS 0 |
| `/writing/` (local) | 100 / 95 / 100 / 100, LCP 1.4 s, CLS 0 | not re-run (unchanged: no layout shift) |
| One throwaway published post (local, deleted afterwards) | 93 / 96 / 100 / 100, LCP 1.8 s, CLS 0.155 (before the fix) | 100 / 96 / 100 / 100, LCP 1.5 s, CLS 0.058 |

The "before" column for local pages is the first run on this branch, not the old production site. Scores come from a single run each on a local machine and vary between runs.

## Owner checklist

- Supply the full 30-topic System Design list (only 8 are seeded).
- Review the `content.ts` claims: team size and tenure against LinkedIn and the resume, revenue and ARR figures, client brand names, "reports to CEO", internal stack detail, "Atlantis/Logra" naming.
- Decide whether Plausible stays until GA4 and consent land in Cycle 3.
- Set the contact-form endpoint (`contact.formEndpoint`).
- Provide a professional photo (`public/profile.jpg`), testimonials and featured-in items.
- Review `public/resume.pdf` content and filename (250 KB; may still contain the phone number).
- Review the privacy, cookie and disclaimer drafts (ideally with a lawyer) before removing the draft banner.
- Move to a custom domain before AdSense or newsletter sending.
- Run CI on a branch before merging (the Playwright/Chromium step and `npm run check` are unverified on the runner).
