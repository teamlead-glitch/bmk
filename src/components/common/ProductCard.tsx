import Link from 'next/link';
import type { CSSProperties } from 'react';
import { ArrowMask } from '@/components/common/Arrow';
import { Stage } from '@/components/common/Stage';
import { SpecRow } from '@/components/common/SpecRow';
import { href } from '@/lib/routes';
import type { BrandColor, CardProduct } from '@/types/catalogue';

export const brandVars = (c: BrandColor) => ({ '--brand': c.color, '--on': c.on }) as CSSProperties;

/** Product card, identical in every listing. On brand surfaces (`brandColor`)
 *  it uses the brand-colour shot and the brand-colour hover. */
export function ProductCard({ product: p, index = 0, brandColor }: { product: CardProduct; index?: number; brandColor?: BrandColor }) {
  const brand = !!brandColor;
  const src = brand ? p.media.brand || p.media.card : p.media.card;
  const style = { '--i': index % 8, ...(brandColor ? brandVars(brandColor) : {}) } as CSSProperties;
  return (
    <article className={`pcard group rise ${brand ? 'pcard-brand' : ''}`} style={style}>
      <Stage name={p.name} glyph={p.template} src={src} brand={brand} />
      <div className="flex flex-1 flex-col gap-4 px-4 pt-5 pb-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">{p.brandName}</span>
        </div>
        <div>
          <h3 className="text-xl leading-snug font-semibold tracking-[-0.01em]">
            <Link href={href(`/product/${p.slug}`)} className="after:absolute after:inset-0">
              {p.name}
            </Link>
          </h3>
          <p className="mt-1 text-sm text-muted">{p.categoryName}</p>
        </div>
        {p.highlights.length ? (
          <dl className="grid gap-1.5 text-[13px]">
            {p.highlights.map((h) => (
              <SpecRow key={h.label} label={h.label} value={h.value} />
            ))}
          </dl>
        ) : (
          <p className="line-clamp-2 text-sm text-muted">{p.short}</p>
        )}
        <span className="brand-cta">
          View details <ArrowMask />
        </span>
      </div>
    </article>
  );
}
