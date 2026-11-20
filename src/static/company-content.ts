import { cache } from 'react';
import * as company from '@/static/data/company';
import { countryVisual } from '@/static/data/visuals';
import type { Location } from '@/types/company';

/* ---------- Company (homepage, About, FAQ, Contact) ---------- */

export const getCompany = cache(async () => ({
  ...company,
  locations: company.countries.map(
    (c): Location => ({
      ...c,
      ...countryVisual[c.id],
      companies: company.entitiesIn(c.id),
    }),
  ),
}));

