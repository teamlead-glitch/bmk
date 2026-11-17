/* eslint-disable @next/next/no-img-element -- brand logos (SVG) */
import { Arrow } from '@/components/common/Arrow';
import { BrandsCarousel } from '@/components/home/brands/BrandsCarousel';
import type { BrandLite } from '@/types/catalogue';

/** Associated (partner) brands carousel with category filters, then BMK's own brands. */
export function BrandsSection({ partner, own, filters }: { partner: BrandLite[]; own: BrandLite[]; filters: { id: string; label: string }[] }) {
  return (
    <section id="brands" className="brands-section section-y text-white" aria-labelledby="brands-title">
      <div className="shell flex flex-col gap-10">
        <BrandsCarousel brands={partner} filters={filters} />

        {/* BMK's own brands (Figma "Homepage v2": below the partner carousel) */}
        <div className="mt-[clamp(24px,3vw,40px)] flex flex-col gap-10">
          <div className="flex max-w-[640px] flex-col gap-3">
            <h2 id="own-brands-title" className="t-display" data-split>
              Our Brands
            </h2>
            <p className="t-body" data-reveal="up">
              BMK’s own brands, SEEKEN and TEAM Appliances.
            </p>
          </div>
          <ul className="grid gap-4 md:grid-cols-2 lg:gap-10" aria-labelledby="own-brands-title">
            {own.map((b) => (
              <li key={b.id} className="own-brand">
                <div className="flex items-center justify-between gap-6">
                  <span className="brand-tag">BMK brand</span>
                  {b.logo && <img className="own-brand-logo" src={b.logo} alt={`${b.name} logo`} width={160} height={57} loading="lazy" />}
                </div>
                <div className="mt-auto flex flex-col items-start gap-3 pt-16">
                  <h3 className="text-[32px] leading-8 font-semibold">{b.name}</h3>
                  <p className="t-body line-clamp-3 text-black/50">{b.intro}</p>
                  {b.sites[0] && (
                    <a href={`https://${b.sites[0][0]}`} target="_blank" rel="noopener" className="brand-cta mt-3 w-auto gap-8">
                      Visit {b.name}
                      <Arrow className="btn-icon -rotate-45" />
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
