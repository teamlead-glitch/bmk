'use client';

/* eslint-disable @next/next/no-img-element -- menu pictures come from the CMS */
import Link from 'next/link';
import { forwardRef, useState, type CSSProperties } from 'react';
import { Arrow } from '@/components/common/Arrow';
import { BrandMark } from '@/components/common/BrandMark';
import { BrandLink } from '@/components/common/SmartLink';
import { MEGA_MENU_DESIGN } from '@/constants/site';
import { href } from '@/lib/routes';
import type { BrandLite, NavData } from '@/types/catalogue';

/** Brands & Products dropdown (desktop), shared by the homepage and every other page. */
export const MegaMenu = forwardRef<HTMLDivElement, { nav: NavData; className: string; style?: CSSProperties; onPointerEnter?: () => void; onPointerLeave?: (e: React.PointerEvent) => void; onNavigate: () => void }>(
  function MegaMenu({ nav, className, style, onPointerEnter, onPointerLeave, onNavigate }, ref) {
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
        {MEGA_MENU_DESIGN === 'brands' ? <BrandsView nav={nav} /> : <CategoriesView nav={nav} />}
      </div>
    );
  },
);

function CategoriesView({ nav }: { nav: NavData }) {
  return (
    <>
      <div className="grid grid-cols-12 gap-10 p-10">
        <div className="col-span-8">
          <p className="mb-5 text-xs tracking-[0.14em] text-muted uppercase">Product categories</p>
          <div className="grid grid-cols-3 gap-x-8 gap-y-7">
            {nav.groups.map((g) => (
              <div key={g.id}>
                <Link href={href(`/category/${g.id}`)} className="group mb-3 inline-flex items-center gap-2 text-[15px] font-semibold">
                  {g.name} <Arrow />
                </Link>
                <ul className="grid">
                  {nav.categories
                    .filter((c) => c.group === g.id)
                    .map((c) => (
                      <li key={c.id}>
                        <Link
                          href={href(`/category/${c.id}`)}
                          className={`-ml-2 flex items-baseline justify-between gap-3 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-mist ${c.count ? 'text-ink' : 'text-ink/35'}`}
                        >
                          {c.name}
                          <span className="text-xs text-muted">{c.count}</span>
                        </Link>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="col-span-4 border-l border-line pl-10">
          <p className="mb-4 text-xs tracking-[0.14em] text-muted uppercase">Our brands</p>
          <ul className="grid gap-2">
            {nav.inHouseBrands.map((b) => (
              <li key={b.id}>
                <BrandLink brand={b} className="group flex items-center justify-between rounded-xl border border-line px-4 py-3 transition-colors hover:border-ink">
                  <BrandMark brand={b} className="h-6" />
                  <span className="flex items-center gap-2 text-xs text-muted">
                    {b.sites[0]?.[0]} <Arrow className="btn-icon -rotate-45" />
                  </span>
                </BrandLink>
              </li>
            ))}
          </ul>
          <p className="mt-6 mb-4 text-xs tracking-[0.14em] text-muted uppercase">Partner brands</p>
          <ul className="grid grid-cols-3 gap-2">
            {nav.partnerBrands.map((b) => (
              <li key={b.id}>
                <Link href={href(`/brand/${b.id}`)} className="mega-brand" title={b.name}>
                  <BrandMark brand={b} className="h-8 !text-[13px]" />
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
    </>
  );
}

/** Brands view: partner brands on the left, a 4:3 picture + CTA on the right
 *  (follows hover/focus), in-house brands as a split bar along the bottom. */
function BrandsView({ nav }: { nav: NavData }) {
  const [on, setOn] = useState(nav.partnerBrands[0]?.id);
  return (
    <>
      <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-10 p-10">
        <div className="flex min-h-0 flex-col">
          <p className="mb-3 text-xs tracking-[0.14em] text-muted uppercase">Partner brands</p>
          <ul className="flex flex-1 flex-col">
            {nav.partnerBrands.map((b) => (
              <li key={b.id} className="flex flex-1">
                <Link href={href(`/brand/${b.id}`)} className={`mb-item ${b.id === on ? 'is-on' : ''}`} onPointerEnter={() => setOn(b.id)} onFocus={() => setOn(b.id)}>
                  {b.name}
                  <Arrow className="mb-arrow" />
                </Link>
              </li>
            ))}
          </ul>
          <Link href={href('/products')} className="group mt-4 inline-flex items-center gap-2 self-start text-sm font-semibold">
            View all products <Arrow />
          </Link>
        </div>
        <div className="mb-stage">
          {nav.partnerBrands.map((b) => (
            <MegaPicture key={b.id} brand={b} on={b.id === on} />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 divide-x divide-line border-t border-line bg-mist">
        {nav.inHouseBrands.map((b) => (
          <BrandLink key={b.id} brand={b} className="group flex items-center justify-between gap-4 px-10 py-5 transition-colors hover:bg-fog" aria-label={`${b.name}, ${b.sites[0]?.[0]} (opens in a new tab)`}>
            <BrandMark brand={b} className="h-7" />
            <span className="flex items-center gap-2 text-sm text-ink">
              {b.sites[0]?.[0]} <Arrow className="btn-icon -rotate-45" />
            </span>
          </BrandLink>
        ))}
      </div>
    </>
  );
}

function MegaPicture({ brand: b, on }: { brand: BrandLite; on: boolean }) {
  return (
    <figure className={`mb-pane ${on ? 'is-on' : ''}`} style={{ '--brand': b.color.color } as CSSProperties}>
      {b.menuImage ? (
        <img src={b.menuImage} alt="" className="absolute inset-0 size-full object-cover" loading="lazy" decoding="async" />
      ) : (
        <div className="mb-fallback">
          <span className="rounded-2xl bg-white px-10 py-7 shadow-[0_20px_40px_-28px_rgba(18,18,18,0.5)]">
            <BrandMark brand={b} className="h-14 !text-2xl" />
          </span>
        </div>
      )}
      <figcaption className="mb-cta">
        <p className="line-clamp-2 text-sm text-muted">{b.intro}</p>
        <Link href={href(`/brand/${b.id}`)} className="btn btn-navy mt-4 self-start" tabIndex={on ? 0 : -1}>
          Explore {b.name} products <Arrow />
        </Link>
      </figcaption>
    </figure>
  );
}
