/* ---------- CONTENT LAYER (the one place pages get their data) ---------- */
// Today every function reads the sample content shipped with the design
// reference (src/data/*). When the CMS API is ready, replace each body with a
// cmsGet(...) call (src/lib/cms-fetch.ts) and map the answer to the same return
// type: pages and components do not change. Keep the slimming (only the fields
// the UI shows go to client components).
//
// Functions are wrapped in React cache() so generateMetadata and the page share
// one call per request.
import { cache } from 'react';
import { brands, categories, groups, products } from '@/data/catalogue';
import * as company from '@/data/company';
import { categoryHero, brandStyle, productMedia } from '@/data/media';
import { countryVisual, DEFAULT_LOCATION } from '@/data/visuals';
import {
  brandOf,
  byId,
  categoriesIn,
  categoryOf,
  countIn,
  fieldLabel,
  groupOf,
  productBySlug,
  shortValue,
  specGroups,
  templateOf,
  toBrandLite,
  toCardProduct,
} from '@/lib/catalogue';
import { href } from '@/lib/routes';
import type { BrandLite, CardProduct, CategoryLite, Group, NavData } from '@/types/catalogue';
import type { Location } from '@/types/company';

/* ---------- Navigation (layouts) ---------- */

const categoryLites = (): CategoryLite[] => categories.map((c) => ({ id: c.id, name: c.name, group: c.group, count: countIn(c.id) }));

export const getNavData = cache(async (): Promise<NavData> => {
  const all = brands.map(toBrandLite);
  return {
    groups,
    categories: categoryLites(),
    inHouseBrands: all.filter((b) => b.inHouse),
    partnerBrands: all.filter((b) => !b.inHouse),
  };
});

export const getContact = cache(async () => company.contact);

/* ---------- Search index (search panel API, search page) ---------- */

export const getSearchIndex = cache(async () => ({
  products: products.map(toCardProduct),
  brands: brands.map(toBrandLite),
  categories: categoryLites(),
  groups,
}));

/* ---------- Listing pages ---------- */

export type ListingKind = 'all' | 'search' | 'brand' | 'group' | 'category';

export interface ListingContext {
  kind: ListingKind;
  /** Page path without query, e.g. "/brand/nikon" */
  path: string;
  title: string;
  brand?: BrandLite;
  group?: Group;
  category?: CategoryLite & { desc: string };
  heroImage?: string | null;
}

export interface ListingData {
  ctx: ListingContext;
  /** Every product the page can show before filters (search: all products) */
  base: CardProduct[];
  brands: BrandLite[];
  categories: CategoryLite[];
  groups: Group[];
}

/** null → the page answers 404. BMK's own brands have no brand page. */
export const getListing = cache(async (kind: ListingKind, id?: string): Promise<ListingData | null> => {
  const shared = { brands: brands.map(toBrandLite), categories: categoryLites(), groups };
  const cards = (list: typeof products) => list.map(toCardProduct);

  if (kind === 'all') return { ctx: { kind, path: '/products', title: 'All products' }, base: cards(products), ...shared };
  if (kind === 'search') return { ctx: { kind, path: '/search', title: 'Search' }, base: cards(products), ...shared };

  if (kind === 'brand') {
    const b = byId(brands, id);
    if (!b || b.inHouse) return null;
    return {
      ctx: { kind, path: `/brand/${b.id}`, title: b.name, brand: toBrandLite(b), heroImage: brandStyle[b.id]?.hero ?? null },
      base: cards(products.filter((p) => p.brand === b.id)),
      ...shared,
    };
  }

  // /category/{id} is either a group or a category
  const g = byId(groups, id);
  if (g) {
    return {
      ctx: { kind: 'group', path: `/category/${g.id}`, title: g.name, group: g, heroImage: categoryHero[g.id] ?? null },
      base: cards(products.filter((p) => categoryOf(p).group === g.id)),
      ...shared,
    };
  }
  const c = byId(categories, id);
  if (!c) return null;
  return {
    ctx: {
      kind: 'category',
      path: `/category/${c.id}`,
      title: c.name,
      group: groupOf(c),
      category: { id: c.id, name: c.name, group: c.group, count: countIn(c.id), desc: c.desc },
      heroImage: categoryHero[c.id] || categoryHero[c.group] || null,
    },
    base: cards(products.filter((p) => p.category === c.id)),
    ...shared,
  };
});

export const getListingParams = cache(async () => ({
  groups: groups.map((g) => g.id),
  categories: categories.map((c) => c.id),
  brands: brands.filter((b) => !b.inHouse).map((b) => b.id),
}));

/* ---------- Product detail ---------- */

export const getProduct = cache(async (slug: string) => {
  const p = productBySlug(slug);
  if (!p) return null;
  const b = brandOf(p);
  const c = categoryOf(p);
  const g = groupOf(c);
  const m = productMedia[p.slug] || {};
  const tpl = templateOf(p);
  return {
    slug: p.slug,
    name: p.name,
    model: p.model,
    modelNo: p.modelNo,
    short: p.short,
    overview: p.overview,
    features: p.features ?? [],
    images: p.images,
    /** Stage glyph follows the category template, as in the design */
    glyph: c.template,
    brand: toBrandLite(b),
    category: { id: c.id, name: c.name },
    group: { id: g.id, name: g.name },
    highlights: c.card.filter((k) => p.specs[k] != null).map((k) => ({ key: k, label: fieldLabel(tpl, k), value: shortValue(p.specs[k]) })),
    specGroups: specGroups(p),
    media: m,
    fromBrand: products.filter((x) => x.brand === p.brand && x.slug !== p.slug).slice(0, 4).map(toCardProduct),
    inCategory: products.filter((x) => x.category === p.category && x.slug !== p.slug).slice(0, 4).map(toCardProduct),
  };
});
export type ProductPageData = NonNullable<Awaited<ReturnType<typeof getProduct>>>;

export const getProductSlugs = cache(async () => products.map((p) => p.slug));

/* ---------- Company (homepage, About, FAQ, Contact) ---------- */

export const getCompany = cache(async () => ({
  ...company,
  locations: company.countries.map(
    (c): Location => ({
      ...c,
      ...countryVisual[c.id],
      companies: company.entitiesIn(c.id),
      href: href('/contact', { country: c.id }),
    }),
  ),
  defaultLocation: DEFAULT_LOCATION,
}));

export const getHomeBrands = cache(async () => {
  const all = brands.map(toBrandLite);
  return {
    partner: all.filter((b) => !b.inHouse),
    own: all.filter((b) => b.inHouse),
    filters: [{ id: 'all', label: 'All' }, ...groups.map((g) => ({ id: g.id, label: g.name }))],
  };
});

export { categoriesIn };
