import { NextResponse } from 'next/server';
import { getSitemapXml, SITEMAP_REVALIDATE_SECONDS } from '@/lib/content';

/* ---------- SITEMAP ---------- */
// /sitemap.xml = the CMS sitemap (GET /v1/sitemap.xml), served exactly as the CMS returns it:
// URLs, lastmod and priority are all set in the admin, nothing is added here. Cached like every
// CMS read and cleared by POST /api/revalidate/; last good copy when the CMS is down; 503 with
// Retry-After (never a made-up sitemap) when nothing is available.
export async function GET() {
  const xml = await getSitemapXml();
  if (!xml) {
    return new NextResponse('Sitemap temporarily unavailable', {
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Retry-After': '600', 'Cache-Control': 'no-store' },
    });
  }
  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': `public, s-maxage=${SITEMAP_REVALIDATE_SECONDS}, stale-while-revalidate=86400`,
    },
  });
}
