import { Suspense } from 'react';
import { SearchListing, SearchListingFromUrl } from '@/components/search/SearchListing';

/** Server wrapper: the static HTML has the page frame (no query yet); in the browser the
 *  listing reads the URL's query and filters and loads the matches from /api/search/. */
export function SearchPage() {
  return (
    <Suspense fallback={<SearchListing status="idle" results={null} />}>
      <SearchListingFromUrl />
    </Suspense>
  );
}
