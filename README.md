# Kumar Ashutosh: portfolio and blog

Astro 7 + Tailwind v4 static site with a Markdown/MDX blog. Live at https://importashutosh.github.io.

Requires Node 22.12 or newer.

## Publish a post (about 5 minutes)

1. Create the draft: `npm run new-post "Your post title"`. This writes `src/content/blog/<slug>.mdx` with the standard section skeleton and `draft: true`.
2. Fill in the frontmatter at the top (`title`, `description`, `date`, `tags`, and optionally `series`, `seriesOrder`, `level`, `sources`). Replace every `TODO` in the body. The "From the field" section must be your own words.
3. Check it locally: `npm run dev`, then open http://localhost:4321/writing/. Drafts and future-dated posts are hidden everywhere, including the dev server, so to preview one set `draft: false` and a `date` of today or earlier while you work on it.
4. Set `draft: false` in the frontmatter.
5. Commit and push to `main`. GitHub Actions builds and deploys the site; the post is live a minute or two later.

## Schedule a post

Set `draft: false` and a `date` in the future. Future-dated posts are left out of the build (pages, RSS, sitemap, series hubs). A scheduled GitHub Actions run rebuilds the site every day at 00:30 UTC, so the post appears on the first rebuild on or after its date. You can also run the workflow by hand from the Actions tab (workflow_dispatch) to publish sooner.

## Diagrams

Fenced code blocks tagged `mermaid` are rendered to inline SVG at build time. No JavaScript is shipped to readers. Building a post that contains a mermaid fence needs headless Chromium on your machine: run `npx playwright install chromium` once. Builds without a mermaid fence do not launch it.

Mermaid SVGs have no built-in alt text. Add a caption (a `<figure>` with `<figcaption>`) or a short text description just before or after each diagram so screen reader users get the same information. The default Mermaid theme is light only.

## Preview and verify

| Command | Action |
| :-- | :-- |
| `npm install` | Install dependencies |
| `npm run dev` | Dev server at `localhost:4321` |
| `npm run build` | Build to `./dist/` |
| `npm run preview` | Serve the production build locally |
| `npm test` | Unit tests (vitest) |
| `npm run check` | Post-build checks on `dist/` (run after `npm run build`) |

`npm run check` fails if `dist/` contains a forbidden string (`tel:`, `mailto:`, the phone number, the personal email, `bit.ly`), a script, stylesheet or preconnect from a host other than `plausible.io`, a built draft post, tag archive URLs or draft slugs in `sitemap-0.xml`, an `rss.xml` that does not parse, or a page (other than `404.html`) without exactly one `<h1>`.

## Deploy

Pushing to `main` runs `.github/workflows/deploy.yml`: install, install Chromium, `npm test`, `npm run build`, `npm run check`, then upload `dist/` to GitHub Pages. It also runs on the daily schedule above and on manual dispatch. One-time setup: in the GitHub repo, Settings, Pages, Source: GitHub Actions. The repo must be named `importashutosh.github.io` for the site to serve at the root URL.

## Site config (`site.config.ts`)

| Field | Status |
| :-- | :-- |
| `siteUrl` | Live. Used for canonical URLs, RSS, sitemap, Open Graph. |
| `siteName` | Live. |
| `contact.formEndpoint` | Live. Empty by default, which hides the contact form and shows the other contact options. Set it to a form-handling endpoint URL to show the form. |
| `analytics.ga4MeasurementId` | Not built yet (Cycle 3). |
| `searchConsole.verificationToken` | Not built yet. |
| `consent` | Not built yet. No consent banner exists. |
| `ads` | Not built yet. |
| `newsletter` | Not built yet. |

Features from later cycles are NOT built: consent banner, GA4, Search Console verification tag, site search, generated Open Graph images (the single `public/og.png` is used everywhere), newsletter and ads. The only third-party host in the built site is Plausible (`plausible.io`).

## Switch to a custom domain

1. Change `siteUrl` in `site.config.ts` to the new origin.
2. Add `public/CNAME` containing the bare domain (for example `example.com`).
3. Configure DNS with your registrar as described in the GitHub Pages custom domain docs, then set the domain in Settings, Pages.
4. Rebuild and run `npm run check`. Keep `public/llms.txt` and `public/robots.txt` in step with the new domain.

## Editing other content

Homepage copy and numbers live in `src/data/content.ts`. Keep these in sync by hand when facts change: `public/llms.txt`, `public/og.png` (1200x630), `public/resume.pdf`.

## Owner checklist

- Supply the full 30-topic System Design list (only 8 are seeded).
- Review the `content.ts` claims: team size and tenure against LinkedIn and the resume, revenue and ARR figures, client brand names, "reports to CEO", internal stack detail, "Atlantis/Logra" naming.
- Decide whether Plausible stays until GA4 and consent land in Cycle 3.
- Set the contact-form endpoint (`contact.formEndpoint`).
- Provide a professional photo (`public/profile.jpg`), testimonials and featured-in items.
- Review `public/resume.pdf` content and filename (it is a 250 KB file and may still contain the phone number).
- Review the privacy, cookie and disclaimer drafts (ideally with a lawyer) before removing the draft banner.
- Move to a custom domain before AdSense or newsletter sending.
- Run CI on a branch before merging (the Playwright/Chromium step and `npm run check` are unverified on the runner).
