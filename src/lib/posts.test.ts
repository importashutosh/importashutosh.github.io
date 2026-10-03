import { describe, it, expect } from 'vitest';
import {
  isPublished,
  sortNewestFirst,
  tagSlug,
  collectTags,
  uniqueTags,
  relatedPosts,
  seriesPosts,
  assertSeriesIntegrity,
  assertRoutablePostIds,
  assertNoPlaceholders,
  readingMinutes,
  seriesNeighbours,
  tocHeadings,
  type PostLike,
} from './posts';

function mk(id: string, data: Partial<PostLike['data']> = {}, body?: string): PostLike {
  return {
    id,
    body,
    data: {
      title: `Title ${id}`,
      description: 'd',
      date: new Date('2026-01-01T00:00:00Z'),
      tags: [],
      draft: false,
      email: true,
      ...data,
    },
  };
}

describe('isPublished', () => {
  const now = new Date('2026-10-03T00:00:00Z');
  it('is false for drafts', () => {
    expect(isPublished(mk('a', { draft: true }), now)).toBe(false);
  });
  it('is true when date equals now', () => {
    expect(isPublished(mk('a', { date: new Date(now) }), now)).toBe(true);
  });
  it('is true for earlier dates', () => {
    expect(isPublished(mk('a', { date: new Date('2026-10-02T00:00:00Z') }), now)).toBe(true);
  });
  it('is false one day in the future', () => {
    expect(isPublished(mk('a', { date: new Date('2026-10-04T00:00:00Z') }), now)).toBe(false);
  });
});

describe('sortNewestFirst', () => {
  it('sorts by date descending without mutating input', () => {
    const a = mk('a', { date: new Date('2026-01-01') });
    const b = mk('b', { date: new Date('2026-03-01') });
    const input = [a, b];
    expect(sortNewestFirst(input).map((p) => p.id)).toEqual(['b', 'a']);
    expect(input.map((p) => p.id)).toEqual(['a', 'b']);
  });
});

describe('tagSlug / collectTags', () => {
  it('normalises spellings', () => {
    expect(tagSlug('System Design')).toBe('system-design');
    expect(tagSlug('system-design')).toBe('system-design');
    expect(tagSlug(' System-Design ')).toBe('system-design');
    expect(tagSlug('CQRS & Saga')).toBe('cqrs-saga');
  });
  it('merges spellings into one entry', () => {
    const posts = [
      mk('a', { tags: ['System Design'] }),
      mk('b', { tags: ['system-design'] }),
      mk('c', { tags: [' System-Design '] }),
    ];
    const tags = collectTags(posts);
    expect(tags).toHaveLength(1);
    expect(tags[0].slug).toBe('system-design');
    expect(tags[0].count).toBe(3);
    expect(tags[0].posts).toHaveLength(3);
  });
  it('folds accents and keeps C++ / C# distinct and readable', () => {
    expect(tagSlug('Café')).toBe('cafe');
    expect(tagSlug('C++')).toBe('c-plus-plus');
    expect(tagSlug('C#')).toBe('c-sharp');
    expect(tagSlug('C')).toBe('c');
  });
  it('keeps C, C++ and C# as three separate chips', () => {
    const tags = collectTags([mk('a', { tags: ['C', 'C++', 'C#'] })]);
    expect(tags.map((t) => t.slug).sort()).toEqual(['c', 'c-plus-plus', 'c-sharp']);
  });
  it('throws when two different spellings share a slug, naming both', () => {
    const posts = [mk('a', { tags: ['Café'] }), mk('b', { tags: ['Cafe'] })];
    expect(() => collectTags(posts)).toThrow(/Café.*Cafe|Cafe.*Café/);
  });
  it('throws when a tag has an empty slug', () => {
    expect(() => collectTags([mk('a', { tags: ['日本語'] })])).toThrow(/日本語/);
    expect(() => collectTags([mk('a', { tags: ['!!!'] })])).toThrow(/!!!/);
  });
  it('sorts by count desc then name', () => {
    const posts = [
      mk('a', { tags: ['b', 'a'] }),
      mk('b', { tags: ['c', 'b'] }),
    ];
    expect(collectTags(posts).map((t) => t.slug)).toEqual(['b', 'a', 'c']);
  });
});

