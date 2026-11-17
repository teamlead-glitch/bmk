import { href } from '@/lib/routes';
import type { ApiResponse } from '@/types/common';

/* ---------- BROWSER FETCH WRAPPER ---------- */
// For this site's own /api/* routes only (never the CMS directly: the API key stays on the
// server and the CSP allows 'self'). Never throws: components check `res.success`.

type Params = Record<string, string | number | string[] | null | undefined>;

async function request<T>(url: string, init: RequestInit): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(url, { ...init, headers: { Accept: 'application/json', ...init.headers } });
    const body = await res.json().catch(() => null);
    if (res.ok) return { success: true, data: body as T };
    return {
      success: false,
      error: (body && (body.message || body.error)) || res.statusText || `HTTP ${res.status}`,
      ...(body?.errors && typeof body.errors === 'object' ? { errors: body.errors as Record<string, string> } : {}),
    };
  } catch (error) {
    if ((error as Error)?.name === 'AbortError') throw error; // the caller cancelled
    return { success: false, error: (error as Error)?.message || 'Network error' };
  }
}

export const api = {
  /** GET /api/... with query params (empty values left out) */
  get: <T>(path: string, params?: Params, signal?: AbortSignal) => request<T>(href(path, params), { method: 'GET', signal }),
  /** POST /api/... with a JSON body */
  post: <T>(path: string, body: unknown) => request<T>(href(path), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }),
};
