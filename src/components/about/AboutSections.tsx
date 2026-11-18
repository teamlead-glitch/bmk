/* eslint-disable @next/next/no-img-element -- photos and SVG icons */
import Link from 'next/link';
import { Globe } from '@/components/about/Globe';
import { JourneyRail } from '@/components/about/JourneyRail';
import { Arrow } from '@/components/common/Arrow';
import { BrandMark } from '@/components/common/BrandMark';
import { MilestoneCard } from '@/components/common/MilestoneCard';
import { KindTag, MapPlaceholder } from '@/components/company/CompanyBits';
import { href } from '@/lib/routes';
import type { OwnBrand, PartnerBrand } from '@/types/brand';
import type { CoreValue } from '@/types/about';
import type { Entity, Location } from '@/types/company';
import type { Milestone } from '@/types/timeline';

/* ---------- Who we are: intro + globe + counts ---------- */
export function WhoWeAre({ heading, html, companies, countries }: { heading: string; html: string; companies: number; countries: number }) {
  return (
    <section id="who-we-are" className="section-y scroll-mt-24 bg-white" data-section>
      <div className="shell grid items-center gap-12 lg:grid-cols-[440px_1fr] lg:gap-[120px]">
        <div className="flex flex-col items-start gap-6">
          <span className="chip border-line text-ink">Who we are</span>
          {heading && <h2 className="t-display">{heading}</h2>}
          {html && <div className="t-body space-y-5" dangerouslySetInnerHTML={{ __html: html }} />}
          <a className="btn btn-navy" href="#our-brands" data-anchor>
            Explore our brands <Arrow />
          </a>
        </div>
        <div className="relative">
          <Globe />
          <dl className="relative z-10 mx-auto -mt-6 grid max-w-[560px] grid-cols-2 gap-2 rounded-3xl bg-mist p-2">
            {(
              [
                [companies, 'Group companies'],
                [countries, 'Countries'],
              ] as const
            ).map(([n, l]) => (
              <div key={l} className="flex flex-col justify-between gap-6 rounded-2xl bg-white p-6">
                <dt className="text-sm text-muted">{l}</dt>
                <dd className="text-[clamp(3rem,2rem+3vw,4.5rem)] leading-none font-medium tracking-[-0.05em]">{n}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

/* ---------- Mission, vision and core values ---------- */
export function MissionValues({ mission, vision, values }: { mission: string; vision: string; values: CoreValue[] }) {
  const statements = (
    [
      ['Our mission', mission],
      ['Our vision', vision],
    ] as const
  ).filter(([, t]) => t);
  if (!statements.length && !values.length) return null;
  return (
    <section id="mission" className="section-y relative isolate scroll-mt-24 overflow-hidden bg-navy text-white" data-section>
      <img src="/assets/patterns/history-mark-1.svg" alt="" className="absolute -top-24 -right-24 -z-10 w-[min(520px,50vw)] opacity-10 brightness-0 invert" />
      <div className="shell">
        {statements.length > 0 && (
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            {statements.map(([k, t]) => (
              <div key={k} className="flex flex-col items-start gap-6">
                <h2 className="text-xs tracking-[0.14em] text-white/60 uppercase">{k}</h2>
                <p className="text-[clamp(1.5rem,1.1rem+1.1vw,2.25rem)] leading-tight tracking-[-0.03em]">{t}</p>
              </div>
            ))}
          </div>
        )}
        {values.length > 0 && (
          <div className={statements.length ? 'mt-16 border-t border-white/15 pt-12' : ''}>
            <h2 className="text-xs tracking-[0.14em] text-white/60 uppercase">Core values</h2>
            <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {values.map((v) => (
                <li key={v.name} className="value-card">
                  <span className="grid size-14 place-items-center rounded-full bg-white">
                    <img src={v.icon} alt="" className="size-7" />
                  </span>
                  <p className="mt-8 text-xl leading-7 font-semibold">{v.name}</p>
                  <p className="mt-2 text-[15px] leading-6 text-white/70">{v.text}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}

/* ---------- Our companies: one card per country ---------- */
// Company cards carry no contact details (those live on Contact Us); each button says which office it reaches
const CTA_LABEL: Record<string, string> = {
  'bmk-gulf': 'Contact Our HQ',
  'island-valley': 'Contact Retail Office',
  'bmk-international': 'Contact Our Corporate Office',
  'bmk-electronics': 'Contact SEA HQ',
  'seeken-malaysia': 'Contact Regional Office',
  'seeken-zambia': 'Contact Zambia Office',
  'ets-hb': 'Contact DRC Distributor',
};

function CountryCard({ c, flip }: { c: Location; flip: boolean }) {
  return (
    <article id={c.id} className={`co-card ${flip ? 'is-flip' : ''} scroll-mt-40`}>
      {c.photo ? (
        <img className="co-photo" src={c.photo} alt="" loading="lazy" style={{ objectPosition: c.pos || 'center' }} />
      ) : (
        <img className="co-mark" src="/assets/patterns/history-mark-2.svg" alt="" />
      )}
      <span className="co-badge">
        <img src={c.icon} alt="" width={40} height={40} />
      </span>
      <p className="co-city">{c.city.split(',')[0]}</p>
      <div className="co-panel">
        <p className="text-xs tracking-[0.14em] text-muted uppercase">
          {c.city}, {c.name}
        </p>
        {c.companies.map((e: Entity, k) => (
          <section key={e.id} id={e.id} className={`scroll-mt-40 ${k ? 'mt-6 border-t border-ink/10 pt-6' : 'mt-2'}`}>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <h3 className="text-[clamp(1.5rem,1.2rem+0.8vw,2rem)] leading-tight font-semibold tracking-[-0.03em]">{e.name}</h3>
              <KindTag e={e} />
            </div>
            <p className="mt-2 text-[15px] leading-6 text-muted">{e.role}</p>
            {e.mandate && (
              <p className="mt-2 text-sm">
                <span className="text-muted">Authorized mandate:</span> {e.mandate}
              </p>
            )}
            {e.products && (
              <p className="mt-2 text-sm">
                <span className="text-muted">In store:</span> {e.products}
              </p>
            )}
            <Link className="btn btn-navy mt-5" href={href('/contact', { office: e.id })}>
              {CTA_LABEL[e.id] || (e.retail ? 'Visit the showroom' : 'Contact this office')} <Arrow />
            </Link>
          </section>
        ))}
        <div className="mt-6">
          <MapPlaceholder label={c.city} className="aspect-[16/7]" pins={c.companies.length} />
        </div>
      </div>
    </article>
  );
}

export function Companies({ locations, intro }: { locations: Location[]; intro: string }) {
  return (
    <section id="companies" className="section-y scroll-mt-24 bg-fog" data-section>
      <div className="shell">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="flex max-w-[620px] flex-col items-start gap-6">
            <span className="chip border-line bg-white text-ink">Group presence</span>
            <h2 className="t-display">Our companies</h2>
            {intro && <p className="t-body">{intro}</p>}
          </div>
          <ul className="flex flex-wrap gap-2">
            {locations.map((c) => (
              <li key={c.id}>
                <a className="pill" href={`#${c.id}`} data-anchor>
                  {c.short} <span className="n">{c.companies.length}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-14 grid gap-8 lg:gap-12">
          {locations.map((c, i) => (
            <CountryCard key={c.id} c={c} flip={i % 2 === 1} />
          ))}
        </div>
      </div>
    </section>
  );
}

/** "https://www.seeken.com/" -> "seeken.com" (the design's "Visit seeken.com" label) */
const domainOf = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www./, '');
  } catch {
    return url;
  }
};

/* ---------- Our brands: BMK's own brands + partner logos (CMS: own-brands, brands) ---------- */
export function OurBrands({ own, partners, title, intro }: { own: OwnBrand[]; partners: PartnerBrand[]; title: string; intro: string }) {
  return (
    <section id="our-brands" className="section-y scroll-mt-24 bg-white" data-section>
      <div className="shell">
        <div className="flex max-w-[640px] flex-col items-start gap-6">
          <span className="chip border-line text-ink">Our brands</span>
          {title && <h2 className="t-display">{title}</h2>}
          {intro && <p className="t-body">{intro}</p>}
        </div>
        <div className="mt-12 grid gap-4 lg:grid-cols-2">
          {own.map((b) => (
            <article key={b.id} className="ih-card">
              <div className="flex items-center justify-between gap-6">
                <span className="brand-tag">BMK brand</span>
                <BrandMark brand={b} className="h-[57px] !max-w-40 object-right" />
              </div>
              <div className="mt-auto flex flex-col items-start gap-3 pt-16">
                <h3 className="text-[32px] leading-8 font-semibold">{b.name}</h3>
                {b.intro && <p className="t-body text-black/50">{b.intro}</p>}
                {b.links.length > 0 && (
                  <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-3">
                    {b.links.map((l) => (
                      <a key={l.url} className="brand-cta" href={l.url} target="_blank" rel="noopener">
                        Visit {domainOf(l.url)} <Arrow className="btn-icon -rotate-45" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
        <p className="mt-16 mb-5 text-xs tracking-[0.14em] text-muted uppercase">Partner brands</p>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {partners.map((b) => (
            <li key={b.slug}>
              <Link className="partner-tile" href={href(`/brand/${b.slug}`)} title={b.name}>
                <BrandMark brand={b} className="h-11 !text-[17px]" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---------- Our journey ---------- */
export function Journey({ milestones }: { milestones: Milestone[] }) {
  if (!milestones.length) return null;
  return (
    <section id="journey" className="section-y relative scroll-mt-24 overflow-hidden bg-mist" data-section>
      <div className="shell">
        <JourneyRail>
          {milestones.map((m) => (
            <MilestoneCard key={m.id} m={m} />
          ))}
        </JourneyRail>
      </div>
    </section>
  );
}
