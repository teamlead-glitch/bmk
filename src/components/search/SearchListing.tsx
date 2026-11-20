'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { EmptyBox, FacetCheck } from '@/components/catalogue/ListingParts';
import { SearchHero } from '@/components/search/SearchHero';
import { listingState, type ListingState } from '@/components/search/search-state';
import { useSearch, type SearchStatus } from '@/components/search/useSearch';
import { Arrow } from '@/components/common/Arrow';
import { ChevIcon, CloseIcon, FilterIcon } from '@/components/common/Icons';
import { ProductCard } from '@/components/common/ProductCard';
import { MIN_SEARCH_LENGTH } from '@/constants/listing';
import { href, NO_FILTERS, type Query } from '@/lib/routes';
import type { SearchResults } from '@/types/search';

/** Reads the query and filters from the URL and loads the matches (CMS search via /api/search/).
 *  Wrap in <Suspense fallback={<SearchListing status="idle" results={null} />}>. */
export function SearchListingFromUrl() {
  const params = useSearchParams();
  const { status, data } = useSearch(params.get('q') || '', 0);
  return <SearchListing status={status} results={data} query={params} />;
}

/** Search results. (All products, category and brand pages: src/components/catalogue/CmsListing.tsx.) */
export function SearchListing({ status, results, query = NO_FILTERS }: { status: SearchStatus; results: SearchResults | null; query?: Query }) {
  const router = useRouter();
  const s = listingState(results, query);
  const [sheet, setSheet] = useState(false);

  useEffect(() => {
    document.body.classList.toggle('no-scroll', sheet);
    return () => document.body.classList.remove('no-scroll');
  }, [sheet]);

  const sortSelect = (
    <label className="select">
      <span className="sr-only">Sort by</span>
      <select value={s.sort} aria-label="Sort by" onChange={(e) => router.push(s.url({ sort: e.target.value === 'latest' ? '' : e.target.value, page: '' }), { scroll: false })}>
        <option value="latest">Sort: Latest</option>
        <option value="az">Sort: A–Z</option>
      </select>
    </label>
  );

  const facets = <Facets s={s} />;

  return (
    <>
      <SearchHero s={s} status={status} results={results} />
      <section className="shell section-y !pt-12">
        {s.sidebar && (
          <div className="mb-6 flex items-center justify-between gap-3 lg:hidden">
            <button type="button" className="pill" onClick={() => setSheet(true)}>
              <FilterIcon /> Filters
              {s.active > 0 && <span className="grid size-5 place-items-center rounded-full bg-navy text-[11px] text-white">{s.active}</span>}
            </button>
            {sortSelect}
          </div>
        )}
        <div className="flex gap-12">
          {s.sidebar && (
            <aside className="hidden w-[272px] shrink-0 lg:block" aria-label="Filters">
              <div className="sticky top-48">
                <p className="pb-2 text-xs tracking-[0.14em] text-muted uppercase">Filter by</p>
                {facets}
              </div>
            </aside>
          )}
          <div className="min-w-0 flex-1">
            {!s.isEmpty && (
              <div className="mb-6 flex items-center justify-between gap-4">
                <p className="text-[15px] text-muted">
                  <strong className="font-semibold text-ink">{s.results.length}</strong> product{s.results.length === 1 ? '' : 's'}
                </p>
                <div className={s.sidebar ? 'hidden lg:block' : ''}>{sortSelect}</div>
              </div>
            )}
            {s.chips.length > 0 && (
              <div className="mb-6 flex flex-wrap items-center gap-2">
                {s.chips.map((c) => (
                  <Link key={c.to} scroll={false} className="pill is-on" href={c.to} aria-label={`Remove ${c.label}`}>
                    {c.label} <CloseIcon />
                  </Link>
                ))}
                <Link scroll={false} className="ml-1 text-sm underline underline-offset-4" href={s.clearUrl}>
                  Clear all
                </Link>
              </div>
            )}
            {status === 'loading' ? (
              <p className="t-body text-muted" role="status">
                Searching…
              </p>
            ) : s.results.length ? (
              <>
                <ul className={`grid gap-5 sm:grid-cols-2 ${s.sidebar ? 'xl:grid-cols-3' : 'lg:grid-cols-3 xl:grid-cols-4'}`}>
                  {s.shown.map((p, i) => (
                    <li key={p.slug}>
                      <ProductCard product={p} index={i} />
                    </li>
                  ))}
                </ul>
                {s.results.length > s.shown.length && (
                  <div className="mt-14 grid justify-items-center gap-4">
                    <p className="text-sm text-muted">
                      Showing {s.shown.length} of {s.results.length} products
                    </p>
                    <div className="h-1 w-56 overflow-hidden rounded-full bg-line">
                      <div className="h-full bg-accent" style={{ width: `${(s.shown.length / s.results.length) * 100}%` }} />
                    </div>
                    <Link scroll={false} className="btn btn-navy" href={s.url({ page: s.pages + 1 })}>
                      Load more <Arrow />
                    </Link>
                  </div>
                )}
              </>
            ) : (
              <Empty s={s} status={status} />
            )}
          </div>
        </div>
      </section>

      {s.sidebar && (
        <div className={`fixed inset-0 z-[70] lg:hidden ${sheet ? '' : 'hidden'}`} role="dialog" aria-modal="true" aria-label="Filters">
          <div className="absolute inset-0 bg-ink/50 backdrop-blur-sm" onClick={() => setSheet(false)} />
          <div className="absolute inset-x-0 bottom-0 flex max-h-[85svh] flex-col rounded-t-3xl bg-white">
            <div className="flex items-center justify-between px-5 pt-5 pb-2">
              <p className="text-lg font-semibold">Filters</p>
              <Link scroll={false} className="text-sm underline underline-offset-4" href={s.clearUrl}>
                Clear all
              </Link>
            </div>
            <div className="overflow-y-auto px-5">{facets}</div>
            <div className="border-t border-line p-4">
              <button type="button" className="btn btn-navy w-full" onClick={() => setSheet(false)}>
                Show {s.results.length} product{s.results.length === 1 ? '' : 's'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Facets({ s }: { s: ListingState }) {
  return (
    <>
      {s.showCat && (
        <details className="facet border-b border-line" open>
          <summary>
            Category <ChevIcon />
          </summary>
          <div className="pb-4">
            {s.catSections.map(({ group, opts }) => (
              <div key={group?.id ?? 'all'}>
                {group && <p className="mt-3 mb-1 px-2 text-[11px] tracking-[0.14em] text-muted uppercase first:mt-0">{group.name}</p>}
                {opts.map((o) => (
                  <FacetCheck key={o.id} on={s.selC.includes(o.id)} label={o.name} n={o.n} to={s.toggle('cat', o.id)} />
                ))}
              </div>
            ))}
          </div>
        </details>
      )}
      {s.showBrand && (
        <details className="facet" open>
          <summary>
            Brand <ChevIcon />
          </summary>
          <div className="pb-4">
            {s.brandOpts.map((o) => (
              <FacetCheck key={o.id} on={s.selB.includes(o.id)} label={o.name} n={o.n} to={s.toggle('brand', o.id)} />
            ))}
          </div>
        </details>
      )}
    </>
  );
}

/** Empty state: no query, a query that is too short, the CMS unavailable, or no matches. */
function Empty({ s, status }: { s: ListingState; status: SearchStatus }) {
  const [title, body] =
    status === 'error'
      ? ['Search is unavailable right now', 'Please try again in a moment, or browse the catalogue.']
      : status === 'short'
        ? ['Search the catalogue', `Type at least ${MIN_SEARCH_LENGTH} characters: a product name, model or brand.`]
        : s.q
          ? [`No products match “${s.q}”`, 'Check the spelling, or search by product name or brand.']
          : ['Search the catalogue', 'Search by product, model name or brand.'];
  return (
    <EmptyBox title={title} body={body}>
      <Link className="btn btn-navy" href={href('/products')}>
        Browse all products <Arrow />
      </Link>
    </EmptyBox>
  );
}
