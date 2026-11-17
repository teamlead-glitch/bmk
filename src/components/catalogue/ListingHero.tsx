'use client';

/* eslint-disable @next/next/no-img-element -- hero photography from the CMS */
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BrandMark } from '@/components/common/BrandMark';
import { Crumbs } from '@/components/common/Crumbs';
import { SearchIcon } from '@/components/common/Icons';
import { Pillbar } from '@/components/common/Pillbar';
import { brandVars } from '@/components/common/ProductCard';
import { BrandLink } from '@/components/common/SmartLink';
import type { ListingState } from '@/components/catalogue/listing-state';
import type { ListingData } from '@/lib/content';
import { HOME, href } from '@/lib/routes';
import { searchBrands, searchCategories } from '@/lib/search';

const PRODUCTS: [string, string] = ['Brands & Products', href('/products')];

/** Hero for Search. (All products and category pages: CmsListing.tsx.) */
export function PageHero({ data, s }: { data: ListingData; s: ListingState }) {
  return (
    <section className="bg-mist pt-[clamp(128px,11vw,168px)] pb-[clamp(40px,4.5vw,64px)]">
      <div className="shell">
        <Crumbs items={[['Home', HOME], ['Search']]} />
        <span className="chip mt-8 border-line bg-white text-ink">Search results</span>
        <h1 className="t-display mt-5 max-w-4xl">{s.q ? `“${s.q}”` : 'Search'}</h1>
        <p className="t-body mt-3 max-w-2xl text-ink/80">{`${s.base.length} product${s.base.length === 1 ? '' : 's'} found.`}</p>
        <SearchExtra data={data} q={s.q} />
      </div>
    </section>
  );
}

function SearchExtra({ data, q }: { data: ListingData; q: string }) {
  const router = useRouter();
  const bs = q ? searchBrands(data.brands, q) : [];
  const cs = q ? searchCategories(data.categories, data.groups, q) : [];
  return (
    <>
      <form
        role="search"
        key={q}
        className="mt-8 flex max-w-2xl items-center gap-3 rounded-full border border-ink/15 bg-white py-1.5 pr-1.5 pl-5 focus-within:border-navy"
        onSubmit={(e) => {
          e.preventDefault();
          const v = String(new FormData(e.currentTarget).get('q') || '').trim();
          if (v) router.push(href('/search', { q: v }));
        }}
      >
        <SearchIcon />
        <input name="q" type="search" defaultValue={q} className="min-w-0 flex-1 bg-transparent outline-none" aria-label="Search products" />
        <button className="btn btn-dark !py-3">Search</button>
      </form>
      {(bs.length > 0 || cs.length > 0) && (
        <div className="mt-5 flex flex-wrap items-center gap-2 text-sm">
          <span className="text-muted">Also matching</span>
          {bs.map((b) => (
            <BrandLink key={b.id} brand={b} className="pill">
              Brand · {b.name}
            </BrandLink>
          ))}
          {cs.map((c) => (
            <Link key={c.id} className="pill" href={href(`/category/${c.id}`)}>
              Category · {c.name}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}

/** Brand page hero: logo, intro, counts and category tabs in the brand colour. */
export function BrandHero({ data, s }: { data: ListingData; s: ListingState }) {
  const b = data.ctx.brand!;
  const cats = data.categories.filter((c) => s.base.some((p) => p.categoryId === c.id));
  return (
    <>
      <section
        className={`photo-hero pt-[clamp(128px,11vw,176px)] ${s.base.length ? 'pb-[146px]' : 'pb-[clamp(56px,5vw,80px)]'}`}
        style={{ '--hero-overlay': 'linear-gradient(90deg,rgb(0 0 0/.55) 0%,rgb(0 0 0/.15) 55%,rgb(0 0 0/0) 100%)' } as React.CSSProperties}
      >
        {data.ctx.heroImage && <img className="photo-hero-img object-[70%_top]" src={data.ctx.heroImage} alt="" fetchPriority="high" />}
        <div className="shell">
          <Crumbs items={[['Home', HOME], PRODUCTS, [b.name]]} light />
          <div className="mt-10 flex max-w-xl flex-col items-start gap-6">
            <div className="rounded-xl bg-white px-4 py-4">
              <BrandMark brand={b} className="h-[42px]" />
            </div>
            <h1 className="t-display">{b.name}</h1>
            <p className="t-body text-white/75">{b.intro}</p>
            {s.base.length > 0 && (
              <dl className="flex gap-12">
                <div>
                  <dt className="text-[11px] tracking-[0.14em] text-white/60 uppercase">Products</dt>
                  <dd className="mt-1 text-[32px] leading-10 tracking-[-0.02em]">{s.base.length}</dd>
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
      {s.base.length ? (
        <Pillbar label={`${b.name} categories`} style={brandVars(b.color)}>
          <li>
            <Link scroll={false} className={`pill-dark is-brand ${s.selC.length ? '' : 'is-on'}`} href={s.url({ cat: [], page: '' })}>
              All <span className="n">{s.base.length}</span>
            </Link>
          </li>
          {cats.map((c) => {
            const on = s.selC.length === 1 && s.selC[0] === c.id;
            return (
              <li key={c.id}>
                <Link scroll={false} className={`pill-dark is-brand ${on ? 'is-on' : ''}`} href={s.url({ cat: on ? [] : [c.id], page: '' })}>
                  {c.name} <span className="n">{s.base.filter((p) => p.categoryId === c.id).length}</span>
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
