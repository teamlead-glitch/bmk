'use client';

/* eslint-disable @next/next/no-img-element -- category banner from the CMS */
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { Query } from '@/components/catalogue/listing-state';
import { Arrow } from '@/components/common/Arrow';
import { Crumbs } from '@/components/common/Crumbs';
import { CheckIcon, ChevIcon, CloseIcon, FilterIcon } from '@/components/common/Icons';
import { Pillbar } from '@/components/common/Pillbar';
import { ProductCard } from '@/components/common/ProductCard';
import { HOME, href } from '@/lib/routes';
import type { CategoryPageData, CountedOption, ProductPage } from '@/types/catalogue';

/* ---------- CATEGORY LISTING (CMS) ---------- */
// Same look as the design's listing (src/components/catalogue/Listing.tsx), with the
// products coming from the CMS a page at a time. Filters, sort and paging live in the
// URL (?brand=a,b&sort=az&page=2) so every state can be linked; more pages load as the
// visitor scrolls (infinite scroll), with "Load more" kept as the fallback.
// The unfiltered first page comes with the server HTML; other pages are loaded from
// /api/products/ and kept, so going back to a filter set costs no new request.

const MAX_PAGES = 100;
const SORT_API = { latest: 'latest', az: 'name_asc' } as const;
type SortKey = keyof typeof SORT_API;

const list = (v: string | null) => (v ? v.split(',').filter(Boolean) : []);

/** Reads filters from the URL. Wrap in <Suspense fallback={<CategoryListing data query={EMPTY_QUERY} />}>. */
export function CategoryListingFromUrl({ data }: { data: CategoryPageData }) {
  const params = useSearchParams();
  return <CategoryListing data={data} query={params} />;
}

