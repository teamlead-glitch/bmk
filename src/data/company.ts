import type { Country, CoreValue, Entity, EnquiryType, Milestone } from '@/types/company';

// Company content (from the design reference; the CMS replaces it).
// Read it through src/lib/content.ts, never directly from pages.
// Source: the client's document "BMK_WEBSITE_INFO_21.10.2026" (shared 22 Oct 2026),
// with the agency's decisions of 22 Oct (24 years, latest phone number, PIN 682021,
// "-Dr" dropped from the Malaysian entity name). Anything the document doesn't
// cover is `null` and renders as "to be confirmed" — nothing is carried over from
// the earlier placeholder copy.

export const FOUNDED = 2002;
export const YEARS = 24; // agreed figure for the homepage ("24 Years of Experience & Trust")

export const intro = {
  heading: 'Built on trust. Driven by innovation.',
  // Full About text (About page)
  paragraphs: [
    'BMK Group has been a trusted leader and driving force across the UAE and international consumer electronics landscape since 2002. Originating as Island Valley Electronics LLC, a dedicated trading firm, BMK Group has evolved into a dynamic, diversified global enterprise specializing in global sourcing, authorized tier-one brand distribution, regional wholesale trade, dedicated retail showrooms, and original product manufacturing.',
    'In addition to serving as official regional distributors and channel partners for premier global names — including Nikon, Canon, Fujifilm, Sony, Samsung, LG, Sujata, Prestige, Voltas, Symphony, and SanDisk — BMK Group develops and markets proprietary technology and home living solutions through its two core in-house brands, SEEKEN and TEAM Appliances.',
    'Today, BMK Group operates an integrated network of corporate entities, retail outlets, and distribution hubs across six core markets: the United Arab Emirates, Singapore, Malaysia, Zambia, the Democratic Republic of the Congo, and India.',
  ],
  // Shortened for the homepage About block (sentences from the document, trimmed)
  short: [
    'BMK Group has been a trusted leader across the UAE and international consumer electronics landscape since 2002. Originating as Island Valley Electronics LLC, it has evolved into a diversified global enterprise: global sourcing, authorized tier-one brand distribution, regional wholesale trade, retail showrooms and original product manufacturing.',
    'Today the group operates corporate entities, retail outlets and distribution hubs across six markets: the UAE, Singapore, Malaysia, Zambia, the DR Congo and India.',
  ],
};

export const mission = 'To create and distribute technologically advanced products that seamlessly integrate into customers’ lives, delivering uncompromising quality and enduring performance.';
export const vision = 'To build a global legacy of excellence in consumer electronics and home appliances, anchored in integrity, adaptability, and a customer-centric focus.';
export const values: CoreValue[] = [
  { name: 'Integrity', text: 'Conducting business transparently and ethically across all international partnerships.' },
  { name: 'Customer-Centric', text: 'Prioritizing consumer lifestyle demands and reliable post-purchase support.' },
  { name: 'Quality-Driven', text: 'Upholding rigorous standards in product durability, compliance, and performance.' },
  { name: 'Innovation-Focused', text: 'Embracing emerging tech, agile distribution models, and intuitive product development.' },
];

