import { cache } from 'react';
import { mediaUrl, text } from '@/lib/api/cms-mappers';
import { serverGetData } from '@/lib/api/server-api';
import { href } from '@/lib/routes';
import { cleanHtml, htmlToText } from '@/lib/sanitize-html';
import type { GlobePlace, GroupCompany, GroupLocation } from '@/types/company';

/* ---------- Group locations (CMS: GET /v1/group-locations) ---------- */
// Homepage Global Footprint (map pins + location card) and Contact › Our offices (one tab per
// location, a card per company), in the admin's order.
// Pin position: the location's `map_position` ({ x, y } or "x,y", % of the 1200×620 map) when
// set in the admin; else worked out from the first company's coordinates (lat/lng). A location
// with neither has no pin on the homepage map (warning in the server log) but still has its
// Contact tab. CMS down -> CmsUnavailableError -> error.tsx.

type CmsCompany = {
  id?: number | string;
  name?: string | null;
  short_description?: string | null;
  description?: string | null;
  website_url?: string | null;
  category?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  coordinates?: { lat?: number | string | null; lng?: number | string | null } | null;
  map_embed_url?: string | null;
  directions_url?: string | null;
};
type CmsGroupLocation = {
  id?: number | string;
  location?: string | null;
  country?: { code?: string | null; name?: string | null } | null;
  map_position?: unknown;
  icon?: { url?: string | null; alt?: string | null } | null;
  background?: { url?: string | null; alt?: string | null } | null;
  group_companies?: CmsCompany[] | null;
};

const SUMMARY_MAX = 240;

// lat/lng -> % of the map frame: least-squares fit of the design's six pins to their cities'
// real coordinates (Dubai, Kochi, Singapore, Petaling Jaya, Lusaka, Kinshasa; within ~2%)
const fromLatLng = (lat: number, lng: number) => ({ x: 0.2928 * lng + 45.98, y: -0.6114 * lat + 63.25 });
/** The same fit backwards: an admin map_position -> approximate lat/lng (About globe) */
const toLatLng = (p: { x: number; y: number }) => ({ lat: round((63.25 - p.y) / 0.6114), lng: round((p.x - 45.98) / 0.2928) });

const inFrame = (p: { x: number; y: number }) => p.x >= 0 && p.x <= 100 && p.y >= 0 && p.y <= 100;
const round = (n: number) => Math.round(n * 100) / 100;

/** map_position as { x, y } or "x,y" (percent) */
function mapPosition(v: unknown): { x: number; y: number } | null {
  const [x, y] =
    typeof v === 'string' ? v.split(/[,\s]+/).map(Number) : v && typeof v === 'object' ? [Number((v as { x?: unknown }).x), Number((v as { y?: unknown }).y)] : [NaN, NaN];
  return Number.isFinite(x) && Number.isFinite(y) && inFrame({ x, y }) ? { x, y } : null;
}

/** A company's coordinates when both are numbers in range */
function companyGeo(c: CmsCompany): { lat: number; lng: number } | null {
  const lat = Number(c.coordinates?.lat);
  const lng = Number(c.coordinates?.lng);
  return c.coordinates && Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180 ? { lat, lng } : null;
}

/** The first company with valid coordinates */
function coordinates(l: CmsGroupLocation): { lat: number; lng: number } | null {
  for (const c of l.group_companies ?? []) {
    const geo = companyGeo(c);
    if (geo) return geo;
  }
  return null;
}

/** Map pin (homepage) and globe position (About): admin map_position first, else coordinates */
function place(l: CmsGroupLocation): { position: { x: number; y: number } | null; geo: { lat: number; lng: number } | null } {
  const set = mapPosition(l.map_position);
  const geo = coordinates(l);
  if (set) return { position: set, geo: geo ?? toLatLng(set) };
  if (!geo) return { position: null, geo: null };
  const p = fromLatLng(geo.lat, geo.lng);
  return { position: inFrame(p) ? { x: round(p.x), y: round(p.y) } : null, geo };
}

/** Only a Google Maps embed may go in the office card's iframe */
const mapEmbed = (v: unknown) => {
  const url = mediaUrl(v);
  return url && /^https:\/\/(www\.)?google\.[a-z.]+\/maps\/embed\?/i.test(url) ? url : null;
};

function summary(c: CmsCompany): string {
  const short = text(c.short_description);
  if (short) return short;
  const plain = htmlToText(cleanHtml(text(c.description)));
  return plain.length > SUMMARY_MAX ? `${plain.slice(0, SUMMARY_MAX).replace(/\s+\S*$/, '')}…` : plain;
}

function toCompany(c: CmsCompany, i: number): GroupCompany | null {
  const name = text(c.name);
  if (!name) return null;
  const address = text(c.address).replace(/\r\n?/g, '\n');
  return {
    id: String(c.id ?? i),
    name,
    kind: text(c.category),
    summary: summary(c),
    address,
    phone: text(c.phone) || null,
    email: text(c.email) || null,
    website: mediaUrl(c.website_url),
    directions: mediaUrl(c.directions_url) ?? (address ? `https://www.google.com/maps/search/${encodeURIComponent(address.replace(/\n/g, ', '))}` : null),
    mapEmbed: mapEmbed(c.map_embed_url),
    geo: companyGeo(c),
  };
}

export const getGroupLocations = cache(async (): Promise<GroupLocation[]> => {
  const list = (await serverGetData<CmsGroupLocation[]>('/v1/group-locations')) ?? [];
  return list.flatMap((l, i) => {
    const city = text(l.location);
    const country = text(l.country?.name);
    if (!city && !country) return [];
    const id = String(l.id ?? i);
    const { position: at, geo } = place(l);
    if (!at) console.warn(`[group-locations] "${city || country}" has no map_position or company coordinates: no pin on the homepage map`);
    return [
      {
        id,
        city: city || country,
        country: country || city,
        countryCode: text(l.country?.code).toLowerCase(),
        position: at,
        geo,
        icon: mediaUrl(l.icon?.url),
        iconAlt: text(l.icon?.alt), // "Icon alt text" in the admin
        photo: mediaUrl(l.background?.url),
        photoAlt: text(l.background?.alt), // "Background alt text" in the admin
        href: href('/contact-us', { location: id }),
        companies: (l.group_companies ?? []).map(toCompany).filter((c): c is GroupCompany => !!c),
      },
    ];
  });
});

/** Globe pins (About › Who we are) for the locations with a real-world position. Two places
 *  close together (within 12° both ways) get their tags on opposite sides. */
export function toGlobePlaces(locations: GroupLocation[]): GlobePlace[] {
  const places: GlobePlace[] = locations.flatMap((l) =>
    l.geo ? [{ id: l.id, label: l.country && l.country !== l.city ? `${l.city}, ${l.country}` : l.city, lat: l.geo.lat, lon: l.geo.lng }] : [],
  );
  for (const a of places) {
    for (const b of places) {
      if (a === b || a.side || b.side) continue;
      if (Math.abs(a.lat - b.lat) < 12 && Math.abs(a.lon - b.lon) < 12) {
        const [west, east] = a.lon <= b.lon ? [a, b] : [b, a];
        west.side = 'left';
        east.side = 'right';
      }
    }
  }
  return places;
}
