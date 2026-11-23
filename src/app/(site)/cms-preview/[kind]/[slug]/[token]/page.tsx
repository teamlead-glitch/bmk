import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BrandPage, CategoryPage, brandMetadata, categoryMetadata } from '@/components/catalogue/ListingPages';
import { ContentPage, cmsPageMetadata } from '@/components/content-page/ContentPage';
import { ProductPage, productMetadata } from '@/components/product/ProductPage';
import { PREVIEW_KINDS, type PreviewKind } from '@/lib/preview';

type Props = { params: Promise<{ kind: string; slug: string; token: string }> };

// CMS preview of a page, product, brand or category. Not a public URL: src/proxy.ts rewrites
// /{slug}/, /product/{slug}/, /brand/{slug}/ and /category/{slug}/ with ?preview={token} here
// (and answers 404 to direct visits). The token goes to the CMS, which then also returns
// unpublished records. Rendered on every request, never cached, noindex. A separate route keeps
// the public pages static (no searchParams in their normal path).

export const dynamic = 'force-dynamic';

const PAGES = { page: ContentPage, product: ProductPage, brand: BrandPage, category: CategoryPage };
const METADATA = { page: cmsPageMetadata, product: productMetadata, brand: brandMetadata, category: categoryMetadata };

const isKind = (k: string): k is PreviewKind => (PREVIEW_KINDS as readonly string[]).includes(k);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { kind, slug, token } = await params;
  return isKind(kind) ? METADATA[kind](slug, decodeURIComponent(token)) : {};
}

export default async function Page({ params }: Props) {
  const { kind, slug, token } = await params;
  if (!isKind(kind)) notFound();
  const View = PAGES[kind];
  return <View slug={slug} preview={decodeURIComponent(token)} />;
}
