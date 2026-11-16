@AGENTS.md

# BMK Group website: rules for Claude Code and developers

This repo is the Next.js front end of the BMK Group website, hosted on Vercel.
The approved design reference is the Vite repo `bmk` (preview https://bmkbyphitany.vercel.app). Visual changes must match it; don't redesign.

## Content
- Every page reads data through `src/lib/content.ts`. Never import `src/data/*` from pages or components.
- Today `content.ts` returns the design's sample data. When the CMS API is ready, replace each function body with `cmsGet(...)` (`src/lib/cms-fetch.ts`) and map the answer to the same return type. Keep slimming: only the fields the UI shows go to client components.
- Only 404/410 from the CMS mean "not found". A CMS failure must never become a 404 (`CmsUnavailableError` → `error.tsx`).

## Caching
- Cache Components is OFF on purpose (`next.config.ts`): pages are prerendered/ISR, data cached with `unstable_cache`, cleared by `POST /api/revalidate/` (header `x-revalidate-secret`). The homepage's GSAP pins and Lenis also need routes to unmount on navigation.
- Never call `headers()`, `cookies()` or read `searchParams` in a page's normal path (it makes the page dynamic). URL filters are read in client components under `<Suspense>` (`ListingFromUrl`, `ContactOfficesFromUrl`).
- `trailingSlash: true`: every URL ends with `/`, API routes included (`/api/search/?q=`).

## Structure
- Components are grouped by area: `layout/`, `common/`, `home/`, `catalogue/`, `product/`, `about/`, `faq/`, `contact/`, `legal/`, `company/`.
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
