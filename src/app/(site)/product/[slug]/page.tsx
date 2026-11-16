import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Crumbs } from '@/components/common/Crumbs';
import type { EnquiryProduct } from '@/components/common/EnquiryProvider';
import { brandVars } from '@/components/common/ProductCard';
import { ProductGallery } from '@/components/product/ProductGallery';
import { ProductOverview } from '@/components/product/ProductOverview';
import { ProductSectionBar } from '@/components/product/ProductSectionBar';
import { ProductSpecs } from '@/components/product/ProductSpecs';
import { ProductStrip } from '@/components/product/ProductStrip';
import { ProductSummary } from '@/components/product/ProductSummary';
import { getProduct, getProductSlugs } from '@/lib/content';
import { HOME, href } from '@/lib/routes';
import { jsonLd, pageMetadata } from '@/lib/seo';
import { siteUrl } from '@/lib/site-url';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProduct(slug);
  if (!p) return {};
  return pageMetadata({ title: p.name, description: p.short, path: `/product/${p.slug}/`, image: p.media.card });
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const p = await getProduct(slug);
  if (!p) notFound();

  // Gallery: the photo for each shot where we have one (first shot falls back to the card photo)
  const sources = p.images.map((shot, i) => p.media.shots?.[shot] || (i === 0 ? p.media.card || '' : ''));
  const enquiry: EnquiryProduct = { name: p.name, brandName: p.brand.name, categoryName: p.category.name, thumb: p.media.card, glyph: p.glyph };
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    model: p.model,
    description: p.short,
    brand: { '@type': 'Brand', name: p.brand.name },
    category: p.category.name,
    url: siteUrl(`/product/${p.slug}/`),
    ...(p.media.card ? { image: siteUrl(p.media.card) } : {}),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }} />
      <section className="pt-[clamp(120px,10vw,152px)]">
        <div className="shell">
          <Crumbs
            items={[
              ['Home', HOME],
              ['Brands & Products', href('/products')],
              [p.group.name, href(`/category/${p.group.id}`)],
              [p.category.name, href(`/category/${p.category.id}`)],
              [p.name],
            ]}
          />
        </div>
        <div className="shell mt-8 grid gap-10 lg:grid-cols-[minmax(0,1.12fr)_minmax(0,1fr)] lg:gap-16">
          <ProductGallery name={p.name} glyph={p.glyph} images={p.images} sources={sources} />
          <ProductSummary p={p} enquiry={enquiry} />
        </div>
      </section>

      <ProductSectionBar product={enquiry} />
      <ProductOverview p={p} />
      <ProductSpecs groups={p.specGroups} />

      <section id="more" className="scroll-mt-24" data-section>
        <div className="on-brand section-y" style={{ ...brandVars(p.brand.color), background: 'var(--brand)', color: 'var(--on)' }}>
          <ProductStrip
            title={`More from ${p.brand.name}`}
            list={p.fromBrand}
            more={href(`/brand/${p.brand.id}`)}
            dark
            emptyText={`No other ${p.brand.name} products yet.`}
            emptyLink={['View all products', href('/products')]}
            brandColor={p.brand.color}
          />
        </div>
        <div className="section-y">
          <ProductStrip
            title={`More in ${p.category.name}`}
            list={p.inCategory}
            more={href(`/category/${p.category.id}`)}
            emptyText={`No other ${p.category.name.toLowerCase()} yet.`}
            emptyLink={[`Browse ${p.group.name}`, href(`/category/${p.group.id}`)]}
          />
        </div>
      </section>
    </>
  );
}

export async function generateStaticParams() {
  return (await getProductSlugs()).map((slug) => ({ slug }));
}
