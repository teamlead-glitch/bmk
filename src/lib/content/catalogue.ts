import { cache } from 'react';
import { API_CONFIG } from '@/constants/config';
import { LISTING_PAGE_SIZE } from '@/constants/listing';
import { cmsGet } from '@/lib/cms-fetch';
import { brandColor, isSlug, mediaUrl, text, type CmsRef } from '@/lib/content/cms';
import { cleanHtml, htmlToText } from '@/lib/html';
import type { CardProduct } from '@/types/catalogue';
import type { CmsListingData, CountedOption, ProductPage, ProductSort } from '@/types/listing';
import type { ProductDetail } from '@/types/product';

/* ---------- CMS catalogue: All products and category pages ---------- */
// GET /v1/products (one page of the listing), /v1/categories and /v1/brands (filters).
// Categories are flat in the CMS (subcategories are switched off). The browser loads more
// pages, filters and sorts through /api/products/ (src/app/api/products/route.ts), which
// calls getProducts.

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
type CmsCategory = {
  slug?: string | null;
  title?: string | null;
  short_description?: string | null;
  image?: { url?: string | null } | null;
  banner?: { url?: string | null } | null;
  products_count?: number | null;
};
type CmsBrand = {
  slug?: string | null;
  name?: string | null;
  introduction?: string | null;
  color?: string | null;
  logo?: { url?: string | null } | null;
  banner?: { url?: string | null } | null;
  categories?: CmsRef[] | null;
};

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

const getCmsCategories = cache(async (): Promise<CmsCategory[]> => {
  if (!API_CONFIG.BASE_URL) return [];
  const { found, json } = await cmsGet(`${API_CONFIG.BASE_URL}/v1/categories`);
  return found ? ((json as { data?: CmsCategory[] })?.data ?? []) : [];
});

const getCmsBrands = cache(async (): Promise<CmsBrand[]> => {
  if (!API_CONFIG.BASE_URL) return [];
  const { found, json } = await cmsGet(`${API_CONFIG.BASE_URL}/v1/brands`);
  return found ? ((json as { data?: CmsBrand[] })?.data ?? []) : [];
});

/** Brand filter: brands with products (in one category, or anywhere), with their count */
async function brandOptions(category?: string): Promise<CountedOption[]> {
  const list = (await getCmsBrands()).filter((b) => isSlug(text(b.slug)) && (!category || (b.categories ?? []).some((x) => text(x.slug) === category)));
  const counts = await Promise.all(list.map((b) => getProducts({ category, brands: [text(b.slug)], perPage: 1 }).then((r) => r.total)));
  return list.map((b, i) => ({ id: text(b.slug), name: text(b.name) || text(b.slug), n: counts[i] })).filter((o) => o.n > 0);
}

/** Categories with products, in CMS order (`keep`: always listed, e.g. the current one) */
async function categoryOptions(keep?: string): Promise<CountedOption[]> {
  return (await getCmsCategories())
    .map((x) => ({ id: text(x.slug), name: text(x.title), n: Number(x.products_count) || 0 }))
    .filter((x) => isSlug(x.id) && x.name && (x.n > 0 || x.id === keep));
}

/** /products: every product, with Category and Brand filters. CMS down -> error.tsx. */
export const getAllProductsPage = cache(async (): Promise<CmsListingData> => {
  const [categories, brandsList, first] = await Promise.all([categoryOptions(), brandOptions(), getProducts({ page: 1 })]);
  return { kind: 'all', category: null, brand: null, categories, brands: brandsList, first };
});

/** Slugs of the CMS categories (built at deploy time, sitemap) */
export const getCategorySlugs = cache(async (): Promise<string[]> => (await getCmsCategories()).map((c) => text(c.slug)).filter(isSlug));

/**
 * /category/{slug}: null -> 404. { redirect } -> the slug was renamed in the CMS (the API
 * answers 301 and fetch follows it to the current category). CMS down -> error.tsx.
 */
export const getCategoryPage = cache(async (slug: string): Promise<CmsListingData | { redirect: string } | null> => {
  if (!API_CONFIG.BASE_URL || !isSlug(slug)) return null;
  const { found, json } = await cmsGet(`${API_CONFIG.BASE_URL}/v1/categories/${encodeURIComponent(slug)}`);
  const c = found ? (json as { data?: CmsCategory })?.data : undefined;
  const current = text(c?.slug);
  if (!c || !current) return null;
  if (current.toLowerCase() !== slug.toLowerCase()) return { redirect: current };

  const [categories, brandsList, first] = await Promise.all([categoryOptions(current), brandOptions(current), getProducts({ category: current, page: 1 })]);

  return {
    kind: 'category',
    brand: null,
    category: {
      slug: current,
      title: text(c.title) || current,
      short: text(c.short_description) || null,
      banner: mediaUrl(c.banner?.url) ?? mediaUrl(c.image?.url),
      count: Number(c.products_count) || first.total,
    },
    categories,
    brands: brandsList,
    first,
  };
});

/** Slugs of the CMS brands (built at deploy time, sitemap) */
export const getBrandSlugs = cache(async (): Promise<string[]> => (await getCmsBrands()).map((b) => text(b.slug)).filter(isSlug));

/**
 * /brand/{slug}: null -> 404. { redirect } -> the slug was renamed in the CMS (the API
 * answers 301 and fetch follows it to the current brand). CMS down -> error.tsx.
 */
export const getBrandPage = cache(async (slug: string): Promise<CmsListingData | { redirect: string } | null> => {
  if (!API_CONFIG.BASE_URL || !isSlug(slug)) return null;
  const { found, json } = await cmsGet(`${API_CONFIG.BASE_URL}/v1/brands/${encodeURIComponent(slug)}`);
  const b = found ? (json as { data?: CmsBrand })?.data : undefined;
  const current = text(b?.slug);
  if (!b || !current) return null;
  if (current.toLowerCase() !== slug.toLowerCase()) return { redirect: current };

  // Category tabs: the brand's categories, with its product count in each
  const cats = (b.categories ?? []).filter((c) => isSlug(text(c.slug)) && text(c.title));
  const [first, counts] = await Promise.all([
    getProducts({ brands: [current], page: 1 }),
    Promise.all(cats.map((c) => getProducts({ category: text(c.slug), brands: [current], perPage: 1 }).then((r) => r.total))),
  ]);
  const name = text(b.name) || current;
  return {
    kind: 'brand',
    category: null,
    brand: {
      slug: current,
      name,
      intro: htmlToText(cleanHtml(text(b.introduction))),
      logo: mediaUrl(b.logo?.url),
      banner: mediaUrl(b.banner?.url),
      color: brandColor(b.color),
    },
    categories: cats.map((c, i) => ({ id: text(c.slug), name: text(c.title), n: counts[i] })).filter((c) => c.n > 0),
    brands: [],
    first,
  };
});

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
