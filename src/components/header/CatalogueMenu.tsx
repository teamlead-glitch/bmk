import Link from 'next/link';
import { Arrow } from '@/components/common/Arrow';
import { BrandMark } from '@/components/common/BrandMark';
import { ChevIcon } from '@/components/common/Icons';
import { BrandLink } from '@/components/common/SmartLink';
import { MEGA_MENU_DESIGN } from '@/constants/site';
import { href } from '@/lib/routes';
import type { NavData } from '@/types/catalogue';

/** Mobile menu: Brands & Products accordion (groups → categories, brands).
 *  `compact` is the homepage's inline menu (smaller summary, no border). */
export function CatalogueMenu({ nav, open = false, compact = false }: { nav: NavData; open?: boolean; compact?: boolean }) {
  return (
    <details className={`facet ${compact ? '' : 'border-b border-line'}`} open={open}>
      <summary className={compact ? '!py-2.5 !text-[22px] !font-normal' : '!py-4 !text-[22px] !font-semibold'}>
        Brands &amp; Products <ChevIcon />
      </summary>
      {MEGA_MENU_DESIGN === 'brands' ? (
        <div>
          <ul className="grid pb-3 text-base">
            {nav.partnerBrands.map((b) => (
              <li key={b.id}>
                <Link className="flex items-center justify-between border-b border-line py-3" href={href(`/brand/${b.id}`)}>
                  {b.name}
                  <Arrow />
                </Link>
              </li>
            ))}
          </ul>
          <Link href={href('/products')} className="btn btn-navy mt-2 w-full">
            View all products <Arrow />
          </Link>
          <div className="mt-5 mb-5 grid grid-cols-2 divide-x divide-line overflow-hidden rounded-2xl border border-line bg-mist">
            {nav.inHouseBrands.map((b) => (
              <BrandLink key={b.id} brand={b} className="grid justify-items-start gap-2 p-4" aria-label={`${b.name}, ${b.sites[0]?.[0]} (opens in a new tab)`}>
                <BrandMark brand={b} className="h-5 max-w-full" />
                <span className="flex items-center gap-1.5 text-xs text-ink">
                  {b.sites[0]?.[0]} <Arrow className="size-3.5 -rotate-45" />
                </span>
              </BrandLink>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid gap-1 pb-5 text-base">
          {nav.groups.map((g) => (
            <details key={g.id} className="facet">
              <summary className="!py-2.5 !text-base !font-medium">
                {g.name} <ChevIcon />
              </summary>
              <ul className="grid pb-2 pl-3 text-[15px]">
                <li>
                  <Link className="block py-1.5 font-medium" href={href(`/category/${g.id}`)}>
                    All {g.name}
                  </Link>
                </li>
                {nav.categories
                  .filter((c) => c.group === g.id)
                  .map((c) => (
                    <li key={c.id}>
                      <Link className={`flex justify-between py-1.5 ${c.count ? '' : 'text-ink/40'}`} href={href(`/category/${c.id}`)}>
                        {c.name}
                        <span className="text-xs text-muted">{c.count}</span>
                      </Link>
                    </li>
                  ))}
              </ul>
            </details>
          ))}
          <p className="mt-4 mb-2 text-xs tracking-[0.14em] text-muted uppercase">Our brands</p>
          <div className="flex flex-wrap gap-2">
            {nav.inHouseBrands.map((b) => (
              <BrandLink key={b.id} brand={b} className="pill">
                {b.name}
              </BrandLink>
            ))}
          </div>
          <p className="mt-4 mb-2 text-xs tracking-[0.14em] text-muted uppercase">Partner brands</p>
          <div className="flex flex-wrap gap-2">
            {nav.partnerBrands.map((b) => (
              <BrandLink key={b.id} brand={b} className="pill">
                {b.name}
              </BrandLink>
            ))}
          </div>
          <Link href={href('/products')} className="btn btn-navy mt-5">
            View all products <Arrow />
          </Link>
        </div>
      )}
    </details>
  );
}
