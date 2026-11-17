import type { MetadataRoute } from 'next';
import { getBrandSlugs, getCategorySlugs, getProductSlugs } from '@/lib/content';
import { siteUrl } from '@/lib/site-url';

// Built from the content layer: every indexable page. Search results (noindex)
// and BMK's own brands (no brand page) are left out. When the CMS is live it can
// supply this list instead (skill template: sitemap.xml/route.ts proxy).
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [brands, categories, slugs] = await Promise.all([getBrandSlugs(), getCategorySlugs(), getProductSlugs()]);
  const fixed = ['/', '/about/', '/products/', '/faq/', '/contact/', '/privacy/', '/cookies/', '/terms/'];
  return [
    ...fixed.map((p) => ({ url: siteUrl(p), changeFrequency: 'monthly' as const, priority: p === '/' ? 1 : 0.7 })),
    ...categories.map((id) => ({ url: siteUrl(`/category/${id}/`), changeFrequency: 'weekly' as const, priority: 0.6 })),
    ...brands.map((id) => ({ url: siteUrl(`/brand/${id}/`), changeFrequency: 'weekly' as const, priority: 0.6 })),
    ...slugs.map((s) => ({ url: siteUrl(`/product/${s}/`), changeFrequency: 'weekly' as const, priority: 0.8 })),
  ];
}
