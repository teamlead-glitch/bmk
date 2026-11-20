import { api } from '@/services/api';
import type { ApiResponse } from '@/types/common';
import type { SearchResults } from '@/types/search';

/* ---------- CATALOGUE SEARCH (browser) ---------- */
// searchGet(q) -> GET /api/search/?q= (src/app/api/search/route.ts): every product, brand and
// category matching the query. Throws only AbortError (the caller cancelled).

export function searchGet(q: string, signal?: AbortSignal): Promise<ApiResponse<SearchResults>> {
  return api.get<SearchResults>('/api/search', { q }, signal);
}
