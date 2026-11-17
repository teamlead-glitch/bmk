import { NextRequest, NextResponse } from 'next/server';
import { CATEGORY_PAGE_SIZE, getProducts, isSlug } from '@/lib/content';
import type { ProductSort } from '@/types/catalogue';

/* ---------- PRODUCT PAGES FOR THE CATEGORY LISTING ---------- */
// GET /api/products/?category=slug&brand=a,b&sort=latest|name_asc|name_desc&page=2
// The browser calls this when filters, sort or "Load more" change; it reads the CMS
// (GET /v1/products) through the shared cache in src/lib/content.ts.
const SORTS: ProductSort[] = ['latest', 'name_asc', 'name_desc'];
const MAX_PAGE = 100;
const MAX_BRANDS = 20;

const bad = (message: string) => NextResponse.json({ error: message }, { status: 400, headers: { 'Cache-Control': 'no-store' } });

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams;
  const category = (q.get('category') || '').trim();
  if (!isSlug(category)) return bad('category is required');

  const brands = (q.get('brand') || '').split(',').map((b) => b.trim()).filter(Boolean);
  if (brands.length > MAX_BRANDS || !brands.every(isSlug)) return bad('invalid brand');

  const sort = (q.get('sort') || 'latest') as ProductSort;
  if (!SORTS.includes(sort)) return bad('invalid sort');

  const page = Number(q.get('page') || '1');
  if (!Number.isInteger(page) || page < 1 || page > MAX_PAGE) return bad('invalid page');

  try {
    const body = await getProducts({ category, brands, sort, page, perPage: CATEGORY_PAGE_SIZE });
    return NextResponse.json(body, { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } });
  } catch (error) {
    if ((error as { digest?: string })?.digest === 'DYNAMIC_SERVER_USAGE') throw error;
    console.error('[products] CMS unavailable:', (error as Error)?.message);
    return NextResponse.json({ error: 'unavailable' }, { status: 502, headers: { 'Cache-Control': 'no-store' } });
  }
}
