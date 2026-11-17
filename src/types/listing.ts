import type { BrandColor, CardProduct } from '@/types/catalogue';

/* ---------- CMS listings: All products, category and brand pages (GET /v1/products, /v1/categories, /v1/brands) ---------- */

/** Product sort the CMS understands */
export type ProductSort = 'latest' | 'name_asc' | 'name_desc';

/** One page of products from GET /v1/products */
export interface ProductPage {
  items: CardProduct[];
  total: number;
  page: number;
  lastPage: number;
}

/** A category page (/category/{slug}) from GET /v1/categories/{slug} */
export interface CategoryInfo {
  slug: string;
  title: string;
  short: string | null;
  /** Hero photo: the category banner, else its image */
  banner: string | null;
  count: number;
}

/** A pill or filter option with its product count */
export interface CountedOption {
  id: string;
  name: string;
  n: number;
}

/** A brand page (/brand/{slug}) from GET /v1/brands/{slug} */
export interface BrandInfo {
  slug: string;
  name: string;
  /** Introduction as plain text (the CMS sends HTML) */
  intro: string;
  logo: string | null;
  banner: string | null;
  /** Brand colour and the label colour on top of it */
  color: BrandColor;
}

/** A product listing page from the CMS: All products (/products), a category (/category/{slug}) or a brand (/brand/{slug}) */
export interface CmsListingData {
  kind: 'all' | 'category' | 'brand';
  /** The category of a category page, else null */
  category: CategoryInfo | null;
  /** The brand of a brand page, else null */
  brand: BrandInfo | null;
  /** Categories with products: Category filter (All products), category tabs (brand page: counts within the brand) */
  categories: CountedOption[];
  /** Brands with products on this page (Brand filter; empty on a brand page) */
  brands: CountedOption[];
  /** First page, unfiltered, latest first: in the server HTML */
  first: ProductPage;
}
