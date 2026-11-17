'use client';

import { useEffect } from 'react';

const INTERVAL_MS = 6000;

/**
 * Hero image slides (home-banner "image"). The server renders every slide; this only
 * moves the "is-active" class on images, texts and dots (CSS crossfades them).
 * Autoplay pauses while the pointer or focus is in the hero text, while the tab is
 * hidden, and never runs with reduced motion. The dots always work.
 */
export function HeroSlider({ count }: { count: number }) {
  useEffect(() => {
    const section = document.querySelector<HTMLElement>('.hero');
    if (!section) return;
    const images = section.querySelectorAll<HTMLElement>('.hero-slide');
    const texts = section.querySelectorAll<HTMLElement>('.hero-text[data-slide]');
    const dots = section.querySelectorAll<HTMLButtonElement>('.hero-dot');
    const content = section.querySelector<HTMLElement>('.hero-content');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

    let current = 0;
    let timer = 0;
    let hovered = false;
    let focused = false;

    const show = (next: number) => {
      current = (next + count) % count;
      images.forEach((el, i) => {
        el.classList.toggle('is-active', i === current);
        el.toggleAttribute('aria-hidden', i !== current);
      });
      texts.forEach((el, i) => {
        const on = i === current;
        el.classList.toggle('is-active', on);
        el.inert = !on;
        if (on) el.removeAttribute('aria-hidden');
        else el.setAttribute('aria-hidden', 'true');
      });
      dots.forEach((el, i) => {
        if (i === current) el.setAttribute('aria-current', 'true');
        else el.removeAttribute('aria-current');
      });
    };

    const stop = () => window.clearInterval(timer);
    const start = () => {
      stop();
      if (reduced || hovered || focused || document.hidden) return;
      timer = window.setInterval(() => show(current + 1), INTERVAL_MS);
    };

    const onDot = (e: MouseEvent) => {
      const i = Number((e.currentTarget as HTMLElement).dataset.slideTo);
      if (Number.isFinite(i)) show(i);
      start(); // full interval on the chosen slide
    };
    const onEnter = () => ((hovered = true), stop());
    const onLeave = () => ((hovered = false), start());
    const onFocusIn = () => ((focused = true), stop());
    const onFocusOut = (e: FocusEvent) => {
      if (content?.contains(e.relatedTarget as Node | null)) return;
      focused = false;
      start();
    };

    dots.forEach((d) => d.addEventListener('click', onDot));
    content?.addEventListener('pointerenter', onEnter);
    content?.addEventListener('pointerleave', onLeave);
    content?.addEventListener('focusin', onFocusIn);
    content?.addEventListener('focusout', onFocusOut);
    document.addEventListener('visibilitychange', start);
    start();

    return () => {
      stop();
      dots.forEach((d) => d.removeEventListener('click', onDot));
      content?.removeEventListener('pointerenter', onEnter);
      content?.removeEventListener('pointerleave', onLeave);
      content?.removeEventListener('focusin', onFocusIn);
      content?.removeEventListener('focusout', onFocusOut);
      document.removeEventListener('visibilitychange', start);
    };
  }, [count]);
  return null;
}
