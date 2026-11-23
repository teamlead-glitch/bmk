import { NextRequest, NextResponse } from 'next/server';
import { isLegacySlugPath, resolveLegacyRedirect } from '@/constants/legacy-redirects';

/* ---------- 410 GONE FOR OLD SPAM / JUNK URLS ---------- */
const GONE_PATTERNS: RegExp[] = [
  // e.g. /^\/(wp-admin|wp-login\.php)/i,
];

const gone = () =>
  new NextResponse('410 Gone - this page has been permanently removed.', {
    status: 410,
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'X-Robots-Tag': 'noindex', 'Cache-Control': 'public, max-age=86400' },
  });

/* ---------- CMS PREVIEW (?preview={token} from the admin) ---------- */
// /{slug}/?preview={token} is rewritten to the internal route /cms-preview/{slug}/{token}/, which
// passes the token to the CMS and is rendered fresh on every request; /{slug}/ itself stays
// static (ISR). Any URL with ?preview gets X-Robots-Tag: noindex. The internal route is not a
// public URL: direct visits answer 404.
const PREVIEW_ROUTE = '/cms-preview/';
const CMS_PAGE_PATH = /^\/([a-z0-9-]+)\/?$/;
// The site's own one-segment routes (src/app/(site)/*): they win over a CMS page with that slug
const SITE_ROUTES = new Set(['about-us', 'contact-us', 'faqs', 'products', 'search', 'brand', 'category', 'product', 'cms-preview']);
const noindex = { 'X-Robots-Tag': 'noindex, nofollow', 'Cache-Control': 'private, no-store' };

function preview(request: NextRequest): NextResponse | null {
  const { pathname, searchParams } = request.nextUrl;
  if (!searchParams.has('preview')) return null;

  const token = searchParams.get('preview')?.trim();
  const slug = CMS_PAGE_PATH.exec(pathname)?.[1];
  if (token && slug && !SITE_ROUTES.has(slug)) {
    const url = request.nextUrl.clone();
    url.pathname = `${PREVIEW_ROUTE}${slug}/${encodeURIComponent(token)}/`;
    url.search = '';
    return NextResponse.rewrite(url, { headers: noindex });
  }
  // Other pages have no preview yet: shown as usual, but not indexed
  return NextResponse.next({ headers: noindex });
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (GONE_PATTERNS.some((p) => p.test(pathname))) return gone();

  // The preview route is only reached through the rewrite below, never directly
  if (pathname.toLowerCase().startsWith(PREVIEW_ROUTE)) {
    return new NextResponse('404 Not Found', { status: 404, headers: { 'Content-Type': 'text/plain; charset=utf-8', ...noindex } });
  }

  const lowerPath = pathname.toLowerCase();

  // Old URLs (and old URLs with capitals) go to the final page in ONE 301
  if (pathname !== lowerPath || isLegacySlugPath(lowerPath)) {
    const legacy = resolveLegacyRedirect(lowerPath);
    if (legacy) {
      const url = request.nextUrl.clone();
      url.pathname = legacy;
      return NextResponse.redirect(url, 301);
    }
  }

  if (pathname === lowerPath) return preview(request) ?? NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = lowerPath;
  return NextResponse.redirect(url, 301);
}

export const config = {
  // Pages only: not the API, Next's files or anything with a file extension
  matcher: ['/((?!api|_next/static|_next/image|.*\\..*).*)'],
};
