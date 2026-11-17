import Link from 'next/link';
import { Arrow } from '@/components/common/Arrow';
import { BrandMark } from '@/components/common/BrandMark';
import type { EnquiryProduct } from '@/components/common/EnquiryProvider';
import { EnquireProduct } from '@/components/product/EnquireProduct';
import { href } from '@/lib/routes';
import type { ProductDetail } from '@/types/catalogue';

/** Right column of the product hero: brand, name, model, summary, highlight tiles, CTAs. */
export function ProductSummary({ p, enquiry, hasSpecs }: { p: ProductDetail; enquiry: EnquiryProduct; hasSpecs: boolean }) {
  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-wrap items-center gap-3">
        {p.brand.slug && (
          <Link href={href(`/brand/${p.brand.slug}`)} className="rounded-lg border border-line px-3 py-2 transition-colors hover:border-ink" aria-label={p.brand.name}>
            <BrandMark brand={p.brand} className="h-7" />
          </Link>
        )}
        {p.category && (
          <Link href={href(`/category/${p.category.slug}`)} className="chip border-line text-ink transition-colors hover:border-ink">
            {p.category.name}
          </Link>
        )}
      </div>
      <div>
        <h1 className="text-[clamp(2.25rem,1.5rem+2vw,3.25rem)] leading-[1.08] font-semibold tracking-[-0.035em]">{p.name}</h1>
        {p.modelNo && <p className="mt-3 text-sm text-muted">Model {p.modelNo}</p>}
      </div>
      {p.short && <p className="text-lg leading-relaxed text-ink/80">{p.short}</p>}
      {p.highlights.length > 0 && (
        <div className="grid gap-2 sm:grid-cols-3">
          {p.highlights.map((h) => (
            <div key={h.label} className="tile">
              <p className="text-xs text-muted">{h.label}</p>
              <p className="mt-1.5 text-[15px] leading-snug font-semibold">{h.value}</p>
            </div>
          ))}
        </div>
      )}
      <div className="flex flex-wrap gap-3 border-t border-line pt-7" id="cta">
        <EnquireProduct product={enquiry} className="btn btn-navy">
          Enquire about this product <Arrow />
        </EnquireProduct>
        {hasSpecs && (
          <a href="#specifications" data-anchor className="btn border border-ink/20 text-ink hover:border-ink">
            View specifications
          </a>
        )}
      </div>
    </div>
  );
}
