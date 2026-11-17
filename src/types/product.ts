import type { BrandColor, CardProduct, Highlight, SpecValue } from '@/types/catalogue';

/** A product page (/product/{slug}) from GET /v1/products/{slug} */
export interface ProductDetail {
  slug: string;
  name: string;
  modelNo: string | null;
  short: string;
  /** Description markup, cleaned on the server (src/lib/html.ts) */
  descriptionHtml: string;
  /** Main image first, then the gallery */
  images: { src: string; alt: string }[];
  brand: { slug: string; name: string; logo: string | null; color: BrandColor };
  /** First category, null when the product has none */
  category: { slug: string; name: string } | null;
  highlights: Highlight[];
  /** Specification groups ("Specifications" when the CMS group has no name); variable products add their options */
  specGroups: { group: string; rows: { key: string; label: string; value: SpecValue }[] }[];
  seo: { title: string; description: string; index: boolean; image: string | null };
  /** Other products of the brand / of the category, up to 4 each */
  fromBrand: CardProduct[];
  inCategory: CardProduct[];
}
