// Catalogue model: group (6) → category (20) → spec template → product.
// Mirrors the back-end model in the developer handoff document; the CMS will
// return these shapes (see src/lib/content.ts).

export type TemplateId = 'camera' | 'lens' | 'instantCamera' | 'film' | 'printer' | 'phone' | 'watch' | 'generic';

export interface Group {
  id: string;
  name: string;
}

export interface Category {
  id: string;
  name: string;
  group: string;
  template: TemplateId;
  /** Spec keys shown as highlights on product cards */
  card: string[];
  desc: string;
}

export interface TemplateGroup {
  group: string;
  /** [spec key, label] */
  fields: [string, string][];
}

export interface Brand {
  id: string;
  name: string;
  /** BMK's own brands: no brand page, they link out to their websites */
  inHouse?: boolean;
  groups: string[];
  /** [domain, label] */
  sites?: [string, string][];
  intro: string;
}

/** string → single value, string[] → list, object → per-variant value */
export type SpecValue = string | string[] | Record<string, string>;

export interface Feature {
  title: string;
  text: string;
}

export interface Product {
  slug: string;
  brand: string;
  category: string;
  /** Overrides the category's spec template */
  template?: TemplateId;
  /** Overrides the category's card highlights */
  card?: string[];
  name: string;
  model: string;
  modelNo: string | null;
  /** ISO date; drives the "Latest" sort */
  released: string;
  colours: string[];
  /** Gallery shot names (Front, Back…) */
  images: string[];
  short: string;
  overview: string[];
  features?: Feature[];
  specs: Record<string, SpecValue>;
}

/** Photography per product (kept apart from the data, as in the design) */
export interface ProductMedia {
  card?: string;
  brand?: string;
  shots?: Record<string, string>;
  features?: string[];
}

export interface BrandColor {
  color: string;
  /** Label colour on top of the accent (black or white) */
  on: string;
  hero?: string;
}

/* ---------- Slim shapes sent to client components ---------- */

export interface Highlight {
  label: string;
  value: string;
}

/** Everything a product card (and client-side filtering/search) needs */
export interface CardProduct {
  slug: string;
  name: string;
  model: string;
  modelNo: string | null;
  brandId: string;
  brandName: string;
  categoryId: string;
  categoryName: string;
  groupId: string;
  groupName: string;
  released: string;
  short: string;
  template: TemplateId;
  highlights: Highlight[];
  media: { card?: string; brand?: string };
}

export interface BrandLite {
  id: string;
  name: string;
  inHouse: boolean;
  groups: string[];
  sites: [string, string][];
  intro: string;
  logo: string | null;
  color: BrandColor;
  menuImage: string | null;
}

export interface CategoryLite {
  id: string;
  name: string;
  group: string;
  count: number;
}

/** Navigation data loaded once in the layouts (mega menu, mobile menu, footer) */
export interface NavData {
  groups: Group[];
  categories: CategoryLite[];
  inHouseBrands: BrandLite[];
  partnerBrands: BrandLite[];
}

/* ---------- CMS catalogue (GET /v1/categories, /v1/products) ---------- */

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
