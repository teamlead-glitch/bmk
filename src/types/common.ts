/* ---------- Shapes shared across resources ---------- */

/** What the browser fetchers (src/services/) return: never throws */
export type ApiResponse<T> = { success: true; data: T } | { success: false; error: string; errors?: Record<string, string> };

type CmsImageRef = { url?: string | null; alt?: string | null } | null;

/** The CMS `seo` block on products, brands and pages (GET /v1/products/{slug}, /v1/brands/{slug}) */
export interface CmsSeo {
  /** Falls back to the record name in the CMS */
  meta_title?: string | null;
  /** Falls back to the short description in the CMS */
  meta_description?: string | null;
  robots?: { index?: boolean } | null;
  sitemap?: { visible?: boolean; priority?: number } | null;
  open_graph?: { type?: string | null; title?: string | null; description?: string | null; image?: CmsImageRef } | null;
  twitter?: { card?: string | null; site?: string | null; creator?: string | null; title?: string | null; description?: string | null; image?: CmsImageRef } | null;
  /** JSON-LD stored in the CMS. Not rendered: the site has no structured data. */
  schema?: Record<string, unknown> | null;
}
