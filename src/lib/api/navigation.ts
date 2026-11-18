import { cache } from 'react';
import { getBrandShowcase } from '@/lib/api/brand-showcase';
import { getCmsCategories } from '@/lib/api/brands-categories';
import { isSlug, text } from '@/lib/api/cms-mappers';
import type { NavCategory, NavData, NavOwnBrand } from '@/types/catalogue';

/* ---------- Navigation (CMS: GET /v1/categories, /v1/brands, /v1/settings/own-brands) ---------- */
// Loaded once in the layouts: mega menu, mobile menu, footer and search panel links.
// Categories are flat in the CMS, so the menus list the main categories only.
// CMS down -> CmsUnavailableError -> error.tsx.

/** "https://www.seeken.com/" -> "seeken.com" (the label next to an own brand) */
function hostLabel(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

export const getNavData = cache(async (): Promise<NavData> => {
  const [cmsCategories, brands] = await Promise.all([getCmsCategories(), getBrandShowcase()]);

  const categories: NavCategory[] = cmsCategories.flatMap((c) => {
    const slug = text(c.slug);
    const name = text(c.title);
    return isSlug(slug) && name ? [{ slug, name, count: Number(c.products_count) || 0 }] : [];
  });

  const ownBrands: NavOwnBrand[] = brands.own.map((b) => {
    const url = b.links[0]?.url;
    return { id: b.id, name: b.name, logo: b.logo, site: url ? { url, label: hostLabel(url) } : null };
  });

  return { categories, ownBrands, partnerBrands: brands.partner.map((b) => ({ slug: b.slug, name: b.name, logo: b.logo })) };
});
