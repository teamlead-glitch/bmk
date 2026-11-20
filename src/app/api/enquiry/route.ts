import { NextRequest, NextResponse } from 'next/server';
import { API_CONFIG } from '@/constants/config';
import { cmsHeaders } from '@/lib/api/cms-headers';
import { isSlug } from '@/lib/api/cms-mappers';
import { BRAND_ENQUIRY_TYPES, ENQUIRY_GENERIC_ERROR, ENQUIRY_TYPE_VALUES, MAX_ENQUIRY_BRANDS } from '@/constants/enquiry';
import type { EnquiryResult } from '@/types/enquiry';

/* ---------- SEND AN ENQUIRY (contact form + enquiry popup) ---------- */
// POST /api/enquiry/ { type, name, email, phone, company?, country_id?, brands?, subject?, message, product? }
// company is required for distribution, dealership and retail; brands (CMS brand ids) are
// sent for those types only. Checks the fields, then forwards them to the CMS:
//  - product enquiry (product slug set): POST {NEXT_PUBLIC_API_URI}/v1/products/{slug}/enquiries (no type)
//  - any other enquiry:                  POST {NEXT_PUBLIC_API_URI}/v1/enquiries
// Never retried (a retry could save the enquiry twice). Personal data is never logged.

const LIMITS = { name: 120, email: 190, phone: 40, company: 150, subject: 200, message: 5000 } as const;
type Field = keyof typeof LIMITS;
const REQUIRED: Field[] = ['name', 'email', 'phone', 'message'];
const LABELS: Record<Field, string> = { name: 'Full name', email: 'Email', phone: 'Phone', company: 'Company', subject: 'Subject', message: 'Message' };
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/** Digits with an optional leading +, spaces, dots, dashes and brackets; 7 to 15 digits (E.164 max) */
const PHONE = /^\+?[\d\s().-]+$/;
const isPhone = (v: string) => PHONE.test(v) && /^\d{7,15}$/.test(v.replace(/\D/g, ''));
const isId = (v: unknown): v is number => Number.isInteger(v) && (v as number) > 0;
const TIMEOUT_MS = 10000;

const reply = (body: EnquiryResult, status: number) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

export async function POST(request: NextRequest) {
  const raw = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!raw || typeof raw !== 'object') return reply({ ok: false, message: ENQUIRY_GENERIC_ERROR }, 400);

  // Bots fill the hidden "website" field: answer as if it worked, send nothing
  if (String(raw.website ?? '').trim()) return reply({ ok: true }, 200);

  const fields = {} as Record<Field, string>;
  const errors: Record<string, string> = {};
  for (const key of Object.keys(LIMITS) as Field[]) {
    const value = String(raw[key] ?? '').trim();
    if (REQUIRED.includes(key) && !value) errors[key] = `${LABELS[key]} is required.`;
    else if (value.length > LIMITS[key]) errors[key] = `${LABELS[key]} is too long (max ${LIMITS[key]} characters).`;
    fields[key] = value;
  }
  if (fields.email && !errors.email && !EMAIL.test(fields.email)) errors.email = 'Enter a valid email address.';
  if (fields.phone && !errors.phone && !isPhone(fields.phone)) errors.phone = 'Enter a valid phone number.';

  const product = String(raw.product ?? '').trim();
  if (product && !isSlug(product)) return reply({ ok: false, message: ENQUIRY_GENERIC_ERROR }, 400);
  const label = String(raw.type ?? '');
  const type = product ? null : ENQUIRY_TYPE_VALUES[label];
  if (!product && !type) errors.type = 'Select an enquiry type.';
  const business = !product && BRAND_ENQUIRY_TYPES.includes(label);
  if (business && !fields.company && !errors.company) errors.company = 'Company is required.';

  // country_id: a CMS country id (the CMS checks it exists); brands: CMS brand ids
  const countryId = raw.country_id === undefined || raw.country_id === null || raw.country_id === '' ? null : Number(raw.country_id);
  if (countryId !== null && !isId(countryId)) errors.country_id = 'Select a valid country.';
  const brandList = raw.brands === undefined || raw.brands === null ? [] : raw.brands;
  if (!Array.isArray(brandList) || brandList.length > MAX_ENQUIRY_BRANDS || !brandList.every(isId)) errors.brands = 'Select valid brands.';
  const brands = business && Array.isArray(brandList) ? [...new Set(brandList as number[])] : [];
  if (Object.keys(errors).length) return reply({ ok: false, message: 'Please check the highlighted fields.', errors }, 422);

  if (!API_CONFIG.BASE_URL) {
    console.error('[enquiry] NEXT_PUBLIC_API_URI is not set: enquiry not sent');
    return reply({ ok: false, message: ENQUIRY_GENERIC_ERROR }, 503);
  }

  const payload = {
    name: fields.name,
    email: fields.email,
    phone: fields.phone || null,
    company: fields.company || null,
    country_id: countryId,
    ...(business ? { brands } : {}),
    ...(type ? { type } : {}),
    subject: fields.subject || null,
    message: fields.message,
  };
  const endpoint = product ? `/v1/products/${encodeURIComponent(product)}/enquiries` : '/v1/enquiries';
  const kind = product ? 'product' : type;

  try {
    const res = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
      method: 'POST',
      cache: 'no-store',
      headers: { ...cmsHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (res.ok) return reply({ ok: true }, 200);

    if (res.status === 422) {
      // Laravel validation answer: { message, errors: { field: [text, ...] } }
      const body = (await res.json().catch(() => null)) as { errors?: Record<string, string[]> } | null;
      const cmsErrors: Record<string, string> = {};
      for (const [key, list] of Object.entries(body?.errors ?? {})) {
        // "brands.0" (one bad id) is shown on the Brands group
        const field = key.startsWith('brands.') ? 'brands' : key;
        if (Array.isArray(list) && list[0] && !cmsErrors[field]) cmsErrors[field] = String(list[0]);
      }
      console.warn(`[enquiry] CMS rejected the enquiry (422), fields: ${Object.keys(cmsErrors).join(', ') || 'none'}, type: ${kind}`);
      // A bad "type" is our mapping, not the visitor's mistake
      if (cmsErrors.type) return reply({ ok: false, message: ENQUIRY_GENERIC_ERROR }, 502);
      return reply({ ok: false, message: 'Please check the highlighted fields.', errors: cmsErrors }, 422);
    }

    console.error(`[enquiry] CMS answered ${res.status} (${kind})`);
    return reply({ ok: false, message: res.status === 429 ? 'Too many messages at once. Please wait a minute and try again.' : ENQUIRY_GENERIC_ERROR }, res.status === 429 ? 429 : 502);
  } catch (error) {
    console.error('[enquiry] CMS unreachable:', (error as Error)?.name || error);
    return reply({ ok: false, message: ENQUIRY_GENERIC_ERROR }, 502);
  }
}
