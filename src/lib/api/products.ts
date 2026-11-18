import { cache } from 'react';
import { LISTING_PAGE_SIZE } from '@/constants/listing';
import { getCmsBrands } from '@/lib/api/brands-categories';
import { brandColor, isSlug, mediaUrl, text, type CmsRef } from '@/lib/api/cms-mappers';
import { serverGet, serverGetData } from '@/lib/api/server-api';
import { getRedirectSlug, type DetailsResult } from '@/lib/api/slug-redirect';
import type { CmsSeo } from '@/types/common';
import { cleanHtml } from '@/lib/sanitize-html';
import type { CardProduct } from '@/types/catalogue';
import type { ProductPage, ProductSort } from '@/types/listing';
import type { ProductDetail } from '@/types/product';

/* ---------- Products (CMS: GET /v1/products, /v1/products/{slug}) ---------- */
// getProducts: one page of products for the listings (the browser loads more pages,
// filters and sorts through /api/list/products/, which calls it). getProduct: the product page.

type CmsProductItem = {
  slug?: string | null;
  name?: string | null;
  short_description?: string | null;
  image?: { url?: string | null } | null;
  brand?: CmsRef | null;
  categories?: CmsRef[] | null;
  highlights?: { name?: string | null; value?: string | null }[] | null;
};
type CmsProductList = { data?: CmsProductItem[]; meta?: { total?: number; current_page?: number; last_page?: number } };

/** CMS product -> the design's product card (no model, release date or spec template in the CMS) */
function toCmsCard(p: CmsProductItem): CardProduct | null {
  const slug = text(p.slug);
  const name = text(p.name);
  if (!slug || !name) return null;
  const cat = p.categories?.[0];
  return {
    slug,
    name,
    model: '',
    modelNo: null,
    brandId: text(p.brand?.slug),
    brandName: text(p.brand?.name),
    categoryId: text(cat?.slug),
    categoryName: text(cat?.title),
    groupId: '',
    groupName: '',
    released: '',
    short: text(p.short_description),
    template: 'generic',
    highlights: (p.highlights ?? []).flatMap((h) => (text(h.name) && text(h.value) ? [{ label: text(h.name), value: text(h.value) }] : [])).slice(0, 3),
    media: { card: mediaUrl(p.image?.url) ?? undefined },
  };
}

const EMPTY_PAGE: ProductPage = { items: [], total: 0, page: 1, lastPage: 1 };

/** One page of products. CMS down -> CmsUnavailableError. */
export async function getProducts(q: { category?: string; brands?: string[]; sort?: ProductSort; page?: number; perPage?: number }): Promise<ProductPage> {
  const body = await serverGet<CmsProductList>('/v1/products', {
    category: q.category,
    brand: q.brands?.length ? [...q.brands].sort().join(',') : undefined, // sorted: one cache entry per filter set
    sort: q.sort ?? 'latest',
    per_page: q.perPage ?? LISTING_PAGE_SIZE,
    page: q.page ?? 1,
  });
  if (!body) return EMPTY_PAGE;
  return {
    items: (body.data ?? []).map(toCmsCard).filter((p): p is CardProduct => !!p),
    total: Number(body.meta?.total) || 0,
    page: Number(body.meta?.current_page) || 1,
    lastPage: Number(body.meta?.last_page) || 1,
  };
}

/* ---------- Product detail (CMS: GET /v1/products/{slug}) ---------- */

type CmsSpec = { name?: string | null; value?: string | null };
type CmsProductDetail = {
  slug?: string | null;
  name?: string | null;
  short_description?: string | null;
  description?: string | null;
  model_no?: string | null;
  image?: { url?: string | null; alt?: string | null } | null;
  gallery?: { url?: string | null; alt?: string | null }[] | null;
  brand?: { slug?: string | null; name?: string | null; logo?: { url?: string | null } | null } | null;
  categories?: CmsRef[] | null;
  attributes?: { name?: string | null; values?: string[] | null }[] | null;
  highlights?: CmsSpec[] | null;
  specification_groups?: { name?: string | null; specifications?: CmsSpec[] | null }[] | null;
  seo?: CmsSeo | null;
};

