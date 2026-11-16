import type { Metadata } from 'next';
import { FaqExplorer } from '@/components/faq/FaqExplorer';
import { getFaqs } from '@/lib/content';
import { jsonLd, pageMetadata } from '@/lib/seo';

// Questions come from the CMS: rebuilt at most every 5 minutes, or at once via POST /api/revalidate/
export const revalidate = 300;

export const metadata: Metadata = pageMetadata({
  title: 'FAQ',
  description: 'Answers to common questions about BMK Group, our brands, where to buy and partnering with us.',
  path: '/faq/',
  image: '/assets/images/faq-hero.webp',
});

export default async function FaqPage() {
  const { faqs, topics } = await getFaqs();
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.text },
    })),
  };
  return (
    <>
      {faqs.length > 0 && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }} />}
      <FaqExplorer faqs={faqs} topics={topics} />
    </>
  );
}
