import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SearchPage } from '@/components/search/SearchPage';
import { getListing } from '@/lib/content';
import { pageMetadata } from '@/lib/seo';

// Search results are not indexed (endless query URLs); links are still followed.
export const metadata: Metadata = pageMetadata({ title: 'Search', path: '/search/', index: false });

export default async function SearchRoute() {
  const data = await getListing('search');
  if (!data) notFound();
  return <SearchPage data={data} />;
}
