import { cache } from 'react';
import { getCmsBrand, getCmsBrands, getCmsCategories, type CmsCategory } from '@/lib/api/brands-categories';
import { brandColor, isSlug, mediaUrl, text } from '@/lib/api/cms-mappers';
import { getProducts } from '@/lib/api/products';
import { serverGetData } from '@/lib/api/server-api';
import { getRedirectSlug, type DetailsResult } from '@/lib/api/slug-redirect';
import { cleanHtml, htmlToText } from '@/lib/sanitize-html';
import type { CmsListingData, CountedOption } from '@/types/listing';

/* ---------- Product listings: All products, category and brand pages ---------- */
// The page data around the product list: the category or brand record, the filters and
// tabs with their counts, and the first page of products (in the server HTML).

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

/**
 * /category/{slug}: null -> 404. { redirect } -> the slug was renamed in the CMS (the API
 * answers 301 and fetch follows it to the current category). CMS down -> error.tsx.
 */
export const getCategoryPage = cache(async (slug: string): Promise<DetailsResult<CmsListingData>> => {
  if (!isSlug(slug)) return null;
  const c = await serverGetData<CmsCategory>(`/v1/categories/${encodeURIComponent(slug)}`);
  const current = text(c?.slug);
  if (!c || !current) return null;
  const moved = getRedirectSlug(slug, current);
  if (moved) return { redirect: moved };

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

/**
 * /brand/{slug}: null -> 404. { redirect } -> the slug was renamed in the CMS (the API
 * answers 301 and fetch follows it to the current brand). CMS down -> error.tsx.
 */
export const getBrandPage = cache(async (slug: string): Promise<DetailsResult<CmsListingData>> => {
  const b = await getCmsBrand(slug);
  const current = text(b?.slug);
  if (!b || !current) return null;
  const moved = getRedirectSlug(slug, current);
  if (moved) return { redirect: moved };

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
    // Tabs list only categories with products; a brand with no products yet keeps every
    // assigned category (links in the "coming soon" box)
    categories: cats.map((c, i) => ({ id: text(c.slug), name: text(c.title), n: counts[i] })).filter((c) => !first.total || c.n > 0),
    brands: [],
    first,
  };
});
