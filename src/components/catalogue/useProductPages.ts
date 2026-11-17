'use client';

import { useEffect, useState } from 'react';
import { listGet } from '@/services/list-api';
import type { ProductPage } from '@/types/listing';

/**
 * The pages a listing shows for one filter set: page 1 up to `pages`. The server's first
 * page is the seed; other pages are loaded from /api/list/products/ and kept by filter set
 * ("category|brand|sort|page"), so going back to a filter set costs no new request.
 */
export function useProductPages({
  category,
  brand,
  sort,
  pages,
  seedKey,
  seed,
}: {
  category: string;
  brand: string;
  sort: string;
  pages: number;
  /** Filter set of the server's first page */
  seedKey: string;
  seed: ProductPage;
}) {
  const setKey = `${category}|${brand}|${sort}`;
  const [loaded, setLoaded] = useState<Record<string, ProductPage>>(() => ({ [`${seedKey}|1`]: seed }));
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  const firstPage = loaded[`${setKey}|1`];
  const want = Math.min(pages, firstPage?.lastPage ?? 1);
  const got: ProductPage[] = [];
  for (let p = 1; p <= want; p++) {
    const page = loaded[`${setKey}|${p}`];
    if (!page) break;
    got.push(page);
  }
  const missing = !firstPage ? [1] : Array.from({ length: want - got.length }, (_, i) => got.length + i + 1);
  const loading = missing.length > 0 && !failed;

  useEffect(() => {
    if (!missing.length) return;
    const ctl = new AbortController();
    Promise.all(
      missing.map((page) =>
        listGet('products', { category, brand, sort, page }, ctl.signal).then((res) => {
          if (!res.success) throw new Error(res.error);
          return res.data;
        }),
      ),
    )
      .then((res) => setLoaded((prev) => ({ ...prev, ...Object.fromEntries(res.map((r, i) => [`${setKey}|${missing[i]}`, r])) })))
      .catch(() => !ctl.signal.aborted && setFailed(true));
    return () => ctl.abort();
    // missing is derived from these
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setKey, want, firstPage, got.length, attempt]);

  return {
    /** Page 1 of the current filter set (undefined while it loads) */
    firstPage,
    /** Pages loaded so far, in order */
    pagesShown: got.length,
    products: got.flatMap((p) => p.items),
    total: firstPage?.total ?? 0,
    loading,
    failed,
    retry: () => (setFailed(false), setAttempt((n) => n + 1)),
  };
}
