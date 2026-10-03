import { describe, it, expect } from 'vitest';
import { postCanonical } from './meta';
import type { PostLike } from './posts';

const base = (over: Partial<PostLike['data']> = {}): PostLike => ({
  id: 'my-post',
  data: {
    title: 'A title long enough',
    description: 'd',
    date: new Date('2026-01-01'),
    tags: ['a'],
    draft: false,
    email: true,
    ...over,
  },
});

describe('postCanonical', () => {
  it('returns the site URL form by default', () => {
    expect(postCanonical(base())).toBe('https://importashutosh.github.io/writing/my-post/');
  });
  it('returns the canonicalUrl override when set', () => {
    expect(postCanonical(base({ canonicalUrl: 'https://example.com/original/' }))).toBe(
      'https://example.com/original/',
    );
  });
});
