import type { BrandColor, CardProduct, Highlight, SpecValue } from '@/types/catalogue';
import type { CmsSeo } from '@/types/common';

/** A product page (/product/{slug}) from GET /v1/products/{slug} */
export interface ProductDetail {
  slug: string;
  name: string;
  modelNo: string | null;
  short: string;
  /** Description markup, cleaned on the server (src/lib/sanitize-html.ts) */
  descriptionHtml: string;
  /** Main image first, then the gallery */
  images: { src: string; alt: string }[];
  brand: { slug: string; name: string; logo: string | null; color: BrandColor };
  /** First category, null when the product has none */
  category: { slug: string; name: string } | null;
  highlights: Highlight[];
  /** Specification groups ("Specifications" when the CMS group has no name); variable products add their options */
  specGroups: { group: string; rows: { key: string; label: string; value: SpecValue }[] }[];
  /** CMS SEO block: page metadata only (src/lib/seo-mapper.ts), server side */
  seo: CmsSeo | null;
  /** Other products of the brand / of the category, up to 4 each */
  fromBrand: CardProduct[];
  inCategory: CardProduct[];
}
