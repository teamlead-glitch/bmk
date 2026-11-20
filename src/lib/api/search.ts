import { cache } from 'react';
import { MIN_SEARCH_LENGTH } from '@/constants/listing';
import { isSlug, text, type CmsRef } from '@/lib/api/cms-mappers';
import { toCmsCard, type CmsProductItem } from '@/lib/api/products';
import { serverGetData } from '@/lib/api/server-api';
import type { CardProduct } from '@/types/catalogue';
import type { SearchLink, SearchResults } from '@/types/search';

/* ---------- Catalogue search (CMS: GET /v1/search?q=) ---------- */
// { data: { products: [...], brands: [...], categories: [...] } }: every match, no paging.
// Products use the listing card mapper. The CMS rejects a query under 2 characters (422),
// so a shorter one never reaches it. Read by /api/search/ (search panel and search page).
// CMS down -> CmsUnavailableError (the route answers 502).

type CmsSearch = { products?: CmsProductItem[] | null; brands?: CmsRef[] | null; categories?: CmsRef[] | null };

export const EMPTY_SEARCH: SearchResults = { products: [], brands: [], categories: [] };

/** Trimmed query, max 100 characters, single spaces */
export const normalizeQuery = (q: string) => q.replace(/\s+/g, ' ').trim().slice(0, 100);

const links = (list: CmsRef[] | null | undefined, label: (r: CmsRef) => unknown): SearchLink[] =>
  (list ?? []).flatMap((r) => {
    const slug = text(r.slug);
    const name = text(label(r));
    return isSlug(slug) && name ? [{ slug, name }] : [];
  });

export const searchCatalogue = cache(async (query: string): Promise<SearchResults> => {
  const q = normalizeQuery(query);
  if (q.length < MIN_SEARCH_LENGTH) return EMPTY_SEARCH;
  // Lower-case: "Nikon" and "nikon" share one cache entry (the CMS search ignores case)
  const data = await serverGetData<CmsSearch>('/v1/search', { q: q.toLowerCase() });
  if (!data) return EMPTY_SEARCH;
  return {
    products: (data.products ?? []).map(toCmsCard).filter((p): p is CardProduct => !!p),
    brands: links(data.brands, (b) => b.name),
    categories: links(data.categories, (c) => c.title),
  };
});
