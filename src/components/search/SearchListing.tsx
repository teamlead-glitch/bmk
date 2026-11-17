'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { PageHero } from '@/components/catalogue/ListingHero';
import { listingState, type ListingState, type Query } from '@/components/catalogue/listing-state';
import { Arrow } from '@/components/common/Arrow';
import { CheckIcon, ChevIcon, CloseIcon, FilterIcon } from '@/components/common/Icons';
import { ProductCard } from '@/components/common/ProductCard';
import { POPULAR_SEARCHES } from '@/data/visuals';
import type { ListingData } from '@/lib/content';
import { href } from '@/lib/routes';

/** Reads filters from the URL. Wrap in <Suspense fallback={<Listing data query={EMPTY} />}>
 *  so the first page is in the server HTML (static), then follows the URL. */
export function ListingFromUrl({ data }: { data: ListingData }) {
  const params = useSearchParams();
  return <Listing data={data} query={params} />;
}

export const EMPTY_QUERY: Query = { get: () => null };

/** Search results. (All products, category and brand pages: CmsListing.tsx.) */
export function Listing({ data, query }: { data: ListingData; query: Query }) {
  const router = useRouter();
  const s = listingState(data, query);
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
      <PageHero data={data} s={s} />
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
            {s.results.length ? (
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
              <Empty s={s} />
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

function Check({ on, label, n, to }: { on: boolean; label: string; n: number; to: string }) {
  return (
    <Link scroll={false} className="check" href={to} role="checkbox" aria-checked={on}>
      <span className="check-box">{on && <CheckIcon />}</span>
      {label}
      <span className="check-count">{n}</span>
    </Link>
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
                  <Check key={o.id} on={s.selC.includes(o.id)} label={o.name} n={o.n} to={s.toggle('cat', o.id)} />
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
              <Check key={o.id} on={s.selB.includes(o.id)} label={o.name} n={o.n} to={s.toggle('brand', o.id)} />
            ))}
          </div>
        </details>
      )}
    </>
  );
}

function Box({ title, body, children }: { title: string; body: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl bg-mist p-10 sm:p-14">
      <p className="text-[28px] leading-tight tracking-[-0.04em]">{title}</p>
      <p className="t-body mt-3 max-w-xl text-muted">{body}</p>
      <div className="mt-8 flex flex-wrap gap-3">{children}</div>
    </div>
  );
}

/** Empty state: no search matches yet. */
function Empty({ s }: { s: ListingState }) {
  return (
    <Box title={s.q ? `No products match “${s.q}”` : 'Search the catalogue'} body={s.q ? 'Check the spelling, or search by model name or brand.' : 'Search by product, model name or brand.'}>
      {POPULAR_SEARCHES.map((t) => (
        <Link key={t} className="pill" href={href('/search', { q: t })}>
          {t}
        </Link>
      ))}
      <Link className="btn btn-navy" href={href('/products')}>
        Browse all products <Arrow />
      </Link>
    </Box>
  );
}