// ── Group companies ──────────────────────────────────────────────────────────
// Six countries, eight entities. Map pins are per country (x / y = % of the
// world map frame, rough positions; the design sets them).
// Phone and email per office are not in the document → null.
export const countries: Country[] = [
  { id: 'uae', name: 'United Arab Emirates', short: 'UAE', city: 'Dubai', region: 'Middle East', x: 60.4, y: 47.1 },
  { id: 'india', name: 'India', short: 'India', city: 'Kochi, Kerala', region: 'South Asia', x: 68.6, y: 58.2 },
  { id: 'singapore', name: 'Singapore', short: 'Singapore', city: 'Singapore', region: 'Southeast Asia', x: 77.3, y: 62.7 },
  { id: 'malaysia', name: 'Malaysia', short: 'Malaysia', city: 'Petaling Jaya', region: 'Southeast Asia', x: 75.6, y: 59.8 },
  { id: 'zambia', name: 'Zambia', short: 'Zambia', city: 'Lusaka', region: 'Africa', x: 55.4, y: 72.6 },
  { id: 'drc', name: 'Democratic Republic of the Congo', short: 'DR Congo', city: 'Kinshasa', region: 'Africa', x: 52.6, y: 65.4 },
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
export const regions = [...new Set(countries.map((c) => c.region))];

// ── Timeline ─────────────────────────────────────────────────────────────────
export const milestones: Milestone[] = [
  { year: '2002', title: 'Origins & Early Success', points: ['BMK Group begins operations with the founding of Island Valley Electronics LLC in Dubai, UAE, specializing in consumer electronics import and export.'] },
  { year: '2004', title: 'Portfolio Diversification', points: ['Expands wholesale and retail portfolios to include digital imaging and cameras, broadening market footprint across regional channels.'] },
  {
    year: '2010',
    title: 'International Expansion & Distribution Hubs',
    points: [
      'Establishes BMK GULF FZE in Jebel Ali Free Zone (JAFZA), Dubai, to scale regional warehousing and logistics.',
      'Incorporates BMK Electronics Pte Ltd in Singapore, securing BMK’s gateway into Southeast Asian markets.',
      'Establishes long-term regional distribution relationships with global tech leaders including Samsung, LG, Canon, Fujifilm, Nikon, Sharp, Sony, and SanDisk.',
    ],
  },
  { year: '2013', title: 'Launch of SEEKEN', points: ['Ventures into original consumer technology with the launch of flagship brand SEEKEN in Singapore.', 'Debuts its first proprietary device, the ST100 tablet.'] },
  {
    year: '2018',
    title: 'Pan-African & Southeast Asian Expansion',
    points: [
      'Scales international distribution into Africa and Southeast Asia.',
      'Secures official Fujifilm camera and accessories distribution in the Democratic Republic of the Congo.',
      'Secures official Nikon camera and accessories distribution in Zambia via SEEKEN ELECTRONICS LIMITED.',
      'Expands SEEKEN across the Middle East, Southeast Asia, and Africa.',
    ],
  },
  { year: '2022', title: 'Wearables & Premium Segments', points: ['SEEKEN expands into premium smartwatches and advanced audio peripherals.'] },
  { year: '2023', title: 'Acquisition of TEAM Appliances', points: ['BMK Group broadens its lifestyle portfolio into domestic living by acquiring home appliance brand TEAM Appliances.'] },
  {
    year: 'Present',
    title: 'Global Distribution, Indian Expansion & Retail',
    points: [
      'Operates BMK International in Kerala, India, distributing premier brands (Samsung, Sujata, Prestige, Voltas, Symphony) and manufacturing the Made-in-India SEEKEN Home and Kitchen Appliances line.',
      'Launches dedicated physical retail experience via Bhome Appliances in Kochi, Kerala.',
      'Sustains direct corporate entities, authorized distributorships, and retail operations spanning the UAE, Singapore, Malaysia, Zambia, the DRC, and India.',
    ],
  },
];

export const enquiryTypes: EnquiryType[] = [
  { type: 'Distribution Enquiry', title: 'Good business starts with the right connection', text: 'Enquire about becoming a distribution partner for BMK Group brands.' },
  { type: 'Dealership Enquiry', title: 'Let’s build something valuable together.', text: 'Apply to become an authorised dealer for one or more BMK brands.' },
  { type: 'Retail Sales Enquiry', title: 'Connect with BMK. Grow with confidence.', text: 'Enquire about retail supply, pricing, and product availability.' },
  { type: 'General Enquiry', title: 'Your next opportunity starts here.', text: 'All other enquiries - partnerships, corporate, media, and more.' },
];
