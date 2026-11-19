import { cache } from 'react';
import { text } from '@/lib/api/cms-mappers';
import { serverGetData } from '@/lib/api/server-api';
import type { EnquiryBrand, EnquiryCountry } from '@/types/enquiry';

/* ---------- Enquiry form options (CMS: GET /v1/countries, /v1/brands?country={code}) ---------- */
// The Country select and the Brand checkboxes of the enquiry forms. The browser reads them
// through GET /api/enquiry/options/ (src/app/api/enquiry/options/route.ts).

type CmsCountry = { id?: number | null; code?: string | null; name?: string | null };
type CmsBrandRef = { id?: number | null; name?: string | null };

const isId = (v: unknown): v is number => Number.isInteger(v) && (v as number) > 0;

/** Every country the CMS knows: the enquiry is saved with its id (`country_id`) */
export const getEnquiryCountries = cache(async (): Promise<EnquiryCountry[]> => {
  const list = (await serverGetData<CmsCountry[]>('/v1/countries')) ?? [];
  return list
    .filter((c) => isId(c.id) && /^[A-Z]{2}$/.test(text(c.code)) && text(c.name))
    .map((c) => ({ id: c.id as number, code: text(c.code), name: text(c.name) }));
});

/** Brands linked to one country (ISO code, e.g. "IN"); [] when the code is unknown.
 *  The code is checked first: the CMS answers 422 for an unknown one. */
export const getEnquiryBrands = cache(async (code: string): Promise<EnquiryBrand[]> => {
  const countries = await getEnquiryCountries();
  if (!countries.some((c) => c.code === code)) return [];
  const list = (await serverGetData<CmsBrandRef[]>('/v1/brands', { country: code })) ?? [];
  return list.filter((b) => isId(b.id) && text(b.name)).map((b) => ({ id: b.id as number, name: text(b.name) }));
});
