// Pure helpers used by the content schema (src/content.config.ts); no `astro:content` import so Vitest can load them.

/** True only for absolute http(s) URLs; z.string().url() alone also accepts javascript: and data:. */
export function isHttpUrl(value: string): boolean {
  try {
    const { protocol } = new URL(value);
    return protocol === 'http:' || protocol === 'https:';
  } catch {
    return false;
  }
}

/** Message when `series` and `seriesOrder` are not set together, otherwise undefined. */
export function seriesFieldIssue(data: { series?: string; seriesOrder?: number }): string | undefined {
  if (data.series && data.seriesOrder === undefined) {
    return `"seriesOrder" is required when "series" is set (use the topic number from src/data/series.ts).`;
  }
  if (!data.series && data.seriesOrder !== undefined) {
    return `"seriesOrder" is only allowed together with "series".`;
  }
  return undefined;
}
