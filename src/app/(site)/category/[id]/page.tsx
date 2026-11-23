import type { Metadata } from 'next';
import { CategoryPage, categoryMetadata } from '@/components/catalogue/ListingPages';
import { getCategorySlugs } from '@/lib/content';

type Props = { params: Promise<{ id: string }> };

// /category/{slug}: a CMS category and its products; preview: src/app/(site)/cms-preview/

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return categoryMetadata((await params).id);
}

export default async function Page({ params }: Props) {
  return <CategoryPage slug={(await params).id} />;
}

// CMS categories are built at deploy time; new ones on first visit, then cached (ISR)
export async function generateStaticParams() {
  return (await getCategorySlugs()).map((id) => ({ id }));
}
