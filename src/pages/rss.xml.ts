import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import siteConfig from '../../site.config';
import { getPublishedPosts } from '../lib/collection';
import { absoluteUrl } from '../lib/url';

export async function GET(context: APIContext) {
  const posts = await getPublishedPosts();
  return rss({
    title: `${siteConfig.siteName} | Writing`,
    description: 'Posts on data engineering, system design and AI products.',
    site: context.site ?? siteConfig.siteUrl,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      link: absoluteUrl(`/writing/${post.id}/`),
      pubDate: post.data.date,
      categories: post.data.tags,
    })),
  });
}
