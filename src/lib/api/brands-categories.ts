import { cache } from 'react';
import { API_CONFIG } from '@/constants/config';
import { cmsGet } from '@/lib/api/cms-fetch';
import { isSlug, text, type CmsRef } from '@/lib/api/cms-mappers';

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
};

export const getCmsCategories = cache(async (): Promise<CmsCategory[]> => {
  if (!API_CONFIG.BASE_URL) return [];
  const { found, json } = await cmsGet(`${API_CONFIG.BASE_URL}/v1/categories`);
  return found ? ((json as { data?: CmsCategory[] })?.data ?? []) : [];
});

export const getCmsBrands = cache(async (): Promise<CmsBrand[]> => {
  if (!API_CONFIG.BASE_URL) return [];
  const { found, json } = await cmsGet(`${API_CONFIG.BASE_URL}/v1/brands`);
  return found ? ((json as { data?: CmsBrand[] })?.data ?? []) : [];
});

/** Slugs of the CMS categories (built at deploy time, sitemap) */
export const getCategorySlugs = cache(async (): Promise<string[]> => (await getCmsCategories()).map((c) => text(c.slug)).filter(isSlug));

/** Slugs of the CMS brands (built at deploy time, sitemap) */
export const getBrandSlugs = cache(async (): Promise<string[]> => (await getCmsBrands()).map((b) => text(b.slug)).filter(isSlug));
