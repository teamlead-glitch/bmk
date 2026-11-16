'use client';

import { useEffect } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';

/**
 * History timeline (design: src/modules/timeline.js).
 * Desktop (≥1024px): the section pins and vertical scroll drives the card row
 * sideways; the orange thumb tracks progress and the card under it becomes active.
 * Smaller screens: native horizontal swipe with the same thumb.
 * Hovering a card always previews its active state.
 */
export function TimelineMotion() {
  useEffect(() => {
    const section = document.querySelector<HTMLElement>('.history');
    if (!section) return;
    const viewport = section.querySelector<HTMLElement>('.history-viewport')!;
    const track = section.querySelector<HTMLElement>('.history-track')!;
    const thumb = section.querySelector<HTMLElement>('.history-thumb')!;
    const cards = [...track.children] as HTMLElement[];
    const marks = section.querySelectorAll('.history-mark');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

    let scrollActive = 0;
    let hoverActive = -1;
    const paint = () => {
      const i = hoverActive >= 0 ? hoverActive : scrollActive;
      cards.forEach((c, k) => c.classList.toggle('is-active', k === i));
    };
    const offs: (() => void)[] = [];
    cards.forEach((c, i) => {
      const enter = (e: PointerEvent) => e.pointerType === 'mouse' && ((hoverActive = i), paint());
      const leave = () => ((hoverActive = -1), paint());
      c.addEventListener('pointerenter', enter);
      c.addEventListener('pointerleave', leave);
      offs.push(() => (c.removeEventListener('pointerenter', enter), c.removeEventListener('pointerleave', leave)));
    });

    const thumbRange = () => thumb.parentElement!.clientWidth - thumb.offsetWidth;
    const setProgress = (p: number) => {
      gsap.set(thumb, { x: p * thumbRange() });
      const i = Math.round(p * (cards.length - 1));
      if (i !== scrollActive) {
        scrollActive = i;
        paint();
      }
    };
    paint();

    // Native swipe (mobile/tablet)
    const onSwipe = () => {
      const max = viewport.scrollWidth - viewport.clientWidth;
      if (max > 0) setProgress(viewport.scrollLeft / max);
    };
    viewport.addEventListener('scroll', onSwipe, { passive: true });
    offs.push(() => viewport.removeEventListener('scroll', onSwipe));

    if (reduced) return () => offs.forEach((f) => f());

    const resetThumb = () => gsap.set(thumb, { x: 0 });
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add('(min-width: 1024px)', () => {
        viewport.scrollLeft = 0;
        const distance = () => {
          const cs = getComputedStyle(viewport);
          const inner = viewport.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
          return Math.max(0, track.scrollWidth - inner);
        };
        gsap
          .timeline({
            defaults: { ease: 'none' },
            scrollTrigger: {
              trigger: section,
              start: 'top top',
              end: () => `+=${Math.max(window.innerHeight * 0.9, distance() * 2.2)}`,
              pin: true,
              scrub: 0.8,
              invalidateOnRefresh: true,
              onUpdate: (self) => setProgress(self.progress),
            },
          })
          .to(track, { x: () => -distance(), duration: 1 }, 0)
          // Watermarks drift up and fade out as the timeline is scrolled through
          .to(marks, { yPercent: (i: number) => -45 - i * 8, autoAlpha: 0, duration: 0.7, ease: 'power1.in', stagger: 0.05 }, 0.3);
        return () => gsap.set(track, { x: 0 });
      });

      // Cards rise in as the section arrives
      gsap.from(cards, { y: 80, autoAlpha: 0, stagger: 0.08, duration: 1.2, scrollTrigger: { trigger: track, start: 'top 90%', once: true } });
      gsap.from(marks, { autoAlpha: 0, yPercent: 20, stagger: 0.12, duration: 2, scrollTrigger: { trigger: section, start: 'top 70%', once: true } });
    }, section);
    ScrollTrigger.addEventListener('refreshInit', resetThumb);

    return () => {
      ScrollTrigger.removeEventListener('refreshInit', resetThumb);
      offs.forEach((f) => f());
      ctx.revert();
    };
  }, []);
  return null;
}
