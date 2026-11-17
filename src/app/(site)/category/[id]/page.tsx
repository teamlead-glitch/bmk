import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { Suspense } from 'react';
import { CmsListing, CmsListingFromUrl } from '@/components/catalogue/CmsListing';
import { getCategoryPage, getCategorySlugs } from '@/lib/content';
import { href } from '@/lib/routes';
import { pageMetadata } from '@/lib/seo';

type Props = { params: Promise<{ id: string }> };

// /category/{slug}: a CMS category (GET /v1/categories/{slug}) and its products (GET /v1/products)

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const data = await getCategoryPage(id);
  if (!data || 'redirect' in data) return {};
  const category = data.category!;
  return pageMetadata({
    title: category.title,
    description: category.short ?? `${category.title} from the brands BMK Group distributes.`,
    path: `/category/${category.slug}/`,
    image: category.banner,
  });
}

export default async function CategoryPage({ params }: Props) {
  const { id } = await params;
  const data = await getCategoryPage(id);
  if (!data) notFound();
  if ('redirect' in data) permanentRedirect(href(`/category/${data.redirect}`)); // slug renamed in the CMS

  // The unfiltered first page is in the static HTML (crawlable product links); in the
  // browser the listing follows the URL's filters and loads more pages as you scroll.
  return (
    <Suspense fallback={<CmsListing data={data} />}>
      <CmsListingFromUrl data={data} />
    </Suspense>
  );
}

// CMS categories are built at deploy time; new ones on first visit, then cached (ISR)
export async function generateStaticParams() {
  return (await getCategorySlugs()).map((id) => ({ id }));
}
