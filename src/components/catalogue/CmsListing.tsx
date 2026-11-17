'use client';

/* eslint-disable @next/next/no-img-element -- category and brand banners from the CMS */
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { Query } from '@/components/catalogue/listing-state';
import { Arrow } from '@/components/common/Arrow';
import { BrandMark } from '@/components/common/BrandMark';
import { Crumbs } from '@/components/common/Crumbs';
import { CheckIcon, ChevIcon, CloseIcon, FilterIcon } from '@/components/common/Icons';
import { Pillbar } from '@/components/common/Pillbar';
import { brandVars, ProductCard } from '@/components/common/ProductCard';
import { HOME, href } from '@/lib/routes';
import type { CmsListingData, CountedOption, ProductPage } from '@/types/catalogue';

/* ---------- PRODUCT LISTING FROM THE CMS (All products, category and brand pages) ---------- */
// Same look as the design's listing (src/components/catalogue/Listing.tsx), with the
// products coming from the CMS a page at a time (GET /v1/products through /api/products/).
// Filters, sort and paging live in the URL (?cat=a,b&brand=c&sort=az&page=2) so every
// state can be linked; more pages load as the visitor scrolls (infinite scroll), with
// "Load more" kept as the fallback. The unfiltered first page comes with the server
// HTML; loaded pages are kept, so going back to a filter set costs no new request.

const MAX_PAGES = 100;
const SORT_API = { latest: 'latest', az: 'name_asc' } as const;
type SortKey = keyof typeof SORT_API;

const list = (v: string | null) => (v ? v.split(',').filter(Boolean) : []);
const known = (ids: string[], options: CountedOption[]) => ids.filter((id) => options.some((o) => o.id === id));

/** Reads filters from the URL. Wrap in <Suspense fallback={<CmsListing data query={EMPTY_QUERY} />}>. */
export function CmsListingFromUrl({ data }: { data: CmsListingData }) {
  const params = useSearchParams();
  return <CmsListing data={data} query={params} />;
}

