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
import { API_CONFIG } from '@/constants/config';
import { cmsGet } from '@/lib/cms-fetch';
import { cleanHtml, htmlToText } from '@/lib/html';
import { href } from '@/lib/routes';
import type { BrandLite, CardProduct, CategoryLite, Group, NavData } from '@/types/catalogue';
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
