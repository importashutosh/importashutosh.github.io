# Kumar Ashutosh — Portfolio

Single-page portfolio built with Astro + Tailwind v4. Live at https://importashutosh.github.io.

## Editing content

All copy and numbers live in [`src/data/content.ts`](src/data/content.ts). Edit only that file —
counts like team size, years of experience, client count and product count are derived from it.

Also keep in sync by hand when facts change:

- `public/llms.txt` — plain-text summary for AI crawlers
- `public/og.png` — social share image (1200×630)
- `public/resume.pdf` — the "Download Resume" button

## Structure

```text
src/
├── data/content.ts       # single source of truth
├── layouts/Layout.astro  # <head>, SEO/OG tags, JSON-LD, scroll/count-up/nav scripts
├── pages/index.astro     # the page
├── pages/404.astro
└── styles/global.css     # design tokens + all styles
public/                   # favicon, og.png, resume.pdf, robots.txt, sitemap.xml, llms.txt
```

## Commands

| Command           | Action                                  |
| :---------------- | :-------------------------------------- |
| `npm install`     | Install dependencies                    |
| `npm run dev`     | Dev server at `localhost:4321`          |
| `npm run build`   | Build to `./dist/`                      |
| `npm run preview` | Preview the production build            |

Requires Node ≥ 22.12.

## Deploying

Pushing to `main` deploys via `.github/workflows/deploy.yml`. One-time setup: in the GitHub
repo, **Settings → Pages → Source: GitHub Actions**. The repo must be named
`importashutosh.github.io` for the site to serve at the root URL (otherwise set `base` in
`astro.config.mjs`).
