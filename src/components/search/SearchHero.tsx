'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Crumbs } from '@/components/common/Crumbs';
import { SearchIcon } from '@/components/common/Icons';
import type { ListingState } from '@/components/search/search-state';
import type { SearchStatus } from '@/components/search/useSearch';
import { HOME, href } from '@/lib/routes';
import type { SearchResults } from '@/types/search';

/** Hero for Search. (All products and category pages: CmsListing.tsx.) */
export function SearchHero({ s, status, results }: { s: ListingState; status: SearchStatus; results: SearchResults | null }) {
  const n = s.base.length;
  const summary = status === 'loading' ? 'Searching…' : status === 'done' ? `${n} product${n === 1 ? '' : 's'} found.` : '';
  return (
    <section className="bg-mist pt-[clamp(128px,11vw,168px)] pb-[clamp(40px,4.5vw,64px)]">
      <div className="shell">
        <Crumbs items={[['Home', HOME], ['Search']]} />
        <span className="chip mt-8 border-line bg-white text-ink">Search results</span>
        <h1 className="t-display mt-5 max-w-4xl">{s.q ? `“${s.q}”` : 'Search'}</h1>
        {summary && <p className="t-body mt-3 max-w-2xl text-ink/80">{summary}</p>}
        <SearchExtra q={s.q} results={status === 'done' ? results : null} />
      </div>
    </section>
  );
}

/** Search box, then the brands and categories that also match (pill links) */
function SearchExtra({ q, results }: { q: string; results: SearchResults | null }) {
  const router = useRouter();
  const bs = results?.brands ?? [];
  const cs = results?.categories ?? [];
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
            <Link key={b.slug} className="pill" href={href(`/brand/${b.slug}`)}>
              Brand · {b.name}
            </Link>
          ))}
          {cs.map((c) => (
            <Link key={c.slug} className="pill" href={href(`/category/${c.slug}`)}>
              Category · {c.name}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
