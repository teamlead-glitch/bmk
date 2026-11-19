import { cache } from 'react';
import { isSlug, text } from '@/lib/api/cms-mappers';
import { serverGetData } from '@/lib/api/server-api';
import { cleanHtml, htmlToText } from '@/lib/sanitize-html';
import type { CmsSeo } from '@/types/common';
import type { CmsPage, PageSection } from '@/types/page';

/* ---------- CMS pages (CMS: GET /v1/pages/{slug}) ---------- */
// { data: { id, slug, title, content (HTML), seo } }. Used by the legal pages (Privacy, Cookies,
// Terms). The content is cleaned (headings kept) and split at each h2 into numbered sections
// for the table of contents; a leading "1." in a heading is dropped (the page numbers them).
// 404/410 -> null (the page answers 404). CMS down -> CmsUnavailableError -> error.tsx.

type CmsPageData = { slug?: string | null; title?: string | null; content?: string | null; seo?: CmsSeo | null };

/** "1. Introduction" -> "introduction" (anchor ids) */
const anchor = (s: string) =>
  s
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

function toSections(html: string): { intro: string; sections: PageSection[] } {
  const parts = html.split(/<h2>([\s\S]*?)<\/h2>/);
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

export const getCmsPage = cache(async (slug: string): Promise<CmsPage | null> => {
  if (!isSlug(slug)) return null;
  const data = await serverGetData<CmsPageData>(`/v1/pages/${encodeURIComponent(slug)}`);
  if (!data) return null;
  return { title: text(data.title), ...toSections(cleanHtml(text(data.content), { headings: true })), seo: data.seo ?? null };
});
