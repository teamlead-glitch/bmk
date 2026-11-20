'use client';

import { useEffect, useRef, useState } from 'react';
import { GOOGLE_MAPS_KEY as KEY, type MapMarker } from '@/lib/google-maps';

/* ---------- Google map with a marker per company (Maps JavaScript API) ---------- */
// Key: NEXT_PUBLIC_GOOGLE_MAPS_API_KEY (src/lib/google-maps.ts); until it is set Google shows its auth
// error on the map. With no company coordinates the caller shows its fallback instead: hasMarkersMap().
// The script loads once per page, the first time a map comes near the screen.

const CALLBACK = '__bmkMapsReady';
const SINGLE_ZOOM = 14; // one marker: street level around it

// Just the parts of google.maps used here (no @types/google.maps dependency)
type LatLng = { lat: number; lng: number };
type GMap = { fitBounds(b: unknown, pad?: number): void; setCenter(p: LatLng): void; setZoom(z: number): void };
type GMarker = { addListener(e: string, f: () => void): void; setMap(m: GMap | null): void };
type Maps = {
  Map: new (el: HTMLElement, o: Record<string, unknown>) => GMap;
  Marker: new (o: { position: LatLng; map: GMap; title: string }) => GMarker;
  LatLngBounds: new () => { extend(p: LatLng): void };
  InfoWindow: new () => { setContent(c: string | Node): void; open(o: { map: GMap; anchor: GMarker }): void };
};

let loading: Promise<Maps> | null = null;
function loadMaps(): Promise<Maps> {
  const w = window as unknown as { google?: { maps?: Maps }; [CALLBACK]?: () => void };
  if (w.google?.maps?.Map) return Promise.resolve(w.google.maps);
  loading ??= new Promise<Maps>((resolve, reject) => {
    w[CALLBACK] = () => resolve(w.google!.maps!);
    const s = document.createElement('script');
    // No key yet: Google still draws the map, with its own auth error on it
    s.src = `https://maps.googleapis.com/maps/api/js?${KEY ? `key=${encodeURIComponent(KEY)}&` : ''}v=weekly&loading=async&callback=${CALLBACK}`;
    s.async = true;
    s.onerror = () => {
      loading = null;
      reject(new Error('Google Maps failed to load'));
    };
    document.head.appendChild(s);
  });
  return loading;
}

/** A live Google map with a marker per company; the view fits every marker */
export function MarkersMap({ markers, label, className = '' }: { markers: MapMarker[]; label: string; className?: string }) {
  const el = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  // Redraw only when the markers themselves change (a parent re-render passes a new array)
  const sig = JSON.stringify(markers);

  useEffect(() => {
    const node = el.current;
    const markers = JSON.parse(sig) as MapMarker[];
    if (!node || !markers.length) return;
    let alive = true;
    let placed: GMarker[] = [];

    const draw = (maps: Maps) => {
      if (!alive) return;
      const map = new maps.Map(node, { mapTypeControl: false, streetViewControl: false, fullscreenControl: true, clickableIcons: false });
      const info = new maps.InfoWindow();
      const bounds = new maps.LatLngBounds();
      placed = markers.map((m) => {
        const position = { lat: m.lat, lng: m.lng };
        const marker = new maps.Marker({ position, map, title: m.title });
        marker.addListener('click', () => {
          const text = document.createElement('strong');
          text.textContent = m.title; // text only: CMS names never become HTML
          info.setContent(text);
          info.open({ map, anchor: marker });
        });
        bounds.extend(position);
        return marker;
      });
      if (markers.length === 1) {
        map.setCenter({ lat: markers[0].lat, lng: markers[0].lng });
        map.setZoom(SINGLE_ZOOM);
      } else {
        map.fitBounds(bounds, 48);
      }
    };

    // Load Google's script only when the map is about to be seen
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        loadMaps()
          .then(draw)
          .catch(() => alive && setFailed(true));
      },
      { rootMargin: '300px' },
    );
    io.observe(node);
    return () => {
      alive = false;
      io.disconnect();
      placed.forEach((m) => m.setMap(null));
    };
  }, [sig]);

  return (
    <div className={`relative aspect-[672/370] overflow-hidden rounded-2xl bg-mist ${className}`}>
      <div ref={el} className="absolute inset-0" role="region" aria-label={`Map of ${label}: ${markers.map((m) => m.title).join(', ')}`} />
      {failed && <p className="absolute inset-0 grid place-items-center p-6 text-center text-sm text-muted">The map couldn’t be loaded.</p>}
    </div>
  );
}
