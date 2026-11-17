// Catalogue search. Pure functions over the slim shapes, so the same rules run
// in the /api/search route (search panel) and in the browser (search page).
// Every query token must match name/model/brand/category text; punctuation-
// insensitive, so "xt5" finds "X-T5".
import type { BrandLite, CardProduct, CategoryLite, Group } from '@/types/catalogue';

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '');

export function searchProducts(list: CardProduct[], q: string): CardProduct[] {
  const tokens = q.toLowerCase().split(/\s+/).map(norm).filter(Boolean);
  if (!tokens.length) return [];
  return list.filter((p) => {
    const hay = norm([p.name, p.model, p.modelNo, p.brandName, p.categoryName, p.groupName].join(' '));
    return tokens.every((t) => hay.includes(t));
  });
}

export function searchBrands(list: BrandLite[], q: string): BrandLite[] {
  const n = norm(q);
  return n ? list.filter((b) => norm(b.name).includes(n) || n.includes(norm(b.name))) : [];
}

export function searchCategories(list: CategoryLite[], groups: Group[], q: string): CategoryLite[] {
  const n = norm(q);
  const groupName = (id: string) => groups.find((g) => g.id === id)?.name ?? '';
  return n ? list.filter((c) => norm(c.name).includes(n) || norm(groupName(c.group)).includes(n)) : [];
}

export interface SearchSuggestions {
  products: CardProduct[];
  total: number;
  brands: BrandLite[];
  categories: CategoryLite[];
}
