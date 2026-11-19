'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { AllProductsHero, BrandHero, CategoryHero } from '@/components/catalogue/CatalogueHeroes';
import { EmptyBox, Facet } from '@/components/catalogue/ListingParts';
import { useProductPages } from '@/components/catalogue/useProductPages';
import { Arrow } from '@/components/common/Arrow';
import { CloseIcon, FilterIcon } from '@/components/common/Icons';
import { ProductCard } from '@/components/common/ProductCard';
import { MAX_LISTING_PAGES } from '@/constants/listing';
import { href, NO_FILTERS, queryList, type Query } from '@/lib/routes';
import type { CmsListingData, CountedOption } from '@/types/listing';

/* ---------- PRODUCT LISTING FROM THE CMS (All products, category and brand pages) ---------- */
// Same look as the design's listing, with the products coming from the CMS a page at a
// time (GET /v1/products through /api/list/products/). Filters, sort and paging live in the URL
// (?cat=a,b&brand=c&sort=az&page=2) so every state can be linked; more pages load as the
// visitor scrolls (infinite scroll), with "Load more" kept as the fallback. The unfiltered
// first page comes with the server HTML.

const SORT_API = { latest: 'latest', az: 'name_asc' } as const;
type SortKey = keyof typeof SORT_API;

const known = (ids: string[], options: CountedOption[]) => ids.filter((id) => options.some((o) => o.id === id));

/** Reads filters from the URL. Wrap in <Suspense fallback={<CmsListing data={data} />}> (no filters on the server). */
export function CmsListingFromUrl({ data }: { data: CmsListingData }) {
  const params = useSearchParams();
  return <CmsListing data={data} query={params} />;
}

