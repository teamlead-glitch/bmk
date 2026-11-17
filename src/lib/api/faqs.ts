import { cache } from 'react';
import { API_CONFIG } from '@/constants/config';
import { cmsGet } from '@/lib/api/cms-fetch';
import { cleanHtml, htmlToText } from '@/lib/sanitize-html';
import type { Faq, FaqTopic } from '@/types/faq';

/* ---------- FAQ (CMS: GET /v1/faqs) ---------- */
// { data: { categories: [{ id, name, faqs: [{ id, question, answer }] }], uncategorized: [...] } }
// Each category becomes a topic; uncategorized questions go under "General", last.

type CmsFaq = { id?: number | string; question?: string; answer?: string };
type CmsFaqCategory = { id?: number | string; name?: string; faqs?: CmsFaq[] };
type CmsFaqAnswer = { data?: { categories?: CmsFaqCategory[]; uncategorized?: CmsFaq[] } };

const GENERAL_TOPIC: FaqTopic = { id: 'general', name: 'General' };

function toFaq(f: CmsFaq, topic: string): Faq | null {
  const q = String(f.question ?? '').trim();
  const html = cleanHtml(String(f.answer ?? ''));
  if (!q || !html) return null;
  return { id: String(f.id ?? q), topic, q, html, text: htmlToText(html) };
}

export const getFaqs = cache(async (): Promise<{ faqs: Faq[]; topics: FaqTopic[] }> => {
  if (!API_CONFIG.BASE_URL) {
    console.warn('[faq] NEXT_PUBLIC_API_URI is not set: the FAQ page has no questions');
    return { faqs: [], topics: [] };
  }
  // CMS down -> CmsUnavailableError -> error.tsx. 404/410 -> an empty list, never a fake 404 page.
  const { found, json } = await cmsGet(`${API_CONFIG.BASE_URL}/v1/faqs`);
  const data = found ? (json as CmsFaqAnswer)?.data : undefined;

  const faqs: Faq[] = [];
  const topics: FaqTopic[] = [];
  for (const c of data?.categories ?? []) {
    const topic = { id: `topic-${c.id}`, name: String(c.name ?? '').trim() };
    const items = (c.faqs ?? []).map((f) => toFaq(f, topic.id)).filter((f): f is Faq => !!f);
    if (!topic.name || !items.length) continue; // empty categories get no filter pill
    topics.push(topic);
    faqs.push(...items);
  }
  const general = (data?.uncategorized ?? []).map((f) => toFaq(f, GENERAL_TOPIC.id)).filter((f): f is Faq => !!f);
  if (general.length) {
    topics.push(GENERAL_TOPIC);
    faqs.push(...general);
  }
  return { faqs, topics };
});
