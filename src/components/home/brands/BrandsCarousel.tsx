'use client';

/* eslint-disable @next/next/no-img-element -- brand logos (SVG) */
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Arrow } from '@/components/common/Arrow';
import { Flip, gsap } from '@/lib/gsap';
import { href } from '@/lib/routes';
import type { PartnerBrand } from '@/types/brand';

/**
 * Associated brands (design: src/modules/brands.js): category chips filter the
 * cards in a sequenced swap (leaving cards sink out, staying cards glide with
 * Flip, new ones rise in); arrows page the native scroll-snap carousel.
 * Cards are shown/hidden with style.display (not React state) so GSAP owns the motion.
 * Brands and chips come from the CMS (src/lib/api/brand-showcase.ts).
 */
export function BrandsCarousel({ brands, filters }: { brands: PartnerBrand[]; filters: { id: string; label: string }[] }) {
  const track = useRef<HTMLUListElement>(null);
  const empty = useRef<HTMLParagraphElement>(null);
  const [filter, setFilter] = useState('all');
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);
  const swap = useRef<gsap.core.Timeline | null>(null);
  const reduced = useRef(false);

  const cards = () => [...(track.current?.children ?? [])] as HTMLElement[];
  const updateArrows = () => {
    const t = track.current;
    if (!t) return;
    setCanPrev(t.scrollLeft > 2);
    setCanNext(t.scrollLeft < t.scrollWidth - t.clientWidth - 2);
  };

  useEffect(() => {
    reduced.current = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const t = track.current!;
    const ro = new ResizeObserver(updateArrows);
    ro.observe(t);
    const ctx = gsap.context(() => {
      if (!reduced.current) gsap.from(cards(), { y: 60, autoAlpha: 0, stagger: 0.1, duration: 1.2, scrollTrigger: { trigger: t, start: 'top 85%', once: true } });
    });
    return () => {
      ro.disconnect();
      ctx.revert();
      swap.current?.kill();
    };
  }, []);

  const applyFilter = (id: string) => {
    if (id === filter) return;
    setFilter(id);
    const matches = (c: HTMLElement) => id === 'all' || (c.dataset.categories ?? '').split(' ').includes(id);
    const isShown = (c: HTMLElement) => c.style.display !== 'none';
    swap.current?.progress(1); // finish any swap in flight first
    const all = cards();
    const leaving = all.filter((c) => isShown(c) && !matches(c));
    const staying = all.filter((c) => isShown(c) && matches(c));
    const entering = all.filter((c) => !isShown(c) && matches(c));
    const nothing = staying.length + entering.length === 0;

    const relayout = () => {
      const state = Flip.getState(staying);
      leaving.forEach((c) => (c.style.display = 'none'));
      entering.forEach((c) => (c.style.display = ''));
      empty.current?.classList.toggle('hidden', !nothing);
      track.current?.scrollTo({ left: 0 });
      updateArrows();
      if (reduced.current) return void gsap.set([...entering, ...leaving], { clearProps: 'opacity,visibility,transform' });
      Flip.from(state, { duration: 0.7, ease: 'power3.inOut' });
      gsap.fromTo(entering, { autoAlpha: 0, y: 32 }, { autoAlpha: 1, y: 0, duration: 0.9, ease: 'expo.out', stagger: 0.07, delay: 0.12 });
      if (nothing) gsap.fromTo(empty.current, { y: 16, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.8 });
    };

    if (reduced.current || !leaving.length) return relayout();
    swap.current = gsap.timeline().to(leaving, { autoAlpha: 0, y: 16, duration: 0.28, ease: 'power2.in', stagger: 0.03 }).add(relayout);
  };

  const step = () => {
    const first = cards().find((c) => c.style.display !== 'none');
    return first ? first.offsetWidth + 24 : (track.current?.clientWidth ?? 0);
  };
  const page = (dir: 1 | -1) => track.current?.scrollBy({ left: dir * step(), behavior: reduced.current ? 'auto' : 'smooth' });

  return (
    <>
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="flex max-w-[640px] flex-col gap-6">
          <div className="flex flex-col gap-3">
            <h2 id="brands-title" className="t-display" data-split>
              Global Partner Brands
            </h2>
            <p className="t-body" data-reveal="up">
              Authorised regional distribution for world-leading technology and home appliance brands.
            </p>
          </div>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter brands" data-reveal="up">
            {filters.map((f) => (
              <button
                key={f.id}
                type="button"
                className="chip border-white/30 text-white transition-colors duration-300 hover:border-white aria-pressed:border-white aria-pressed:bg-white aria-pressed:text-black"
                aria-pressed={f.id === filter}
                onClick={() => applyFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-1 self-end" data-reveal="up">
          <button type="button" className="icon-btn hover:bg-white/10" disabled={!canPrev} onClick={() => page(-1)} aria-label="Previous brands">
            <Arrow tone="light" className="size-4 -scale-x-100" />
          </button>
          <button type="button" className="icon-btn hover:bg-white/10" disabled={!canNext} onClick={() => page(1)} aria-label="Next brands">
            <Arrow tone="light" className="size-4" />
          </button>
        </div>
      </div>

      <div className="relative">
        <ul
          ref={track}
          onScroll={updateArrows}
          className="brand-track -my-4 flex snap-x snap-mandatory gap-6 overflow-x-auto py-4 [scrollbar-width:none] max-lg:-mx-[clamp(20px,7.5vw,120px)] max-lg:scroll-px-[clamp(20px,7.5vw,120px)] max-lg:gap-4 max-lg:px-[clamp(20px,7.5vw,120px)] [&::-webkit-scrollbar]:hidden"
          data-lenis-prevent-wheel
        >
          {brands.map((b) => (
            <li key={b.slug} className="brand-card" data-categories={b.categories.join(' ')}>
              <div className="brand-inner">
                {b.logo ? (
                  <img className="brand-logo" src={b.logo} alt={`${b.name} logo`} width={120} height={44} loading="lazy" />
                ) : (
                  <span className="brand-wordmark" aria-hidden="true">
                    {b.name}
                  </span>
                )}
                <div className="flex w-full flex-col gap-3">
                  <h3 className="text-[32px] leading-8 font-semibold">{b.name}</h3>
                  {b.intro && <p className="t-body line-clamp-5 text-black/50">{b.intro}</p>}
                  <Link href={href(`/brand/${b.slug}`)} className="brand-cta mt-3">
                    {b.name} Products
                    <Arrow />
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <p ref={empty} className="hidden py-24 text-center text-white/60">
          No brands in this category yet. Choose another category or All.
        </p>
      </div>
    </>
  );
}
