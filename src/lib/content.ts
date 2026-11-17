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
import { DEFAULT_BRAND_COLOR, productMedia } from '@/data/media';
import { countryVisual, DEFAULT_LOCATION } from '@/data/visuals';
import {
  brandOf,
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
import { API_CONFIG } from '@/constants/config';
import { cmsGet } from '@/lib/cms-fetch';
import { cleanHtml, htmlToText } from '@/lib/html';
import { href } from '@/lib/routes';
import type { BrandColor, BrandLite, CardProduct, CountedOption, CategoryLite, CmsListingData, Group, NavData, ProductPage, ProductSort } from '@/types/catalogue';
import type { Contact, Faq, FaqTopic, Location, SocialId } from '@/types/company';
import type { HeroSlide, HomeBanner } from '@/types/home';

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

/* ---------- Site contact details (CMS: GET /v1/settings/contact) ---------- */
// { data: { phone, email, office_address, social: { facebook, twitter, youtube, instagram, linkedin } } }
// Footer, Contact Us, legal pages and the homepage JSON-LD. Empty fields are hidden.

type CmsContact = {
  data?: { phone?: string | null; email?: string | null; office_address?: string | null; social?: Record<string, string | null> | null };
};

// Footer order (the design's), CMS key -> icon
const SOCIALS: { key: string; id: SocialId; label: string }[] = [
  { key: 'facebook', id: 'facebook', label: 'Facebook' },
  { key: 'instagram', id: 'instagram', label: 'Instagram' },
  { key: 'linkedin', id: 'linkedin', label: 'LinkedIn' },
  { key: 'twitter', id: 'x', label: 'X' },
  { key: 'youtube', id: 'youtube', label: 'YouTube' },
];

const NO_CONTACT: Contact = { phone: null, email: null, address: [], social: [] };

export const getContact = cache(async (): Promise<Contact> => {
  if (!API_CONFIG.BASE_URL) {
    console.warn('[contact] NEXT_PUBLIC_API_URI is not set: no contact details');
    return NO_CONTACT;
  }
  const { found, json } = await cmsGet(`${API_CONFIG.BASE_URL}/v1/settings/contact`);
  const data = found ? (json as CmsContact)?.data : undefined;
  if (!data) return NO_CONTACT;

  const email = String(data.email ?? '').trim();
  const social = data.social ?? {};
  return {
    phone: String(data.phone ?? '').trim() || null,
    email: /^[^\s@<>"']+@[^\s@<>"']+$/.test(email) ? email : null,
    address: String(data.office_address ?? '')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean),
    social: SOCIALS.flatMap(({ key, id, label }) => {
      const url = mediaUrl(social[key]);
      return url ? [{ id, label, href: url }] : [];
    }),
  };
});

/** tel: link for a phone number as typed in the CMS ("+971 4 232 4747" -> "tel:+97142324747") */
export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, '')}`;
}

/* ---------- Search index (search panel API, search page) ---------- */

export const getSearchIndex = cache(async () => ({
  products: products.map(toCardProduct),
  brands: brands.map(toBrandLite),
  categories: categoryLites(),
  groups,
}));

/* ---------- Listing pages ---------- */

// All products (/products), category pages (/category/{slug}) and brand pages
// (/brand/{slug}) come from the CMS: getAllProductsPage, getCategoryPage, getBrandPage below.
export type ListingKind = 'search';

export interface ListingContext {
  kind: ListingKind;
  /** Page path without query, e.g. "/brand/nikon" */
  path: string;
  title: string;
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
export const getListing = cache(
  async (kind: ListingKind): Promise<ListingData> => ({
    ctx: { kind, path: '/search', title: 'Search' },
    base: products.map(toCardProduct),
    brands: brands.map(toBrandLite),
    categories: categoryLites(),
    groups,
  }),
);

/* ---------- CMS catalogue: All products and category pages ---------- */
// GET /v1/products (one page of the listing), /v1/categories and /v1/brands (filters).
// Categories are flat in the CMS (subcategories are switched off). The browser loads more
// pages, filters and sorts through /api/products/ (src/app/api/products/route.ts), which
// calls getProducts.

/** Products per page */
export const LISTING_PAGE_SIZE = 12;
const SLUG = /^[a-z0-9][a-z0-9-]{0,190}$/i;
export const isSlug = (v: string) => SLUG.test(v);

type CmsRef = { id?: number; slug?: string | null; name?: string | null; title?: string | null };
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

const text = (v: unknown) => String(v ?? '').trim();

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

/** Brand colour from the CMS ("#d12e2e"), with a black or white label colour that reads on it */
function brandColor(hex: unknown): BrandColor {
  const m = text(hex).match(/^#?([0-9a-f]{6})$/i);
  if (!m) return DEFAULT_BRAND_COLOR;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return { color: `#${m[1].toLowerCase()}`, on: luminance > 0.4 ? '#121212' : '#ffffff' };
}

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

/* ---------- FAQ (CMS: GET /v1/faqs) ---------- */
// { data: { categories: [{ id, name, faqs: [{ id, question, answer }] }], uncategorized: [...] } }
// Each category becomes a topic; uncategorized questions go under "General", last.

type CmsFaq = { id?: number | string; question?: string; answer?: string };
type CmsFaqCategory = { id?: number | string; name?: string; faqs?: CmsFaq[] };
type CmsFaqAnswer = { data?: { categories?: CmsFaqCategory[]; uncategorized?: CmsFaq[] } };

const GENERAL_TOPIC: FaqTopic = { id: 'general', name: 'General' };

