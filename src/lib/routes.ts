// Page URLs. Every page lives at the site root with a trailing slash, as in the
// design reference: /about/, /products/, /brand/nikon/, /product/nikon-z8/ …

type Params = Record<string, string | number | string[] | null | undefined>;

/** href('/brand/nikon', { sort: 'az' }) → "/brand/nikon/?sort=az" */
export function href(path: string, params: Params = {}): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v == null || v === '' || (Array.isArray(v) && !v.length)) continue;
    q.set(k, Array.isArray(v) ? v.join(',') : String(v));
  }
  const qs = q.toString();
  const p = path.replace(/^\/+|\/+$/g, '');
  return `/${p ? `${p}/` : ''}${qs ? `?${qs}` : ''}`;
}

export const HOME = '/';

/** Link props for a brand: partner brands open their catalogue page; BMK's own
 *  brands (SEEKEN, TEAM) have no brand page and open their website instead. */
export function brandLinkProps(b: { id: string; inHouse?: boolean; sites?: [string, string][] }) {
  if (b.inHouse && b.sites?.[0]) return { href: `https://${b.sites[0][0]}`, target: '_blank', rel: 'noopener', external: true as const };
  return { href: href(`/brand/${b.id}`), external: false as const };
}

/* ---------- URL filters (listing pages) ---------- */

/** What a listing reads from the URL: useSearchParams() in the browser, NO_FILTERS on the server */
export interface Query {
  get(key: string): string | null;
}

/** No filters: the server render and the <Suspense> fallback of a listing. Used inside the
 *  client listings (a server page can't pass an object with a function to a client component). */
export const NO_FILTERS: Query = { get: () => null };

/** "a,b" -> ["a", "b"] (a URL list filter) */
export const queryList = (v: string | null) => (v ? v.split(',').filter(Boolean) : []);
