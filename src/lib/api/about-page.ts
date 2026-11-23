import { cache } from 'react';
import { text } from '@/lib/api/cms-mappers';
import { serverGetData } from '@/lib/api/server-api';
import { cleanHtml } from '@/lib/sanitize-html';
import type { AboutPage, CoreValue } from '@/types/about';

/* ---------- About page (CMS: GET /v1/settings/about/page) ---------- */
// { data: { title, description (HTML), mission, vision, core_values: [{ title, icon, description }],
//           companies: { description }, brands: { title, description } } }
// Missing fields come back empty and the About sections leave them out.
// CMS down -> CmsUnavailableError -> error.tsx.

type CmsAboutPage = {
  title?: string | null;
  description?: string | null;
  mission?: string | null;
  vision?: string | null;
  core_values?: { title?: string | null; icon?: string | null; description?: string | null }[] | null;
  companies?: { description?: string | null } | null;
  brands?: { title?: string | null; description?: string | null } | null;
};

/** Core value icon picked in the admin (key) -> SVG in public/assets/icons/. One entry per option
 *  of the admin's icon list, with the other spellings a key may come in (e.g. "users"). */
const ICON_FILES: Record<string, string> = {
  star: 'star',
  verified: 'verified',
  flag: 'value-flag',
  trophy: 'value-trophy',
  rocket: 'value-rocket',
  'rocket-launch': 'value-rocket',
  building: 'value-building',
  office: 'value-building',
  location: 'value-location',
  'map-pin': 'value-location',
  globe: 'value-globe',
  world: 'value-globe',
  people: 'value-people',
  users: 'value-people',
  team: 'value-people',
  idea: 'value-idea',
  lightbulb: 'value-idea',
  'light-bulb': 'value-idea',
  delivery: 'value-delivery',
  truck: 'value-delivery',
  product: 'value-product',
  box: 'value-product',
  package: 'value-product',
  achievement: 'value-achievement',
  award: 'value-achievement',
  medal: 'value-achievement',
};
/** No icon picked ("None") -> null (no icon circle); a key we have no SVG for -> the verified badge */
const iconPath = (key: unknown): string | null => {
  const k = text(key).toLowerCase().replace(/[\s_]+/g, '-');
  if (!k || k === 'none') return null;
  return `/assets/icons/${ICON_FILES[k] ?? 'verified'}.svg`;
};

export const getAboutPage = cache(async (): Promise<AboutPage> => {
  const data = await serverGetData<CmsAboutPage>('/v1/settings/about/page');

  const values: CoreValue[] = (data?.core_values ?? []).flatMap((v) => {
    const name = text(v.title);
    return name ? [{ name, text: text(v.description), icon: iconPath(v.icon) }] : [];
  });

  return {
    title: text(data?.title),
    html: cleanHtml(text(data?.description)),
    mission: text(data?.mission),
    vision: text(data?.vision),
    values,
    companiesText: text(data?.companies?.description),
    brandsTitle: text(data?.brands?.title),
    brandsText: text(data?.brands?.description),
  };
});
