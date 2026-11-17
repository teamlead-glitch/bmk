// Catalogue rules: lookups, spec templates, card highlights, slim client shapes.
// Pure functions over the catalogue data; used by src/static/*-content.ts for the menus, search and homepage brands.
import { brands, categories, groups, products, templates } from '@/static/data/catalogue';
import { DEFAULT_BRAND_COLOR } from '@/constants/brand';
import { brandLogos, brandMenuImage, brandStyle, productMedia } from '@/static/data/media';
import type { Brand, BrandLite, CardProduct, Category, Product, SpecValue, TemplateId } from '@/types/catalogue';

const byId = <T extends { id: string }>(list: T[], id: string | undefined | null) => list.find((x) => x.id === id);
const brandOf = (p: Product) => byId(brands, p.brand)!;
const categoryOf = (p: Product) => byId(categories, p.category)!;
const groupOf = (c: Category) => byId(groups, c.group)!;
export const categoriesIn = (groupId: string) => categories.filter((c) => c.group === groupId);
export const countIn = (categoryId: string) => products.filter((p) => p.category === categoryId).length;

/** Spec template and card highlights: the product's own, else its category's. */
const templateOf = (p: Product): TemplateId => p.template || categoryOf(p).template;
const cardFieldsOf = (p: Product) => p.card || categoryOf(p).card;

/** Field label lookup across a template. */
function fieldLabel(templateId: TemplateId, key: string): string {
  for (const g of templates[templateId] || []) for (const [k, l] of g.fields) if (k === key) return l;
  return key;
}

/** Shortest readable form of a spec value, for cards and highlight tiles. */
function shortValue(v: SpecValue | null | undefined): string {
  if (v == null) return '';
  if (Array.isArray(v)) return v.length > 1 ? `${v[0]} +${v.length - 1}` : v[0];
  if (typeof v === 'object') return Object.values(v).join(' / ');
  return v;
}

function highlightsFor(p: Product) {
  return cardFieldsOf(p)
    .filter((k) => p.specs[k] != null)
    .map((k) => ({ label: fieldLabel(templateOf(p), k), value: shortValue(p.specs[k]) }));
}

/* ---------- Slim shapes for client components ---------- */

export function toCardProduct(p: Product): CardProduct {
  const b = brandOf(p);
  const c = categoryOf(p);
  const g = groupOf(c);
  const m = productMedia[p.slug] || {};
  return {
    slug: p.slug,
    name: p.name,
    model: p.model,
    modelNo: p.modelNo,
    brandId: b.id,
    brandName: b.name,
    categoryId: c.id,
    categoryName: c.name,
    groupId: g.id,
    groupName: g.name,
    released: p.released,
    short: p.short,
    template: categoryOf(p).template,
    highlights: highlightsFor(p),
    media: { card: m.card, brand: m.brand },
  };
}

export function toBrandLite(b: Brand): BrandLite {
  return {
    id: b.id,
    name: b.name,
    inHouse: !!b.inHouse,
    groups: b.groups,
    sites: b.sites || [],
    intro: b.intro,
    logo: brandLogos[b.id] || null,
    color: brandStyle[b.id] || DEFAULT_BRAND_COLOR,
    menuImage: brandMenuImage[b.id] || null,
  };
}

