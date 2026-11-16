import type { Metadata } from 'next';
import { FaqExplorer } from '@/components/faq/FaqExplorer';
import { getCompany } from '@/lib/content';
import { jsonLd, pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'FAQ',
  description: 'Answers to common questions about BMK Group, our brands, where to buy and partnering with us.',
  path: '/faq/',
  image: '/assets/images/faq-hero.webp',
});

export default async function FaqPage() {
  const { faqs, faqTopics } = await getCompany();
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: [...f.a, ...(f.list || [])].join(' ') },
    })),
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }} />
      <FaqExplorer faqs={faqs} topics={faqTopics} />
    </>
  );
}
