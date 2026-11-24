import Link from 'next/link';
import { Arrow } from '@/components/common/Arrow';
import { BrandMark } from '@/components/common/BrandMark';
import { ChevIcon } from '@/components/common/Icons';
import { href } from '@/lib/routes';
import type { NavData } from '@/types/catalogue';

const Label = ({ children }: { children: string }) => <p className="mt-4 mb-2 text-xs tracking-[0.14em] text-muted uppercase">{children}</p>;

/** Mobile menu: Brands & Products accordion (brands, then main categories), all from the CMS.
 *  `compact` is the homepage's inline menu (smaller summary, no border).
 *  `active`: a catalogue page is open (summary semibold, like the current item in the menu). */
export function CatalogueMenu({ nav, open = false, compact = false, active = false }: { nav: NavData; open?: boolean; compact?: boolean; active?: boolean }) {
  return (
    <details className={`facet ${compact ? '' : 'border-b border-line'}`} open={open}>
      <summary className={`${compact ? '!py-2.5' : '!py-4'} !text-[22px] ${active ? '!font-semibold' : '!font-normal'}`}>
        Brands &amp; Products <ChevIcon />
      </summary>
      <div className="grid gap-1 pb-5 text-base">
        {nav.ownBrands.length > 0 && (
          <>
            <Label>Our brands</Label>
            {/* Logo cards (the desktop mega menu shows the same cards): one per row on phones,
                side by side in one row from tablet width (QA 24 Nov: wasted vertical space) */}
            <ul className="grid gap-2 sm:grid-cols-[repeat(auto-fit,minmax(14rem,1fr))]">
              {nav.ownBrands.map((b) => (
                <li key={b.id}>
                  {b.site ? (
                    <a
                      href={b.site.url}
                      target="_blank"
                      rel="noopener"
                      className="flex items-center justify-between gap-4 rounded-xl border border-line bg-white px-4 py-3"
                      aria-label={`${b.name}, ${b.site.label} (opens in a new tab)`}
                    >
                      <BrandMark brand={b} className="h-6" />
                      <span className="flex items-center gap-2 text-xs text-muted">
                        {b.site.label} <Arrow className="btn-icon -rotate-45" />
                      </span>
                    </a>
                  ) : (
                    <div className="flex items-center rounded-xl border border-line bg-white px-4 py-3">
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
            <div className="flex flex-wrap gap-2">
              {nav.partnerBrands.map((b) => (
                <Link key={b.slug} href={href(`/brand/${b.slug}`)} className="pill">
                  {b.name}
                </Link>
              ))}
            </div>
          </>
        )}
        {nav.categories.length > 0 && (
          <>
            <Label>Product categories</Label>
            <ul className="grid text-[15px]">
              {nav.categories.map((c) => (
                <li key={c.slug}>
                  <Link className="flex items-center justify-between border-b border-line py-3 font-medium" href={href(`/category/${c.slug}`)}>
                    {c.name}
                    <span className="flex items-center gap-3">
                      <span className="text-xs font-normal text-muted">{c.count}</span>
                      <Arrow />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
        <Link href={href('/products')} className="btn btn-navy mt-5">
          View all products <Arrow />
        </Link>
      </div>
    </details>
  );
}
