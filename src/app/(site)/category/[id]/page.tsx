import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ListingPage } from '@/components/catalogue/ListingPage';
import { getListing, getListingParams } from '@/lib/content';
import { pageMetadata } from '@/lib/seo';

type Props = { params: Promise<{ id: string }> };

// /category/{id} is a product group (imaging) or a category (lenses-optics)
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const data = await getListing('category', id);
  if (!data) return {};
  const { ctx } = data;
  return pageMetadata({
    title: ctx.title,
    description: ctx.category?.desc ?? `${ctx.title} from the brands BMK Group distributes.`,
    path: `${ctx.path}/`,
    image: ctx.heroImage,
  });
}

export default async function CategoryPage({ params }: Props) {
  const { id } = await params;
  const data = await getListing('category', id);
  if (!data) notFound();
  return <ListingPage data={data} />;
}

// Known categories are built at deploy time; new CMS ones on first visit, then cached
export async function generateStaticParams() {
  const { groups, categories } = await getListingParams();
  return [...groups, ...categories].map((id) => ({ id }));
}
