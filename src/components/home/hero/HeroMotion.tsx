'use client';

import { useEffect } from 'react';
import { gsap, SplitText } from '@/lib/gsap';

/**
 * Hero motion (design: src/modules/hero.js), for any CMS background (video, YouTube, slides):
 * - Pinned scroll-out: watermark drifts up, the white gradient rises and the CTAs dissolve into it.
 * - Intro: navbar, background zoom, headline lines, copy, CTAs, years card and counter.
 * The pinned ScrollTrigger is created immediately so sections below measure the pin spacing.
 */
export function HeroMotion() {
  useEffect(() => {
    const section = document.querySelector<HTMLElement>('.hero');
    if (!section) return;
    const media = section.querySelector<HTMLElement>('.hero-media')!;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      section.querySelector('video')?.pause(); // a still frame, no looping background
      return;
    }
    const small = matchMedia('(max-width: 767px)').matches;

    const ctx = gsap.context(() => {
      const partners = section.querySelectorAll('.hero-partner');
      const partnerIcons = section.querySelectorAll('.hero-partner img');

      // 0.3–0.7 watermark drifts up; 0.52–0.9 white gradient rises, CTAs dissolve
      // into it; 0.84 bottom edge sealed white (no seam on high-DPI).
      gsap
        .timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: () => `+=${window.innerHeight * (small ? 1 : 1.6)}`,
            pin: true,
            scrub: 0.6,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        })
        .to({}, { duration: 1 }, 0) // keeps the timeline 1 long, so the steps below land where the design put them
        .to('.hero-mark', { yPercent: -60, autoAlpha: 0, duration: 0.4, ease: 'power1.in' }, 0.3)
        .fromTo('.hero-fade', { y: 0, yPercent: 100 }, { y: 0, yPercent: 0, duration: 0.38, ease: 'power1.out' }, 0.52)
        .to('.hero-shade', { autoAlpha: 0, duration: 0.3, ease: 'power1.inOut' }, 0.5)
        .fromTo(partners, { color: '#ffffff', borderColor: '#ffffff' }, { color: '#121212', borderColor: '#121212', duration: 0.22, ease: 'power1.inOut' }, 0.64)
        .fromTo(partnerIcons, { filter: 'brightness(1)' }, { filter: 'brightness(0.07)', duration: 0.22, ease: 'power1.inOut' }, 0.64)
        .fromTo(media, { clipPath: 'inset(0% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 6% 0%)', duration: 0.06 }, 0.84)
        .fromTo(section, { backgroundColor: '#121212' }, { backgroundColor: '#ffffff', duration: 0.06 }, 0.84);

      // Intro: only the visible text block (hidden slides keep their CSS state)
      const text = section.querySelector<HTMLElement>('.hero-text.is-active')!;
      const split = SplitText.create(text.querySelector('.hero-title')!, { type: 'lines', mask: 'lines', linesClass: 'pb-[0.06em]' });
      const count = section.querySelector<HTMLElement>('.hero-count')!;
      const counter = { v: 0 };
      gsap
        .timeline({ delay: 0.15 })
        .from(document.getElementById('nav'), { yPercent: -160, duration: 1.2 }) // outside the section scope
        .from(media, { scale: 1.12, duration: 2.2, ease: 'power3.out' }, 0)
        .from('.hero-badge', { y: 16, autoAlpha: 0, duration: 0.9 }, 0.25)
        .from(split.lines, { yPercent: 110, stagger: 0.1, duration: 1.2 }, 0.3)
        .from(text.querySelectorAll('.hero-copy'), { y: 24, autoAlpha: 0 }, 0.6)
        .from(text.querySelectorAll('.hero-ctas > *'), { y: 24, autoAlpha: 0, stagger: 0.08 }, 0.7)
        .from(section.querySelectorAll('.hero-dots'), { y: 16, autoAlpha: 0, duration: 0.8 }, 0.9)
        .from('.hero-stat', { x: 40, autoAlpha: 0, duration: 1.2 }, 0.8)
        .to(counter, { v: Number(count.dataset.count), duration: 1.6, ease: 'power2.out', onUpdate: () => (count.textContent = String(Math.round(counter.v))) }, 0.9)
        .from('.hero-mark', { autoAlpha: 0, yPercent: 12, duration: 1.8 }, 0.5);
    }, section);

    return () => ctx.revert();
  }, []);
  return null;
}
