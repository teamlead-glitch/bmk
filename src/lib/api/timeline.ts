import { cache } from 'react';
import { mediaUrl, text } from '@/lib/api/cms-mappers';
import { serverGetData } from '@/lib/api/server-api';
import type { Milestone } from '@/types/timeline';

/* ---------- Timeline (CMS: GET /v1/timeline-events) ---------- */
// { data: [{ id, year, title, description, icon, image: { url, alt } }] }
// Homepage "Our Journey" and About › Our journey, in the order set in the admin.
// CMS down -> CmsUnavailableError -> error.tsx. 404/410 -> an empty list (the section is hidden).

type CmsTimelineEvent = {
  id?: number | string;
  year?: number | string | null;
  title?: string | null;
  description?: string | null;
  icon?: string | null;
  image?: { url?: string | null; alt?: string | null } | null;
};

/** CMS icon keys we have an SVG for (public/assets/icons/milestone-*.svg) */
const ICONS = new Set(['camera', 'home', 'store', 'watch']);
const DEFAULT_ICON = 'store';
const iconPath = (key: unknown) => {
  const k = text(key).toLowerCase();
  return `/assets/icons/milestone-${ICONS.has(k) ? k : DEFAULT_ICON}.svg`;
};

export const getTimeline = cache(async (): Promise<Milestone[]> => {
  const list = await serverGetData<CmsTimelineEvent[]>('/v1/timeline-events');

  // Kept in the CMS order (drag to reorder in the admin), never re-sorted here
  return (list ?? []).flatMap((e, i): Milestone[] => {
    const year = text(e.year);
    const title = text(e.title);
    if (!year || !title) return [];
    return [{ id: String(e.id ?? i), year, title, description: text(e.description), icon: iconPath(e.icon), image: mediaUrl(e.image?.url) }];
  });
});
