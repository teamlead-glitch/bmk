'use client';

import { useEffect } from 'react';
import { gsap, SplitText } from '@/lib/gsap';

/**
 * Hero: background video whose playhead follows the scroll position (design: src/modules/hero.js).
 * - Video files have a keyframe on every frame (ffmpeg -g 1), so any time decodes instantly.
 * - The file is fetched into memory as a Blob so seeks never wait on range requests.
 * - The pinned ScrollTrigger is created immediately so sections below measure the pin spacing.
 */
export function HeroMotion() {
  useEffect(() => {
    const section = document.querySelector<HTMLElement>('.hero');
    if (!section) return;
    const video = section.querySelector<HTMLVideoElement>('.hero-video')!;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return; // poster only, no scrubbing

    const small = matchMedia('(max-width: 767px)').matches;
    // H.264 MP4 where it decodes (Safari/iOS need it); VP9 WebM otherwise
    const mp4 = video.canPlayType('video/mp4; codecs="avc1.640028"') !== '';
    const base = (small ? video.dataset.srcMobile : video.dataset.src)!;
    const src = mp4 ? base : base.replace(/\.mp4$/, '.webm');

    let objectUrl = '';
    let alive = true;
    fetch(src)
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.blob();
      })
      .then((blob) => {
        if (!alive) return;
        objectUrl = URL.createObjectURL(blob);
        video.src = objectUrl;
      })
      .catch(() => alive && (video.src = src));

    // iOS Safari only renders seeks after the video has been "played" once
    const unlock = () => video.play().then(() => video.pause()).catch(() => {});
    window.addEventListener('touchstart', unlock, { once: true, passive: true });

    const state = { p: 0 };
    let lastSet = -1;
    const seek = () => {
      if (!video.duration || video.readyState < 1) return;
      const t = state.p * (video.duration - 0.04);
      if (Math.abs(t - lastSet) < 1 / 60) return; // skip sub-frame updates
      lastSet = t;
      video.currentTime = t;
    };
    video.addEventListener('loadedmetadata', seek);

    const ctx = gsap.context(() => {
      const mark = section.querySelector('.hero-mark');
      const fade = section.querySelector('.hero-fade');
      const shade = section.querySelector('.hero-shade');
      const partner = section.querySelector('.hero-partner');
      const partnerIcon = partner?.querySelector('img');

      // 0–1 video; 0.3–0.7 watermark drifts up; 0.52–0.9 white gradient rises,
      // CTAs dissolve into it; 0.84 bottom edge sealed white (no seam on high-DPI).
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
        .to(state, { p: 1, duration: 1, onUpdate: seek }, 0)
        .to(mark, { yPercent: -60, autoAlpha: 0, duration: 0.4, ease: 'power1.in' }, 0.3)
        .fromTo(fade, { y: 0, yPercent: 100 }, { y: 0, yPercent: 0, duration: 0.38, ease: 'power1.out' }, 0.52)
        .to(shade, { autoAlpha: 0, duration: 0.3, ease: 'power1.inOut' }, 0.5)
        .fromTo(partner, { color: '#ffffff', borderColor: '#ffffff' }, { color: '#121212', borderColor: '#121212', duration: 0.22, ease: 'power1.inOut' }, 0.64)
        .fromTo(partnerIcon ?? [], { filter: 'brightness(1)' }, { filter: 'brightness(0.07)', duration: 0.22, ease: 'power1.inOut' }, 0.64)
        .fromTo(video, { clipPath: 'inset(0% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 6% 0%)', duration: 0.06 }, 0.84)
        .fromTo(section, { backgroundColor: '#121212' }, { backgroundColor: '#ffffff', duration: 0.06 }, 0.84);

      // Intro
      const title = section.querySelector('.hero-title')!;
      const split = SplitText.create(title, { type: 'lines', mask: 'lines', linesClass: 'pb-[0.06em]' });
      const count = section.querySelector<HTMLElement>('.hero-count')!;
      const counter = { v: 0 };
      gsap
        .timeline({ delay: 0.15 })
        .from(document.getElementById('nav'), { yPercent: -160, duration: 1.2 }) // outside the section scope
        .from(video, { scale: 1.12, duration: 2.2, ease: 'power3.out' }, 0)
        .from('.hero-badge', { y: 16, autoAlpha: 0, duration: 0.9 }, 0.25)
        .from(split.lines, { yPercent: 110, stagger: 0.1, duration: 1.2 }, 0.3)
        .from('.hero-copy', { y: 24, autoAlpha: 0 }, 0.6)
        .from('.hero-ctas > *', { y: 24, autoAlpha: 0, stagger: 0.08 }, 0.7)
        .from('.hero-stat', { x: 40, autoAlpha: 0, duration: 1.2 }, 0.8)
        .to(counter, { v: Number(count.dataset.count), duration: 1.6, ease: 'power2.out', onUpdate: () => (count.textContent = String(Math.round(counter.v))) }, 0.9)
        .from('.hero-mark', { autoAlpha: 0, yPercent: 12, duration: 1.8 }, 0.5);
    }, section);

    return () => {
      alive = false;
      window.removeEventListener('touchstart', unlock);
      video.removeEventListener('loadedmetadata', seek);
      ctx.revert();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, []);
  return null;
}
