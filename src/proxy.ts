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

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (GONE_PATTERNS.some((p) => p.test(pathname))) return gone();

  // CMS preview link (?token=...) -> /api/preview (draft mode), then back to the clean URL
  const previewToken = request.nextUrl.searchParams.get('token');
  if (previewToken) {
    const rest = new URLSearchParams(request.nextUrl.searchParams);
    rest.delete('token');
    const query = rest.toString();
    const url = request.nextUrl.clone();
    url.pathname = '/api/preview';
    url.search = '';
    url.searchParams.set('token', previewToken);
    url.searchParams.set('path', `${pathname.toLowerCase()}${query ? `?${query}` : ''}`);
    return NextResponse.redirect(url, 307);
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

  if (pathname === lowerPath) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = lowerPath;
  return NextResponse.redirect(url, 301);
}

export const config = {
  // Pages only: not the API, Next's files or anything with a file extension
  matcher: ['/((?!api|_next/static|_next/image|.*\\..*).*)'],
};
