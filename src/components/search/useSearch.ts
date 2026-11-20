'use client';

import { useEffect, useState } from 'react';
import { MIN_SEARCH_LENGTH } from '@/constants/listing';
import { searchGet } from '@/services/search-api';
import type { SearchResults } from '@/types/search';

export type SearchStatus = 'idle' | 'short' | 'loading' | 'error' | 'done';

/** Results for a query from /api/search/ (CMS search), shared by the navbar search panel and
 *  the search page. Debounced; a newer query cancels the older request.
 *  idle: no query · short: under 2 characters · loading · error: CMS unavailable · done */
export function useSearch(query: string, debounceMs = 150): { status: SearchStatus; data: SearchResults | null } {
  const q = query.replace(/\s+/g, ' ').trim();
  const [result, setResult] = useState<{ q: string; data: SearchResults | null; failed: boolean } | null>(null);

  useEffect(() => {
    if (q.length < MIN_SEARCH_LENGTH) return;
    const ctl = new AbortController();
    const t = setTimeout(() => {
      searchGet(q, ctl.signal)
        .then((res) => setResult({ q, data: res.success ? res.data : null, failed: !res.success }))
        .catch(() => {}); // aborted: a newer query is on its way
    }, debounceMs);
    return () => (clearTimeout(t), ctl.abort());
  }, [q, debounceMs]);

  if (!q) return { status: 'idle', data: null };
  if (q.length < MIN_SEARCH_LENGTH) return { status: 'short', data: null };
  if (!result || result.q !== q) return { status: 'loading', data: null };
  return result.failed ? { status: 'error', data: null } : { status: 'done', data: result.data };
}
