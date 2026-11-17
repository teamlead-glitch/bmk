import { Suspense } from 'react';
import { SearchListing, SearchListingFromUrl } from '@/components/search/SearchListing';
import type { ListingData } from '@/lib/content';

/** Server wrapper: the unfiltered first page is in the static HTML (crawlable
 *  product links); in the browser the listing follows the URL's query and filters. */
export function SearchPage({ data }: { data: ListingData }) {
  return (
    <Suspense fallback={<SearchListing data={data} />}>
      <SearchListingFromUrl data={data} />
    </Suspense>
  );
}
