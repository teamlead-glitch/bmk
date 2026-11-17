import { cookies, draftMode } from 'next/headers';

/* ---------- CMS PREVIEW (?token=...) ---------- */
// proxy.ts sends /any-page?token=... to /api/preview, which turns on draft mode, keeps the
// token in a short-lived cookie and returns to the clean URL. The token is read ONLY in
// draft mode, so normal visits never touch cookies and stay in the page cache.
export const PREVIEW_COOKIE = 'bmk_preview_token';

export async function getPreviewToken(): Promise<string | undefined> {
  const draft = await draftMode();
  if (!draft.isEnabled) return undefined;
  return (await cookies()).get(PREVIEW_COOKIE)?.value || undefined;
}

export function withPreviewToken(url: string, token?: string): string {
  return token ? `${url}?token=${encodeURIComponent(token)}` : url;
}
