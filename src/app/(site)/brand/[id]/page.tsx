import type { Metadata } from 'next';
import { BrandPage, brandMetadata } from '@/components/catalogue/ListingPages';
import { getBrandSlugs } from '@/lib/content';

type Props = { params: Promise<{ id: string }> };

// /brand/{slug}: a CMS brand and its products; preview: src/app/(site)/cms-preview/

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return brandMetadata((await params).id);
}

export default async function Page({ params }: Props) {
  return <BrandPage slug={(await params).id} />;
}

// CMS brands are built at deploy time; new ones on first visit, then cached (ISR)
export async function generateStaticParams() {
  return (await getBrandSlugs()).map((id) => ({ id }));
}
