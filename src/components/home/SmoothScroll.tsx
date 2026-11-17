'use client';

import Lenis from 'lenis';
import { useEffect } from 'react';
import { gsap, ScrollTrigger, setLenis } from '@/lib/gsap';

/** Homepage only: Lenis smoothing makes the pinned, scrubbed sections feel continuous.
 *  Driven by GSAP's ticker so Lenis and ScrollTrigger read the same position.
 *  Pauses while a popup (body.no-scroll) is open. Render it FIRST on the page:
 *  effects run in tree order, and the pinned sections below rely on it. */
export function SmoothScroll() {
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
      prevent: (node: HTMLElement) => node.hasAttribute?.('data-lenis-prevent-wheel') && node.scrollWidth > node.clientWidth,
    });
    setLenis(lenis);
    lenis.on('scroll', ScrollTrigger.update);
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    const mo = new MutationObserver(() => (document.body.classList.contains('no-scroll') ? lenis.stop() : lenis.start()));
    mo.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    return () => {
      mo.disconnect();
      gsap.ticker.remove(raf);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
      setLenis(null);
    };
  }, []);
  return null;
}
