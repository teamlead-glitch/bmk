import { NextRequest, NextResponse } from 'next/server';
import { getEnquiryBrands, getEnquiryCountries } from '@/lib/content';

/* ---------- ENQUIRY FORM OPTIONS (browser) ---------- */
// GET /api/enquiry/options/             { countries: [{ id, code, name }] }
// GET /api/enquiry/options/?country=IN  { brands: [{ id, name }] }   (brands linked to that country)
// Data comes from the CMS through the shared cache. Browser helpers: src/services/enquiry.ts.

const CACHE = { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' };

export async function GET(request: NextRequest) {
  const country = (request.nextUrl.searchParams.get('country') || '').trim().toUpperCase();
  if (country && !/^[A-Z]{2}$/.test(country)) return NextResponse.json({ error: 'invalid country' }, { status: 400, headers: { 'Cache-Control': 'no-store' } });
  try {
    const body = country ? { brands: await getEnquiryBrands(country) } : { countries: await getEnquiryCountries() };
    return NextResponse.json(body, { headers: CACHE });
  } catch (error) {
    if ((error as { digest?: string })?.digest === 'DYNAMIC_SERVER_USAGE') throw error;
    console.error('[enquiry options] CMS unavailable:', (error as Error)?.message);
    return NextResponse.json({ error: 'unavailable' }, { status: 502, headers: { 'Cache-Control': 'no-store' } });
  }
}
