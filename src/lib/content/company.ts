import { cache } from 'react';
import { brands, groups } from '@/data/catalogue';
import * as company from '@/data/company';
import { countryVisual, DEFAULT_LOCATION } from '@/data/visuals';
import { categoriesIn, toBrandLite } from '@/lib/catalogue';
import { href } from '@/lib/routes';
import type { Location } from '@/types/company';

/* ---------- Company (homepage, About, FAQ, Contact) ---------- */

export const getCompany = cache(async () => ({
  ...company,
  locations: company.countries.map(
    (c): Location => ({
      ...c,
      ...countryVisual[c.id],
      companies: company.entitiesIn(c.id),
      href: href('/contact', { country: c.id }),
    }),
  ),
  defaultLocation: DEFAULT_LOCATION,
}));

export const getHomeBrands = cache(async () => {
  const all = brands.map(toBrandLite);
  return {
    partner: all.filter((b) => !b.inHouse),
    own: all.filter((b) => b.inHouse),
    filters: [{ id: 'all', label: 'All' }, ...groups.map((g) => ({ id: g.id, label: g.name }))],
  };
});

export { categoriesIn };
