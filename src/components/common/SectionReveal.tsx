'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

/** Sections below the fold fade up as they scroll into view (not the hero).
 *  A scroll check rather than an IntersectionObserver, so sections skipped by
 *  an anchor jump are revealed too (design: catalogue/src/main.js wireReveals). */
export function SectionReveal() {
  const pathname = usePathname();

  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const main = document.getElementById('main');
    if (!main) return;
    let pending = [...main.querySelectorAll<HTMLElement>(':scope > div > section, :scope > div > div > section')].filter(
      (s, i) => i > 0 && !s.classList.contains('photo-hero') && s.getBoundingClientRect().top > innerHeight * 0.92,
    );
    pending.forEach((s) => s.classList.add('reveal'));

    const check = () => {
      if (!pending.length) return;
      const edge = innerHeight * 0.86;
      pending = pending.filter((s) => (s.getBoundingClientRect().top < edge ? (s.classList.add('is-in'), false) : true));
    };
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => ((ticking = false), check()));
    };
    addEventListener('scroll', onScroll, { passive: true });
    return () => removeEventListener('scroll', onScroll);
  }, [pathname]);

  return null;
}
