import { API_CONFIG } from '@/constants/config';
import { cmsGet, cmsGetFresh } from '@/lib/api/cms-fetch';

/* ---------- SERVER GET (every read in src/lib/api/ goes through here) ---------- */

type GetOptions = {
  /** CMS preview: skip the cache and the last good copy (cmsGetFresh) */
  fresh?: boolean;
};

/**
 * GET a CMS endpoint through cmsGet (shared cache, retries, timeout budget, last good
 * copy) and return the parsed JSON body (`{ data }`, or `{ data, links, meta }` for lists).
 *  - null: NEXT_PUBLIC_API_URI is not set, or the CMS answered 404/410 (not found)
 *  - throws CmsUnavailableError when the CMS fails and nothing was saved yet, so the
 *    page answers 5xx (error.tsx) and never a fake 404
 */
export async function serverGet<T>(
  path: string,
  params?: Record<string, string | number | undefined | null>,
  options?: GetOptions,
): Promise<T | null> {
  if (!API_CONFIG.BASE_URL) {
    console.warn(`[cms] NEXT_PUBLIC_API_URI is not set: ${path} not loaded`);
    return null;
  }
  const query = new URLSearchParams();
  Object.entries(params ?? {}).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '') query.set(key, String(val));
  });
  const qs = query.toString();
  const url = `${API_CONFIG.BASE_URL}${path}${qs ? `?${qs}` : ''}`;
  const { found, json } = await (options?.fresh ? cmsGetFresh(url) : cmsGet(url));
  return found ? (json as T) : null;
}

/** `{ data }` of a CMS answer (undefined when not found) */
export async function serverGetData<T>(
  path: string,
  params?: Record<string, string | number | undefined | null>,
  options?: GetOptions,
): Promise<T | undefined> {
  return (await serverGet<{ data?: T }>(path, params, options))?.data ?? undefined;
}
