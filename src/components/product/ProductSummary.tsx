import Link from 'next/link';
import { Arrow } from '@/components/common/Arrow';
import { BrandMark } from '@/components/common/BrandMark';
import type { EnquiryProduct } from '@/components/common/EnquiryProvider';
import { EnquireProduct } from '@/components/product/EnquireProduct';
import type { ProductPageData } from '@/lib/content';
import { href } from '@/lib/routes';

/** Right column of the product hero: brand, name, model, summary, highlight tiles, CTAs. */
export function ProductSummary({ p, enquiry }: { p: ProductPageData; enquiry: EnquiryProduct }) {
  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-wrap items-center gap-3">
        <Link href={href(`/brand/${p.brand.id}`)} className="rounded-lg border border-line px-3 py-2 transition-colors hover:border-ink" aria-label={p.brand.name}>
          <BrandMark brand={p.brand} className="h-7" />
        </Link>
        <Link href={href(`/category/${p.category.id}`)} className="chip border-line text-ink transition-colors hover:border-ink">
          {p.category.name}
        </Link>
      </div>
      <div>
        <h1 className="text-[clamp(2.25rem,1.5rem+2vw,3.25rem)] leading-[1.08] font-semibold tracking-[-0.035em]">{p.name}</h1>
        <p className="mt-3 text-sm text-muted">
          Model {p.model}
          {p.modelNo ? ` · ${p.modelNo}` : ''}
        </p>
      </div>
      <p className="text-lg leading-relaxed text-ink/80">{p.short}</p>
      {p.highlights.length > 0 && (
        <div className="grid gap-2 sm:grid-cols-3">
          {p.highlights.map((h) => (
            <div key={h.key} className="tile">
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
        <a href="#specifications" data-anchor className="btn border border-ink/20 text-ink hover:border-ink">
          View specifications
        </a>
      </div>
    </div>
  );
}
