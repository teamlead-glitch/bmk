/* ---------- Google Maps (About › Our companies: live map with a marker per company) ---------- */
// NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: a browser key (Maps JavaScript API), restricted in Google Cloud
// to the site's domains. Until it is set, the live map still loads and Google shows its own
// "for development purposes only" / auth error on it; the map works once the key is added (redeploy).
// Shared by server components (to choose) and src/components/company/MarkersMap.tsx (to draw).

export const GOOGLE_MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

export type MapMarker = { lat: number; lng: number; title: string };

/** Map markers for companies with coordinates */
export const companyMarkers = (companies: { name: string; geo: { lat: number; lng: number } | null }[]): MapMarker[] =>
  companies.flatMap((c) => (c.geo ? [{ lat: c.geo.lat, lng: c.geo.lng, title: c.name }] : []));

/** Whether the live map is shown: at least one company has coordinates (else the embed or preview) */
export const hasMarkersMap = (markers: MapMarker[]) => markers.length > 0;