describe('relatedPosts', () => {
  it('limits to 3, excludes self, ranks by shared tags', () => {
    const self = mk('self', { tags: ['x', 'y', 'z'] });
    const all = [
      self,
      mk('one', { tags: ['x'], date: new Date('2026-05-01') }),
      mk('two', { tags: ['x', 'y'], date: new Date('2026-01-01') }),
      mk('three', { tags: ['x', 'y', 'z'], date: new Date('2026-01-02') }),
      mk('four', { tags: ['x'], date: new Date('2026-06-01') }),
      mk('none', { tags: ['q'] }),
    ];
    const r = relatedPosts(self, all);
    expect(r.map((p) => p.id)).toEqual(['three', 'two', 'four']);
    expect(r.find((p) => p.id === 'self')).toBeUndefined();
  });
});

describe('assertRoutablePostIds', () => {
  const bad = ['page', 'tags', 'tags/foo', 'page/2', '123', '/lead', 'trail/', 'a//b'];
  for (const id of bad) {
    it(`rejects "${id}"`, () => {
      expect(() => assertRoutablePostIds([mk(id)])).toThrow(new RegExp(id.replace(/[/]/g, '\\/')));
    });
  }
  it('lists every offending id in one error', () => {
    expect(() => assertRoutablePostIds([mk('page'), mk('ok'), mk('tags')])).toThrow(/page[\s\S]*tags/);
  });
  it('accepts normal ids', () => {
    expect(() =>
      assertRoutablePostIds([mk('rate-limiting'), mk('system-design/cqrs'), mk('2024-recap')]),
    ).not.toThrow();
  });
});

describe('seriesPosts', () => {
  it('orders by seriesOrder', () => {
    const posts = [
      mk('b', { series: 's', seriesOrder: 2 }),
      mk('a', { series: 's', seriesOrder: 1 }),
      mk('o', { series: 'other', seriesOrder: 1 }),
    ];
    expect(seriesPosts(posts, 's').map((p) => p.id)).toEqual(['a', 'b']);
  });
});

describe('assertSeriesIntegrity', () => {
  const known = { s: { topics: [{ order: 1 }, { order: 2 }] } };
  it('throws on duplicate order, naming both ids', () => {
    const posts = [
      mk('p1', { series: 's', seriesOrder: 1 }),
      mk('p2', { series: 's', seriesOrder: 1 }),
    ];
    expect(() => assertSeriesIntegrity(posts, known)).toThrow(/p1.*p2|p2.*p1/);
  });
  it('throws on unknown series', () => {
    const posts = [mk('p1', { series: 'nope', seriesOrder: 1 })];
    expect(() => assertSeriesIntegrity(posts, known)).toThrow(/p1/);
  });
  it('does not throw for posts without series', () => {
    expect(() => assertSeriesIntegrity([mk('p1'), mk('p2')], known)).not.toThrow();
  });
  it('throws when seriesOrder has no matching topic, naming post, order, series and the fix', () => {
    const posts = [mk('p9', { series: 's', seriesOrder: 9 })];
    expect(() => assertSeriesIntegrity(posts, known)).toThrow(/p9/);
    expect(() => assertSeriesIntegrity(posts, known)).toThrow(/9/);
    expect(() => assertSeriesIntegrity(posts, known)).toThrow(/"s"/);
    expect(() => assertSeriesIntegrity(posts, known)).toThrow(/add the topic to src\/data\/series\.ts/);
  });
  it('throws when a series post has no seriesOrder', () => {
    const posts = [mk('p0', { series: 's' })];
    expect(() => assertSeriesIntegrity(posts, known)).toThrow(/p0.*seriesOrder/);
  });
  it('passes when every order matches a topic', () => {
    const posts = [mk('p1', { series: 's', seriesOrder: 1 }), mk('p2', { series: 's', seriesOrder: 2 })];
    expect(() => assertSeriesIntegrity(posts, known)).not.toThrow();
  });
});

describe('readingMinutes', () => {
  it('counts 200 wpm', () => {
    expect(readingMinutes('word '.repeat(400))).toBe(2);
  });
  it('is at least 1', () => {
    expect(readingMinutes('')).toBe(1);
  });
  it('ignores fenced code and import lines', () => {
    const code = '```ts\n' + 'code '.repeat(1000) + '\n```';
    expect(readingMinutes('hello world\n' + code + '\nimport X from "./x.astro"\n')).toBe(1);
  });
});

