import Link from 'next/link';
import { Arrow } from '@/components/common/Arrow';
import { ProductCard } from '@/components/common/ProductCard';
import type { BrandColor, CardProduct } from '@/types/catalogue';

/** "More from {brand}" (brand colour) and "More in {category}" strips. */
export function ProductStrip({
  title,
  list,
  more,
  dark = false,
  emptyText,
  emptyLink,
  brandColor,
}: {
  title: string;
  list: CardProduct[];
  more: string;
  dark?: boolean;
  emptyText: string;
  emptyLink: [string, string];
  brandColor?: BrandColor;
}) {
  const head = (
    <div className="mb-10 flex items-end justify-between gap-6">
      <h2 className="t-display">{title}</h2>
      {list.length > 0 && (
        <Link className="group hidden items-center gap-2 text-sm font-semibold sm:inline-flex" href={more}>
          View all <Arrow />
        </Link>
      )}
    </div>
  );
  if (!list.length)
    return (
      <div className="shell">
        {head}
        <div className={`flex flex-wrap items-center justify-between gap-4 rounded-2xl p-8 ${dark ? 'bg-white/10' : 'bg-mist'}`}>
          <p className={`t-body ${dark ? 'text-white/80' : 'text-muted'}`}>{emptyText}</p>
          <Link className={`btn ${dark ? 'btn-outline-light' : 'btn-dark'}`} href={emptyLink[1]}>
            {emptyLink[0]} <Arrow tone={dark ? 'white' : 'orange'} />
          </Link>
        </div>
      </div>
    );
  return (
    <div className="shell">
      {head}
      <ul className="-mx-5 flex snap-x gap-5 overflow-x-auto px-5 pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4">
        {list.map((x, i) => (
          <li key={x.slug} className="w-[78%] shrink-0 snap-start text-ink sm:w-auto">
            <ProductCard product={x} index={i} brandColor={brandColor} />
          </li>
        ))}
      </ul>
    </div>
  );
}
