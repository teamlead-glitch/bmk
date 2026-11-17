import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CmsListing, CmsListingFromUrl } from '@/components/catalogue/CmsListing';
import { getAllProductsPage } from '@/lib/content';
import { jsonLd, pageMetadata } from '@/lib/seo';
import { siteUrl } from '@/lib/site-url';

export const metadata: Metadata = pageMetadata({
  title: 'All products',
  description: 'The full BMK Group catalogue from the brands BMK distributes.',
  path: '/products/',
});

// /products: every CMS product (GET /v1/products), Category and Brand filters (GET /v1/categories, /v1/brands)
export default async function ProductsPage() {
  const data = await getAllProductsPage();
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'All products',
    url: siteUrl('/products/'),
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: data.first.total,
      itemListElement: data.first.items.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: siteUrl(`/product/${p.slug}/`), name: p.name })),
    },
  };

  // The unfiltered first page is in the static HTML (crawlable product links); in the
  // browser the listing follows the URL's filters and loads more pages as you scroll.
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }} />
      <Suspense fallback={<CmsListing data={data} />}>
        <CmsListingFromUrl data={data} />
      </Suspense>
    </>
  );
}
