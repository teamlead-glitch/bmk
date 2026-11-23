import type { Metadata } from 'next';
import { ContentPage, cmsPageMetadata } from '@/components/content-page/ContentPage';

type Props = { params: Promise<{ slug: string; token: string }> };

// CMS page preview. Not a public URL: src/proxy.ts rewrites /{slug}/?preview={token} here (and
// answers 404 to direct visits). The token goes to the CMS (GET /v1/pages/{slug}?preview=…),
// which then also returns unpublished pages. Rendered on every request, never cached, noindex.
// A separate route keeps /{slug}/ itself static (no searchParams in the normal page path).

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, token } = await params;
  return cmsPageMetadata(slug, decodeURIComponent(token));
}

export default async function Page({ params }: Props) {
  const { slug, token } = await params;
  return <ContentPage slug={slug} preview={decodeURIComponent(token)} />;
}
