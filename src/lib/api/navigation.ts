import { cache } from 'react';
import { getBrandShowcase } from '@/lib/api/brand-showcase';
import { getCmsCategories } from '@/lib/api/brands-categories';
import { isSlug, text } from '@/lib/api/cms-mappers';
import { hostLabel } from '@/lib/routes';
import type { NavCategory, NavData, NavOwnBrand } from '@/types/catalogue';

/* ---------- Navigation (CMS: GET /v1/categories, /v1/brands, /v1/settings/own-brands) ---------- */
// Loaded once in the layouts: mega menu, mobile menu, footer and search panel links.
// Categories are flat in the CMS, so the menus list the main categories only.
// CMS down -> CmsUnavailableError -> error.tsx.

/** Brands the search panel suggests before anything is typed */
const LATEST_BRANDS = 4;

export const getNavData = cache(async (): Promise<NavData> => {
  const [cmsCategories, brands] = await Promise.all([getCmsCategories(), getBrandShowcase()]);

  // The first brands in the admin's sort order (GET /v1/brands answers in that order)
  const latestBrands = brands.partner.slice(0, LATEST_BRANDS).map((b) => ({ slug: b.slug, name: b.name }));

  const categories: NavCategory[] = cmsCategories.flatMap((c) => {
    const slug = text(c.slug);
    const name = text(c.title);
    return isSlug(slug) && name ? [{ slug, name, count: Number(c.products_count) || 0 }] : [];
  });

  const ownBrands: NavOwnBrand[] = brands.own.map((b) => {
    const url = b.links[0]?.url;
    return { id: b.id, name: b.name, logo: b.logo, site: url ? { url, label: hostLabel(url) } : null };
  });

  return { categories, ownBrands, partnerBrands: brands.partner.map((b) => ({ slug: b.slug, name: b.name, logo: b.logo })), latestBrands };
});
