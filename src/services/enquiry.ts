import { ENQUIRY_GENERIC_ERROR } from '@/constants/enquiry';
import { api } from '@/services/api';
import type { EnquiryBrand, EnquiryCountry, EnquiryInput, EnquiryResult } from '@/types/enquiry';

/* ---------- ENQUIRIES (browser) ---------- */
// The forms post to this site's POST /api/enquiry/ (src/app/api/enquiry/route.ts), which
// checks the fields and forwards them to the CMS (POST /v1/enquiries, or
// POST /v1/products/{slug}/enquiries for a product) with the server-only key.

/** Send a form and get a result the form can show. Never throws. */
export async function sendEnquiry(input: EnquiryInput): Promise<EnquiryResult> {
  const res = await api.post<EnquiryResult>('/api/enquiry', input);
  if (res.success) return res.data.ok ? { ok: true } : { ok: false, message: ENQUIRY_GENERIC_ERROR };
  // The route answers { ok: false, message, errors } with a 4xx/5xx; a network failure or a
  // bare status (no message of ours) shows the generic text
  const ours = res.error && !/^(HTTP \d+|Network error|Failed to fetch|Load failed)/i.test(res.error);
  return { ok: false, message: ours ? res.error : ENQUIRY_GENERIC_ERROR, errors: res.errors };
}

/** Reads a submitted <form> into the text fields the API takes (brands: readEnquiryBrands). */
export function readEnquiryForm(form: HTMLFormElement): Record<string, string> {
  const data = new FormData(form);
  const out: Record<string, string> = {};
  for (const key of ['type', 'name', 'email', 'phone', 'company', 'country_id', 'subject', 'message', 'website', 'captcha_token', 'captcha_answer']) {
    out[key] = String(data.get(key) ?? '').trim();
  }
  return out;
}

/** The ticked Brand checkboxes of a submitted <form> (ids) */
export function readEnquiryBrands(form: HTMLFormElement): number[] {
  return new FormData(form)
    .getAll('brands')
    .map(Number)
    .filter((id) => Number.isInteger(id) && id > 0);
}

/* Country and brand options: loaded once per page view, shared by every form on the page.
   A failed load is forgotten so the next open tries again. */
let countries: Promise<EnquiryCountry[] | null> | null = null;
const brands = new Map<string, Promise<EnquiryBrand[] | null>>();

/** Every country for the Country select; null when it couldn't be loaded */
export function loadEnquiryCountries(): Promise<EnquiryCountry[] | null> {
  countries ??= api.get<{ countries?: EnquiryCountry[] }>('/api/enquiry/options').then((res) => {
    if (res.success && Array.isArray(res.data.countries)) return res.data.countries;
    countries = null;
    return null;
  });
  return countries;
}

/** Brands linked to a country (ISO code); null when they couldn't be loaded */
export function loadEnquiryBrands(code: string): Promise<EnquiryBrand[] | null> {
  let pending = brands.get(code);
  if (!pending) {
    pending = api.get<{ brands?: EnquiryBrand[] }>('/api/enquiry/options', { country: code }).then((res) => {
      if (res.success && Array.isArray(res.data.brands)) return res.data.brands;
      brands.delete(code);
      return null;
    });
    brands.set(code, pending);
  }
  return pending;
}
