/* ---------- CONTENT LAYER (the one place pages get their data) ---------- */
// Pages and components import from '@/lib/content' only (never src/data/* directly).
// One file per resource:
//   cms.ts               mapping helpers for CMS answers
//   catalogue.ts         CMS products, listings (All products, category, brand) and product pages
//   contact.ts           site contact details (CMS settings/contact)
//   faq.ts               FAQ (CMS)
//   home.ts              homepage hero (CMS settings/home-banner)
//   company.ts           company content (design sample data, no endpoint yet)
//   static-catalogue.ts  navbar menus and search (design sample data until they move to the CMS)
// CMS reads go through cmsGet (src/lib/cms-fetch.ts): shared cache, retries, last good copy.
// Functions are wrapped in React cache() so generateMetadata and the page share one call.

export * from '@/lib/content/catalogue';
export { isSlug } from '@/lib/content/cms';
export * from '@/lib/content/company';
export * from '@/lib/content/contact';
export * from '@/lib/content/faq';
export * from '@/lib/content/home';
export * from '@/lib/content/static-catalogue';
