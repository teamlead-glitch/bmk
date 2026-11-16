'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Arrow } from '@/components/common/Arrow';

/** About › Our journey: horizontal milestone rail with a progress thumb and arrows.
 *  Children are the server-rendered milestone cards. */
export function JourneyRail({ children }: { children: ReactNode }) {
  const track = useRef<HTMLOListElement>(null);
  const thumb = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const update = () => {
    const t = track.current;
    const th = thumb.current;
    if (!t || !th) return;
    const max = t.scrollWidth - t.clientWidth;
    const p = max > 0 ? t.scrollLeft / max : 0;
    th.style.transform = `translateX(${p * (th.parentElement!.clientWidth - th.offsetWidth)}px)`;
    setCanPrev(t.scrollLeft > 2);
    setCanNext(t.scrollLeft < max - 2);
  };

  useEffect(() => {
    const t = track.current!;
    const cards = [...t.querySelectorAll<HTMLElement>('.milestone')];
    const on = (e: Event) => (e.currentTarget as HTMLElement).classList.add('is-active');
    const off = (e: Event) => (e.currentTarget as HTMLElement).classList.remove('is-active');
    cards.forEach((c) => (c.addEventListener('pointerenter', on), c.addEventListener('pointerleave', off)));
    const ro = new ResizeObserver(update);
    ro.observe(t);
    return () => {
      ro.disconnect();
      cards.forEach((c) => (c.removeEventListener('pointerenter', on), c.removeEventListener('pointerleave', off)));
    };
  }, []);

  const page = (dir: 1 | -1) => {
    const first = track.current?.querySelector<HTMLElement>('.milestone');
    const smooth = !matchMedia('(prefers-reduced-motion: reduce)').matches;
    track.current?.scrollBy({ left: dir * ((first?.offsetWidth || 280) + 8) * 2, behavior: smooth ? 'smooth' : 'auto' });
  };

  return (
    <>
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="flex max-w-[560px] flex-col items-start gap-6">
          <span className="chip border-line bg-white text-ink">Our Journey</span>
          <h2 className="t-display">From global trade to new possibilities.</h2>
          <p className="t-body">From a Dubai trading firm in 2002 to companies, brands and retail across six markets.</p>
        </div>
        <div className="flex gap-1 self-end">
          <button type="button" className="icon-btn hover:bg-white" disabled={!canPrev} onClick={() => page(-1)} aria-label="Previous milestones">
            <Arrow tone="dark" className="size-4 -scale-x-100" />
          </button>
          <button type="button" className="icon-btn hover:bg-white" disabled={!canNext} onClick={() => page(1)} aria-label="Next milestones">
            <Arrow tone="dark" className="size-4" />
          </button>
        </div>
      </div>
      <div className="relative mt-10 h-2 overflow-hidden rounded-full bg-white/70" aria-hidden="true">
        <div ref={thumb} className="absolute inset-y-0 left-0 w-[min(160px,25%)] bg-accent transition-transform duration-150" />
      </div>
      <ol
        ref={track}
        onScroll={update}
        className="-mx-[clamp(20px,7.5vw,120px)] mt-8 flex snap-x gap-2 overflow-x-auto px-[clamp(20px,7.5vw,120px)] pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </ol>
    </>
  );
}
