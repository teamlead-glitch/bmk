import type { MetadataRoute } from 'next';
import { getBrandSlugs, getCategorySlugs, getProductSlugs } from '@/lib/content';
import { LEGAL_PAGES } from '@/constants/legal';
import { siteUrl } from '@/lib/site-url';

// Built from the content layer: every indexable page. Search results (noindex)
// and BMK's own brands (no brand page) are left out. When the CMS is live it can
// supply this list instead (skill template: sitemap.xml/route.ts proxy).
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [brands, categories, slugs] = await Promise.all([getBrandSlugs(), getCategorySlugs(), getProductSlugs()]);
  // Legal CMS pages at their admin slug. Other CMS pages can't be listed yet (no GET /v1/pages list).
  const fixed = ['/', '/about-us/', '/products/', '/faqs/', '/contact-us/', ...LEGAL_PAGES.map((p) => `/${p.slug}/`)];
  return [
    ...fixed.map((p) => ({ url: siteUrl(p), changeFrequency: 'monthly' as const, priority: p === '/' ? 1 : 0.7 })),
    ...categories.map((id) => ({ url: siteUrl(`/category/${id}/`), changeFrequency: 'weekly' as const, priority: 0.6 })),
    ...brands.map((id) => ({ url: siteUrl(`/brand/${id}/`), changeFrequency: 'weekly' as const, priority: 0.6 })),
    ...slugs.map((s) => ({ url: siteUrl(`/product/${s}/`), changeFrequency: 'weekly' as const, priority: 0.8 })),
  ];
}
