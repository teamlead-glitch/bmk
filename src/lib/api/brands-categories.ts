import { cache } from 'react';
import { isSlug, text, type CmsRef } from '@/lib/api/cms-mappers';
import { serverGetData } from '@/lib/api/server-api';
import type { CmsSeo } from '@/types/common';

/* ---------- Brands and categories (CMS: GET /v1/brands, /v1/categories) ---------- */
// The full lists, shared by the product listings (filters, tabs, slugs) and the product
// page (brand colour). Categories are flat in the CMS: subcategories are switched off.

export type CmsCategory = {
  slug?: string | null;
  title?: string | null;
  short_description?: string | null;
  image?: { url?: string | null } | null;
  banner?: { url?: string | null } | null;
  products_count?: number | null;
};

export type CmsBrand = {
  slug?: string | null;
  name?: string | null;
  introduction?: string | null;
  color?: string | null;
  logo?: { url?: string | null } | null;
  banner?: { url?: string | null } | null;
  categories?: CmsRef[] | null;
  /** Brand detail only (GET /v1/brands/{slug}) */
  seo?: CmsSeo | null;
};

export const getCmsCategories = cache(async (): Promise<CmsCategory[]> => {
  return (await serverGetData<CmsCategory[]>('/v1/categories')) ?? [];
});

export const getCmsBrands = cache(async (): Promise<CmsBrand[]> => {
  return (await serverGetData<CmsBrand[]>('/v1/brands')) ?? [];
});

/** Slugs of the CMS categories (built at deploy time, sitemap) */
export const getCategorySlugs = cache(async (): Promise<string[]> => (await getCmsCategories()).map((c) => text(c.slug)).filter(isSlug));

/** Slugs of the CMS brands (built at deploy time, sitemap) */
export const getBrandSlugs = cache(async (): Promise<string[]> => (await getCmsBrands()).map((b) => text(b.slug)).filter(isSlug));

/** One brand with its SEO block (GET /v1/brands/{slug}); null when unknown. A renamed slug
 *  comes back with its current slug (the CMS answers 301 and fetch follows it). */
export const getCmsBrand = cache(async (slug: string): Promise<CmsBrand | null> =>
  isSlug(slug) ? ((await serverGetData<CmsBrand>(`/v1/brands/${encodeURIComponent(slug)}`)) ?? null) : null,
);

/** The brand page's CMS SEO block (page metadata, server side only) */
export const getBrandSeo = cache(async (slug: string): Promise<CmsSeo | null> => (await getCmsBrand(slug))?.seo ?? null);
