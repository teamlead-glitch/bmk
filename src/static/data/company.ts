import type { Country, Entity, EnquiryType } from '@/types/company';

// Company content (from the design reference; the CMS replaces it).
// Read it through @/lib/content (src/static/company-content.ts), never directly from pages.
// Source: the client's document "BMK_WEBSITE_INFO_21.10.2026" (shared 22 Oct 2026),
// with the agency's decisions of 22 Oct (24 years, latest phone number, PIN 682021,
// "-Dr" dropped from the Malaysian entity name). Anything the document doesn't
// cover is `null` and renders as "to be confirmed" — nothing is carried over from
// the earlier placeholder copy.

export const YEARS = 24; // agreed figure for the homepage ("24 Years of Experience & Trust")

// ── Group companies ──────────────────────────────────────────────────────────
// Six countries, eight entities (About › companies; the homepage map and Contact read the CMS).
// Phone and email per office are not in the document → null.
export const countries: Country[] = [
  { id: 'uae', name: 'United Arab Emirates', short: 'UAE', city: 'Dubai' },
  { id: 'india', name: 'India', short: 'India', city: 'Kochi, Kerala' },
  { id: 'singapore', name: 'Singapore', short: 'Singapore', city: 'Singapore' },
  { id: 'malaysia', name: 'Malaysia', short: 'Malaysia', city: 'Petaling Jaya' },
  { id: 'zambia', name: 'Zambia', short: 'Zambia', city: 'Lusaka' },
  { id: 'drc', name: 'Democratic Republic of the Congo', short: 'DR Congo', city: 'Kinshasa' },
];

export const entities: Entity[] = [
  {
    id: 'bmk-gulf',
    country: 'uae',
    name: 'BMK GULF FZE',
    kind: 'Headquarters & global logistics',
    city: 'Jebel Ali Free Zone, Dubai',
    role: 'Master distribution hub, global supply chain logistics, and regional partner for tier-one electronics (Samsung, LG, Canon, Nikon, Fujifilm, Sony, SanDisk, etc.).',
    address: 'Warehouse # RA08LB07, P.O. Box 261752, Jebel Ali Free Zone (JAFZA), Dubai, United Arab Emirates',
    phone: '+971 4 232 4747',
    email: 'info@bmkintl.com',
  },
  {
    id: 'island-valley',
    country: 'uae',
    name: 'Island Valley Electronics LLC',
    kind: 'Commercial trading & retail',
    city: 'Business Bay, Dubai',
    role: 'Founding commercial and retail arm; distributor of mobile phones, gaming accessories, audio/video solutions, and group brand products.',
    address: 'Westburry Business Tower 1, Business Bay, Dubai, United Arab Emirates',
    phone: null,
    email: null,
  },
  {
    id: 'bmk-international',
    country: 'india',
    name: 'BMK International',
    kind: 'Corporate office',
    city: 'Thrikkakara, Ernakulam, Kerala',
    role: 'Regional corporate entity & distributor for Samsung, Sujata, Prestige, Voltas, and Symphony in Kerala; manufacturer and distributor of Made-in-India SEEKEN Home and Kitchen Appliances.',
    address: '3/287, Unichira, Edappally Pukkattupady Road, Thrikkakara, Ernakulam, Kerala, India – 682021',
    phone: null,
    email: null,
  },
  {
    id: 'bhome',
    country: 'india',
    name: 'Bhome Appliances',
    kind: 'Retail showroom',
    retail: true,
    city: 'Thrikkakara, Ernakulam, Kerala',
    role: 'Dedicated multi-brand physical retail store offering Samsung, Sujata, Prestige, Voltas, Symphony, and SEEKEN appliances.',
    products: 'Samsung, Sujata, Prestige, Voltas, Symphony, SEEKEN Appliances and more',
    address: '3/288, Near St. Jude Church, Unichira, Thrikkakara, Ernakulam, Kerala, India – 682021',
    phone: null,
    email: null,
  },
  {
    id: 'bmk-electronics',
    country: 'singapore',
    name: 'BMK Electronics Pte Ltd',
    kind: 'Southeast Asia headquarters',
    city: 'Singapore',
    role: 'Southeast Asian corporate headquarters, product sourcing, and international trading.',
    address: '114 Lavender Street, CT Hub 2, #10-81, Singapore – 338729',
    phone: null,
    email: null,
  },
  {
    id: 'seeken-malaysia',
    country: 'malaysia',
    name: 'Seeken Electronics SDN. BHD.',
    kind: 'Regional office',
    city: 'Petaling Jaya, Selangor',
    role: 'Regional operations and nationwide distribution of SEEKEN consumer electronics, smartwatches, and audio products across Malaysia.',
    address: 'D-3A-05, Blk D, Oasis Square Ara Damansara, No. 2 Jalan PJU 1A/7A, 47301 Petaling Jaya, Selangor, Malaysia',
    phone: null,
    email: null,
  },
  {
    id: 'seeken-zambia',
    country: 'zambia',
    name: 'SEEKEN ELECTRONICS LIMITED',
    kind: 'Official Nikon distributor',
    city: 'Lusaka',
    role: 'Official distributor of Nikon cameras and camera accessories in Zambia; distributor of SEEKEN consumer electronics.',
    mandate: 'Official Distributor of Nikon Cameras & Accessories; SEEKEN Brand Products',
    address: 'Shop No. 17, Kavilamungu Business Centre, Mungwi Road, Lusaka, Zambia',
    phone: null,
    email: null,
  },
  {
    id: 'ets-hb',
    country: 'drc',
    name: 'ETS HB Trading & BMK Gulf',
    kind: 'Official Fujifilm distributor',
    city: 'Kinshasa',
    role: 'Official distributor of Fujifilm cameras and camera accessories in the DRC; distributor of SEEKEN consumer electronics.',
    mandate: 'Official Distributor of Fujifilm Cameras & Accessories; SEEKEN Brand Products',
    address: 'Shop B01, Galleries Leon, Croisement des Avenues Luambo et Colonel Ebeya, n° 218, Commune de la Gombe, Kinshasa, DRC',
    phone: null,
    email: null,
  },
];

export const entitiesIn = (countryId: string) => entities.filter((e) => e.country === countryId);

export const enquiryTypes: EnquiryType[] = [
  { type: 'Distribution Enquiry', title: 'Regional Distribution Partnerships', text: 'Partner with us for territory-wide wholesale distribution of SEEKEN and TEAM Appliances.' },
  { type: 'Dealership Enquiry', title: 'Authorised Retail Dealerships', text: 'Stock BMK Group brands and distributed electronics in your retail outlets.' },
  { type: 'Retail Sales Enquiry', title: 'Bulk & Corporate Orders', text: 'Request volume pricing, wholesale stock availability, and commercial quotes.' },
  { type: 'General Enquiry', title: 'General & Corporate Enquiries', text: 'Get in touch for corporate communications, media requests, supplier onboarding, or general questions.' },
];
