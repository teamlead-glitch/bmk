import { Suspense } from 'react';
import { SearchListing, SearchListingFromUrl } from '@/components/search/SearchListing';
import type { ListingData } from '@/lib/content';
import { jsonLd } from '@/lib/seo';
import { siteUrl } from '@/lib/site-url';

/** Server wrapper: the unfiltered first page is in the static HTML (crawlable
 *  product links); in the browser the listing follows the URL's filters. */
export function SearchPage({ data }: { data: ListingData }) {
  const { ctx } = data;
  const schema =
    ctx.kind === 'search'
      ? null
      : {
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: ctx.title,
          url: siteUrl(`${ctx.path}/`),
          mainEntity: {
            '@type': 'ItemList',
            numberOfItems: data.base.length,
            itemListElement: data.base.slice(0, 30).map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: siteUrl(`/product/${p.slug}/`), name: p.name })),
          },
        };
  return (
    <>
      {schema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }} />}
      <Suspense fallback={<SearchListing data={data} />}>
        <SearchListingFromUrl data={data} />
      </Suspense>
    </>
  );
}
