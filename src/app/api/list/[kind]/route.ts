import { NextRequest, NextResponse } from 'next/server';
import { LISTING_PAGE_SIZE, MAX_LISTING_PAGES } from '@/constants/listing';
import { getProducts, isSlug } from '@/lib/content';
import type { ProductSort } from '@/types/listing';

/* ---------- LIST PAGES FOR THE BROWSER (infinite scroll, filters, sort) ---------- */
// GET /api/list/{kind}/?…  Whitelisted kinds and params; answers are slim and cached at the
// edge for a minute. The data comes from the CMS through the shared cache (src/lib/api/).
// Browser helper: listGet(kind, params) in src/services/list-api.ts.
//
//   products  ?category=a,b&brand=c,d&sort=latest|name_asc|name_desc&page=2   (GET /v1/products)

const SORTS: ProductSort[] = ['latest', 'name_asc', 'name_desc'];
const MAX_SLUGS = 20;

/** "a,b" -> ["a","b"]; null when there are too many or one isn't a slug */
const slugs = (v: string | null) => {
  const out = (v || '').split(',').map((s) => s.trim()).filter(Boolean);
  return out.length <= MAX_SLUGS && out.every(isSlug) ? out : null;
};

const bad = (message: string, status = 400) => NextResponse.json({ error: message }, { status, headers: { 'Cache-Control': 'no-store' } });

/** One handler per list kind: read and check the query, return the slim page */
const KINDS: Record<string, (q: URLSearchParams) => Promise<NextResponse>> = {
  async products(q) {
    const categories = slugs(q.get('category'));
    if (!categories) return bad('invalid category');
    const brands = slugs(q.get('brand'));
    if (!brands) return bad('invalid brand');
    const sort = (q.get('sort') || 'latest') as ProductSort;
    if (!SORTS.includes(sort)) return bad('invalid sort');
    const page = Number(q.get('page') || '1');
    if (!Number.isInteger(page) || page < 1 || page > MAX_LISTING_PAGES) return bad('invalid page');

    const body = await getProducts({ category: [...categories].sort().join(',') || undefined, brands, sort, page, perPage: LISTING_PAGE_SIZE });
    return NextResponse.json(body, { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } });
  },
};

export async function GET(request: NextRequest, { params }: { params: Promise<{ kind: string }> }) {
  const { kind } = await params;
  const handler = Object.hasOwn(KINDS, kind) ? KINDS[kind] : undefined;
  if (!handler) return bad('unknown list', 404);
  try {
    return await handler(request.nextUrl.searchParams);
  } catch (error) {
    if ((error as { digest?: string })?.digest === 'DYNAMIC_SERVER_USAGE') throw error;
    console.error(`[list] ${kind}: CMS unavailable:`, (error as Error)?.message);
    return NextResponse.json({ error: 'unavailable' }, { status: 502, headers: { 'Cache-Control': 'no-store' } });
  }
}
