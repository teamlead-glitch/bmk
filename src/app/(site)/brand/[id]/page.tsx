import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { Suspense } from 'react';
import { CmsListing, CmsListingFromUrl } from '@/components/catalogue/CmsListing';
import { getBrandPage, getBrandSeo, getBrandSlugs } from '@/lib/content';
import { href } from '@/lib/routes';
import { mapSeoToMetadata } from '@/lib/seo-mapper';

type Props = { params: Promise<{ id: string }> };

// /brand/{slug}: a CMS brand (GET /v1/brands/{slug}) and its products (GET /v1/products?brand=)

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const data = await getBrandPage(id);
  if (!data || 'redirect' in data) return {};
  const brand = data.brand!;
  // CMS SEO block (title, description, robots, Open Graph, Twitter); canonical on this site
  return mapSeoToMetadata(await getBrandSeo(brand.slug), {
    title: `${brand.name} products`,
    description: brand.intro.slice(0, 160) || `${brand.name} products from BMK Group.`,
    path: `/brand/${brand.slug}/`,
    image: brand.banner,
  });
}

export default async function BrandPage({ params }: Props) {
  const { id } = await params;
  const data = await getBrandPage(id);
  if (!data) notFound();
  if ('redirect' in data) permanentRedirect(href(`/brand/${data.redirect}`)); // slug renamed in the CMS

  // The unfiltered first page is in the static HTML (crawlable product links); in the
  // browser the listing follows the URL's category tab and loads more pages as you scroll.
  return (
    <Suspense fallback={<CmsListing data={data} />}>
      <CmsListingFromUrl data={data} />
    </Suspense>
  );
}

// CMS brands are built at deploy time; new ones on first visit, then cached (ISR)
export async function generateStaticParams() {
  return (await getBrandSlugs()).map((id) => ({ id }));
}
