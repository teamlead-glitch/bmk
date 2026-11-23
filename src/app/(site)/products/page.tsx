import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CmsListing, CmsListingFromUrl } from '@/components/catalogue/CmsListing';
import { getAllProductsPage } from '@/lib/content';
import { cmsSeoMetadata } from '@/lib/page-metadata';

// SEO from the admin's "products" page (CMS: GET /v1/pages/products); these values are the fallback
export function generateMetadata(): Promise<Metadata> {
  return cmsSeoMetadata('products', {
    title: 'All products',
    description: 'The full BMK Group catalogue from the brands BMK distributes.',
    path: '/products/',
  });
}

// /products: every CMS product (GET /v1/products), Category and Brand filters (GET /v1/categories, /v1/brands)
export default async function ProductsPage() {
  const data = await getAllProductsPage();

  // The unfiltered first page is in the static HTML (crawlable product links); in the
  // browser the listing follows the URL's filters and loads more pages as you scroll.
  return (
    <Suspense fallback={<CmsListing data={data} />}>
      <CmsListingFromUrl data={data} />
    </Suspense>
  );
}
