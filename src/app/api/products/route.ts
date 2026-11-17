import { NextRequest, NextResponse } from 'next/server';
import { LISTING_PAGE_SIZE, MAX_LISTING_PAGES } from '@/constants/listing';
import { getProducts, isSlug } from '@/lib/content';
import type { ProductSort } from '@/types/listing';

/* ---------- PRODUCT PAGES FOR THE LISTINGS (All products, category pages) ---------- */
// GET /api/products/?category=a,b&brand=c,d&sort=latest|name_asc|name_desc&page=2
// The browser calls this when filters, sort or the next page change; it reads the CMS
// (GET /v1/products) through the shared cache in src/lib/api/products.ts.
const SORTS: ProductSort[] = ['latest', 'name_asc', 'name_desc'];
const MAX_SLUGS = 20;

/** "a,b" -> ["a","b"]; null when there are too many or one isn't a slug */
const slugs = (v: string | null) => {
  const out = (v || '').split(',').map((s) => s.trim()).filter(Boolean);
  return out.length <= MAX_SLUGS && out.every(isSlug) ? out : null;
};

const bad = (message: string) => NextResponse.json({ error: message }, { status: 400, headers: { 'Cache-Control': 'no-store' } });

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams;
  const categories = slugs(q.get('category'));
  if (!categories) return bad('invalid category');
  const brands = slugs(q.get('brand'));
  if (!brands) return bad('invalid brand');

  const sort = (q.get('sort') || 'latest') as ProductSort;
  if (!SORTS.includes(sort)) return bad('invalid sort');

  const page = Number(q.get('page') || '1');
  if (!Number.isInteger(page) || page < 1 || page > MAX_LISTING_PAGES) return bad('invalid page');

  try {
    const body = await getProducts({ category: [...categories].sort().join(',') || undefined, brands, sort, page, perPage: LISTING_PAGE_SIZE });
    return NextResponse.json(body, { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } });
  } catch (error) {
    if ((error as { digest?: string })?.digest === 'DYNAMIC_SERVER_USAGE') throw error;
    console.error('[products] CMS unavailable:', (error as Error)?.message);
    return NextResponse.json({ error: 'unavailable' }, { status: 502, headers: { 'Cache-Control': 'no-store' } });
  }
}
