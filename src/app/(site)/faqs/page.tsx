import type { Metadata } from 'next';
import { FaqExplorer } from '@/components/faq/FaqExplorer';
import { getFaqs } from '@/lib/content';
import { cmsSeoMetadata } from '@/lib/page-metadata';

// Questions come from the CMS: rebuilt at most every minute, or at once via POST /api/revalidate/
export const revalidate = 60; // TODO: back to 300 after development

// SEO from the admin's "faqs" page (CMS: GET /v1/pages/faqs); these values are the fallback
export function generateMetadata(): Promise<Metadata> {
  return cmsSeoMetadata('faqs', {
    title: 'FAQ',
    description: 'Answers to common questions about BMK Group, our brands, where to buy and partnering with us.',
    path: '/faqs/',
    image: '/assets/images/faq-hero.webp',
  });
}

export default async function FaqPage() {
  const { faqs, topics } = await getFaqs();
  return <FaqExplorer faqs={faqs} topics={topics} />;
}