describe('seriesNeighbours', () => {
  const a = mk('a', { series: 's', seriesOrder: 1 });
  const b = mk('b', { series: 's', seriesOrder: 2 });
  const c = mk('c', { series: 's', seriesOrder: 4 });
  const other = mk('o', { series: 'x', seriesOrder: 1 });
  const none = mk('n');
  it('returns only next for the first post', () => {
    expect(seriesNeighbours([c, other, b, a], a)).toEqual({ prev: undefined, next: b });
  });
  it('returns prev and next for a middle post, skipping missing orders', () => {
    expect(seriesNeighbours([a, b, c], b)).toEqual({ prev: a, next: c });
  });
  it('returns only prev for the last published post', () => {
    expect(seriesNeighbours([a, b], b)).toEqual({ prev: a, next: undefined });
  });
  it('returns nothing for posts without a series', () => {
    expect(seriesNeighbours([a, none], none)).toEqual({ prev: undefined, next: undefined });
  });
});

describe('tocHeadings', () => {
  const h = (depth: number, slug: string) => ({ depth, slug, text: slug });
  it('keeps only h2 and h3', () => {
    const out = tocHeadings([h(1, 't'), h(2, 'a'), h(4, 'x'), h(3, 'b'), h(2, 'c')]);
    expect(out.map((x) => x.slug)).toEqual(['a', 'b', 'c']);
  });
  it('returns empty with fewer than 3 usable headings', () => {
    expect(tocHeadings([h(2, 'a'), h(3, 'b'), h(4, 'c')])).toEqual([]);
  });
});

describe('assertNoPlaceholders', () => {
  const clean = () => mk('clean', { tags: ['caching'], description: 'A real description.' }, 'Real body.\n');
  it('passes a clean post', () => {
    expect(() => assertNoPlaceholders([clean()])).not.toThrow();
  });
  it('throws naming a published post with the todo-replace-me tag', () => {
    const bad = mk('bad-tag', { tags: ['todo-replace-me'] });
    expect(() => assertNoPlaceholders([clean(), bad])).toThrow(/bad-tag/);
  });
  it('throws on TODO or PLACEHOLDER in title or description', () => {
    expect(() => assertNoPlaceholders([mk('t1', { title: 'TODO write title' })])).toThrow(/t1/);
    expect(() => assertNoPlaceholders([mk('d1', { description: 'TODO: write a summary' })])).toThrow(/d1/);
    expect(() => assertNoPlaceholders([mk('d2', { description: 'PLACEHOLDER text' })])).toThrow(/d2/);
  });
  it('does not flag words that merely contain todo', () => {
    expect(() => assertNoPlaceholders([mk('ok', { description: 'Mastodon and todos' })])).not.toThrow();
  });
  it('throws on a body line starting with TODO or containing PLACEHOLDER', () => {
    expect(() => assertNoPlaceholders([mk('b1', {}, '## H\n\nTODO: fill in\n')])).toThrow(/b1/);
    expect(() => assertNoPlaceholders([mk('b2', {}, 'some PLACEHOLDER here')])).toThrow(/b2/);
  });
  it('names every offender in a single error', () => {
    let msg = '';
    try {
      assertNoPlaceholders([mk('x1', { tags: ['todo-replace-me'] }), mk('x2', { title: 'TODO' })]);
    } catch (e) {
      msg = (e as Error).message;
    }
    expect(msg).toMatch(/x1/);
    expect(msg).toMatch(/x2/);
  });
  it('exempts drafts', () => {
    const draft = mk('wip', { draft: true, tags: ['todo-replace-me'], description: 'TODO' }, 'TODO: x');
    expect(() => assertNoPlaceholders([draft])).not.toThrow();
  });
});

describe('uniqueTags', () => {
  it('dedupes by slug, keeps first trimmed label, drops empty', () => {
    expect(uniqueTags(['System Design', ' system-design ', 'CQRS & Saga', '!!!'])).toEqual([
      { label: 'System Design', slug: 'system-design' },
      { label: 'CQRS & Saga', slug: 'cqrs-saga' },
    ]);
  });
});
