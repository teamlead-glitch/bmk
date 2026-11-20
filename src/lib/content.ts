/* ---------- CONTENT LAYER (the one place pages get their data) ---------- */
// Pages and components import page data from '@/lib/content' only. It re-exports:
//
// CMS API (src/lib/api/), read through cmsGet (cms-fetch.ts: shared cache, retries, last good copy)
//   about-page.ts          About page text, mission, vision, core values (settings/about/page)
//   products.ts            product pages, one page of products (listings, /api/list/products/)
//   product-listings.ts    All products, category and brand pages (filters, tabs, first page)
//   brands-categories.ts   brand and category lists (filters, slugs for the build and sitemap)
//   brand-showcase.ts      homepage Associated Brands + Our Brands, About "Our brands"
//   contact-settings.ts    site contact details (settings/contact)
//   enquiry-options.ts     enquiry forms: countries and each country's brands (/api/enquiry/options/)
//   faqs.ts                FAQ
//   group-locations.ts     homepage Global Footprint: map pins and their companies (group-locations)
//   home-banner.ts         homepage hero (settings/home-banner)
//   navigation.ts          mega menu, mobile menu, footer and search panel links
//   pages.ts               CMS pages: Privacy, Cookies, Terms (pages/{slug})
//   search.ts              catalogue search: search panel and search page (search?q=, via /api/search/)
//   home-about.ts          homepage About BMK Group (settings/about/home)
//   timeline.ts            homepage Our Journey, About › Our journey (timeline-events)
//
// Designer's static content (src/static/), until these get a CMS endpoint
//   company-content.ts     company and offices (static/data/company.ts)
//
// Functions are wrapped in React cache() so generateMetadata and the page share one call.

export * from '@/lib/api/about-page';
export * from '@/lib/api/brand-showcase';
export { getBrandSeo, getBrandSlugs, getCategorySlugs } from '@/lib/api/brands-categories';
export { isSlug } from '@/lib/api/cms-mappers';
export * from '@/lib/api/contact-settings';
export * from '@/lib/api/enquiry-options';
export * from '@/lib/api/faqs';
export * from '@/lib/api/group-locations';
export * from '@/lib/api/home-about';
export * from '@/lib/api/home-banner';
export * from '@/lib/api/navigation';
export * from '@/lib/api/pages';
export * from '@/lib/api/product-listings';
export * from '@/lib/api/products';
export * from '@/lib/api/search';
export * from '@/lib/api/timeline';
export * from '@/static/company-content';
