import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ListingPage } from '@/components/catalogue/ListingPage';
import { getListing } from '@/lib/content';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'All products',
  description: 'The full BMK Group catalogue: cameras, lenses, instant photography and more from the brands BMK distributes.',
  path: '/products/',
});

export default async function ProductsPage() {
  const data = await getListing('all');
  if (!data) notFound();
  return <ListingPage data={data} />;
}
