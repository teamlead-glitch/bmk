# BMK Group website (Next.js)

Production front end of the BMK Group website, built from the approved design reference (the Vite repo `bmk`, live preview https://bmkbyphitany.vercel.app). Markup, styles, motion and copy follow that reference; this repo adds routing, SEO, caching and the CMS-ready data layer.

Content currently comes from the design's sample data (`src/data/`). The CMS API is wired in later through one file: `src/lib/content.ts`.

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
| `/privacy/`, `/cookies/`, `/terms/` | Legal pages (placeholder wording) | `src/components/legal/*`, `src/data/legal.ts` |
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
    robots.ts, sitemap.ts    from the content layer
    api/search               search suggestions for the navbar panel
    api/revalidate, preview  CMS cache clear + preview (ready for the CMS)
    api/csp-report           CSP violation logs
  components/
    layout/                  navbars, mega menu (both designs), search panel, catalogue menu, footer
    common/                  shared UI: buttons/arrows, stage, product card, crumbs, pill bar, enquiry popup…
    home/                    one file per homepage section + its motion (GSAP, Lenis)
    catalogue/               listing (filters, sort, sheet, heroes, empty states)
    product/                 gallery + lightbox, summary, section bar, overview, specs, strips
    about/ faq/ contact/ legal/ company/   page sections
  data/                      sample content from the design (CMS replaces it)
  lib/
    content.ts               THE content layer: every page reads data here
    catalogue.ts, search.ts  catalogue rules (templates, highlights, search)
    cms-fetch.ts, server-api.ts, preview.ts   CMS fetch with cache/retry/last-good copy
    seo.ts, site-url.ts      metadata, canonical, JSON-LD
    gsap.ts, gtm.ts, routes.ts
  constants/                 config (env), site settings, legacy redirects
  types/                     catalogue + company types
  proxy.ts                   preview hand-off, lowercase URLs, legacy redirects, 410s
public/                      design assets, hero video, map/globe dot data
```

## Design notes carried over

- **Mega menu:** two designs exist and the client has not chosen. Default is "categories"; set `NEXT_PUBLIC_MEGA_MENU=brands` for the brands-only design (`src/constants/site.ts`).
- **Forms** (enquiry popup, contact form) show the success state only. Wire them to the CMS enquiry endpoint (see `TODO(back end)` in `EnquiryProvider.tsx` and `ContactForm.tsx`).
- **Social links** are `#` and office maps are placeholders until BMK supplies URLs and Google Maps embeds.
- **Motion:** GSAP (ScrollTrigger, SplitText, Flip, Draggable, Inertia) and Lenis on the homepage; everything respects `prefers-reduced-motion`. Don't put a CSS `transition` on `transform` for elements GSAP animates.

See `CLAUDE.md` for working rules and `docs/DEPLOYMENT.md` for going live.
