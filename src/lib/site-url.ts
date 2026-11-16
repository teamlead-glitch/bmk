/* ---------- ONE SITE ADDRESS FOR SEO URLS ---------- */
// From the environment, never from the request (headers() would make every page dynamic).
// TODO: replace with the live domain once it is confirmed.
const PRODUCTION_URL = 'https://www.bmkintl.com';
const CONFIGURED = (process.env.NEXT_PUBLIC_SITE_URL || '').trim().replace(/\/+$/, '');

export function getSiteUrl(): string {
  if (CONFIGURED) return CONFIGURED;
  if (process.env.VERCEL_ENV === 'production' && process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return PRODUCTION_URL;
}

/** Absolute URL on this site for a path ("/about/" → "https://…/about/") */
export function siteUrl(path = '/'): string {
  return `${getSiteUrl()}${path.startsWith('/') ? path : `/${path}`}`;
}
