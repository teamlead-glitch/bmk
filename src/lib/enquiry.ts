/* ---------- ENQUIRIES (contact form + enquiry popup) ---------- */
// The browser posts to our own route, POST /api/enquiry/, which checks the fields
// and forwards them to the CMS (POST /v1/enquiries) with the server-only API key.
// Shared by the route (server) and the forms (browser): no secrets here.

/** Site label -> CMS `type` value. The CMS rejects any other value. */
export const ENQUIRY_TYPE_VALUES: Record<string, string> = {
  'Distribution Enquiry': 'distribution',
  'Dealership Enquiry': 'dealership',
  // TODO(CMS): not accepted by /v1/enquiries yet (422 "Select a valid enquiry type")
  'Retail Sales Enquiry': 'retail',
  'General Enquiry': 'general',
  'Product Enquiry': 'general',
};

export interface EnquiryInput {
  /** One of the ENQUIRY_TYPE_VALUES labels */
  type: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  country?: string;
  subject?: string;
  message: string;
  /** Honeypot: hidden from people, filled in by bots */
  website?: string;
}

export type EnquiryResult = { ok: true } | { ok: false; message: string; errors?: Record<string, string> };

const GENERIC_ERROR = 'Sorry, we couldn’t send your message. Please try again in a moment.';

/** Browser side: send a form and get a result the form can show. Never throws. */
export async function sendEnquiry(input: EnquiryInput): Promise<EnquiryResult> {
  try {
    const res = await fetch('/api/enquiry/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(input),
    });
    const body = (await res.json().catch(() => null)) as EnquiryResult | null;
    if (res.ok && body?.ok) return { ok: true };
    return body && !body.ok ? body : { ok: false, message: GENERIC_ERROR };
  } catch {
    return { ok: false, message: GENERIC_ERROR };
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

export { GENERIC_ERROR as ENQUIRY_GENERIC_ERROR };