export function CmsListing({ data, query }: { data: CmsListingData; query: Query }) {
  const router = useRouter();
  const { category, brand } = data;
  const all = data.kind === 'all';
  const path = category ? `/category/${category.slug}` : brand ? `/brand/${brand.slug}` : '/products';

  // URL state (unknown categories and brands are ignored). Category pages have no category
  // filter; brand pages have one category tab at a time and no brand filter.
  const cats = known(list(query.get('cat')), data.categories);
  const selC = all ? cats : brand ? cats.slice(0, 1) : [];
  const selB = brand ? [] : known(list(query.get('brand')), data.brands);
  const sort: SortKey = query.get('sort') === 'az' ? 'az' : 'latest';
  const pages = Math.min(MAX_PAGES, Math.max(1, parseInt(query.get('page') || '1', 10) || 1));
  const keep = { cat: selC, brand: selB, sort: sort === 'latest' ? '' : sort };
  const url = (o: Record<string, string | number | string[]> = {}) => href(path, { ...keep, ...o });
  const toggle = (key: 'cat' | 'brand', id: string) => {
    const cur = key === 'cat' ? selC : selB;
    return url({ [key]: cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id], page: '' });
  };
  const clearUrl = url({ cat: [], brand: [], page: '' });

  // Loaded pages, by filter set and page number: "categories|brands|sort|page"
  const apiCategory = category ? category.slug : [...selC].sort().join(',');
  const apiBrand = brand ? brand.slug : [...selB].sort().join(',');
  const setKey = `${apiCategory}|${apiBrand}|${SORT_API[sort]}`;
  const [loaded, setLoaded] = useState<Record<string, ProductPage>>(() => ({ [`${category?.slug ?? ''}|${brand?.slug ?? ''}|latest|1`]: data.first }));
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
    const [cat, brand, apiSort] = setKey.split('|');
    Promise.all(
      missing.map((p) =>
        fetch(href('/api/products', { category: cat, brand, sort: apiSort, page: p }), { signal: ctl.signal }).then((r) => {
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
  }, [setKey, want, firstPage, got.length, retry]);

  const shown = got.flatMap((p) => p.items);
  const total = firstPage?.total ?? 0;
  const isEmpty = data.first.total === 0; // nothing to list at all (before filters)
  const showCat = all && data.categories.length > 0;
  const sidebar = !isEmpty && !brand && (showCat || data.brands.length > 0); // brand pages filter with the hero tabs
  const active = selC.length + selB.length;
  const chips = brand ? [] : [
    ...selC.map((id) => ({ label: data.categories.find((c) => c.id === id)?.name ?? id, to: toggle('cat', id) })),
    ...selB.map((id) => ({ label: data.brands.find((b) => b.id === id)?.name ?? id, to: toggle('brand', id) })),
  ];

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
              <Box title="We couldn’t load the products" body="Please check your connection and try again.">
                <button type="button" className="btn btn-navy" onClick={() => (setFailed(false), setRetry((n) => n + 1))}>
                  Try again
                </button>
              </Box>
            ) : isEmpty ? (
              <Box
                title={category ? `${category.title}: products coming soon` : brand ? `${brand.name} products are coming soon` : 'Products coming soon'}
                body={
                  category
                    ? 'Products for this category are being added. Explore related categories, or ask our team what’s available.'
                    : brand
                      ? `We’re adding the ${brand.name} range to the catalogue. Meanwhile, ask our team what’s available.`
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
              </Box>
            ) : shown.length ? (
              <>
                <ul className={`grid gap-5 sm:grid-cols-2 ${sidebar ? 'xl:grid-cols-3' : 'lg:grid-cols-3 xl:grid-cols-4'}`}>
                  {shown.map((p, i) => (
                    <li key={p.slug}>
                      <ProductCard product={p} index={i} brandColor={brand?.color} />
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

/** All products hero (design: PageHero, catalogue variant, without the category pills) */
function AllProductsHero({ data }: { data: CmsListingData }) {
  return (
    <section className="bg-mist pt-[clamp(128px,11vw,168px)] pb-[clamp(40px,4.5vw,64px)]">
      <div className="shell">
        <Crumbs items={[['Home', HOME], ['Brands & Products']]} />
        <span className="chip mt-8 border-line bg-white text-ink">Catalogue</span>
        <h1 className="t-display mt-5 max-w-4xl">All products</h1>
        <p className="t-body mt-3 max-w-2xl text-ink/80">
          The full BMK Group catalogue across {data.brands.length} brand{data.brands.length === 1 ? '' : 's'} and {data.categories.length} categor
          {data.categories.length === 1 ? 'y' : 'ies'}.
        </p>
      </div>
    </section>
  );
}

/** Category photo hero (design: PageHero, category variant, without the sub-category pills) */
function CategoryHero({ data }: { data: CmsListingData }) {
  const category = data.category!;
  return (
    <section
      className="photo-hero pt-[clamp(128px,11vw,176px)] pb-[clamp(40px,4.5vw,64px)]"
      style={{ '--hero-overlay': 'linear-gradient(180deg,rgb(0 0 0/.5) 0%,rgb(0 0 0/.85) 100%)' } as React.CSSProperties}
    >
      {category.banner && <img className="photo-hero-img" src={category.banner} alt="" fetchPriority="high" />}
      <div className="shell">
        <Crumbs items={[['Home', HOME], ['Brands & Products', href('/products')], [category.title]]} light />
        <h1 className="t-display mt-6 max-w-4xl">{category.title}</h1>
        {category.short && <p className="t-body mt-2 max-w-2xl text-mist">{category.short}</p>}
      </div>
    </section>
  );
}

/** Brand hero (design: BrandHero): banner, logo, intro, counts and the category tabs in the brand colour */
function BrandHero({ data, selected, url, total }: { data: CmsListingData; selected?: string; url: (o: Record<string, string | string[]>) => string; total: number }) {
  const b = data.brand!;
  const cats = data.categories;
  return (
    <>
      <section
        className={`photo-hero pt-[clamp(128px,11vw,176px)] ${total ? 'pb-[146px]' : 'pb-[clamp(56px,5vw,80px)]'}`}
        style={{ '--hero-overlay': 'linear-gradient(90deg,rgb(0 0 0/.55) 0%,rgb(0 0 0/.15) 55%,rgb(0 0 0/0) 100%)' } as React.CSSProperties}
      >
        {b.banner && <img className="photo-hero-img object-[70%_top]" src={b.banner} alt="" fetchPriority="high" />}
        <div className="shell">
          <Crumbs items={[['Home', HOME], ['Brands & Products', href('/products')], [b.name]]} light />
          <div className="mt-10 flex max-w-xl flex-col items-start gap-6">
            <div className="rounded-xl bg-white px-4 py-4">
              <BrandMark brand={b} className="h-[42px]" />
            </div>
            <h1 className="t-display">{b.name}</h1>
            {b.intro && <p className="t-body text-white/75">{b.intro}</p>}
            {total > 0 && (
              <dl className="flex gap-12">
                <div>
                  <dt className="text-[11px] tracking-[0.14em] text-white/60 uppercase">Products</dt>
                  <dd className="mt-1 text-[32px] leading-10 tracking-[-0.02em]">{total}</dd>
                </div>
                <div>
                  <dt className="text-[11px] tracking-[0.14em] text-white/60 uppercase">Categories</dt>
                  <dd className="mt-1 text-[32px] leading-10 tracking-[-0.02em]">{cats.length}</dd>
                </div>
              </dl>
            )}
          </div>
        </div>
      </section>
      {total ? (
        <Pillbar label={`${b.name} categories`} style={brandVars(b.color)}>
          <li>
            <Link scroll={false} className={`pill-dark is-brand ${selected ? '' : 'is-on'}`} href={url({ cat: [], page: '' })}>
              All <span className="n">{total}</span>
            </Link>
          </li>
          {cats.map((c) => {
            const on = selected === c.id;
            return (
              <li key={c.id}>
                <Link scroll={false} className={`pill-dark is-brand ${on ? 'is-on' : ''}`} href={url({ cat: on ? [] : [c.id], page: '' })}>
                  {c.name} <span className="n">{c.n}</span>
                </Link>
              </li>
            );
          })}
        </Pillbar>
      ) : (
        <div className="h-0" />
      )}
    </>
  );
}

function Facet({ title, options, selected, to, divider = false }: { title: string; options: CountedOption[]; selected: string[]; to: (id: string) => string; divider?: boolean }) {
  return (
    <details className={`facet ${divider ? 'border-b border-line' : ''}`} open>
      <summary>
        {title} <ChevIcon />
      </summary>
      <div className="pb-4">
        {options.map((o) => (
          <Link key={o.id} scroll={false} className="check" href={to(o.id)} role="checkbox" aria-checked={selected.includes(o.id)}>
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
