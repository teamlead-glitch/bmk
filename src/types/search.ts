import type { CardProduct } from '@/types/catalogue';

/* ---------- Catalogue search (CMS: GET /v1/search?q=) ---------- */

/** A brand or category that matches the query (pill link) */
export interface SearchLink {
  slug: string;
  name: string;
}

/** Everything that matches a query: the navbar search panel and the search page */
export interface SearchResults {
  products: CardProduct[];
  brands: SearchLink[];
  categories: SearchLink[];
}
