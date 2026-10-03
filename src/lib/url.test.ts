import { describe, it, expect } from 'vitest';
import { absoluteUrl } from './url';

describe('absoluteUrl', () => {
  it('joins a rooted path', () => {
    expect(absoluteUrl('/writing/')).toBe('https://importashutosh.github.io/writing/');
  });
  it('adds the missing leading slash', () => {
    expect(absoluteUrl('writing/')).toBe('https://importashutosh.github.io/writing/');
  });
  it('handles the root', () => {
    expect(absoluteUrl('/')).toBe('https://importashutosh.github.io/');
  });
});
