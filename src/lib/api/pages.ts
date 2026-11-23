import { cache } from 'react';
import { isSlug, text } from '@/lib/api/cms-mappers';
import { serverGetRecord } from '@/lib/api/server-api';
import { getRedirectSlug, type DetailsResult } from '@/lib/api/slug-redirect';
import { cleanHtml, htmlToText } from '@/lib/sanitize-html';
import type { CmsSeo } from '@/types/common';
import type { ContentPageData, PageSection } from '@/types/page';

/* ---------- CMS pages (CMS: GET /v1/pages/{slug}) ---------- */
// { data: { id, slug, title, content (HTML), seo } }. Used by the legal pages (Privacy, Cookies,
// Terms) and any page made in the admin. The content is cleaned with cleanHtml `page` (headings,
// images, videos, embeds and alignment kept; h1 becomes h2) and split at each h2 into numbered sections
// for the table of contents; a leading "1." in a heading is dropped (the page numbers them).
// 404/410 -> null (the page answers 404). Renamed slug -> { redirect } (the page answers 308 to
// the new URL). CMS down -> CmsUnavailableError -> error.tsx.

type CmsPageData = { slug?: string | null; title?: string | null; content?: string | null; seo?: CmsSeo | null };

/** "1. Introduction" -> "introduction" (anchor ids) */
const anchor = (s: string) =>
  s
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

function toSections(html: string): { intro: string; sections: PageSection[] } {
  const parts = html.split(/<h2\b[^>]*>([\s\S]*?)<\/h2>/);
  const sections: PageSection[] = [];
  const used = new Set<string>();
  // parts: [intro, heading1, body1, heading2, body2, …]
  for (let i = 1; i < parts.length; i += 2) {
    const title = htmlToText(parts[i]).replace(/^\d+[.)]\s*/, '');
    if (!title) continue;
    let id = anchor(title) || `section-${sections.length + 1}`;
    while (used.has(id)) id += '-2';
    used.add(id);
    sections.push({ id, n: String(sections.length + 1).padStart(2, '0'), title, html: (parts[i + 1] ?? '').trim() });
  }
  return { intro: parts[0].trim(), sections };
}

/** null -> 404. { redirect } -> the slug was renamed in the admin: the API answers 301 and fetch
 *  follows it to the current page, so the slug that comes back differs (src/lib/api/slug-redirect.ts). */
/** `preview`: the token from ?preview= (admin "Preview" link). It is passed on to the CMS, which
 *  then also returns unpublished pages; the answer is never cached. */
export const getCmsPage = cache(async (slug: string, preview?: string): Promise<DetailsResult<ContentPageData>> => {
  if (!isSlug(slug)) return null;
  const data = await serverGetRecord<CmsPageData>(`/v1/pages/${encodeURIComponent(slug)}`, preview);
  if (!data) return null;
  const moved = getRedirectSlug(slug, text(data.slug));
  if (moved) return { redirect: moved };
  return { title: text(data.title), ...toSections(cleanHtml(text(data.content), { page: true })), seo: data.seo ?? null };
});