export function CategoryListing({ data, query }: { data: CategoryPageData; query: Query }) {
  const router = useRouter();
  const { category } = data;
  const path = `/category/${category.slug}`;

  // URL state (unknown brands are ignored)
  const selB = list(query.get('brand')).filter((id) => data.brands.some((b) => b.id === id));
  const sort: SortKey = query.get('sort') === 'az' ? 'az' : 'latest';
  const pages = Math.min(MAX_PAGES, Math.max(1, parseInt(query.get('page') || '1', 10) || 1));
  const keep = { brand: selB, sort: sort === 'latest' ? '' : sort };
  const url = (o: Record<string, string | number | string[]> = {}) => href(path, { ...keep, ...o });
  const toggle = (id: string) => url({ brand: selB.includes(id) ? selB.filter((x) => x !== id) : [...selB, id], page: '' });
  const clearUrl = url({ brand: [], page: '' });

  // Loaded pages, by filter set and page number: "brand|sort|page"
  const setKey = `${[...selB].sort().join(',')}|${SORT_API[sort]}`;
  const [loaded, setLoaded] = useState<Record<string, ProductPage>>(() => ({ [`|latest|1`]: data.first }));
  const [failed, setFailed] = useState(false);
  const [retry, setRetry] = useState(0);

  const firstPage = loaded[`${setKey}|1`];
  const want = Math.min(pages, firstPage?.lastPage ?? 1);
  const got: ProductPage[] = [];
  for (let p = 1; p <= want; p++) {
    const page = loaded[`${setKey}|${p}`];
    if (!page) break;
    got.push(page);
  }
  const missing = !firstPage ? [1] : Array.from({ length: want - got.length }, (_, i) => got.length + i + 1);
  const loading = missing.length > 0 && !failed;

  useEffect(() => {
    if (!missing.length) return;
    const ctl = new AbortController();
    const [brand, apiSort] = setKey.split('|');
    Promise.all(
      missing.map((p) =>
        fetch(href('/api/products', { category: category.slug, brand, sort: apiSort, page: p }), { signal: ctl.signal }).then((r) => {
          if (!r.ok) throw new Error(String(r.status));
          return r.json() as Promise<ProductPage>;
        }),
      ),
    )
      .then((res) => setLoaded((prev) => ({ ...prev, ...Object.fromEntries(res.map((r, i) => [`${setKey}|${missing[i]}`, r])) })))
      .catch(() => !ctl.signal.aborted && setFailed(true));
    return () => ctl.abort();
    // missing is derived from these
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setKey, want, firstPage, got.length, retry, category.slug]);

  const shown = got.flatMap((p) => p.items);
  const total = firstPage?.total ?? 0;
  const isEmpty = data.first.total === 0; // nothing in this category at all
  const sidebar = !isEmpty && data.brands.length > 0;
  const chips = selB.map((id) => ({ label: data.brands.find((b) => b.id === id)?.name ?? id, to: toggle(id) }));

  // Infinite scroll: when the end of the list comes near, ask for the next page. The URL is
  // replaced (not pushed), so Back leaves the page instead of stepping through pages.
  const more = useRef<HTMLDivElement>(null);
  const nextUrl = !loading && !failed && firstPage && shown.length < total ? url({ page: got.length + 1 }) : '';
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
  const facets = <BrandFacet options={data.brands} selected={selB} toggle={toggle} />;

  return (
    <>
      <CategoryHero data={data} />
      <section className="shell section-y !pt-12">
        {sidebar && (
          <div className="mb-6 flex items-center justify-between gap-3 lg:hidden">
            <button type="button" className="pill" onClick={() => setSheet(true)}>
              <FilterIcon /> Filters
              {selB.length > 0 && <span className="grid size-5 place-items-center rounded-full bg-navy text-[11px] text-white">{selB.length}</span>}
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
              <Box title="We couldn’t load the products" body="Please check your connection and try again.">
                <button type="button" className="btn btn-navy" onClick={() => (setFailed(false), setRetry((n) => n + 1))}>
                  Try again
                </button>
              </Box>
            ) : isEmpty ? (
              <Box title={`${category.title}: products coming soon`} body="Products for this category are being added. Explore related categories, or ask our team what’s available.">
                {data.categories
                  .filter((c) => c.id !== category.slug)
                  .map((c) => (
                    <Link key={c.id} className="pill" href={href(`/category/${c.id}`)}>
                      {c.name}
                    </Link>
                  ))}
                <button type="button" className="btn btn-navy" data-enquire="">
                  Make an enquiry <Arrow />
                </button>
              </Box>
            ) : shown.length ? (
              <>
                <ul className={`grid gap-5 sm:grid-cols-2 ${sidebar ? 'xl:grid-cols-3' : 'lg:grid-cols-3 xl:grid-cols-4'}`}>
                  {shown.map((p, i) => (
                    <li key={p.slug}>
                      <ProductCard product={p} index={i} />
                    </li>
                  ))}
                </ul>
                {shown.length < total && (
                  // Scroll trigger (infinite scroll); the link stays for keyboards, crawlers and no-JS
                  <div ref={more} className="mt-14 grid justify-items-center gap-4">
                    <p className="text-sm text-muted">
                      Showing {shown.length} of {total} products
                    </p>
                    <div className="h-1 w-56 overflow-hidden rounded-full bg-line">
                      <div className="h-full bg-accent" style={{ width: `${(shown.length / total) * 100}%` }} />
                    </div>
                    {loading ? (
                      <p className="btn btn-navy pointer-events-none opacity-70" role="status">
                        Loading…
                      </p>
                    ) : (
                      <Link scroll={false} replace className="btn btn-navy" href={url({ page: got.length + 1 })}>
                        Load more <Arrow />
                      </Link>
                    )}
                  </div>
                )}
              </>
            ) : loading ? null : (
              <Box title="No products match these filters" body="Remove a filter to see more products.">
                <Link scroll={false} className="btn btn-dark" href={clearUrl}>
                  Clear filters
                </Link>
              </Box>
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

/** Photo hero with the other categories as pills (design: PageHero, category variant) */
function CategoryHero({ data }: { data: CategoryPageData }) {
  const { category, categories } = data;
  const pills = categories.length > 1;
  return (
    <>
      <section
        className={`photo-hero pt-[clamp(128px,11vw,176px)] ${pills ? 'pb-[138px]' : 'pb-[clamp(40px,4.5vw,64px)]'}`}
        style={{ '--hero-overlay': 'linear-gradient(180deg,rgb(0 0 0/.5) 0%,rgb(0 0 0/.85) 100%)' } as React.CSSProperties}
      >
        {category.banner && <img className="photo-hero-img" src={category.banner} alt="" fetchPriority="high" />}
        <div className="shell">
          <Crumbs items={[['Home', HOME], ['Brands & Products', href('/products')], [category.title]]} light />
          <h1 className="t-display mt-6 max-w-4xl">{category.title}</h1>
          {category.short && <p className="t-body mt-2 max-w-2xl text-mist">{category.short}</p>}
        </div>
      </section>
      {pills && (
        <Pillbar label="Product categories">
          {categories.map((c) => (
            <li key={c.id}>
              <Link className={`pill-dark ${c.id === category.slug ? 'is-on' : ''}`} href={href(`/category/${c.id}`)} aria-current={c.id === category.slug ? 'page' : undefined}>
                {c.name} <span className="n">{c.n}</span>
              </Link>
            </li>
          ))}
        </Pillbar>
      )}
    </>
  );
}

function BrandFacet({ options, selected, toggle }: { options: CountedOption[]; selected: string[]; toggle: (id: string) => string }) {
  return (
    <details className="facet" open>
      <summary>
        Brand <ChevIcon />
      </summary>
      <div className="pb-4">
        {options.map((o) => (
          <Link key={o.id} scroll={false} className="check" href={toggle(o.id)} role="checkbox" aria-checked={selected.includes(o.id)}>
            <span className="check-box">{selected.includes(o.id) && <CheckIcon />}</span>
            {o.name}
            <span className="check-count">{o.n}</span>
          </Link>
        ))}
      </div>
    </details>
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
