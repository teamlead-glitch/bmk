import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ListingPage } from '@/components/catalogue/ListingPage';
import { getListing, getListingParams } from '@/lib/content';
import { pageMetadata } from '@/lib/seo';

type Props = { params: Promise<{ id: string }> };

// Partner brands only: BMK's own brands (SEEKEN, TEAM) link to their websites
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const data = await getListing('brand', id);
  if (!data) return {};
  const b = data.ctx.brand!;
  return pageMetadata({ title: `${b.name} products`, description: b.intro, path: `${data.ctx.path}/`, image: data.ctx.heroImage });
}

export default async function BrandPage({ params }: Props) {
  const { id } = await params;
  const data = await getListing('brand', id);
  if (!data) notFound();
  return <ListingPage data={data} />;
}

export async function generateStaticParams() {
  const { brands } = await getListingParams();
  return brands.map((id) => ({ id }));
}