/**
 * /product/{slug}: null -> 404. { redirect } -> the slug was renamed in the CMS (the API
 * answers 301 and fetch follows it to the current product). CMS down -> error.tsx.
 */
export const getProduct = cache(async (slug: string): Promise<DetailsResult<ProductDetail>> => {
  if (!isSlug(slug)) return null;
  const p = await serverGetData<CmsProductDetail>(`/v1/products/${encodeURIComponent(slug)}`);
  const current = text(p?.slug);
  if (!p || !current) return null;
  const moved = getRedirectSlug(slug, current);
  if (moved) return { redirect: moved };

  const name = text(p.name) || current;
  const brandSlug = text(p.brand?.slug);
  const categories: ProductDetail['categories'] = [];
  for (const c of p.categories ?? []) {
    const slug = text(c.slug);
    if (isSlug(slug) && text(c.title) && !categories.some((x) => x.slug === slug)) categories.push({ slug, name: text(c.title) });
  }
  const cat = categories[0] ?? null;
  const catSlug = cat?.slug ?? '';

  // Images: main image first, then the gallery (duplicates and broken links dropped)
  const images: ProductDetail['images'] = [];
  for (const im of [p.image, ...(p.gallery ?? [])]) {
    const src = mediaUrl(im?.url);
    if (src && !images.some((x) => x.src === src)) images.push({ src, alt: text(im?.alt) });
  }

  const specRows = (list: CmsSpec[] | null | undefined, prefix: string) =>
    (list ?? []).flatMap((x, i) => (text(x.name) && text(x.value) ? [{ key: `${prefix}-${i}`, label: text(x.name), value: text(x.value) }] : []));
  const specGroups: ProductDetail['specGroups'] = (p.specification_groups ?? [])
    .map((g, i) => ({ group: text(g.name) || 'Specifications', rows: specRows(g.specifications, `g${i}`) }))
    .filter((g) => g.rows.length);
  // Variable products: the options they come in (e.g. Colour: Red, Blue)
  const options = (p.attributes ?? []).flatMap((a, i) => {
    const values = (a.values ?? []).map(text).filter(Boolean);
    return text(a.name) && values.length ? [{ key: `opt-${i}`, label: text(a.name), value: values }] : [];
  });
  if (options.length) specGroups.unshift({ group: 'Available options', rows: options });

  const [cmsBrands, byBrand, byCategory] = await Promise.all([
    getCmsBrands(),
    isSlug(brandSlug) ? getProducts({ brands: [brandSlug], perPage: 5 }) : null,
    catSlug ? getProducts({ category: catSlug, perPage: 5 }) : null,
  ]);
  const others = (page: ProductPage | null) => (page?.items ?? []).filter((x) => x.slug !== current).slice(0, 4);

  return {
    slug: current,
    name,
    modelNo: text(p.model_no) || null,
    short: text(p.short_description),
    descriptionHtml: cleanHtml(text(p.description)),
    images,
    brand: {
      slug: brandSlug,
      name: text(p.brand?.name),
      logo: mediaUrl(p.brand?.logo?.url),
      color: brandColor(cmsBrands.find((b) => text(b.slug) === brandSlug)?.color),
    },
    category: cat,
    categories,
    highlights: specRows(p.highlights, 'h').slice(0, 3).map(({ label, value }) => ({ label, value })),
    specGroups,
    seo: p.seo ?? null,
    fromBrand: others(byBrand),
    inCategory: others(byCategory),
  };
});

/** Every product slug (sitemap, build): all pages of GET /v1/products, 48 at a time */
export const getProductSlugs = cache(async (): Promise<string[]> => {
  const slugs: string[] = [];
  for (let page = 1, last = 1; page <= last && page <= 50; page++) {
    const res = await getProducts({ page, perPage: 48 });
    slugs.push(...res.items.map((x) => x.slug));
    last = res.lastPage;
  }
  return slugs;
});
