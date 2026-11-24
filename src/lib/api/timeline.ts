import { cache } from 'react';
import { mediaUrl, text } from '@/lib/api/cms-mappers';
import { serverGetData } from '@/lib/api/server-api';
import type { Milestone } from '@/types/timeline';

/* ---------- Timeline (CMS: GET /v1/timeline-events) ---------- */
// { data: [{ id, year, title, description, icon: { url, alt }, image: { url, alt } }] }
// Homepage "Our Journey" and About › Our journey, in the order set in the admin.
// CMS down -> CmsUnavailableError -> error.tsx. 404/410 -> an empty list (the section is hidden).

type CmsImage = { url?: string | null; alt?: string | null };
type CmsTimelineEvent = {
  id?: number | string;
  year?: number | string | null;
  title?: string | null;
  description?: string | null;
  /** The icon uploaded in the admin ({ url, alt }); older records: a key such as "camera" */
  icon?: CmsImage | string | null;
  image?: CmsImage | null;
};

/** Icon keys we have an SVG for (public/assets/icons/milestone-*.svg), used when nothing is uploaded */
const ICONS = new Set(['camera', 'home', 'store', 'watch']);
const DEFAULT_ICON = 'store';

/** The uploaded icon, else the local SVG for the key, else the default icon */
function iconPath(icon: CmsTimelineEvent['icon']): string {
  const uploaded = icon && typeof icon === 'object' ? mediaUrl(icon.url) : null;
  if (uploaded) return uploaded;
  const k = text(typeof icon === 'string' ? icon : '').toLowerCase();
  return `/assets/icons/milestone-${ICONS.has(k) ? k : DEFAULT_ICON}.svg`;
}

export const getTimeline = cache(async (): Promise<Milestone[]> => {
  const list = await serverGetData<CmsTimelineEvent[]>('/v1/timeline-events');

  // Kept in the CMS order (drag to reorder in the admin), never re-sorted here
  return (list ?? []).flatMap((e, i): Milestone[] => {
    const year = text(e.year);
    const title = text(e.title);
    if (!year || !title) return [];
    const image = mediaUrl(e.image?.url);
    return [
      {
        id: String(e.id ?? i),
        year,
        title,
        description: text(e.description),
        icon: iconPath(e.icon),
        // Alt texts as entered in the admin (Icon alt text, Image alt text)
        iconAlt: e.icon && typeof e.icon === 'object' ? text(e.icon.alt) : '',
        image,
        imageAlt: image ? text(e.image?.alt) : '',
      },
    ];
  });
});
