import type { Metadata } from 'next';
import { ContentPage, cmsPageMetadata } from '@/components/content-page/ContentPage';
import { LEGAL_PAGES } from '@/constants/legal';

type Props = { params: Promise<{ slug: string }> };

// /{slug}/: any page created in the admin (CMS: GET /v1/pages/{slug}), e.g. /privacy-policy/.
// The site's own routes (/about/, /contact/, …) take priority over a CMS page with the same slug.

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return cmsPageMetadata((await params).slug);
}

export default async function Page({ params }: Props) {
  return <ContentPage slug={(await params).slug} />;
}

// The legal pages are built at deploy time; other CMS pages on their first visit, then cached (ISR)
export function generateStaticParams() {
  return LEGAL_PAGES.map((p) => ({ slug: p.slug }));
}
