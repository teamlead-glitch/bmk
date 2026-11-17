import { href } from '@/lib/routes';
import type { ProductPage } from '@/types/listing';

/* ---------- PRODUCT PAGES (browser) ---------- */
// The listings ask this site's /api/products/ (src/app/api/products/route.ts), never the
// CMS directly: the API key stays on the server and the CSP allows only 'self'.

export interface ProductPageQuery {
  /** Category slug(s), comma-separated */
  category?: string;
  /** Brand slug(s), comma-separated */
  brand?: string;
  sort: string;
  page: number;
}

/** One page of products. Throws on a failed request (the listing shows "Try again"). */
export async function fetchProductPage(q: ProductPageQuery, signal?: AbortSignal): Promise<ProductPage> {
  const res = await fetch(href('/api/products', { ...q }), { signal });
  if (!res.ok) throw new Error(`products ${res.status}`);
  return (await res.json()) as ProductPage;
}
