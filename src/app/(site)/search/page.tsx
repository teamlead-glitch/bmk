import type { Metadata } from 'next';
import { SearchPage } from '@/components/search/SearchPage';
import { pageMetadata } from '@/lib/seo';

// Search results are not indexed (endless query URLs); links are still followed.
// The page is static: the query is read in the browser and the results come from the CMS
// search through /api/search/ (src/components/search/).
export const metadata: Metadata = pageMetadata({ title: 'Search', path: '/search/', index: false });

export default function SearchRoute() {
  return <SearchPage />;
}
