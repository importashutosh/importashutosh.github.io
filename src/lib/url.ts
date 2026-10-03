import siteConfig from '../../site.config';

/** Join the site origin and a path with exactly one slash; trailing slash is preserved. */
export function absoluteUrl(path: string): string {
  const base = siteConfig.siteUrl.replace(/\/+$/, '');
  return `${base}/${path.replace(/^\/+/, '')}`;
}
