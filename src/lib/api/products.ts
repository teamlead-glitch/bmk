import { cache } from 'react';
import { API_CONFIG } from '@/constants/config';
import { LISTING_PAGE_SIZE } from '@/constants/listing';
import { getCmsBrands } from '@/lib/api/brands-categories';
import { cmsGet } from '@/lib/api/cms-fetch';
import { brandColor, isSlug, mediaUrl, text, type CmsRef } from '@/lib/api/cms-mappers';
import { cleanHtml } from '@/lib/sanitize-html';
import type { CardProduct } from '@/types/catalogue';
import type { ProductPage, ProductSort } from '@/types/listing';
import type { ProductDetail } from '@/types/product';

/* ---------- Products (CMS: GET /v1/products, /v1/products/{slug}) ---------- */
// getProducts: one page of products for the listings (the browser loads more pages,
// filters and sorts through /api/products/, which calls it). getProduct: the product page.

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
  if (!API_CONFIG.BASE_URL) return EMPTY_PAGE;
  const params = new URLSearchParams();
  if (q.category) params.set('category', q.category);
  if (q.brands?.length) params.set('brand', [...q.brands].sort().join(',')); // sorted: one cache entry per filter set
  params.set('sort', q.sort ?? 'latest');
  params.set('per_page', String(q.perPage ?? LISTING_PAGE_SIZE));
  params.set('page', String(q.page ?? 1));
  const { found, json } = await cmsGet(`${API_CONFIG.BASE_URL}/v1/products?${params}`);
  if (!found) return EMPTY_PAGE;
  const body = json as CmsProductList;
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
  seo?: {
    meta_title?: string | null;
    meta_description?: string | null;
    robots?: { index?: boolean } | null;
    open_graph?: { image?: { url?: string | null } | null } | null;
  } | null;
};

/**
 * /product/{slug}: null -> 404. { redirect } -> the slug was renamed in the CMS (the API
 * answers 301 and fetch follows it to the current product). CMS down -> error.tsx.
 */
export const getProduct = cache(async (slug: string): Promise<ProductDetail | { redirect: string } | null> => {
  if (!API_CONFIG.BASE_URL || !isSlug(slug)) return null;
  const { found, json } = await cmsGet(`${API_CONFIG.BASE_URL}/v1/products/${encodeURIComponent(slug)}`);
  const p = found ? (json as { data?: CmsProductDetail })?.data : undefined;
  const current = text(p?.slug);
  if (!p || !current) return null;
  if (current.toLowerCase() !== slug.toLowerCase()) return { redirect: current };

  const name = text(p.name) || current;
  const brandSlug = text(p.brand?.slug);
  const cat = (p.categories ?? []).find((c) => isSlug(text(c.slug)) && text(c.title));
  const catSlug = cat ? text(cat.slug) : '';

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
    category: cat ? { slug: catSlug, name: text(cat.title) } : null,
    highlights: specRows(p.highlights, 'h').slice(0, 3).map(({ label, value }) => ({ label, value })),
    specGroups,
    seo: {
      title: text(p.seo?.meta_title) || name,
      description: text(p.seo?.meta_description) || text(p.short_description),
      index: p.seo?.robots?.index !== false,
      image: mediaUrl(p.seo?.open_graph?.image?.url) ?? images[0]?.src ?? null,
    },
    fromBrand: others(byBrand),
    inCategory: others(byCategory),
  };
});

/** Every product slug (sitemap, build): all pages of GET /v1/products, 48 at a time */
export const getProductSlugs = cache(async (): Promise<string[]> => {
  if (!API_CONFIG.BASE_URL) return [];
  const slugs: string[] = [];
  for (let page = 1, last = 1; page <= last && page <= 50; page++) {
    const res = await getProducts({ page, perPage: 48 });
    slugs.push(...res.items.map((x) => x.slug));
    last = res.lastPage;
  }
  return slugs;
});