function toFaq(f: CmsFaq, topic: string): Faq | null {
  const q = String(f.question ?? '').trim();
  const html = cleanHtml(String(f.answer ?? ''));
  if (!q || !html) return null;
  return { id: String(f.id ?? q), topic, q, html, text: htmlToText(html) };
}

export const getFaqs = cache(async (): Promise<{ faqs: Faq[]; topics: FaqTopic[] }> => {
  if (!API_CONFIG.BASE_URL) {
    console.warn('[faq] NEXT_PUBLIC_API_URI is not set: the FAQ page has no questions');
    return { faqs: [], topics: [] };
  }
  // CMS down -> CmsUnavailableError -> error.tsx. 404/410 -> an empty list, never a fake 404 page.
  const { found, json } = await cmsGet(`${API_CONFIG.BASE_URL}/v1/faqs`);
  const data = found ? (json as CmsFaqAnswer)?.data : undefined;

  const faqs: Faq[] = [];
  const topics: FaqTopic[] = [];
  for (const c of data?.categories ?? []) {
    const topic = { id: `topic-${c.id}`, name: String(c.name ?? '').trim() };
    const items = (c.faqs ?? []).map((f) => toFaq(f, topic.id)).filter((f): f is Faq => !!f);
    if (!topic.name || !items.length) continue; // empty categories get no filter pill
    topics.push(topic);
    faqs.push(...items);
  }
  const general = (data?.uncategorized ?? []).map((f) => toFaq(f, GENERAL_TOPIC.id)).filter((f): f is Faq => !!f);
  if (general.length) {
    topics.push(GENERAL_TOPIC);
    faqs.push(...general);
  }
  return { faqs, topics };
});

/* ---------- Homepage hero (CMS: GET /v1/settings/home-banner) ---------- */
// { data: { display_type: "video" | "image" | "video_url", video, video_url, slides: [...] } }
// The hero shows only what this setting says. Empty or unusable setting -> { kind: 'none' }
// (text on the dark background). CMS down -> CmsUnavailableError -> error.tsx.

const NO_BANNER: HomeBanner = { kind: 'none' };

type CmsImage = { url?: string | null; alt?: string | null } | null;
type CmsSlide = {
  id?: number | string;
  title?: string | null;
  tagline?: string | null;
  button?: { text?: string | null; url?: string | null } | null;
  images?: { web?: CmsImage; mobile?: CmsImage } | null;
};
type CmsHomeBanner = { data?: { display_type?: string; video?: string | null; video_url?: string | null; slides?: CmsSlide[] } };

/** Absolute http(s) URL, upgraded to https (the CMS answers http:// links; the site is https) */
function mediaUrl(url: unknown): string | null {
  const value = String(url ?? '').trim();
  if (!/^https?:\/\/[^\s"'<>]+$/i.test(value)) return null;
  return value.replace(/^http:\/\//i, 'https://');
}

/** YouTube id from watch, youtu.be, embed and shorts links */
function youTubeId(url: unknown): string | null {
  const m = String(url ?? '').match(/(?:youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/i);
  return m ? m[1] : null;
}

/** CMS button link: site paths stay internal, other http(s) links open in a new tab */
function slideLink(url: unknown): { href: string; external: boolean } | null {
  const value = String(url ?? '').trim();
  if (/^\/(?!\/)/.test(value)) return { href: value, external: false };
  const abs = mediaUrl(value);
  return abs ? { href: abs, external: true } : null;
}

function toSlide(s: CmsSlide): HeroSlide | null {
  const src = mediaUrl(s.images?.web?.url);
  const title = String(s.title ?? '').trim();
  if (!src || !title) return null;
  const mobileSrc = mediaUrl(s.images?.mobile?.url);
  const link = slideLink(s.button?.url);
  const text = String(s.button?.text ?? '').trim();
  return {
    id: String(s.id ?? src),
    title,
    tagline: String(s.tagline ?? '').trim() || undefined,
    button: link && text ? { text, ...link } : undefined,
    image: { src, alt: String(s.images?.web?.alt ?? '').trim() },
    mobile: mobileSrc ? { src: mobileSrc, alt: String(s.images?.mobile?.alt ?? '').trim() } : undefined,
  };
}

export const getHomeBanner = cache(async (): Promise<HomeBanner> => {
  if (!API_CONFIG.BASE_URL) {
    console.warn('[home-banner] NEXT_PUBLIC_API_URI is not set: the hero has no background');
    return NO_BANNER;
  }
  const { found, json } = await cmsGet(`${API_CONFIG.BASE_URL}/v1/settings/home-banner`);
  const data = found ? (json as CmsHomeBanner)?.data : undefined;

  switch (data?.display_type) {
    case 'video': {
      const src = mediaUrl(data.video);
      if (src) return { kind: 'video', src };
      break;
    }
    case 'video_url': {
      const id = youTubeId(data.video_url);
      if (id) return { kind: 'youtube', id };
      const src = mediaUrl(data.video_url); // a direct .mp4 link also works
      if (src && /\.(mp4|webm)(\?|$)/i.test(src)) return { kind: 'video', src };
      break;
    }
    case 'image': {
      const slides = (data.slides ?? []).map(toSlide).filter((s): s is HeroSlide => !!s);
      if (slides.length) return { kind: 'slides', slides };
      break;
    }
  }
  console.warn(`[home-banner] empty or unusable setting "${data?.display_type ?? ''}": the hero has no background`);
  return NO_BANNER;
});

export const getHomeBrands = cache(async () => {
  const all = brands.map(toBrandLite);
  return {
    partner: all.filter((b) => !b.inHouse),
    own: all.filter((b) => b.inHouse),
    filters: [{ id: 'all', label: 'All' }, ...groups.map((g) => ({ id: g.id, label: g.name }))],
  };
});

export { categoriesIn };
