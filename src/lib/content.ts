/* ---------- CONTENT LAYER (the one place pages get their data) ---------- */
// Pages and components import page data from '@/lib/content' only. It re-exports:
//
// CMS API (src/lib/api/), read through cmsGet (cms-fetch.ts: shared cache, retries, last good copy)
//   products.ts            product pages, one page of products (listings, /api/list/products/)
//   product-listings.ts    All products, category and brand pages (filters, tabs, first page)
//   brands-categories.ts   brand and category lists (filters, slugs for the build and sitemap)
//   brand-showcase.ts      homepage Associated Brands + Our Brands, About "Our brands"
//   contact-settings.ts    site contact details (settings/contact)
//   faqs.ts                FAQ
//   home-banner.ts         homepage hero (settings/home-banner)
//
// Designer's static content (src/static/), until these get a CMS endpoint
//   company-content.ts     company, offices, timeline (static/data/company.ts)
//   catalogue-content.ts   navbar menus and search (static/data/catalogue.ts)
//
// Functions are wrapped in React cache() so generateMetadata and the page share one call.

export * from '@/lib/api/brand-showcase';
export { getBrandSeo, getBrandSlugs, getCategorySlugs } from '@/lib/api/brands-categories';
export { isSlug } from '@/lib/api/cms-mappers';
export * from '@/lib/api/contact-settings';
export * from '@/lib/api/faqs';
export * from '@/lib/api/home-banner';
export * from '@/lib/api/product-listings';
export * from '@/lib/api/products';
export * from '@/static/catalogue-content';
export * from '@/static/company-content';
