// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
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
    // Heading ids come from Astro's built-in Sätteri pipeline; the "#" permalinks are
    // added in PostLayout's script. github-light: AA contrast for every token on its
    // #fff background (comment colour #6a737d is 4.8:1).
    shikiConfig: { theme: 'github-light' },
  },
  vite: {
    plugins: [tailwindcss()]
  }
});
