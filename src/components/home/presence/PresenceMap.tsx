'use client';

/* eslint-disable @next/next/no-img-element -- city icons (SVG) */
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Arrow } from '@/components/common/Arrow';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import type { PresenceLocation } from '@/types/company';

/**
 * Group presence map (design: src/modules/map.js).
 * The 7,664 dots come from the Figma layer coordinates (public/data/map-dots.json,
 * 1200×620 frame space), drawn on a canvas so every dot can react to the cursor.
 * Pins are real <button>s at % positions: aligned at any width, keyboard accessible.
 */
const INK = [0, 0, 0];
const NAVY = [31, 72, 125];
const HOVER_RADIUS = 70; // frame units
const HOVER_SCALE = 1.9;
const GAP = 28; // popover: clear of the pin's ring
const EDGE = 24; // popover: breathing room from the viewport edges

type MapData = { w: number; h: number; r: number; dots: number[] };

export function PresenceMap({ locations }: { locations: PresenceLocation[] }) {
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const card = useRef<HTMLElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const pins = useRef<(HTMLButtonElement | null)[]>([]);

  const start = 0; // the first location in the admin's order
  const [current, setCurrent] = useState(start); // selected pin
  const [shown, setShown] = useState(start); // content in the card
  const currentRef = useRef(start);
  const swapDir = useRef(0);
  const placeRef = useRef<() => void>(() => {});
  const reducedRef = useRef(false);

  /* ---------- Canvas: dots, reveal wave, cursor reaction ---------- */
  useEffect(() => {
    const cv = canvas.current!;
    const ctx = cv.getContext('2d')!;
    const reduced = (reducedRef.current = matchMedia('(prefers-reduced-motion: reduce)').matches);
    const view = { reveal: reduced ? 1 : 0, mx: -9999, my: -9999, hover: 0 };
    let data: MapData | null = null;
    let scale = 1;
    let dpr = 1;
    let raf = 0;

    const draw = () => {
      raf = 0;
      if (!data) return;
      const { w: FW, r: R, dots } = data;
      const count = dots.length / 2;
      const s = scale * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, cv.width, cv.height);
      ctx.setTransform(s, 0, 0, s, 0, 0);
      // Reveal is a soft wave sweeping west → east
      const front = view.reveal * (FW + 240) - 120;
      const hoverOn = view.hover > 0.01;
      const buckets: number[][] = [[], [], [], [], [], []]; // quantised alpha, batched fills
      const hovered: number[] = [];
      for (let i = 0; i < count; i++) {
        const x = dots[i * 2];
        const y = dots[i * 2 + 1];
        const a = Math.min(1, Math.max(0, (front - x + (y % 37)) / 120));
        if (a <= 0) continue;
        if (hoverOn) {
          const dx = x - view.mx;
          const dy = y - view.my;
          const d2 = dx * dx + dy * dy;
          if (d2 < HOVER_RADIUS * HOVER_RADIUS) {
            hovered.push(x, y, a, 1 - Math.sqrt(d2) / HOVER_RADIUS);
            continue;
          }
        }
        buckets[Math.round(a * 5)].push(x, y);
      }
      ctx.fillStyle = `rgb(${INK})`;
      buckets.forEach((pts, b) => {
        if (!b || !pts.length) return;
        ctx.globalAlpha = b / 5;
        ctx.beginPath();
        for (let j = 0; j < pts.length; j += 2) {
          ctx.moveTo(pts[j] + R, pts[j + 1]);
          ctx.arc(pts[j], pts[j + 1], R, 0, Math.PI * 2);
        }
        ctx.fill();
      });
      for (let j = 0; j < hovered.length; j += 4) {
        const t = hovered[j + 3] * view.hover;
        const e = t * t * (3 - 2 * t); // smoothstep
        const c = INK.map((v, k) => Math.round(v + (NAVY[k] - v) * e));
        ctx.globalAlpha = hovered[j + 2];
        ctx.fillStyle = `rgb(${c})`;
        ctx.beginPath();
        ctx.arc(hovered[j], hovered[j + 1], R * (1 + (HOVER_SCALE - 1) * e), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };
    const requestDraw = () => {
      if (!raf) raf = requestAnimationFrame(draw);
    };
    const resize = () => {
      const rect = cv.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = Math.round(rect.width * dpr);
      cv.height = Math.round(rect.height * dpr);
      scale = rect.width / (data?.w ?? 1200);
      draw();
    };

    let alive = true;
    fetch('/data/map-dots.json')
      .then((r) => r.json())
      .then((d: MapData) => {
        if (!alive) return;
        data = d;
        resize();
      })
      .catch(() => {});

    const ro = new ResizeObserver(resize);
    ro.observe(cv);

    const ctxG = gsap.context(() => {
      // Cursor-reactive dots (fine pointers only)
      const host = cv.parentElement!;
      let onMove: ((e: PointerEvent) => void) | null = null;
      let onLeave: (() => void) | null = null;
      if (!reduced && matchMedia('(pointer: fine)').matches) {
        const hoverTo = gsap.quickTo(view, 'hover', { duration: 0.5, ease: 'power2.out', onUpdate: requestDraw });
        onMove = (e) => {
          const rect = cv.getBoundingClientRect();
          view.mx = (e.clientX - rect.left) / scale;
          view.my = (e.clientY - rect.top) / scale;
          hoverTo(1);
          requestDraw();
        };
        onLeave = () => hoverTo(0);
        host.addEventListener('pointermove', onMove);
        host.addEventListener('pointerleave', onLeave);
      }

      // Entrance: dots sweep in, pins pop, card rises
      if (!reduced) {
        const pinEls = pins.current.filter(Boolean);
        gsap.set(pinEls, { scale: 0, autoAlpha: 0 });
        gsap.set(card.current, { y: 40, autoAlpha: 0 });
        ScrollTrigger.create({
          trigger: root.current,
          start: 'top 75%',
          once: true,
          onEnter: () => {
            gsap
              .timeline()
              .to(view, { reveal: 1, duration: 2.2, ease: 'power2.inOut', onUpdate: requestDraw })
              .to(pinEls, { scale: 1, autoAlpha: 1, duration: 0.8, ease: 'back.out(3)', stagger: 0.12 }, 1.1)
              .add(() => placeRef.current(), 1.2)
              .to(card.current, { y: 0, autoAlpha: 1, duration: 1.1 }, 1.3);
          },
        });
      }
      return () => {
        if (onMove) host.removeEventListener('pointermove', onMove);
        if (onLeave) host.removeEventListener('pointerleave', onLeave);
      };
    });

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      ctxG.revert();
    };
  }, []);

  /* ---------- Desktop popover placement (xl+) ---------- */
  // The card opens beside the selected pin: right when it fits, else left,
  // centred on the pin and kept inside the viewport (below the navbar) and the section.
  const place = useCallback(() => {
    const c = card.current;
    const pin = pins.current[currentRef.current];
    const section = root.current?.closest('section');
    if (!c || !pin || !section) return;
    if (!matchMedia('(min-width: 1280px)').matches) {
      c.style.left = c.style.top = c.style.transformOrigin = '';
      return;
    }
    const s = section.getBoundingClientRect();
    const p = pin.getBoundingClientRect();
    const px = p.left + p.width / 2;
    const py = p.top + p.height / 2;
    const w = c.offsetWidth;
    const h = c.offsetHeight;
    const vw = document.documentElement.clientWidth;
    const vh = window.innerHeight;
    const nav = document.getElementById('nav');
    const navBottom = Math.max(0, nav ? nav.getBoundingClientRect().bottom : 0);
    let side = 'right';
    let x = px + GAP;
    if (x + w > vw - EDGE) {
      side = 'left';
      x = px - GAP - w;
    }
    x = gsap.utils.clamp(EDGE, vw - w - EDGE, x);
    const top = Math.max(EDGE, navBottom + 12, s.top + EDGE);
    const bottom = Math.min(vh - EDGE, s.bottom - EDGE);
    let y = py - h / 2;
    y = bottom - top >= h ? gsap.utils.clamp(top, bottom - h, y) : top;
    c.style.left = `${Math.round(x - s.left)}px`;
    c.style.top = `${Math.round(y - s.top)}px`;
    c.dataset.side = side;
    c.style.transformOrigin = `${side === 'right' ? '0%' : '100%'} ${gsap.utils.clamp(0, 100, ((py - y) / h) * 100)}%`;
  }, []);
  useEffect(() => {
    placeRef.current = place;
    const section = root.current?.closest('section');
    const ro = new ResizeObserver(place);
    if (section) ro.observe(section);
    const mq = matchMedia('(min-width: 1280px)');
    mq.addEventListener('change', place);
    place();
    return () => (ro.disconnect(), mq.removeEventListener('change', place));
  }, [place]);

  /* ---------- Selecting a location ---------- */
  const select = (next: number) => {
    const i = (next + locations.length) % locations.length;
    if (i === currentRef.current) return;
    swapDir.current = i > currentRef.current ? 1 : -1;
    currentRef.current = i;
    setCurrent(i);
    if (reducedRef.current) return setShown(i);
    const c = card.current!;
    if (matchMedia('(min-width: 1280px)').matches) {
      // Card tucks away, jumps to the new pin, then pulls up beside it
      gsap.killTweensOf(c);
      gsap.to(c, { autoAlpha: 0, y: 10, scale: 0.97, duration: 0.2, ease: 'power2.in', onComplete: () => setShown(i) });
    } else {
      // Mobile: content slides within the card
      gsap.to([iconRef.current, bodyRef.current], { x: -16 * swapDir.current, autoAlpha: 0, duration: 0.22, ease: 'power2.in', stagger: 0.03, onComplete: () => setShown(i) });
    }
  };

  // New content is in the card: place it and bring it back
  const first = useRef(true);
  useLayoutEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    place();
    if (reducedRef.current) return;
    const c = card.current!;
    if (matchMedia('(min-width: 1280px)').matches) gsap.fromTo(c, { autoAlpha: 0, y: 28, scale: 0.96 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.75, ease: 'expo.out' });
    else gsap.fromTo([iconRef.current, bodyRef.current], { x: 16 * swapDir.current }, { x: 0, autoAlpha: 1, duration: 0.6, stagger: 0.05 });
  }, [shown, place]);

  const loc = locations[shown];

  return (
    <>
      {/* xl: capped by height too, so the whole map fits one fold on short screens */}
      <div ref={root} className="map relative mx-auto mt-10 w-[calc(100%-24px)] xl:mt-0 xl:w-3/4 xl:max-w-[calc((100svh-120px)*1200/620)]" data-map>
        <div className="relative aspect-[1200/620]">
          <canvas ref={canvas} className="map-canvas absolute inset-0 size-full" aria-hidden="true" />
          <div className="map-pins absolute inset-0 z-20" role="group" aria-label="Group entities">
            {locations.map((l, i) => (
              <button
                key={l.id}
                ref={(el) => {
                  pins.current[i] = el;
                }}
                type="button"
                className="pin group absolute grid size-8 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full"
                style={{ left: `${l.x}%`, top: `${l.y}%` }}
                aria-pressed={i === current}
                aria-label={`${l.city}, ${l.country}: ${l.companies.length} compan${l.companies.length === 1 ? 'y' : 'ies'}`}
                onClick={() => select(i)}
              >
                <span className="pin-ring" />
                <span className="pin-dot" />
                <span className="pointer-events-none absolute bottom-full left-1/2 mb-1 -translate-x-1/2 translate-y-1 rounded-full bg-ink px-3 py-1 text-xs whitespace-nowrap text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
                  {l.city}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Location card (Figma 360×352). Mobile: under the map. xl+: popover beside the pin. */}
      <div className="shell mt-8 xl:pointer-events-none xl:absolute xl:inset-0 xl:z-30 xl:mt-0 xl:max-w-none xl:p-0">
        <article
          ref={card}
          className="location-card pointer-events-auto flex w-full max-w-[380px] flex-col gap-10 rounded-xl bg-white p-6 drop-shadow-[0_20px_10px_rgba(0,0,0,0.08)] xl:absolute xl:top-0 xl:left-0 xl:w-[380px]"
          aria-live="polite"
          onKeyDown={(e) => {
            if (e.key === 'ArrowLeft') select(currentRef.current - 1);
            if (e.key === 'ArrowRight') select(currentRef.current + 1);
          }}
        >
          <div className="flex items-start justify-between">
            <div ref={iconRef} className="loc-icon grid size-16 place-items-center">
              {loc.icon ? (
                <img src={loc.icon} alt="" width={64} height={64} className="size-16" />
              ) : (
                <span className="grid size-16 place-items-center rounded-full bg-fog">
                  <span className="size-3 rounded-full bg-accent" />
                </span>
              )}
            </div>
            <div className="flex gap-1">
              <button type="button" className="icon-btn hover:bg-fog" onClick={() => select(currentRef.current - 1)} aria-label="Previous location">
                <Arrow tone="dark" className="size-4 -scale-x-100" />
              </button>
              <button type="button" className="icon-btn hover:bg-fog" onClick={() => select(currentRef.current + 1)} aria-label="Next location">
                <Arrow tone="dark" className="size-4" />
              </button>
            </div>
          </div>
          <div ref={bodyRef} className="loc-body flex flex-col items-start gap-4">
            <div>
              <p className="loc-city text-xs tracking-[0.14em] text-black/50 uppercase">{loc.city}</p>
              <h3 className="loc-entity mt-1 text-2xl leading-7 font-semibold text-black">{loc.country}</h3>
            </div>
            <ul className="loc-list flex w-full flex-col gap-2">
              {loc.companies.map((c) => (
                <li key={c.id} className="flex flex-col gap-0.5 rounded-lg bg-fog px-4 py-3">
                  <span className="text-[15px] leading-5 font-semibold text-black">{c.name}</span>
                  <span className="text-[13px] leading-5 text-black/50">
                    {[c.kind, loc.city].filter(Boolean).join(' · ')}
                  </span>
                </li>
              ))}
            </ul>
            <Link href={loc.href} className="loc-link btn btn-navy">
              View Details <Arrow />
            </Link>
          </div>
        </article>
      </div>
    </>
  );
}
