import { NextRequest, NextResponse } from 'next/server';
import { API_CONFIG } from '@/constants/config';
import { cmsHeaders } from '@/lib/cms-headers';
import { ENQUIRY_GENERIC_ERROR, ENQUIRY_TYPE_VALUES } from '@/constants/enquiry';
import type { EnquiryResult } from '@/types/enquiry';

/* ---------- SEND AN ENQUIRY (contact form + enquiry popup) ---------- */
// POST /api/enquiry/ { type, name, email, phone?, company?, country?, subject?, message }
// Checks the fields, then forwards them to the CMS: POST {NEXT_PUBLIC_API_URI}/v1/enquiries.
// Never retried (a retry could save the enquiry twice). Personal data is never logged.

const LIMITS = { name: 120, email: 190, phone: 40, company: 150, country: 100, subject: 200, message: 5000 } as const;
type Field = keyof typeof LIMITS;
const REQUIRED: Field[] = ['name', 'email', 'message'];
const LABELS: Record<Field, string> = { name: 'Full name', email: 'Email', phone: 'Phone', company: 'Company', country: 'Country', subject: 'Subject', message: 'Message' };
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
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

  const type = ENQUIRY_TYPE_VALUES[String(raw.type ?? '')];
  if (!type) errors.type = 'Select an enquiry type.';
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
    country: fields.country || null,
    type,
    subject: fields.subject || null,
    message: fields.message,
  };

  try {
    const res = await fetch(`${API_CONFIG.BASE_URL}/v1/enquiries`, {
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
        if (Array.isArray(list) && list[0]) cmsErrors[key] = String(list[0]);
      }
      console.warn(`[enquiry] CMS rejected the enquiry (422), fields: ${Object.keys(cmsErrors).join(', ') || 'none'}, type: ${type}`);
      // A bad "type" is our mapping, not the visitor's mistake
      if (cmsErrors.type) return reply({ ok: false, message: ENQUIRY_GENERIC_ERROR }, 502);
      return reply({ ok: false, message: 'Please check the highlighted fields.', errors: cmsErrors }, 422);
    }

    console.error(`[enquiry] CMS answered ${res.status}`);
    return reply({ ok: false, message: res.status === 429 ? 'Too many messages at once. Please wait a minute and try again.' : ENQUIRY_GENERIC_ERROR }, res.status === 429 ? 429 : 502);
  } catch (error) {
    console.error('[enquiry] CMS unreachable:', (error as Error)?.name || error);
    return reply({ ok: false, message: ENQUIRY_GENERIC_ERROR }, 502);
  }
}
