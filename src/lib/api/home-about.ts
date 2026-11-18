import { cache } from 'react';
import { cmsLink, mediaUrl, text } from '@/lib/api/cms-mappers';
import { serverGetData } from '@/lib/api/server-api';
import { cleanHtml } from '@/lib/sanitize-html';
import type { HomeAbout } from '@/types/home';

/* ---------- Homepage "About BMK Group" (CMS: GET /v1/settings/about/home) ---------- */
// { data: { title, description (HTML), button: { text, url }, image: { url, alt } } }
// No title or text -> null (the section is hidden). CMS down -> CmsUnavailableError -> error.tsx.

type CmsHomeAbout = { title?: string | null; description?: string | null; button?: { text?: string | null; url?: string | null } | null; image?: { url?: string | null; alt?: string | null } | null };

export const getHomeAbout = cache(async (): Promise<HomeAbout | null> => {
  const data = await serverGetData<CmsHomeAbout>('/v1/settings/about/home');

  const title = text(data?.title);
  // Inline styles and spans pasted from the editor are dropped; the design's typography applies
  const html = cleanHtml(text(data?.description));
  if (!title || !html) return null;

  const link = cmsLink(data?.button?.url);
  const buttonText = text(data?.button?.text);
  const src = mediaUrl(data?.image?.url);

  return { title, html, button: link && buttonText ? { text: buttonText, ...link } : null, image: src ? { src, alt: text(data?.image?.alt) } : null };
});
