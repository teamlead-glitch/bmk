import { NextRequest, NextResponse } from 'next/server';
import { normalizeQuery, searchCatalogue } from '@/lib/content';

/* ---------- CATALOGUE SEARCH FOR THE BROWSER ---------- */
// GET /api/search/?q=nik → { products, brands, categories }: every match from the CMS
// (GET /v1/search, through the shared cache). Used by the navbar search panel (first few
// products + "See all N") and the search page (all results, filtered and sorted in the
// browser). Under 2 characters → empty lists, the CMS is not called. Edge-cached a minute.

export async function GET(request: NextRequest) {
  const q = normalizeQuery(request.nextUrl.searchParams.get('q') || '');
  try {
    const body = await searchCatalogue(q);
    return NextResponse.json(body, { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=600' } });
  } catch (error) {
    if ((error as { digest?: string })?.digest === 'DYNAMIC_SERVER_USAGE') throw error;
    console.error('[search] CMS unavailable:', (error as Error)?.message);
    return NextResponse.json({ error: 'unavailable' }, { status: 502, headers: { 'Cache-Control': 'no-store' } });
  }
}
