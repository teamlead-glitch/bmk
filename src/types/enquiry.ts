/** What the forms send to POST /api/enquiry/ */
export interface EnquiryInput {
  /** One of the ENQUIRY_TYPE_VALUES labels (src/constants/enquiry.ts) */
  type: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  /** CMS country id (GET /v1/countries) */
  country_id?: number;
  /** CMS brand ids: distribution, dealership and retail enquiries only */
  brands?: number[];
  subject?: string;
  message: string;
  /** Product slug: set by the product enquiry popup, sends to POST /v1/products/{slug}/enquiries */
  product?: string;
  /** Honeypot: hidden from people, filled in by bots */
  website?: string;
  /** CAPTCHA: the signed token from GET /api/captcha/ and the code the visitor typed */
  captcha_token?: string;
  captcha_answer?: string;
}

/** What POST /api/enquiry/ answers; `errors` maps a field name to its message */
export type EnquiryResult = { ok: true } | { ok: false; message: string; errors?: Record<string, string> };

/** A Country option of the enquiry forms */
export interface EnquiryCountry {
  id: number;
  /** ISO code, used to load that country's brands */
  code: string;
  name: string;
}

/** A Brand checkbox of the enquiry forms */
export interface EnquiryBrand {
  id: number;
  name: string;
}
