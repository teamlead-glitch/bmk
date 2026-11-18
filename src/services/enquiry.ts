import { ENQUIRY_GENERIC_ERROR } from '@/constants/enquiry';
import { api } from '@/services/api';
import type { EnquiryInput, EnquiryResult } from '@/types/enquiry';

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

/** Reads a submitted <form> into the fields the API takes. */
export function readEnquiryForm(form: HTMLFormElement): Record<string, string> {
  const data = new FormData(form);
  const out: Record<string, string> = {};
  for (const key of ['type', 'name', 'email', 'phone', 'company', 'country', 'subject', 'message', 'website']) {
    out[key] = String(data.get(key) ?? '').trim();
  }
  return out;
}
