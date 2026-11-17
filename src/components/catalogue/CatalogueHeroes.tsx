/* eslint-disable @next/next/no-img-element -- category and brand banners from the CMS */
import Link from 'next/link';
import { BrandMark } from '@/components/common/BrandMark';
import { Crumbs } from '@/components/common/Crumbs';
import { Pillbar } from '@/components/common/Pillbar';
import { brandVars } from '@/components/common/ProductCard';
import { HOME, href } from '@/lib/routes';
import type { CmsListingData } from '@/types/listing';

/* ---------- Heroes of the CMS listings (design: PageHero / BrandHero) ---------- */

const PRODUCTS: [string, string] = ['Brands & Products', href('/products')];

/** All products: catalogue chip, title and counts (no category pills) */
export function AllProductsHero({ data }: { data: CmsListingData }) {
  const brands = data.brands.length;
  const cats = data.categories.length;
  return (
    <section className="bg-mist pt-[clamp(128px,11vw,168px)] pb-[clamp(40px,4.5vw,64px)]">
      <div className="shell">
        <Crumbs items={[['Home', HOME], ['Brands & Products']]} />
        <span className="chip mt-8 border-line bg-white text-ink">Catalogue</span>
        <h1 className="t-display mt-5 max-w-4xl">All products</h1>
        <p className="t-body mt-3 max-w-2xl text-ink/80">
          {`The full BMK Group catalogue across ${brands} brand${brands === 1 ? '' : 's'} and ${cats} categor${cats === 1 ? 'y' : 'ies'}.`}
        </p>
      </div>
    </section>
  );
}

/** Category: banner photo, title and short description (no sub-category pills) */
export function CategoryHero({ data }: { data: CmsListingData }) {
  const category = data.category!;
  return (
    <section
      className="photo-hero pt-[clamp(128px,11vw,176px)] pb-[clamp(40px,4.5vw,64px)]"
      style={{ '--hero-overlay': 'linear-gradient(180deg,rgb(0 0 0/.5) 0%,rgb(0 0 0/.85) 100%)' } as React.CSSProperties}
    >
      {category.banner && <img className="photo-hero-img" src={category.banner} alt="" fetchPriority="high" />}
      <div className="shell">
        <Crumbs items={[['Home', HOME], PRODUCTS, [category.title]]} light />
        <h1 className="t-display mt-6 max-w-4xl">{category.title}</h1>
        {category.short && <p className="t-body mt-2 max-w-2xl text-mist">{category.short}</p>}
      </div>
    </section>
  );
}

/** Brand: banner, logo, intro, counts and the category tabs in the brand colour */
export function BrandHero({ data, selected, url, total }: { data: CmsListingData; selected?: string; url: (o: Record<string, string | string[]>) => string; total: number }) {
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
          <Crumbs items={[['Home', HOME], PRODUCTS, [b.name]]} light />
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