export function CmsListing({ data, query = NO_FILTERS }: { data: CmsListingData; query?: Query }) {
  const router = useRouter();
  const { category, brand } = data;
  const all = data.kind === 'all';
  const path = category ? `/category/${category.slug}` : brand ? `/brand/${brand.slug}` : '/products';

  // URL state (unknown categories and brands are ignored). Category pages have no category
  // filter; brand pages have one category tab at a time and no brand filter.
  const cats = known(queryList(query.get('cat')), data.categories);
  const selC = all ? cats : brand ? cats.slice(0, 1) : [];
  const selB = brand ? [] : known(queryList(query.get('brand')), data.brands);
  const sort: SortKey = query.get('sort') === 'az' ? 'az' : 'latest';
  const pages = Math.min(MAX_LISTING_PAGES, Math.max(1, parseInt(query.get('page') || '1', 10) || 1));
  const keep = { cat: selC, brand: selB, sort: sort === 'latest' ? '' : sort };
  const url = (o: Record<string, string | number | string[]> = {}) => href(path, { ...keep, ...o });
  const toggle = (key: 'cat' | 'brand', id: string) => {
    const cur = key === 'cat' ? selC : selB;
    return url({ [key]: cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id], page: '' });
  };
  const clearUrl = url({ cat: [], brand: [], page: '' });

  const { firstPage, pagesShown, products, total, loading, failed, retry } = useProductPages({
    category: category ? category.slug : [...selC].sort().join(','),
    brand: brand ? brand.slug : [...selB].sort().join(','),
    sort: SORT_API[sort],
    pages,
    seedKey: `${category?.slug ?? ''}|${brand?.slug ?? ''}|latest`,
    seed: data.first,
  });

  const isEmpty = data.first.total === 0; // nothing to list at all (before filters)
  const showCat = all && data.categories.length > 0;
  const sidebar = !isEmpty && !brand && (showCat || data.brands.length > 0); // brand pages filter with the hero tabs
  const active = selC.length + selB.length;
  const chips = brand
    ? []
    : [
        ...selC.map((id) => ({ label: data.categories.find((c) => c.id === id)?.name ?? id, to: toggle('cat', id) })),
        ...selB.map((id) => ({ label: data.brands.find((b) => b.id === id)?.name ?? id, to: toggle('brand', id) })),
      ];

  // Infinite scroll: when the end of the list comes near, ask for the next page. The URL is
  // replaced (not pushed), so Back leaves the page instead of stepping through pages.
  const more = useRef<HTMLDivElement>(null);
  const nextUrl = !loading && !failed && firstPage && products.length < total ? url({ page: pagesShown + 1 }) : '';
  useEffect(() => {
    const el = more.current;
    if (!el || !nextUrl || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver((entries) => entries[0]?.isIntersecting && router.replace(nextUrl, { scroll: false }), { rootMargin: '0px 0px 600px 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, [nextUrl, router]);

  const [sheet, setSheet] = useState(false);
  useEffect(() => {
    document.body.classList.toggle('no-scroll', sheet);
    return () => document.body.classList.remove('no-scroll');
  }, [sheet]);

  const sortSelect = (
    <label className="select">
      <span className="sr-only">Sort by</span>
      <select value={sort} aria-label="Sort by" onChange={(e) => router.push(url({ sort: e.target.value === 'latest' ? '' : e.target.value, page: '' }), { scroll: false })}>
        <option value="latest">Sort: Latest</option>
        <option value="az">Sort: A–Z</option>
      </select>
    </label>
  );
  const facets = (
    <>
      {showCat && <Facet title="Category" options={data.categories} selected={selC} to={(id) => toggle('cat', id)} divider={data.brands.length > 0} />}
      {data.brands.length > 0 && <Facet title="Brand" options={data.brands} selected={selB} to={(id) => toggle('brand', id)} />}
    </>
  );

  return (
    <>
      {category ? <CategoryHero data={data} /> : brand ? <BrandHero data={data} selected={selC[0]} url={url} total={data.first.total} /> : <AllProductsHero data={data} />}
      <section className="shell section-y !pt-12">
        {sidebar && (
          <div className="mb-6 flex items-center justify-between gap-3 lg:hidden">
            <button type="button" className="pill" onClick={() => setSheet(true)}>
              <FilterIcon /> Filters
              {active > 0 && <span className="grid size-5 place-items-center rounded-full bg-navy text-[11px] text-white">{active}</span>}
            </button>
            {sortSelect}
          </div>
        )}
        <div className="flex gap-12">
          {sidebar && (
            <aside className="hidden w-[272px] shrink-0 lg:block" aria-label="Filters">
              <div className="sticky top-48">
                <p className="pb-2 text-xs tracking-[0.14em] text-muted uppercase">Filter by</p>
                {facets}
              </div>
            </aside>
          )}
          <div className="min-w-0 flex-1" aria-busy={loading}>
            {!isEmpty && (
              <div className="mb-6 flex items-center justify-between gap-4">
                <p className="text-[15px] text-muted" aria-live="polite">
                  {firstPage ? (
                    <>
                      <strong className="font-semibold text-ink">{total}</strong> product{total === 1 ? '' : 's'}
                    </>
                  ) : (
                    'Loading products…'
                  )}
                </p>
                <div className={sidebar ? 'hidden lg:block' : ''}>{sortSelect}</div>
              </div>
            )}
            {chips.length > 0 && (
              <div className="mb-6 flex flex-wrap items-center gap-2">
                {chips.map((c) => (
                  <Link key={c.to} scroll={false} className="pill is-on" href={c.to} aria-label={`Remove ${c.label}`}>
                    {c.label} <CloseIcon />
                  </Link>
                ))}
                <Link scroll={false} className="ml-1 text-sm underline underline-offset-4" href={clearUrl}>
                  Clear all
                </Link>
              </div>
            )}

            {failed ? (
              <EmptyBox title="We couldn’t load the products" body="Please check your connection and try again.">
                <button type="button" className="btn btn-navy" onClick={retry}>
                  Try again
                </button>
              </EmptyBox>
            ) : isEmpty ? (
              <EmptyBox
                title={category ? `${category.title}: products coming soon` : brand ? `${brand.name} products are coming soon` : 'Products coming soon'}
                body={
                  category
                    ? 'Products for this category are being added. Explore related categories, or ask our team what’s available.'
                    : brand
                      ? `We’re adding the ${brand.name} range to the catalogue. Meanwhile, ${data.categories.length ? 'browse the categories it covers, or ' : ''}ask our team what’s available.`
                      : 'We’re adding products to the catalogue. Meanwhile, ask our team what’s available.'
                }
              >
                {data.categories
                  .filter((c) => c.id !== category?.slug)
                  .map((c) => (
                    <Link key={c.id} className="pill" href={href(`/category/${c.id}`)}>
                      {c.name}
                    </Link>
                  ))}
                <button type="button" className="btn btn-navy" data-enquire="">
                  Make an enquiry <Arrow />
                </button>
              </EmptyBox>
            ) : products.length ? (
              <>
                <ul className={`grid gap-5 sm:grid-cols-2 ${sidebar ? 'xl:grid-cols-3' : 'lg:grid-cols-3 xl:grid-cols-4'}`}>
                  {products.map((p, i) => (
                    <li key={p.slug}>
                      <ProductCard product={p} index={i} brandColor={brand?.color} />
                    </li>
                  ))}
                </ul>
                {products.length < total && (
                  // Scroll trigger (infinite scroll); the link stays for keyboards, crawlers and no-JS
                  <div ref={more} className="mt-14 grid justify-items-center gap-4">
                    <p className="text-sm text-muted">
                      Showing {products.length} of {total} products
                    </p>
                    <div className="h-1 w-56 overflow-hidden rounded-full bg-line">
                      <div className="h-full bg-accent" style={{ width: `${(products.length / total) * 100}%` }} />
                    </div>
                    {loading ? (
                      <p className="btn btn-navy pointer-events-none opacity-70" role="status">
                        Loading…
                      </p>
                    ) : (
                      <Link scroll={false} replace className="btn btn-navy" href={url({ page: pagesShown + 1 })}>
                        Load more <Arrow />
                      </Link>
                    )}
                  </div>
                )}
              </>
            ) : loading ? null : (
              <EmptyBox title="No products match these filters" body="Remove a filter to see more products.">
                <Link scroll={false} className="btn btn-dark" href={clearUrl}>
                  Clear filters
                </Link>
              </EmptyBox>
            )}
          </div>
        </div>
      </section>

      {sidebar && (
        <div className={`fixed inset-0 z-[70] lg:hidden ${sheet ? '' : 'hidden'}`} role="dialog" aria-modal="true" aria-label="Filters">
          <div className="absolute inset-0 bg-ink/50 backdrop-blur-sm" onClick={() => setSheet(false)} />
          <div className="absolute inset-x-0 bottom-0 flex max-h-[85svh] flex-col rounded-t-3xl bg-white">
            <div className="flex items-center justify-between px-5 pt-5 pb-2">
              <p className="text-lg font-semibold">Filters</p>
              <Link scroll={false} className="text-sm underline underline-offset-4" href={clearUrl}>
                Clear all
              </Link>
            </div>
            <div className="overflow-y-auto px-5">{facets}</div>
            <div className="border-t border-line p-4">
              <button type="button" className="btn btn-navy w-full" onClick={() => setSheet(false)}>
                {firstPage ? `Show ${total} product${total === 1 ? '' : 's'}` : 'Show products'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
