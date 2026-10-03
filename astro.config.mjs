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
  vite: {
    plugins: [tailwindcss()]
  }
});
