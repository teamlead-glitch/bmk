import type { EnquiryType } from '@/types/company';

// Company content with no CMS endpoint yet (from the design reference).
// Read it through @/lib/content (src/static/company-content.ts), never directly from pages.
// Group locations and companies come from the CMS (src/lib/api/group-locations.ts).

export const YEARS = 24; // agreed figure for the homepage ("24 Years of Experience & Trust")

export const enquiryTypes: EnquiryType[] = [
  { type: 'Distribution Enquiry', title: 'Regional Distribution Partnerships', text: 'Partner with us for territory-wide wholesale distribution of SEEKEN and TEAM Appliances.' },
  { type: 'Dealership Enquiry', title: 'Authorised Retail Dealerships', text: 'Stock BMK Group brands and distributed electronics in your retail outlets.' },
  { type: 'Retail Sales Enquiry', title: 'Bulk & Corporate Orders', text: 'Request volume pricing, wholesale stock availability, and commercial quotes.' },
  { type: 'General Enquiry', title: 'General & Corporate Enquiries', text: 'Get in touch for corporate communications, media requests, supplier onboarding, or general questions.' },
];
