import { unstable_cache } from 'next/cache';
import { API_CONFIG } from '@/constants/config';
import { CMS_TAG } from '@/lib/api/cms-fetch';
import { cmsHeaders } from '@/lib/api/cms-headers';

/* ---------- Sitemap (CMS: GET /v1/sitemap.xml) ---------- */
// The CMS builds the whole sitemap (pages, products, brands, categories, with lastmod and
// priority); it is served as is at /sitemap.xml (src/app/sitemap.xml/route.ts), URLs included:
// they are set in the admin. Cached like every CMS read; a last good copy is kept for when the
// CMS is down. null -> nothing to serve (the route answers 503, never a made-up sitemap).

export const SITEMAP_REVALIDATE_SECONDS = Number(process.env.CMS_REVALIDATE_SECONDS) || 60;
const TIMEOUT_MS = 15000;

const store = globalThis as typeof globalThis & { __cmsSitemapXml?: string };

const load = unstable_cache(
  async (url: string): Promise<string> => {
    const res = await fetch(url, { cache: 'no-store', headers: { ...cmsHeaders(), Accept: 'application/xml' }, signal: AbortSignal.timeout(TIMEOUT_MS) });
    if (!res.ok) throw new Error(`status ${res.status}`);
    const xml = await res.text();
    if (!xml.includes('<urlset') && !xml.includes('<sitemapindex')) throw new Error('not a sitemap');
    return xml;
  },
  ['cms-sitemap'],
  { revalidate: SITEMAP_REVALIDATE_SECONDS, tags: [CMS_TAG, 'cms:/v1/sitemap.xml'] },
);

/** The CMS sitemap XML, the last good copy when the CMS fails, or null when there is none */
export async function getSitemapXml(): Promise<string | null> {
  if (!API_CONFIG.BASE_URL) return null;
  try {
    return (store.__cmsSitemapXml = await load(`${API_CONFIG.BASE_URL}/v1/sitemap.xml`));
  } catch (error) {
    console.error('[cms] sitemap.xml not loaded:', error);
    return store.__cmsSitemapXml ?? null;
  }
}
