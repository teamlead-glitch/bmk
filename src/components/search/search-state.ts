// Search results rules (design: catalogue/src/listing.js): query, filters, sort and paging live
// in the URL (?q=…&brand=a,b&cat=x&sort=az&page=2), so every state can be linked to and the back
// button works. The matches come from the CMS search (/api/search/: every match, no paging);
// filters, sort and "Load more" run here on that list. Pure: runs on the server (first render)
// and in the browser.
import { SEARCH_PAGE_SIZE } from '@/constants/listing';
import { href, queryList as list, type Query } from '@/lib/routes';
import type { CardProduct } from '@/types/catalogue';
import type { SearchResults } from '@/types/search';

const PATH = '/search';

/** Filter options from the matches themselves, in first-seen order */
function options(products: CardProduct[], id: (p: CardProduct) => string, name: (p: CardProduct) => string) {
  const seen = new Map<string, string>();
  for (const p of products) if (id(p) && !seen.has(id(p))) seen.set(id(p), name(p) || id(p));
  return [...seen].map(([oid, oname]) => ({ id: oid, name: oname }));
}

export function listingState(results: SearchResults | null, params: Query) {
  const q = (params.get('q') || '').trim();
  const base = results?.products ?? [];
  const selB = list(params.get('brand'));
  const selC = list(params.get('cat'));
  const sort = params.get('sort') === 'az' ? 'az' : 'latest';
  const pages = Math.max(1, parseInt(params.get('page') || '1', 10) || 1);
  const keep = { q: q || undefined, brand: selB, cat: selC, sort: sort === 'latest' ? '' : sort };
  const url = (o: Record<string, string | number | string[] | undefined> = {}) => href(PATH, { ...keep, ...o });

  const byB = (p: CardProduct) => !selB.length || selB.includes(p.brandId);
  const byC = (p: CardProduct) => !selC.length || selC.includes(p.categoryId);
  // "Latest": the CMS order; A–Z by name
  const filtered = base.filter((p) => byB(p) && byC(p));
  const results_ = sort === 'az' ? [...filtered].sort((a, b) => a.name.localeCompare(b.name)) : filtered;
  const shown = results_.slice(0, pages * SEARCH_PAGE_SIZE);

  const brandOpts = options(base, (p) => p.brandId, (p) => p.brandName)
    .map((b) => ({ ...b, n: base.filter((p) => p.brandId === b.id && byC(p)).length }))
    .filter((o) => o.n || selB.includes(o.id));
  const catOpts = options(base, (p) => p.categoryId, (p) => p.categoryName)
    .map((c) => ({ ...c, n: base.filter((p) => p.categoryId === c.id && byB(p)).length }))
    .filter((o) => o.n || selC.includes(o.id));

  const isEmpty = base.length === 0;
  const showCat = catOpts.length > 0;
  const showBrand = brandOpts.length > 0;
  const sidebar = !isEmpty && (showCat || showBrand);
  const active = selB.length + selC.length;
  const toggle = (key: 'brand' | 'cat', id: string) => {
    const cur = key === 'brand' ? selB : selC;
    return url({ [key]: cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id], page: '' });
  };
  const clearUrl = url({ brand: [], cat: [], page: '' });

  const chips = [
    ...selC.map((id) => ({ label: catOpts.find((c) => c.id === id)?.name ?? id, to: toggle('cat', id) })),
    ...selB.map((id) => ({ label: brandOpts.find((b) => b.id === id)?.name ?? id, to: toggle('brand', id) })),
  ];

  // CMS categories are flat: one section, no group headings
  const catSections = catOpts.length ? [{ group: null as null | { id: string; name: string }, opts: catOpts }] : [];

  return {
    q,
    base,
    selB,
    selC,
    sort,
    pages,
    url,
    results: results_,
    shown,
    brandOpts,
    catSections,
    isEmpty,
    showCat,
    showBrand,
    sidebar,
    active,
    toggle,
    clearUrl,
    chips,
  };
}

export type ListingState = ReturnType<typeof listingState>;
