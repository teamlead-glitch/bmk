// Catalogue shapes the CMS mappers (src/lib/api/) produce for the UI.

export type TemplateId = 'camera' | 'lens' | 'instantCamera' | 'film' | 'printer' | 'phone' | 'watch' | 'generic';

/** string → single value, string[] → list, object → per-variant value */
export type SpecValue = string | string[] | Record<string, string>;

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
