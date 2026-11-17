'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { forwardRef, useEffect, useRef, useState } from 'react';
import { Arrow } from '@/components/common/Arrow';
import { CloseIcon, SearchIcon } from '@/components/common/Icons';
import { BrandLink } from '@/components/common/SmartLink';
import { Stage } from '@/components/common/Stage';
import { POPULAR_SEARCHES } from '@/static/data/visuals';
import { href } from '@/lib/routes';
import type { SearchSuggestions } from '@/static/search-helpers';
import type { Group } from '@/types/catalogue';

const Label = ({ children }: { children: string }) => <p className="mb-3 text-xs tracking-[0.14em] text-muted uppercase">{children}</p>;

/** Search panel under the navbar: popular searches and categories, then live
 *  product / brand / category matches. Enter opens the search page. */
export const SearchPanel = forwardRef<HTMLDivElement, { groups: Group[]; open: boolean; className: string; onClose: () => void }>(function SearchPanel(
  { groups, open, className, onClose },
  ref,
) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState('');
  const [result, setResult] = useState<{ q: string; data: SearchSuggestions } | null>(null);

  useEffect(() => {
    if (open) requestAnimationFrame(() => input.current?.focus());
  }, [open]);

  // Live suggestions (debounced, cancelled when the query changes)
  useEffect(() => {
    const term = q.trim();
    if (!term) return;
    const ctl = new AbortController();
    const t = setTimeout(() => {
      // Trailing slash: trailingSlash in next.config.ts applies to API routes too
      fetch(`/api/search/?q=${encodeURIComponent(term)}`, { signal: ctl.signal })
        .then((r) => (r.ok ? r.json() : null))
        .then((data: SearchSuggestions | null) => data && setResult({ q: term, data }))
        .catch(() => {});
    }, 120);
    return () => (clearTimeout(t), ctl.abort());
  }, [q]);

  const term = q.trim();
  const data = result && result.q === term ? result.data : null;

  return (
    <div ref={ref} id="search-panel" className={className} data-lenis-prevent onClick={(e) => (e.target as Element).closest('a') && onClose()}>
      <form
        role="search"
        className="flex items-center gap-3 rounded-full border border-ink/15 px-5 py-3 transition-colors focus-within:border-navy"
        onSubmit={(e) => {
          e.preventDefault();
          if (!term) return;
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
        {!term ? (
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <Label>Popular searches</Label>
              <div className="flex flex-wrap gap-2">
                {POPULAR_SEARCHES.map((t) => (
                  <Link key={t} className="pill" href={href('/search', { q: t })}>
                    {t}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <Label>Browse categories</Label>
              <div className="flex flex-wrap gap-2">
                {groups.map((g) => (
                  <Link key={g.id} className="pill" href={href(`/category/${g.id}`)}>
                    {g.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ) : !data ? (
          <p className="text-muted">Searching…</p>
        ) : !data.total && !data.brands.length && !data.categories.length ? (
          <p className="text-muted">
            No matches for “{term}”. Try a model name such as{' '}
            <Link className="text-ink underline" href={href('/search', { q: 'X-T5' })}>
              X-T5
            </Link>
            , or{' '}
            <Link className="text-ink underline" href={href('/products')}>
              browse all products
            </Link>
            .
          </p>
        ) : (
          <div className="grid gap-8 md:grid-cols-[2fr_1fr]">
            <div>
              <Label>Products</Label>
              <ul className="grid gap-1">
                {data.products.map((p) => (
                  <li key={p.slug}>
                    <Link href={href(`/product/${p.slug}`)} className="flex items-center gap-4 rounded-xl p-2 transition-colors hover:bg-mist">
                      <div className="w-20 shrink-0">
                        <Stage name={p.name} glyph={p.template} src={p.media.card} className="!rounded-lg" />
                      </div>
                      <span className="min-w-0">
                        <span className="block truncate font-semibold">{p.name}</span>
                        <span className="block text-sm text-muted">
                          {p.brandName} · {p.categoryName}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              {data.total > 0 && (
                <Link href={href('/search', { q: term })} className="group mt-4 inline-flex items-center gap-2 text-sm font-semibold">
                  See all {data.total} result{data.total === 1 ? '' : 's'} for “{term}” <Arrow />
                </Link>
              )}
            </div>
            <div className="grid content-start gap-6">
              {data.brands.length > 0 && (
                <div>
                  <Label>Brands</Label>
                  <div className="flex flex-wrap gap-2">
                    {data.brands.map((b) => (
                      <BrandLink key={b.id} brand={b} className="pill">
                        {b.name}
                      </BrandLink>
                    ))}
                  </div>
                </div>
              )}
              {data.categories.length > 0 && (
                <div>
                  <Label>Categories</Label>
                  <div className="flex flex-wrap gap-2">
                    {data.categories.map((c) => (
                      <Link key={c.id} className="pill" href={href(`/category/${c.id}`)}>
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
