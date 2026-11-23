import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { CmsListing, CmsListingFromUrl } from '@/components/catalogue/CmsListing';
import { getBrandPage, getBrandSeo, getCategoryPage } from '@/lib/content';
import { previewMetadata, redirectRenamed } from '@/lib/preview';
import { pageMetadata } from '@/lib/seo';
import { mapSeoToMetadata } from '@/lib/seo-mapper';
import type { CmsListingData } from '@/types/listing';

/* ---------- Brand and category pages (also used by the CMS preview route) ---------- */
// `preview`: token from ?preview= (src/proxy.ts): passed to the CMS for the brand / category record.

/** The unfiltered first page is in the static HTML (crawlable product links); in the browser
 *  the listing follows the URL's filters / category tab and loads more pages as you scroll. */
function Listing({ data }: { data: CmsListingData }) {
  return (
    <Suspense fallback={<CmsListing data={data} />}>
      <CmsListingFromUrl data={data} />
    </Suspense>
  );
}

/** /brand/{slug}: CMS SEO block (title, description, robots, Open Graph, Twitter) */
export async function brandMetadata(slug: string, preview?: string): Promise<Metadata> {
  const data = await getBrandPage(slug, preview);
  if (!data || 'redirect' in data) return previewMetadata({}, preview);
  const brand = data.brand!;
  return previewMetadata(
    mapSeoToMetadata(await getBrandSeo(brand.slug, preview), {
      title: `${brand.name} products`,
      description: brand.intro.slice(0, 160) || `${brand.name} products from BMK Group.`,
      path: `/brand/${brand.slug}/`,
      image: brand.banner,
    }),
    preview,
  );
}

/** /brand/{slug}: a CMS brand (GET /v1/brands/{slug}) and its products (GET /v1/products?brand=) */
export async function BrandPage({ slug, preview }: { slug: string; preview?: string }) {
  const data = await getBrandPage(slug, preview);
  if (!data) notFound();
  if ('redirect' in data) redirectRenamed(`/brand/${data.redirect}`, preview); // slug renamed in the CMS
  return <Listing data={data} />;
}

export async function categoryMetadata(slug: string, preview?: string): Promise<Metadata> {
  const data = await getCategoryPage(slug, preview);
  if (!data || 'redirect' in data) return previewMetadata({}, preview);
  const category = data.category!;
  return previewMetadata(
    pageMetadata({
      title: category.title,
      description: category.short ?? `${category.title} from the brands BMK Group distributes.`,
      path: `/category/${category.slug}/`,
      image: category.banner,
    }),
    preview,
  );
}

/** /category/{slug}: a CMS category (GET /v1/categories/{slug}) and its products (GET /v1/products) */
export async function CategoryPage({ slug, preview }: { slug: string; preview?: string }) {
  const data = await getCategoryPage(slug, preview);
  if (!data) notFound();
  if ('redirect' in data) redirectRenamed(`/category/${data.redirect}`, preview); // slug renamed in the CMS
  return <Listing data={data} />;
}
