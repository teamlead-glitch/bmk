# Deployment

Host: Vercel. Merging into `main` deploys production; every pull request gets a preview URL.

## Environment variables

| Name | Where | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Production | Live domain for canonical URLs, sitemap, robots |
| `NEXT_PUBLIC_GTM_ID` | all | Google Tag Manager container (empty = no tracking) |
| `NEXT_PUBLIC_MEGA_MENU` | all | `categories` (default) or `brands` |
| `NEXT_PUBLIC_API_URI` | all | CMS API base (when the CMS is live) |
| `CMS_API_KEY` | server only | Frontend key header for the CMS |
| `CMS_REVALIDATE_SECONDS` | optional | CMS cache time (default 60 during development, 300 after) |
| `REVALIDATE_SECRET` | server only | Secret for `POST /api/revalidate/` |

## Before the first production deploy
1. Confirm the live domain and set `NEXT_PUBLIC_SITE_URL` (fallback in `src/lib/site-url.ts`).
2. Add the old site's URLs to `src/constants/legacy-redirects.ts` (single hop).
3. Review the `[csp]` log lines, then switch `Content-Security-Policy-Report-Only` to `Content-Security-Policy` in `next.config.ts`.

## When the CMS goes live
1. Set `NEXT_PUBLIC_API_URI`, `CMS_API_KEY`, `REVALIDATE_SECRET`.
2. Move the remaining static content (`src/static/company-content.ts`, `src/static/catalogue-content.ts`) to new files in `src/lib/api/` that use `cmsGet(...)`, keeping the same return types.
3. Ask the CMS team to call `POST {site}/api/revalidate/` (header `x-revalidate-secret`) after every save; body `{ "tag": "cms:/product/{slug}" }` clears one record, `{}` clears everything.

## Rollback
In Vercel → Deployments, promote the last good `main` deployment, then fix forward on a branch.
