import { absoluteUrl } from './url';
import type { PostLike } from './posts';

/** Canonical URL for a post: the frontmatter override if set, else the site URL form. */
export function postCanonical(post: PostLike): string {
  return post.data.canonicalUrl ?? absoluteUrl(`/writing/${post.id}/`);
}
