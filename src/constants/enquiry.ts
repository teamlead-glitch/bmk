// Enquiries (contact form + enquiry popup): shared by POST /api/enquiry/ (server) and the
// forms (browser). No secrets here.

/** Site label -> CMS `type` value. The CMS rejects any other value. */
export const ENQUIRY_TYPE_VALUES: Record<string, string> = {
  'Distribution Enquiry': 'distribution',
  'Dealership Enquiry': 'dealership',
  'Retail Sales Enquiry': 'retail_sales',
  'General Enquiry': 'general',
  'Product Enquiry': 'general',
};

/** Enquiry types that ask for the brands of the chosen country (and need a company + country) */
export const BRAND_ENQUIRY_TYPES = ['Distribution Enquiry', 'Dealership Enquiry', 'Retail Sales Enquiry'];

/** Most brands one enquiry can carry (the route rejects more) */
export const MAX_ENQUIRY_BRANDS = 50;

/** Shown when an enquiry can't be sent (network, CMS down, a type the CMS rejects) */
export const ENQUIRY_GENERIC_ERROR = 'Sorry, we couldn’t send your message. Please try again in a moment.';
