/** What the forms send to POST /api/enquiry/ */
export interface EnquiryInput {
  /** One of the ENQUIRY_TYPE_VALUES labels (src/constants/enquiry.ts) */
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

/** What POST /api/enquiry/ answers; `errors` maps a field name to its message */
export type EnquiryResult = { ok: true } | { ok: false; message: string; errors?: Record<string, string> };
