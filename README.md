# BMK Group website (Next.js)

Production front end of the BMK Group website, built from the approved design reference (the Vite repo `bmk`, live preview https://bmkbyphitany.vercel.app). Markup, styles, motion and copy follow that reference; this repo adds routing, SEO, caching and the CMS-ready data layer.

Pages get their data through one entry point, `src/lib/content.ts`. CMS API code lives in `src/lib/api/` (products, listings, contact, FAQ, home banner); the designer's static content that has no endpoint yet lives in `src/static/` (sample data in `src/static/data/`).

## Run it

Requires Node 20+.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build (all pages prerendered)
npm run start      # serve the build
npx tsc --noEmit   # type check
npm run lint
```

Copy `.env.example` to `.env.local` for local settings (all optional today).

## Pages

| URL | Page | Files |
| --- | --- | --- |
| `/` | Homepage | `src/app/(home)/page.tsx`, `src/components/home/*` |
| `/about/` | About Us (globe, companies, brands, journey) | `src/app/(site)/about`, `src/components/about/*` |
| `/products/` | All products | `src/app/(site)/products`, `src/components/catalogue/*` |
| `/category/{group-or-category}/` | Group or category listing | `src/app/(site)/category/[id]` |
| `/brand/{id}/` | Partner brand page (SEEKEN and TEAM link to their own sites) | `src/app/(site)/brand/[id]` |
| `/product/{slug}/` | Product detail | `src/app/(site)/product/[slug]`, `src/components/product/*` |
| `/search/?q=` | Search results (noindex) | `src/app/(site)/search` |
| `/faq/`, `/contact/` | FAQ, Contact Us | `src/components/faq/*`, `src/components/contact/*` |
| `/privacy/`, `/cookies/`, `/terms/` | Legal pages (placeholder wording) | `src/components/legal/*`, `src/static/data/legal.ts` |
| anything else | 404 (the 4/0 wall) | `src/app/not-found.tsx` |

Listing filters, sort and paging live in the URL (`?brand=nikon&cat=lenses-optics&sort=az&page=2`). The unfiltered first page is in the static HTML; the browser applies the URL's filters.

## Structure

```
src/
  app/
    layout.tsx               root: font, GTM, js-motion flag, enquiry popup provider
    globals.css              design tokens + all styles (ported from the design repo)
    (home)/                  homepage + its layout (glass navbar, inline mobile menu)
    (site)/                  every other page + layout (floating navbar, drawer, footer)
      template.tsx           page fade-in on navigation
    not-found.tsx, error.tsx 404 wall, "couldn't load" (5xx)
    robots.ts, sitemap.ts    from the content layer (CMS categories, brands, products)
    api/list/[kind]          list pages for the browser (products: infinite scroll, filters, sort)
    api/enquiry              contact form + enquiry popup -> CMS POST /v1/enquiries
    api/search               search suggestions for the navbar panel
    api/revalidate           CMS cache clear after a save (secret header)
    api/csp-report           CSP violation logs
  components/
    header/  footer/         navbars, mega menu, search panel, catalogue menu; footer
    common/                  shared UI: arrows, stage, product card, crumbs, pill bar…
    enquiry/                 enquiry popup, enquiry block, form submit hook
    home/                    homepage sections (hero/, presence/, brands/, history/) + motion
    catalogue/               CMS listings: All products, category, brand (filters, heroes)
    search/                  search results (static catalogue)
    product/                 gallery + lightbox, summary, section bar, overview, specs, strips
    about/ faq/ contact/ legal/ company/   page sections
  lib/
    content.ts               the one import point for page data (re-exports api/ + static/)
    api/                     CMS API: products, product-listings, brands-categories,
                             contact-settings, faqs, home-banner; server-api (serverGet),
                             cms-fetch (cache/retry/last-good), slug-redirect, cms-mappers
    seo.ts, seo-mapper.ts    page metadata; CMS seo block -> metadata (canonical on this site)
    site-url.ts, routes.ts   site address, URLs; sanitize-html.ts (CMS rich text)
    gsap.ts, gtm.ts
  services/                  browser fetchers: api.ts ({ success, data, error }), list-api.ts, enquiry.ts
  static/                    designer's static content without a CMS endpoint yet (data/ + loaders)
  constants/                 config (env), listing sizes, enquiry types, brand colour, redirects
  types/                     one file per resource + common.ts (ApiResponse, CMS seo)
  proxy.ts                   lowercase URLs, legacy redirects, 410s
public/                      design assets, map/globe dot data
```

## Design notes carried over

- **Forms** (enquiry popup, contact form) post to the CMS through `/api/enquiry/`. Retail Sales and General types still need the CMS values confirmed (`src/constants/enquiry.ts`).
- **Office maps** are placeholders until BMK supplies Google Maps embeds. Social links come from the CMS contact settings.
- **Motion:** GSAP (ScrollTrigger, SplitText, Flip, Draggable, Inertia) and Lenis on the homepage; everything respects `prefers-reduced-motion`. Don't put a CSS `transition` on `transform` for elements GSAP animates.

See `CLAUDE.md` for working rules and `docs/DEPLOYMENT.md` for going live.
