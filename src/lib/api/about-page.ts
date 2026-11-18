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

/** CMS icon keys we have an SVG for (public/assets/icons/<key>.svg) */
const ICONS = new Set(['star', 'verified']);
const DEFAULT_ICON = 'verified';
const iconPath = (key: unknown) => {
  const k = text(key).toLowerCase();
  return `/assets/icons/${ICONS.has(k) ? k : DEFAULT_ICON}.svg`;
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
