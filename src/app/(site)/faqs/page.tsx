import type { Metadata } from 'next';
import { FaqExplorer } from '@/components/faq/FaqExplorer';
import { getFaqs } from '@/lib/content';
import { pageMetadata } from '@/lib/seo';

// Questions come from the CMS: rebuilt at most every minute, or at once via POST /api/revalidate/
export const revalidate = 60; // TODO: back to 300 after development

export const metadata: Metadata = pageMetadata({
  title: 'FAQ',
  description: 'Answers to common questions about BMK Group, our brands, where to buy and partnering with us.',
  path: '/faqs/',
  image: '/assets/images/faq-hero.webp',
});

export default async function FaqPage() {
  const { faqs, topics } = await getFaqs();
  return <FaqExplorer faqs={faqs} topics={topics} />;
}
