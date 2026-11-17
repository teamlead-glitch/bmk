// Enquiries (contact form + enquiry popup): shared by POST /api/enquiry/ (server) and the
// forms (browser). No secrets here.

/** Site label -> CMS `type` value. The CMS rejects any other value. */
export const ENQUIRY_TYPE_VALUES: Record<string, string> = {
  'Distribution Enquiry': 'distribution',
  'Dealership Enquiry': 'dealership',
  // TODO(CMS): not accepted by /v1/enquiries yet (422 "Select a valid enquiry type")
  'Retail Sales Enquiry': 'retail',
  'General Enquiry': 'general',
  'Product Enquiry': 'general',
};

/** Shown when an enquiry can't be sent (network, CMS down, a type the CMS rejects) */
export const ENQUIRY_GENERIC_ERROR = 'Sorry, we couldn’t send your message. Please try again in a moment.';
