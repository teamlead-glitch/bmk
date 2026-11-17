import { api } from '@/services/api';
import type { ApiResponse } from '@/types/common';
import type { ProductPage } from '@/types/listing';

/* ---------- LIST PAGES (browser) ---------- */
// listGet(kind, params) -> GET /api/list/{kind}/ (src/app/api/list/[kind]/route.ts).

/** What each list kind answers, and the params it takes */
interface Lists {
  products: {
    page: ProductPage;
    params: { category?: string; brand?: string; sort: string; page: number };
  };
}

export function listGet<K extends keyof Lists>(kind: K, params: Lists[K]['params'], signal?: AbortSignal): Promise<ApiResponse<Lists[K]['page']>> {
  return api.get<Lists[K]['page']>(`/api/list/${kind}`, params, signal);
}
