'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Crumbs } from '@/components/common/Crumbs';
import { SearchIcon } from '@/components/common/Icons';
import { BrandLink } from '@/components/common/SmartLink';
import type { ListingState } from '@/components/search/search-state';
import type { ListingData } from '@/lib/content';
import { HOME, href } from '@/lib/routes';
import { searchBrands, searchCategories } from '@/lib/search';


/** Hero for Search. (All products and category pages: CmsListing.tsx.) */
export function SearchHero({ data, s }: { data: ListingData; s: ListingState }) {
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
