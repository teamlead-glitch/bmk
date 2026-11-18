'use client';

import Link from 'next/link';
import { forwardRef, type CSSProperties } from 'react';
import { Arrow } from '@/components/common/Arrow';
import { BrandMark } from '@/components/common/BrandMark';
import { href } from '@/lib/routes';
import type { NavData } from '@/types/catalogue';

const Label = ({ children, className = '' }: { children: string; className?: string }) => <p className={`mb-4 text-xs tracking-[0.14em] text-muted uppercase ${className}`}>{children}</p>;

/** Brands & Products dropdown (desktop), shared by the homepage and every other page.
 *  Brands on the left (55%), main product categories on the right (45%), all from the CMS. */
export const MegaMenu = forwardRef<
  HTMLDivElement,
  { nav: NavData; className: string; style?: CSSProperties; onPointerEnter?: () => void; onPointerLeave?: (e: React.PointerEvent) => void; onNavigate: () => void }
>(function MegaMenu({ nav, className, style, onPointerEnter, onPointerLeave, onNavigate }, ref) {
  return (
    <div
      ref={ref}
      id="mega"
      className={`fixed left-1/2 z-40 w-[min(1200px,calc(100%-32px))] -translate-x-1/2 overflow-hidden rounded-2xl bg-white shadow-[0_40px_80px_-30px_rgba(18,18,18,0.45)] ${className}`}
      style={style}
      role="region"
      aria-label="Brands and products"
      data-lenis-prevent
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onClick={(e) => (e.target as Element).closest('a') && onNavigate()}
    >
      <div className="grid grid-cols-[minmax(0,11fr)_minmax(0,9fr)] gap-10 p-10">
        <div>
          {nav.ownBrands.length > 0 && (
            <>
              <Label>Our brands</Label>
              <ul className="mb-8 grid grid-cols-2 gap-2">
                {nav.ownBrands.map((b) => (
                  <li key={b.id}>
                    {b.site ? (
                      <a
                        href={b.site.url}
                        target="_blank"
                        rel="noopener"
                        className="group flex items-center justify-between gap-4 rounded-xl border border-line px-4 py-3 transition-colors hover:border-ink"
                        aria-label={`${b.name}, ${b.site.label} (opens in a new tab)`}
                      >
                        <BrandMark brand={b} className="h-6" />
                        <span className="flex items-center gap-2 text-xs text-muted">
                          {b.site.label} <Arrow className="btn-icon -rotate-45" />
                        </span>
                      </a>
                    ) : (
                      <div className="flex items-center rounded-xl border border-line px-4 py-3">
                        <BrandMark brand={b} className="h-6" />
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </>
          )}
          {nav.partnerBrands.length > 0 && (
            <>
              <Label>Partner brands</Label>
              <ul className="grid grid-cols-4 gap-2">
                {nav.partnerBrands.map((b) => (
                  <li key={b.slug}>
                    <Link href={href(`/brand/${b.slug}`)} className="mega-brand" title={b.name}>
                      <BrandMark brand={b} className="h-8 !text-[13px]" />
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
        <div className="border-l border-line pl-10">
          <Label>Product categories</Label>
          <ul className="grid">
            {nav.categories.map((c) => (
              <li key={c.slug}>
                <Link
                  href={href(`/category/${c.slug}`)}
                  className="group -ml-2 flex items-center justify-between gap-3 rounded-lg px-2 py-2.5 text-[15px] font-semibold transition-colors hover:bg-mist"
                >
                  {c.name}
                  <span className="flex shrink-0 items-center gap-3">
                    <span className="text-xs font-normal text-muted">{c.count}</span>
                    <Arrow />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="flex items-center justify-between gap-6 bg-mist px-10 py-5">
        <p className="text-sm text-muted">Explore the brands associated with and handled by BMK Group.</p>
        <Link href={href('/products')} className="btn btn-navy">
          View all products <Arrow />
        </Link>
      </div>
    </div>
  );
});
