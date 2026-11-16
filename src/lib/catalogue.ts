// Catalogue rules: lookups, spec templates, card highlights, slim client shapes.
// Pure functions over the catalogue data; used on the server (src/lib/content.ts).
import { brands, categories, groups, products, templates } from '@/data/catalogue';
import { brandLogos, brandMenuImage, brandStyle, DEFAULT_BRAND_COLOR, productMedia } from '@/data/media';
import type { Brand, BrandLite, CardProduct, Category, Group, Product, SpecValue, TemplateId } from '@/types/catalogue';

export const byId = <T extends { id: string }>(list: T[], id: string | undefined | null) => list.find((x) => x.id === id);
export const brandOf = (p: Product) => byId(brands, p.brand)!;
export const categoryOf = (p: Product) => byId(categories, p.category)!;
export const groupOf = (c: Category) => byId(groups, c.group)!;
export const productBySlug = (slug: string) => products.find((p) => p.slug === slug);
export const categoriesIn = (groupId: string) => categories.filter((c) => c.group === groupId);
export const countIn = (categoryId: string) => products.filter((p) => p.category === categoryId).length;

/** Spec template and card highlights: the product's own, else its category's. */
export const templateOf = (p: Product): TemplateId => p.template || categoryOf(p).template;
export const cardFieldsOf = (p: Product) => p.card || categoryOf(p).card;

/** Field label lookup across a template. */
export function fieldLabel(templateId: TemplateId, key: string): string {
  for (const g of templates[templateId] || []) for (const [k, l] of g.fields) if (k === key) return l;
  return key;
}

/** Shortest readable form of a spec value, for cards and highlight tiles. */
export function shortValue(v: SpecValue | null | undefined): string {
  if (v == null) return '';
  if (Array.isArray(v)) return v.length > 1 ? `${v[0]} +${v.length - 1}` : v[0];
  if (typeof v === 'object') return Object.values(v).join(' / ');
  return v;
}

export function highlightsFor(p: Product) {
  return cardFieldsOf(p)
    .filter((k) => p.specs[k] != null)
    .map((k) => ({ label: fieldLabel(templateOf(p), k), value: shortValue(p.specs[k]) }));
}

/** Template groups → filled rows; empty fields/groups dropped; unknown fields
 *  kept under "Other". Uses the product's own template when it has one (the
 *  design reference used the category's, which put film/printer specs under "Other"). */
export function specGroups(p: Product) {
  const used = new Set<string>();
  const out = (templates[templateOf(p)] || [])
    .map((g) => ({
      group: g.group,
      rows: g.fields
        .filter(([k]) => p.specs[k] != null && p.specs[k] !== '')
        .map(([k, label]) => (used.add(k), { key: k, label, value: p.specs[k] })),
    }))
    .filter((g) => g.rows.length);
  const extra = Object.keys(p.specs).filter((k) => !used.has(k));
  if (extra.length) out.push({ group: out.length ? 'Other' : 'Specifications', rows: extra.map((k) => ({ key: k, label: k, value: p.specs[k] })) });
  return out;
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

export const groupList = (): Group[] => groups;
