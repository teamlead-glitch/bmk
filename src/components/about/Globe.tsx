'use client';

/* eslint-disable @next/next/no-img-element -- pin icon (SVG) */
import { useEffect, useRef } from 'react';
import { globePlaces } from '@/data/visuals';

/**
 * About › Who we are: a dotted globe that tours BMK's locations and can be
 * dragged (design: catalogue/src/globe.js). Canvas 2D orthographic projection,
 * GSAP for the tour and Draggable + InertiaPlugin for the throw. GSAP and the
 * 46k-dot data load after the page is interactive.
 */
const RAD = Math.PI / 180;
const DOT = '#628abf'; // lighter brand blue
const LIFT = 26; // degrees above the globe centre where the active location rests
const PHI_MIN = -50;
const PHI_MAX = 55;
const BUCKETS = 7;

export function Globe() {
  const el = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = el.current!;
    const canvas = root.querySelector('canvas')!;
    const ctx = canvas.getContext('2d')!;
    const pins = globePlaces.map((p) => ({ ...p, el: root.querySelector<HTMLElement>(`[data-place="${p.id}"]`)! }));
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const coarse = matchMedia('(pointer: coarse)').matches;
    let cleanup = () => {};
    let alive = true;

    Promise.all([import('gsap'), import('gsap/Draggable'), import('gsap/InertiaPlugin'), fetch('/data/globe-dots.json').then((r) => r.json() as Promise<{ n: number; dots: number[] }>)])
      .then(([{ gsap }, { Draggable }, { InertiaPlugin }, globe]) => {
        if (!alive) return;
        gsap.registerPlugin(Draggable, InertiaPlugin);

        // Unit vectors for the dots, computed once
        const d = globe.dots;
        const pts = new Float32Array((d.length / 2) * 3);
        for (let i = 0, j = 0; i < d.length; i += 2, j += 3) {
          const la = d[i] * RAD;
          pts[j] = Math.cos(la);
          pts[j + 1] = Math.sin(la);
          pts[j + 2] = d[i + 1] * RAD;
        }
        const SPACING = Math.sqrt((4 * Math.PI) / globe.n);

        const view = { lam: globePlaces[0].lon, phi: globePlaces[0].lat - LIFT };
        let W = 0;
        let H = 0;
        let R = 0;
        let cx = 0;
        let cy = 0;
        let dpr = 1;
        let active = 0;
        let interacting = false;

        const project = (cosLat: number, sinLat: number, lon: number, sp: number, cp: number, lam: number) => {
          const dl = lon - lam;
          const cd = Math.cos(dl);
          return [cx + R * cosLat * Math.sin(dl), cy - R * (cp * sinLat - sp * cosLat * cd), sp * sinLat + cp * cosLat * cd];
        };

        const buckets: number[][] = Array.from({ length: BUCKETS }, () => []);
        const draw = () => {
          if (!W) return;
          const sp = Math.sin(view.phi * RAD);
          const cp = Math.cos(view.phi * RAD);
          const lam = view.lam * RAD;
          const base = SPACING * R * 0.29;
          buckets.forEach((b) => (b.length = 0));
          for (let j = 0; j < pts.length; j += 3) {
            const [x, y, z] = project(pts[j], pts[j + 1], pts[j + 2], sp, cp, lam);
            if (z < 0.03 || y < -8 || y > H + 8 || x < -8 || x > W + 8) continue;
            // Front dots are bigger and solid; towards the rim they shrink and fade
            buckets[Math.min(BUCKETS - 1, Math.floor(Math.pow(z, 0.75) * BUCKETS))].push(x, y, base * (0.35 + 0.65 * z));
          }
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          ctx.clearRect(0, 0, W, H);
          ctx.fillStyle = DOT;
          buckets.forEach((b, i) => {
            if (!b.length) return;
            ctx.globalAlpha = 0.14 + (0.86 * (i + 1)) / BUCKETS;
            ctx.beginPath();
            for (let k = 0; k < b.length; k += 3) {
              ctx.moveTo(b[k] + b[k + 2], b[k + 1]);
              ctx.arc(b[k], b[k + 1], b[k + 2], 0, Math.PI * 2);
            }
            ctx.fill();
          });
          ctx.globalAlpha = 1;
          // Pins and tags follow their projected positions
          pins.forEach((p, i) => {
            const [x, y, z] = project(Math.cos(p.lat * RAD), Math.sin(p.lat * RAD), p.lon * RAD, sp, cp, lam);
            const inside = z > 0.02 && y > 6 && y < H - 6 && x > 6 && x < W - 6;
            const tag = (interacting ? z > 0.72 : i === active) && inside;
            p.el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
            p.el.style.opacity = inside ? Math.min(1, z * 3).toFixed(2) : '0';
            p.el.classList.toggle('show-tag', tag);
          });
        };

        const size = () => {
          const r = root.getBoundingClientRect();
          dpr = Math.min(devicePixelRatio || 1, 2);
          W = r.width;
          H = r.height;
          canvas.width = Math.round(W * dpr);
          canvas.height = Math.round(H * dpr);
          R = Math.min(W * 0.74, H * 1.02);
          cx = W / 2;
          cy = H + R * 0.02;
          draw();
        };

        // Tour: rotate to each location in turn, drift slowly while it rests
        let tween: gsap.core.Timeline | null = null;
        let idle: gsap.core.Tween | null = null;
        const shortest = (from: number, to: number) => from + ((((to - from) % 360) + 540) % 360) - 180;
        const goTo = (i: number) => {
          active = i;
          const p = globePlaces[i];
          tween?.kill();
          tween = gsap
            .timeline({ onUpdate: draw, onComplete: () => goTo((i + 1) % globePlaces.length) })
            .to(view, { lam: shortest(view.lam, p.lon), phi: p.lat - LIFT, duration: 2.4, ease: 'power2.inOut', onUpdate: draw })
            .add(() => draw())
            .to(view, { lam: '+=3', duration: 2.8, ease: 'none', onUpdate: draw });
        };
        const nearest = () => {
          let best = 0;
          let bd = Infinity;
          globePlaces.forEach((p, i) => {
            const dd = Math.abs(shortest(view.lam, p.lon) - view.lam) + Math.abs(p.lat - LIFT - view.phi);
            if (dd < bd) {
              bd = dd;
              best = i;
            }
          });
          return best;
        };
        const startTour = (i = nearest()) => !reduced && goTo(i);
        const pauseTour = () => (tween?.kill(), idle?.kill());

        // Drag: spin (x) and tilt (y), mouse and touch
        const proxy = document.createElement('div');
        let lx = 0;
        let ly = 0;
        const gain = () => (180 / Math.PI / R) * (coarse ? 1.7 : 1);
        function onMove(this: Draggable) {
          view.lam -= (this.x - lx) * gain();
          view.phi = gsap.utils.clamp(PHI_MIN, PHI_MAX, view.phi + (this.y - ly) * gain());
          lx = this.x;
          ly = this.y;
          draw();
        }
        const settle = () => {
          idle?.kill();
          idle = gsap.delayedCall(3.5, () => {
            interacting = false;
            startTour();
          });
        };
        const [drag] = Draggable.create(proxy, {
          trigger: root,
          type: 'x,y',
          inertia: !reduced,
          allowNativeTouchScrolling: false,
          cursor: 'grab',
          activeCursor: 'grabbing',
          onPress() {
            pauseTour();
            interacting = true;
            root.classList.add('is-touched');
            lx = this.x;
            ly = this.y;
            draw();
          },
          onDrag: onMove,
          onThrowUpdate: onMove,
          onRelease() {
            if (!this.tween || !this.tween.isActive()) settle();
          },
          onThrowComplete: settle,
        });

        // Only animate while on screen
        let running = false;
        const io = new IntersectionObserver(([e]) => {
          if (e.isIntersecting && !running) {
            running = true;
            if (!interacting) startTour(active);
          } else if (!e.isIntersecting && running) {
            running = false;
            pauseTour();
          }
        });
        io.observe(root);
        const ro = new ResizeObserver(size);
        ro.observe(root);
        size();

        cleanup = () => {
          pauseTour();
          drag.kill();
          io.disconnect();
          ro.disconnect();
        };
      })
      .catch(() => {});

    return () => {
      alive = false;
      cleanup();
    };
  }, []);

  return (
    <div ref={el} className="globe" role="img" aria-label={`Globe showing BMK Group locations: ${globePlaces.map((p) => p.label).join(', ')}`}>
      <canvas className="globe-canvas" aria-hidden="true" />
      <div className="globe-pins" aria-hidden="true">
        {globePlaces.map((p) => (
          <div key={p.id} className="globe-pin" data-place={p.id}>
            <span className="globe-dot" />
            <span className={`globe-tag is-${p.side || 'center'}`}>
              <img src="/assets/icons/map-pin-orange.svg" alt="" width={12} height={16} />
              {p.label}
            </span>
          </div>
        ))}
      </div>
      <p className="globe-hint" aria-hidden="true">
        Drag to explore
      </p>
    </div>
  );
}
