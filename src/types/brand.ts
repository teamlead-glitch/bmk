/* ---------- Brand showcase: homepage "Associated Brands" + "Our Brands", About "Our brands" ---------- */

/** A distributed (partner) brand, from GET /v1/brands */
export interface PartnerBrand {
  slug: string;
  name: string;
  /** Introduction as plain text (the CMS sends HTML) */
  intro: string;
  logo: string | null;
  /** Category slugs the brand offers products in (the homepage category chips) */
  categories: string[];
}

/** One of BMK's own brands, from GET /v1/settings/own-brands */
export interface OwnBrand {
  id: string;
  name: string;
  intro: string;
  logo: string | null;
  /** Websites, in the admin's order */
  links: { title: string; url: string }[];
}

export interface BrandShowcase {
  partner: PartnerBrand[];
  own: OwnBrand[];
  /** "All" + the categories that at least one partner brand has, in CMS order */
  filters: { id: string; label: string }[];
}
