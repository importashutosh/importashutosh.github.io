// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import { unified } from '@astrojs/markdown-remark';
import rehypeMermaid from 'rehype-mermaid';
import sitemap from '@astrojs/sitemap';
import siteConfig from './site.config.ts';

export default defineConfig({
  site: siteConfig.siteUrl,
  trailingSlash: 'always',
  integrations: [
    mdx(),
    sitemap({ filter: (page) => !page.includes('/writing/tags/') }),
  ],
  markdown: {
    // Unified (not the default Sätteri) so rehype-mermaid can render mermaid fences to
    // inline SVG at build time; .mdx inherits it. Heading ids still come from Astro; the
    // "#" permalinks are added in PostLayout's script. The Shiki theme is the light GitHub
    // one: AA contrast for every token on its #fff background (comment colour 4.8:1).
    // A local build containing a mermaid fence needs `npx playwright install chromium`
    // (builds without mermaid fences never launch Chromium).
    processor: unified({
      rehypePlugins: [[rehypeMermaid, { strategy: 'inline-svg' }]],
    }),
    // Mermaid blocks must reach rehype-mermaid untouched by Shiki.
    syntaxHighlight: { type: 'shiki', excludeLangs: ['mermaid'] },
    shikiConfig: { theme: 'github-light' },
  },
  vite: {
    plugins: [tailwindcss()]
  }
});
