import type { Metadata } from 'next';
import { ProductPage, productMetadata } from '@/components/product/ProductPage';
import { getProductSlugs } from '@/lib/content';

type Props = { params: Promise<{ slug: string }> };

// /product/{slug}: a CMS product (GET /v1/products/{slug}); preview: src/app/(site)/cms-preview/

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return productMetadata((await params).slug);
}

export default async function Page({ params }: Props) {
  return <ProductPage slug={(await params).slug} />;
}

// CMS products are built at deploy time; new ones on first visit, then cached (ISR)
export async function generateStaticParams() {
  return (await getProductSlugs()).map((slug) => ({ slug }));
}
