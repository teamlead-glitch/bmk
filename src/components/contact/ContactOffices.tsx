'use client';

/* eslint-disable @next/next/no-img-element -- location icons (CMS) */
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Arrow } from '@/components/common/Arrow';
import { ContactRows, KindTag, OfficeMap } from '@/components/company/CompanyBits';
import type { GroupCompany, GroupLocation } from '@/types/company';

/** One tab per country: every company of the country's locations, each with its location */
type CountryTab = { id: string; name: string; offices: { company: GroupCompany; location: GroupLocation }[] };

function byCountry(locations: GroupLocation[]): CountryTab[] {
  const tabs = new Map<string, CountryTab>();
  for (const l of locations) {
    const id = l.countryCode || `loc-${l.id}`;
    const tab = tabs.get(id) ?? { id, name: l.country, offices: [] };
    tab.offices.push(...l.companies.map((company) => ({ company, location: l })));
    tabs.set(id, tab);
  }
  return [...tabs.values()];
}

/** Reads ?location= (homepage map "View Details"), ?country= (ISO code) and ?office= (a company id). */
export function ContactOfficesFromUrl({ locations }: { locations: GroupLocation[] }) {
  const params = useSearchParams();
  return <ContactOffices locations={locations} location={params.get('location')} country={params.get('country')} office={params.get('office')} />;
}

/** Our offices (CMS: GET /v1/group-locations): one tab per country (its locations' companies
 *  together), each company with its contact rows, directions, website and Google map. */
export function ContactOffices({
  locations,
  location = null,
  country = null,
  office = null,
}: {
  locations: GroupLocation[];
  location?: string | null;
  country?: string | null;
  office?: string | null;
}) {
  const tabs = byCountry(locations);
  const tabOf = (find: (o: CountryTab['offices'][number]) => boolean) => tabs.find((t) => t.offices.some(find))?.id;
  const fromOffice = office ? tabOf((o) => o.company.id === office) : undefined;
  const initial = tabOf((o) => o.location.id === location) ?? fromOffice ?? tabs.find((t) => t.id === country?.toLowerCase())?.id ?? tabs[0]?.id;
  const [current, setCurrent] = useState(initial);
  const [prevInitial, setPrevInitial] = useState(initial);
  if (initial !== prevInitial) {
    setPrevInitial(initial);
    setCurrent(initial);
  }

  useEffect(() => {
    if (fromOffice && office) requestAnimationFrame(() => document.querySelector(`[data-entity="${CSS.escape(office)}"]`)?.scrollIntoView({ block: 'center' }));
  }, [fromOffice, office]);

  const tab = tabs.find((t) => t.id === current) ?? tabs[0];
  if (!tab) return null;
  const anyMap = tab.offices.some((o) => o.company.mapEmbed);

  return (
    <div id="offices">
      <div className="flex flex-col items-start gap-4">
        <h2 className="text-[28px] leading-tight tracking-[-0.04em]">Our offices</h2>
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Countries">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              id={`tab-${t.id}`}
              aria-controls="offices-panel"
              className={`pill ${t.id === tab.id ? 'is-on' : ''}`}
              aria-selected={t.id === tab.id}
              onClick={() => setCurrent(t.id)}
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>
      <div id="offices-panel" className="mt-5 grid gap-2 rounded-3xl border border-line bg-mist p-2" role="tabpanel" aria-labelledby={`tab-${tab.id}`}>
        {tab.offices.map(({ company: e, location: c }) => (
          <div key={e.id} className={`rounded-2xl bg-white p-6 sm:p-8 ${office === e.id ? 'ring-2 ring-navy' : ''}`} data-entity={e.id}>
            <div className="flex items-start gap-4 max-sm:flex-col">
              <span className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-full bg-mist">
                {c.icon ? <img src={c.icon} alt={c.iconAlt} width={36} height={36} className="size-9 object-contain" /> : <span className="size-3 rounded-full bg-accent" />}
              </span>
              <div className="min-w-0">
                <p className="text-xs tracking-[0.14em] text-muted uppercase">
                  {c.city}
                  {c.country && c.country !== c.city ? `, ${c.country}` : ''}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-2">
                  <p className="text-xl leading-7 font-semibold tracking-[-0.02em]">{e.name}</p>
                  {e.kind && <KindTag e={e} />}
                </div>
                {e.summary && <p className="mt-1 text-[15px] leading-6 text-muted">{e.summary}</p>}
              </div>
            </div>
            <div className="mt-5 border-t border-line pt-5">
              <ContactRows e={e} />
            </div>
            {(e.directions || e.website) && (
              <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
                {e.directions && (
                  <a className="group inline-flex items-center gap-2 text-sm font-semibold" href={e.directions} target="_blank" rel="noopener">
                    Get directions <Arrow />
                  </a>
                )}
                {e.website && (
                  <a className="group inline-flex items-center gap-2 text-sm font-semibold" href={e.website} target="_blank" rel="noopener">
                    Visit website <Arrow />
                  </a>
                )}
              </div>
            )}
            {e.mapEmbed && <OfficeMap label={`${e.name}, ${c.city}`} embed={e.mapEmbed} className="mt-5" />}
          </div>
        ))}
        {/* No embed set in the admin for any company here: the design's map preview */}
        {!anyMap && <OfficeMap label={tab.name} />}
      </div>
    </div>
  );
}
