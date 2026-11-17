import { ENQUIRY_GENERIC_ERROR } from '@/constants/enquiry';
import type { EnquiryInput, EnquiryResult } from '@/types/enquiry';

/* ---------- ENQUIRIES (browser) ---------- */
// The forms post to this site's POST /api/enquiry/ (src/app/api/enquiry/route.ts), which
// checks the fields and forwards them to the CMS (POST /v1/enquiries) with the server-only key.

/** Send a form and get a result the form can show. Never throws. */
export async function sendEnquiry(input: EnquiryInput): Promise<EnquiryResult> {
  try {
    const res = await fetch('/api/enquiry/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(input),
    });
    const body = (await res.json().catch(() => null)) as EnquiryResult | null;
    if (res.ok && body?.ok) return { ok: true };
    return body && !body.ok ? body : { ok: false, message: ENQUIRY_GENERIC_ERROR };
  } catch {
    return { ok: false, message: ENQUIRY_GENERIC_ERROR };
  }
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
