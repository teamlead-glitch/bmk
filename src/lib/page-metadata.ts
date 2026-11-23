import type { Metadata } from 'next';
import { getCmsPage } from '@/lib/api/pages';
import { pageMetadata, type PageSeo } from '@/lib/seo';
import { mapSeoToMetadata } from '@/lib/seo-mapper';

/* ---------- SITE PAGE SEO FROM THE CMS (GET /v1/pages/{slug}) ---------- */
// The site's own pages (home, about-us, contact-us, products, faqs) have a record in the admin's
// Pages list that only carries their SEO. Its `seo` block (title, description, robots, OG, Twitter)
// is applied over `fallback`, which is also used as is when the CMS has no record for the slug,
// a field is empty, or the CMS is down (the page itself still renders).

export async function cmsSeoMetadata(slug: string, fallback: PageSeo): Promise<Metadata> {
  try {
    const page = await getCmsPage(slug);
    if (page && !('redirect' in page) && page.seo) {
      return mapSeoToMetadata(page.seo, { path: fallback.path, title: fallback.title, description: fallback.description, image: fallback.image });
    }
  } catch (error) {
    console.error(`[cms] SEO for /${slug}/ not loaded, using the defaults:`, error);
  }
  return pageMetadata(fallback);
}
