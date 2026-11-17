// Search results rules (design: catalogue/src/listing.js): query, filters, sort and
// paging live in the URL (?q=…&brand=a,b&cat=x&sort=az&page=2), so every state can be
// linked to and the back button works. Pure: runs on the server (first render) and in
// the browser.
import { SEARCH_PAGE_SIZE } from '@/constants/listing';
import type { ListingData } from '@/lib/content';
import { href, queryList as list, type Query } from '@/lib/routes';
import { searchProducts } from '@/lib/search';

export function listingState({ ctx, base: all, brands, categories, groups }: ListingData, params: Query) {
  const q = (params.get('q') || '').trim();
  const base = searchProducts(all, q);
  const selB = list(params.get('brand'));
  const selC = list(params.get('cat'));
  const sort = params.get('sort') === 'az' ? 'az' : 'latest';
  const pages = Math.max(1, parseInt(params.get('page') || '1', 10) || 1);
  const keep = { q: q || undefined, brand: selB, cat: selC, sort: sort === 'latest' ? '' : sort };
  const url = (o: Record<string, string | number | string[] | undefined> = {}) => href(ctx.path, { ...keep, ...o });

  const byB = (p: { brandId: string }) => !selB.length || selB.includes(p.brandId);
  const byC = (p: { categoryId: string }) => !selC.length || selC.includes(p.categoryId);
  const results = base
    .filter((p) => byB(p) && byC(p))
    .sort((a, b) => (sort === 'az' ? a.name.localeCompare(b.name) : b.released.localeCompare(a.released)));
  const shown = results.slice(0, pages * SEARCH_PAGE_SIZE);

  const brandOpts = brands
    .map((b) => ({ id: b.id, name: b.name, n: base.filter((p) => p.brandId === b.id && byC(p)).length }))
    .filter((o) => o.n || selB.includes(o.id));
  const catOpts = categories.map((c) => ({ ...c, n: base.filter((p) => p.categoryId === c.id && byB(p)).length })).filter((o) => o.n || selC.includes(o.id));

  const isEmpty = base.length === 0;
  const showCat = true;
  const showBrand = true;
  const sidebar = !isEmpty && (showCat || showBrand);
  const active = selB.length + selC.length;
  const toggle = (key: 'brand' | 'cat', id: string) => {
    const cur = key === 'brand' ? selB : selC;
    return url({ [key]: cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id], page: '' });
  };
  const clearUrl = url({ brand: [], cat: [], page: '' });

  const chips = [
    ...selC.map((id) => ({ label: categories.find((c) => c.id === id)?.name ?? id, to: toggle('cat', id) })),
    ...selB.map((id) => ({ label: brands.find((b) => b.id === id)?.name ?? id, to: toggle('brand', id) })),
  ];

  // Category facet: grouped by product group
  const catSections = groups.map((g) => ({ group: g as null | { id: string; name: string }, opts: catOpts.filter((o) => o.group === g.id) })).filter((x) => x.opts.length);

  return { q, base, selB, selC, sort, pages, url, results, shown, brandOpts, catSections, isEmpty, showCat, showBrand, sidebar, active, toggle, clearUrl, chips };
}

export type ListingState = ReturnType<typeof listingState>;
