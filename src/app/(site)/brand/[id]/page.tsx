import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { Suspense } from 'react';
import { CmsListing, CmsListingFromUrl } from '@/components/catalogue/CmsListing';
import { EMPTY_QUERY } from '@/components/catalogue/Listing';
import { getBrandPage, getBrandSlugs } from '@/lib/content';
import { href } from '@/lib/routes';
import { jsonLd, pageMetadata } from '@/lib/seo';
import { siteUrl } from '@/lib/site-url';

type Props = { params: Promise<{ id: string }> };

// /brand/{slug}: a CMS brand (GET /v1/brands/{slug}) and its products (GET /v1/products?brand=)

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const data = await getBrandPage(id);
  if (!data || 'redirect' in data) return {};
  const brand = data.brand!;
  return pageMetadata({
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

  const brand = data.brand!;
  const { first } = data;
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${brand.name} products`,
    url: siteUrl(`/brand/${brand.slug}/`),
    about: { '@type': 'Brand', name: brand.name, ...(brand.logo && { logo: brand.logo }) },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: first.total,
      itemListElement: first.items.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: siteUrl(`/product/${p.slug}/`), name: p.name })),
    },
  };

  // The unfiltered first page is in the static HTML (crawlable product links); in the
  // browser the listing follows the URL's category tab and loads more pages as you scroll.
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }} />
      <Suspense fallback={<CmsListing data={data} query={EMPTY_QUERY} />}>
        <CmsListingFromUrl data={data} />
      </Suspense>
    </>
  );
}

// CMS brands are built at deploy time; new ones on first visit, then cached (ISR)
export async function generateStaticParams() {
  return (await getBrandSlugs()).map((id) => ({ id }));
}
