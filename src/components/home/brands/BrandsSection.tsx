/* eslint-disable @next/next/no-img-element -- brand logos from the CMS */
import { Arrow } from '@/components/common/Arrow';
import { BrandsCarousel } from '@/components/home/brands/BrandsCarousel';
import { hostLabel } from '@/lib/routes';
import type { BrandShowcase } from '@/types/brand';

/** Associated (partner) brands carousel with category filters, then BMK's own brands. All from the CMS. */
export function BrandsSection({ partner, own, filters }: BrandShowcase) {
  return (
    <section id="brands" className="brands-section section-y text-white" aria-labelledby="brands-title">
      <div className="shell flex flex-col gap-10">
        <BrandsCarousel brands={partner} filters={filters} />

        {/* BMK's own brands (Figma "Homepage v2": below the partner carousel) */}
        {own.length > 0 && (
          <div className="mt-[clamp(24px,3vw,40px)] flex flex-col gap-10">
            <div className="flex max-w-[640px] flex-col gap-3">
              <h2 id="own-brands-title" className="t-display [word-spacing:0.12em]" data-split>
                Our Brands
              </h2>
              <p className="t-body" data-reveal="up">
                In-house consumer technology and home living solutions engineered for modern lifestyles.
              </p>
            </div>
            <ul className="grid gap-4 md:grid-cols-2 lg:gap-10" aria-labelledby="own-brands-title">
              {own.map((b) => (
                <li key={b.id} className="own-brand">
                  <div className="flex items-center justify-between gap-6">
                    <span className="brand-tag shrink-0">BMK brand</span>
                    {b.logo && <img className="own-brand-logo" src={b.logo} alt={`${b.name} logo`} width={208} height={72} loading="lazy" />}
                  </div>
                  <div className="mt-auto flex flex-col items-start gap-3 pt-16">
                    <h3 className="text-[32px] leading-8 font-semibold">{b.name}</h3>
                    {b.intro && <p className="t-body line-clamp-3 text-black/50">{b.intro}</p>}
                    {b.links.length > 0 && (
                      <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-3">
                        {b.links.map((l, i) => (
                          <a key={`${l.url}-${i}`} href={l.url} target="_blank" rel="noopener" className="brand-cta w-auto gap-8">
                            {l.title || `Visit ${hostLabel(l.url)}`}
                            <Arrow className="btn-icon -rotate-45" />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
