import { describe, it, expect } from 'vitest';
import { isHttpUrl, seriesFieldIssue } from './schema';

describe('seriesFieldIssue', () => {
  it('requires seriesOrder when series is set', () => {
    expect(seriesFieldIssue({ series: 'system-design' })).toMatch(/seriesOrder/);
  });
  it('forbids seriesOrder without series', () => {
    expect(seriesFieldIssue({ seriesOrder: 2 })).toMatch(/series/);
  });
  it('accepts both, or neither', () => {
    expect(seriesFieldIssue({ series: 'x', seriesOrder: 1 })).toBeUndefined();
    expect(seriesFieldIssue({})).toBeUndefined();
  });
});

describe('isHttpUrl', () => {
  it('accepts http and https', () => {
    expect(isHttpUrl('https://example.com/a?b=1')).toBe(true);
    expect(isHttpUrl('http://example.com')).toBe(true);
  });
  it('rejects other schemes and junk', () => {
    expect(isHttpUrl('javascript:alert(1)')).toBe(false);
    expect(isHttpUrl('data:text/html,hi')).toBe(false);
    expect(isHttpUrl('ftp://example.com')).toBe(false);
    expect(isHttpUrl('/relative')).toBe(false);
    expect(isHttpUrl('')).toBe(false);
  });
});
