import { getCollection, type CollectionEntry } from 'astro:content';
import { series } from '../data/series';
import { assertNoPlaceholders, assertRoutablePostIds, assertSeriesIntegrity, isPublished, sortNewestFirst } from './posts';

export async function getPublishedPosts(now: Date = new Date()): Promise<CollectionEntry<'blog'>[]> {
  const all = await getCollection('blog');
  const published = all.filter((p) => isPublished(p, now));
  assertRoutablePostIds(published);
  // Every non-draft post, including future-dated ones: they go live unattended at the cron run.
  assertNoPlaceholders(all);
  assertSeriesIntegrity(published, series);
  return sortNewestFirst(published);
}
