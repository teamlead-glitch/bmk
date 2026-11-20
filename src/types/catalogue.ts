// Catalogue model: group (6) → category (20) → spec template → product.
// Mirrors the back-end model in the developer handoff document; the CMS will
// return these shapes (see src/lib/api/).

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

/** A main product category in the menus (CMS: GET /v1/categories) */
export interface NavCategory {
  slug: string;
  name: string;
  count: number;
}

/** One of BMK's own brands in the menus: its logo and website (CMS: settings/own-brands) */
export interface NavOwnBrand {
  id: string;
  name: string;
  logo: string | null;
  site: { url: string; label: string } | null;
}

/** A partner brand in the menus, linking to its brand page (CMS: GET /v1/brands) */
export interface NavPartnerBrand {
  slug: string;
  name: string;
  logo: string | null;
}

/** Navigation data loaded once in the layouts (mega menu, mobile menu, footer, search panel) */
export interface NavData {
  categories: NavCategory[];
  ownBrands: NavOwnBrand[];
  partnerBrands: NavPartnerBrand[];
  /** The first partner brands in the admin's sort order (search panel "Popular searches") */
  latestBrands: { slug: string; name: string }[];
}
