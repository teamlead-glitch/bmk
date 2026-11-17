import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { Crumbs } from '@/components/common/Crumbs';
import type { EnquiryProduct } from '@/components/enquiry/EnquiryProvider';
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

// /product/{slug}: a CMS product (GET /v1/products/{slug})

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProduct(slug);
  if (!p || 'redirect' in p) return {};
  const meta = pageMetadata({ title: p.seo.title, description: p.seo.description, path: `/product/${p.slug}/`, image: p.seo.image });
  // "Index" switched off for this product in the CMS
  return p.seo.index ? meta : { ...meta, robots: { index: false, follow: true } };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const p = await getProduct(slug);
  if (!p) notFound();
  if ('redirect' in p) permanentRedirect(href(`/product/${p.redirect}`)); // slug renamed in the CMS

  // Gallery: labels (alt text) and photos; a product without photos shows the placeholder
  const labels = p.images.length ? p.images.map((im) => im.alt) : [''];
  const sources = p.images.length ? p.images.map((im) => im.src) : [''];
  const enquiry: EnquiryProduct = { name: p.name, brandName: p.brand.name, categoryName: p.category?.name ?? '', thumb: p.images[0]?.src, glyph: 'generic' };
  const hasOverview = p.descriptionHtml.length > 0;
  const hasSpecs = p.specGroups.length > 0;
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    ...(p.modelNo && { model: p.modelNo }),
    ...(p.short && { description: p.short }),
    ...(p.brand.name && { brand: { '@type': 'Brand', name: p.brand.name } }),
    ...(p.category && { category: p.category.name }),
    url: siteUrl(`/product/${p.slug}/`),
    ...(p.images.length > 0 && { image: p.images.map((im) => im.src) }),
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
              ...(p.category ? [[p.category.name, href(`/category/${p.category.slug}`)] as [string, string]] : []),
              [p.name],
            ]}
          />
        </div>
        <div className="shell mt-8 grid gap-10 lg:grid-cols-[minmax(0,1.12fr)_minmax(0,1fr)] lg:gap-16">
          <ProductGallery name={p.name} glyph="generic" images={labels} sources={sources} />
          <ProductSummary p={p} enquiry={enquiry} hasSpecs={hasSpecs} />
        </div>
      </section>

      <ProductSectionBar product={enquiry} sections={[...(hasOverview ? ['overview'] : []), ...(hasSpecs ? ['specifications'] : []), 'more']} />
      {hasOverview && <ProductOverview name={p.name} html={p.descriptionHtml} />}
      {hasSpecs && <ProductSpecs groups={p.specGroups} />}

      <section id="more" className="scroll-mt-24" data-section>
        {p.brand.slug && (
          <div className="on-brand section-y" style={{ ...brandVars(p.brand.color), background: 'var(--brand)', color: 'var(--on)' }}>
            <ProductStrip
              title={`More from ${p.brand.name}`}
              list={p.fromBrand}
              more={href(`/brand/${p.brand.slug}`)}
              dark
              emptyText={`No other ${p.brand.name} products yet.`}
              emptyLink={['View all products', href('/products')]}
              brandColor={p.brand.color}
            />
          </div>
        )}
        {p.category && (
          <div className="section-y">
            <ProductStrip
              title={`More in ${p.category.name}`}
              list={p.inCategory}
              more={href(`/category/${p.category.slug}`)}
              emptyText={`No other ${p.category.name.toLowerCase()} products yet.`}
              emptyLink={['View all products', href('/products')]}
            />
          </div>
        )}
      </section>
    </>
  );
}

// CMS products are built at deploy time; new ones on first visit, then cached (ISR)
export async function generateStaticParams() {
  return (await getProductSlugs()).map((slug) => ({ slug }));
}
