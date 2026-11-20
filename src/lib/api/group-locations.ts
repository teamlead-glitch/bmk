import { cache } from 'react';
import { mediaUrl, text } from '@/lib/api/cms-mappers';
import { serverGetData } from '@/lib/api/server-api';
import { href } from '@/lib/routes';
import type { PresenceLocation } from '@/types/company';

/* ---------- Group locations (CMS: GET /v1/group-locations) ---------- */
// Homepage Global Footprint: one map pin per location, in the admin's order (the first one is
// selected when the page loads), with its group companies in the card.
// Pin position: the location's `map_position` ({ x, y } or "x,y", % of the 1200×620 map) when
// set in the admin; else worked out from the first company's coordinates (lat/lng). A location
// with neither gets no pin (warning in the server log). CMS down -> CmsUnavailableError -> error.tsx.

type CmsCompany = {
  id?: number | string;
  name?: string | null;
  category?: string | null;
  coordinates?: { lat?: number | string | null; lng?: number | string | null } | null;
};
type CmsGroupLocation = {
  id?: number | string;
  location?: string | null;
  country?: { code?: string | null; name?: string | null } | null;
  map_position?: unknown;
  icon?: { url?: string | null } | null;
  group_companies?: CmsCompany[] | null;
};

// lat/lng -> % of the map frame: least-squares fit of the design's six pins to their cities'
// real coordinates (Dubai, Kochi, Singapore, Petaling Jaya, Lusaka, Kinshasa; within ~2%)
const fromLatLng = (lat: number, lng: number) => ({ x: 0.2928 * lng + 45.98, y: -0.6114 * lat + 63.25 });

const inFrame = (p: { x: number; y: number }) => p.x >= 0 && p.x <= 100 && p.y >= 0 && p.y <= 100;
const round = (n: number) => Math.round(n * 100) / 100;

/** map_position as { x, y } or "x,y" (percent) */
function mapPosition(v: unknown): { x: number; y: number } | null {
  const [x, y] =
    typeof v === 'string' ? v.split(/[,\s]+/).map(Number) : v && typeof v === 'object' ? [Number((v as { x?: unknown }).x), Number((v as { y?: unknown }).y)] : [NaN, NaN];
  return Number.isFinite(x) && Number.isFinite(y) && inFrame({ x, y }) ? { x, y } : null;
}

function position(l: CmsGroupLocation): { x: number; y: number } | null {
  const set = mapPosition(l.map_position);
  if (set) return set;
  for (const c of l.group_companies ?? []) {
    const lat = Number(c.coordinates?.lat);
    const lng = Number(c.coordinates?.lng);
    if (c.coordinates && Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180) {
      const p = fromLatLng(lat, lng);
      if (inFrame(p)) return p;
    }
  }
  return null;
}

export const getGroupLocations = cache(async (): Promise<PresenceLocation[]> => {
  const list = (await serverGetData<CmsGroupLocation[]>('/v1/group-locations')) ?? [];
  return list.flatMap((l, i) => {
    const city = text(l.location);
    const country = text(l.country?.name);
    if (!city && !country) return [];
    const at = position(l);
    if (!at) {
      console.warn(`[group-locations] "${city || country}" has no map_position or company coordinates: no pin`);
      return [];
    }
    const code = text(l.country?.code).toLowerCase();
    return [
      {
        id: String(l.id ?? i),
        city: city || country,
        country: country || city,
        x: round(at.x),
        y: round(at.y),
        icon: mediaUrl(l.icon?.url),
        href: href('/contact', code ? { country: code } : {}),
        companies: (l.group_companies ?? []).flatMap((c, j) => {
          const name = text(c.name);
          return name ? [{ id: String(c.id ?? j), name, kind: text(c.category) }] : [];
        }),
      },
    ];
  });
});
