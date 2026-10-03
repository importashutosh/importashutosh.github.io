import { getCollection, type CollectionEntry } from 'astro:content';
import { series } from '../data/series';
import { assertRoutablePostIds, assertSeriesIntegrity, isPublished, sortNewestFirst } from './posts';

export async function getPublishedPosts(now: Date = new Date()): Promise<CollectionEntry<'blog'>[]> {
  const all = await getCollection('blog');
  const published = all.filter((p) => isPublished(p, now));
  assertRoutablePostIds(published);
  assertSeriesIntegrity(published, Object.keys(series));
  return sortNewestFirst(published);
}
