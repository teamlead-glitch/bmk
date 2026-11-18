@AGENTS.md

# BMK Group website: rules for Claude Code and developers

This repo is the Next.js front end of the BMK Group website, hosted on Vercel.
The approved design reference is the Vite repo `bmk` (preview https://bmkbyphitany.vercel.app). Visual changes must match it; don't redesign.

## Content
- Every page reads data through `@/lib/content` (`src/lib/content.ts`), which re-exports the two groups below. Never import `src/static/data/*` from pages.
- CMS API code lives in `src/lib/api/`, one file per function: `products.ts`, `product-listings.ts`, `brands-categories.ts`, `contact-settings.ts`, `faqs.ts`, `home-banner.ts`, `home-about.ts`, `about-page.ts`, `timeline.ts`, plus `server-api.ts` (`serverGet`: every read goes through it), `cms-fetch.ts` (`cmsGet`: cache, retries, last good copy), `cms-headers.ts`, `cms-mappers.ts`, `slug-redirect.ts`. Detail pages map the CMS `seo` block with `mapSeoToMetadata` (`src/lib/seo-mapper.ts`). Nothing in `src/lib/api/` imports from `src/static/`.
- The designer's static content (no endpoint yet) lives in `src/static/`: sample data in `static/data/`, its loaders (`company-content.ts`, `catalogue-content.ts`) and helpers. When an endpoint is ready, add the API file in `src/lib/api/`, keep the same return type, and delete the static part. Keep slimming: only the fields the UI shows go to client components.
- Only 404/410 from the CMS mean "not found". A CMS failure must never become a 404 (`CmsUnavailableError` → `error.tsx`).

## Caching
- Cache Components is OFF on purpose (`next.config.ts`): pages are prerendered/ISR, data cached with `unstable_cache`, cleared by `POST /api/revalidate/` (header `x-revalidate-secret`). The homepage's GSAP pins and Lenis also need routes to unmount on navigation.
- Never call `headers()`, `cookies()` or read `searchParams` in a page's normal path (it makes the page dynamic). URL filters are read in client components under `<Suspense>` (`CmsListingFromUrl`, `SearchListingFromUrl`, `ContactOfficesFromUrl`).
- `trailingSlash: true`: every URL ends with `/`, API routes included (`/api/search/?q=`).

## Structure
- Components are grouped by site section: `header/`, `footer/`, `common/` (shared UI), `enquiry/` (popup, forms), `home/` (one subfolder per section: `hero/`, `presence/`, `brands/`, `history/`), `catalogue/` (CMS listings), `search/`, `product/`, `about/`, `faq/`, `contact/`, `legal/`, `company/`.
- Elsewhere in `src/`: `types/` (one file per resource), `constants/` (page sizes, enquiry types, brand colour, config), `services/` (browser fetchers for this site's `/api/*` routes: `api.ts` returns `{ success, data, error }`, `list-api.ts` calls `/api/list/[kind]/`), `lib/api/` (CMS API), `lib/` (other helpers: routes, SEO, site URL, GTM, GSAP, HTML sanitising), `static/` (designer's static content).
- Server components render the markup; small client components own state and motion. Homepage motion components must stay in page order (pinned sections are measured top to bottom): `SmoothScroll` first, `HomeReveals` last.
- Styles live in `src/app/globals.css` (ported from the design). Keep class names in sync with the design repo. The catalogue navbar rules are scoped to `.site-nav`; the homepage navbar is animated by GSAP and must not get CSS transform transitions.

## How every change goes live
1. Branch from main (`fix/short-topic`), one topic per branch.
2. `npx tsc --noEmit`, `npm run lint` and `npm run build` must pass.
3. Open a pull request into main; check the Vercel preview on desktop and phone.
4. The owner merges. Merging into main deploys the live site.

## Never
- Never push directly to main or promote a non-main build to production.
- Never commit secrets: use Vercel environment variables.
- Never hard-code tracking scripts: all tags go through Google Tag Manager (`NEXT_PUBLIC_GTM_ID`).

## SEO rules that must not break
- `*.vercel.app` hosts stay noindex (header in `next.config.ts`); the live domain stays indexable.
- Canonical, og:url, sitemap and robots come from `NEXT_PUBLIC_SITE_URL` (`src/lib/site-url.ts`).
- One H1 per page in the server HTML. Search results stay noindex.
- Old-site redirects go in `src/constants/legacy-redirects.ts`, single hop.
