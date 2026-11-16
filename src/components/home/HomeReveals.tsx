'use client';

import { useEffect } from 'react';
import { getLenis, gsap, ScrollTrigger, SplitText } from '@/lib/gsap';

/**
 * Declarative scroll reveals on the homepage (design: src/modules/reveals.js):
 *   data-split          heading lines rise out of a mask
 *   data-reveal="up"    fade + rise
 *   data-reveal="clip"  image wipes up, inner <img> settles from 1.2× scale
 *   data-reveal-group   direct children stagger in
 *   data-parallax-img   image drifts slower than the page
 * Elements start hidden (html.js-motion, set before paint in the root layout).
 * Render LAST on the page so the pinned sections above are measured first.
 * Also smooth-scrolls in-page anchors (#contact, #history) with Lenis.
 */
export function HomeReveals() {
  useEffect(() => {
    const main = document.getElementById('main');
    if (!main) return;
    const all = '[data-split],[data-reveal],[data-reveal-group] > *';
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ctx = gsap.context(() => {
      if (reduced) {
        gsap.set(all, { clearProps: 'all', visibility: 'visible' });
        return;
      }
      const onEnter = (el: Element, start = 'top 85%') => ({ trigger: el, start, once: true });

      main.querySelectorAll<HTMLElement>('[data-split]').forEach((el) => {
        gsap.set(el, { visibility: 'visible' });
        SplitText.create(el, {
          type: 'lines',
          mask: 'lines',
          autoSplit: true, // re-split on resize / font load
          onSplit: (self) => gsap.from(self.lines, { yPercent: 110, stagger: 0.08, duration: 1.2, scrollTrigger: onEnter(el) }),
        });
      });
      gsap.utils.toArray<HTMLElement>('[data-reveal="up"]', main).forEach((el) => {
        gsap.from(el, { y: 32, autoAlpha: 0, duration: 1.1, scrollTrigger: onEnter(el) });
      });
      gsap.utils.toArray<HTMLElement>('[data-reveal="clip"]', main).forEach((el) => {
        gsap
          .timeline({ scrollTrigger: onEnter(el, 'top 80%') })
          .set(el, { visibility: 'visible' })
          .fromTo(el, { clipPath: 'inset(100% 0% 0% 0% round 12px)' }, { clipPath: 'inset(0% 0% 0% 0% round 12px)', duration: 1.4, ease: 'expo.inOut' })
          .from(el.querySelector('img'), { scale: 1.25, duration: 1.8, ease: 'expo.out' }, 0.2);
      });
      gsap.utils.toArray<HTMLElement>('[data-reveal-group]', main).forEach((group) => {
        gsap.from(group.children, { y: 60, autoAlpha: 0, stagger: 0.12, duration: 1.2, scrollTrigger: onEnter(group, 'top 80%') });
      });
      gsap.utils.toArray<HTMLElement>('[data-parallax-img]', main).forEach((img) => {
        gsap.fromTo(img, { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
      });
      ScrollTrigger.refresh();
    }, main);

    // Images/fonts change layout after load → re-measure every trigger once
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener('load', refresh);
    document.fonts?.ready.then(refresh);

    // In-page anchors: smooth-scroll with Lenis
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element).closest<HTMLAnchorElement>('#main a[href^="#"]');
      const id = a?.getAttribute('href') ?? '';
      const target = id.length > 1 ? document.querySelector(id) : null;
      if (!target || e.defaultPrevented) return;
      e.preventDefault();
      const lenis = getLenis();
      if (lenis) lenis.scrollTo(target, { offset: -24, duration: 1.4 });
      else target.scrollIntoView();
    };
    document.addEventListener('click', onClick);

    return () => {
      window.removeEventListener('load', refresh);
      document.removeEventListener('click', onClick);
      ctx.revert();
    };
  }, []);
  return null;
}
