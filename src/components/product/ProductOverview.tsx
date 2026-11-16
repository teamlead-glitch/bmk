import { Stage } from '@/components/common/Stage';
import type { ProductPageData } from '@/lib/content';

/** About the product: overview copy and the feature cards. */
export function ProductOverview({ p }: { p: ProductPageData }) {
  return (
    <section id="overview" className="shell section-y scroll-mt-24" data-section>
      <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
        <div>
          <h2 className="t-display">About the {p.model}</h2>
        </div>
        <div className="t-body grid content-start gap-5 text-[17px] leading-[1.65] text-ink/80">
          {p.overview.map((t) => (
            <p key={t}>{t}</p>
          ))}
        </div>
      </div>
      {p.features.length > 0 && (
        <ul className={`mt-14 grid gap-4 rounded-3xl bg-mist p-4 sm:grid-cols-2 ${p.features.length >= 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'}`}>
          {p.features.map((f, i) => (
            <li key={f.title} className="enquiry !items-start !text-left">
              <div className="w-full">
                <Stage name={p.name} glyph={p.glyph} ratio="16 / 10" className="!rounded-xl" src={p.media.features?.[i]} />
              </div>
              <div className="px-1 pt-3">
                <p className="text-lg font-semibold tracking-[-0.01em]">{f.title}</p>
                <p className="mt-1.5 text-sm text-muted">{f.text}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
