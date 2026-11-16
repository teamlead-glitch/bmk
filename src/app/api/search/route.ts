import { NextRequest, NextResponse } from 'next/server';
import { getSearchIndex } from '@/lib/content';
import { searchBrands, searchCategories, searchProducts, type SearchSuggestions } from '@/lib/search';

/* ---------- SEARCH SUGGESTIONS (navbar search panel) ---------- */
// GET /api/search?q=x-t5 → top 5 products (card fields only) + total, matching
// brands and categories. Answers are cached at the edge for a minute.
const MAX_PRODUCTS = 5;

export async function GET(request: NextRequest) {
  const q = (request.nextUrl.searchParams.get('q') || '').slice(0, 100);
  const index = await getSearchIndex();
  const products = searchProducts(index.products, q);
  const body: SearchSuggestions = {
    products: products.slice(0, MAX_PRODUCTS),
    total: products.length,
    brands: searchBrands(index.brands, q),
    categories: searchCategories(index.categories, index.groups, q),
  };
  return NextResponse.json(body, { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=600' } });
}
