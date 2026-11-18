import { cache } from 'react';
import { brands, categories, groups, products } from '@/static/data/catalogue';
import { countIn, toBrandLite, toCardProduct } from '@/static/catalogue-helpers';
import type { BrandLite, CardProduct, CategoryLite, Group } from '@/types/catalogue';

/* ---------- The design's sample catalogue (src/static/data/catalogue.ts) ---------- */
// Still used by search (search panel results, /api/search/, the search page) until it moves to
// the CMS (GET /v1/categories, /v1/brands, /v1/products). Product, listing, category and
// brand pages already read the CMS (src/lib/api/).

const categoryLites = (): CategoryLite[] => categories.map((c) => ({ id: c.id, name: c.name, group: c.group, count: countIn(c.id) }));

/* ---------- Search index (search panel API, search page) ---------- */

export const getSearchIndex = cache(async () => ({
  products: products.map(toCardProduct),
  brands: brands.map(toBrandLite),
  categories: categoryLites(),
  groups,
}));

/* ---------- Listing pages ---------- */

// All products (/products), category pages (/category/{slug}) and brand pages
// (/brand/{slug}) come from the CMS: getAllProductsPage, getCategoryPage, getBrandPage below.
export type ListingKind = 'search';

export interface ListingContext {
  kind: ListingKind;
  /** Page path without query, e.g. "/brand/nikon" */
  path: string;
  title: string;
}

export interface ListingData {
  ctx: ListingContext;
  /** Every product the page can show before filters (search: all products) */
  base: CardProduct[];
  brands: BrandLite[];
  categories: CategoryLite[];
  groups: Group[];
}

/** null → the page answers 404. BMK's own brands have no brand page. */
export const getListing = cache(
  async (kind: ListingKind): Promise<ListingData> => ({
    ctx: { kind, path: '/search', title: 'Search' },
    base: products.map(toCardProduct),
    brands: brands.map(toBrandLite),
    categories: categoryLites(),
    groups,
  }),
);
