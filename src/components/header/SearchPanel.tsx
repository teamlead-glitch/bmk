'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { forwardRef, useEffect, useRef, useState } from 'react';
import { Arrow } from '@/components/common/Arrow';
import { CloseIcon, SearchIcon } from '@/components/common/Icons';
import { Stage } from '@/components/common/Stage';
import { useSearch } from '@/components/search/useSearch';
import { MIN_SEARCH_LENGTH, SEARCH_PANEL_PRODUCTS } from '@/constants/listing';
import { href } from '@/lib/routes';
import type { NavCategory, NavData } from '@/types/catalogue';

const Label = ({ children }: { children: string }) => <p className="mb-3 text-xs tracking-[0.14em] text-muted uppercase">{children}</p>;

/** Search panel under the navbar: popular searches (the latest brands added in the CMS) and
 *  categories, then live product / brand / category matches from the CMS search (/api/search/).
 *  Enter opens the search page. */
export const SearchPanel = forwardRef<
  HTMLDivElement,
  { categories: NavCategory[]; popular: NavData['latestBrands']; open: boolean; className: string; onClose: () => void }
>(function SearchPanel(
  { categories, popular, open, className, onClose },
  ref,
) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState('');
  const { status, data } = useSearch(q);
  const term = q.trim();
  const total = data?.products.length ?? 0;

  useEffect(() => {
    if (open) requestAnimationFrame(() => input.current?.focus());
  }, [open]);

  return (
    <div ref={ref} id="search-panel" className={className} data-lenis-prevent onClick={(e) => (e.target as Element).closest('a') && onClose()}>
      <form
        role="search"
        className="flex items-center gap-3 rounded-full border border-ink/15 px-5 py-3 transition-colors focus-within:border-navy"
        onSubmit={(e) => {
          e.preventDefault();
          if (term.length < MIN_SEARCH_LENGTH) return;
          onClose();
          router.push(href('/search', { q: term }));
        }}
      >
        <SearchIcon />
        <input
          ref={input}
          type="search"
          autoComplete="off"
          placeholder="Search by product, model or brand"
          className="min-w-0 flex-1 bg-transparent text-lg outline-none placeholder:text-ink/35"
          aria-label="Search products"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button type="button" className="icon-btn size-9 hover:bg-ink/5" onClick={onClose} aria-label="Close search">
          <CloseIcon />
        </button>
      </form>
      <div className="max-h-[60svh] overflow-y-auto pt-6" aria-live="polite">
        {status === 'idle' ? (
          <div className="grid gap-6 sm:grid-cols-2">
            {popular.length > 0 && (
              <div>
                <Label>Popular searches</Label>
                <div className="flex flex-wrap gap-2">
                  {popular.map((b) => (
                    <Link key={b.slug} className="pill" href={href('/search', { q: b.name })}>
                      {b.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
            <div>
              <Label>Browse categories</Label>
              <div className="flex flex-wrap gap-2">
                {categories.map((c) => (
                  <Link key={c.slug} className="pill" href={href(`/category/${c.slug}`)}>
                    {c.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ) : status === 'short' ? (
          <p className="text-muted">Type at least {MIN_SEARCH_LENGTH} characters to search.</p>
        ) : status === 'loading' ? (
          <p className="text-muted">Searching…</p>
        ) : status === 'error' || !data ? (
          <p className="text-muted">Search is unavailable right now. Please try again in a moment.</p>
        ) : !total && !data.brands.length && !data.categories.length ? (
          <p className="text-muted">
            No matches for “{term}”. Try a product name or brand, or{' '}
            <Link className="text-ink underline" href={href('/products')}>
              browse all products
            </Link>
            .
          </p>
        ) : (
          <div className="grid gap-8 md:grid-cols-[2fr_1fr]">
            <div>
              <Label>Products</Label>
              {!total && <p className="text-muted">No products match “{term}”.</p>}
              <ul className="grid gap-1">
                {data.products.slice(0, SEARCH_PANEL_PRODUCTS).map((p) => (
                  <li key={p.slug}>
                    <Link href={href(`/product/${p.slug}`)} className="flex items-center gap-4 rounded-xl p-2 transition-colors hover:bg-mist">
                      <div className="w-20 shrink-0">
                        <Stage name={p.name} glyph={p.template} src={p.media.card} className="!rounded-lg" />
                      </div>
                      <span className="min-w-0">
                        <span className="block truncate font-semibold">{p.name}</span>
                        <span className="block text-sm text-muted">{[p.brandName, p.categoryName].filter(Boolean).join(' · ')}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              {total > 0 && (
                <Link href={href('/search', { q: term })} className="group mt-4 inline-flex items-center gap-2 text-sm font-semibold">
                  See all {total} result{total === 1 ? '' : 's'} for “{term}” <Arrow />
                </Link>
              )}
            </div>
            <div className="grid content-start gap-6">
              {data.brands.length > 0 && (
                <div>
                  <Label>Brands</Label>
                  <div className="flex flex-wrap gap-2">
                    {data.brands.map((b) => (
                      <Link key={b.slug} className="pill" href={href(`/brand/${b.slug}`)}>
                        {b.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              {data.categories.length > 0 && (
                <div>
                  <Label>Categories</Label>
                  <div className="flex flex-wrap gap-2">
                    {data.categories.map((c) => (
                      <Link key={c.slug} className="pill" href={href(`/category/${c.slug}`)}>
                        {c.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
