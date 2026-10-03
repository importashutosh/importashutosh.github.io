import type { APIRoute } from 'astro';
import { absoluteUrl } from '../lib/url';

// Keeps the legacy /sitemap.xml URL alive by pointing at the generated sitemap.
export const GET: APIRoute = () => {
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap><loc>${absoluteUrl('/sitemap-0.xml')}</loc></sitemap>
</sitemapindex>
`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml' } });
};
