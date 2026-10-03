import { describe, it, expect } from 'vitest';
import { safeJsonLd } from './jsonld';

describe('safeJsonLd', () => {
  it('escapes < so content cannot close the script element', () => {
    const out = safeJsonLd({ name: '</script><script>alert(1)</script>' });
    expect(out).not.toContain('<');
    expect(out).toContain('\\u003c/script>');
  });
  it('round-trips through JSON.parse', () => {
    const obj = { a: '</script> & <b>', n: [1, 2], u: 'é' };
    expect(JSON.parse(safeJsonLd(obj))).toEqual(obj);
  });
  it('escapes U+2028 and U+2029', () => {
    const out = safeJsonLd({ s: 'a\u2028b\u2029c' });
    expect(out).not.toMatch(/[\u2028\u2029]/);
    expect(JSON.parse(out).s).toBe('a\u2028b\u2029c');
  });
});
