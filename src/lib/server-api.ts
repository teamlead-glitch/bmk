import { API_CONFIG } from '@/constants/config';
import { cmsGet } from '@/lib/cms-fetch';

/** Server-side GET for CMS lists. Same cache/retry as pages; null when nothing can be served,
 *  so the component can fall back (or fetch in the browser). */
export async function serverGet<T = unknown>(path: string, params?: Record<string, string | number | undefined | null>): Promise<T | null> {
  if (!API_CONFIG.BASE_URL) return null; // CMS not configured yet
  const query = new URLSearchParams();
  Object.entries(params ?? {}).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '') query.set(key, String(val));
  });
  const qs = query.toString();
  try {
    const { found, json } = await cmsGet(`${API_CONFIG.BASE_URL}${path}${qs ? `?${qs}` : ''}`);
    return found ? (json as T) : null;
  } catch (error) {
    if ((error as { digest?: string })?.digest === 'DYNAMIC_SERVER_USAGE') throw error;
    console.error(`SERVER LIST FETCH ${path} ERROR:`, error);
    return null;
  }
}

/** Reads the new slug from a "not found" answer: { redirect: { to } }. */
export function getRedirectSlug(json: { redirect?: { to?: string } } | null, slug: string, prefix = ''): string | null {
  let to = String(json?.redirect?.to ?? '').replace(/^\/+/, '');
  if (prefix && to.startsWith(prefix)) to = to.slice(prefix.length);
  return to && to !== slug ? to : null;
}
