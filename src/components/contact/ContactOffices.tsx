'use client';

/* eslint-disable @next/next/no-img-element -- city icons (SVG) */
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Arrow } from '@/components/common/Arrow';
import { ContactRows, KindTag, OfficeMap } from '@/components/company/CompanyBits';
import type { Location } from '@/types/company';

/** Reads ?office= / ?country= (links from About and the homepage map). */
export function ContactOfficesFromUrl({ locations }: { locations: Location[] }) {
  const params = useSearchParams();
  return <ContactOffices locations={locations} office={params.get('office')} country={params.get('country')} />;
}

/** Our offices: one tab per country, each office with contact rows and directions. */
export function ContactOffices({ locations, office = null, country = null }: { locations: Location[]; office?: string | null; country?: string | null }) {
  const fromOffice = locations.flatMap((l) => l.companies).find((e) => e.id === office);
  const initial = fromOffice?.country || locations.find((c) => c.id === (country || office))?.id || 'uae';
  const [current, setCurrent] = useState(initial);
  const [prevInitial, setPrevInitial] = useState(initial);
  if (initial !== prevInitial) {
    setPrevInitial(initial);
    setCurrent(initial);
  }

  useEffect(() => {
    if (fromOffice) requestAnimationFrame(() => document.querySelector(`[data-entity="${fromOffice.id}"]`)?.scrollIntoView({ block: 'center' }));
  }, [fromOffice]);

  const c = locations.find((l) => l.id === current) ?? locations[0];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
        <h2 className="text-[28px] leading-tight tracking-[-0.04em]">Our offices</h2>
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Countries">
          {locations.map((l) => (
            <button
              key={l.id}
              type="button"
              role="tab"
              id={`tab-${l.id}`}
              aria-controls="offices-panel"
              className={`pill ${l.id === current ? 'is-on' : ''}`}
              aria-selected={l.id === current}
              onClick={() => setCurrent(l.id)}
            >
              {l.short}
            </button>
          ))}
        </div>
      </div>
      <div id="offices-panel" className="mt-5 grid gap-2 rounded-3xl border border-line bg-mist p-2" role="tabpanel" aria-labelledby={`tab-${c.id}`}>
        {c.companies.map((e) => (
          <div key={e.id} className={`rounded-2xl bg-white p-6 sm:p-8 ${fromOffice?.id === e.id ? 'ring-2 ring-navy' : ''}`} data-entity={e.id}>
            <div className="flex items-start gap-4 max-sm:flex-col">
              <span className="grid size-16 shrink-0 place-items-center rounded-full bg-mist">
                <img src={c.icon} alt="" width={36} height={36} />
              </span>
              <div className="min-w-0">
                <p className="text-xs tracking-[0.14em] text-muted uppercase">{c.city}</p>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-2">
                  <p className="text-xl leading-7 font-semibold tracking-[-0.02em]">{e.name}</p>
                  <KindTag e={e} />
                </div>
                <p className="mt-1 text-[15px] leading-6 text-muted">{e.mandate || e.role}</p>
              </div>
            </div>
            <div className="mt-5 border-t border-line pt-5">
              <ContactRows e={e} />
            </div>
            <a className="group mt-5 inline-flex items-center gap-2 text-sm font-semibold" href={`https://www.google.com/maps/search/${encodeURIComponent(e.address)}`} target="_blank" rel="noopener">
              Get directions <Arrow />
            </a>
          </div>
        ))}
        <OfficeMap label={c.city} />
      </div>
    </div>
  );
}
