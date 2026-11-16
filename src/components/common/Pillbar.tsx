'use client';

import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';

/** Pills that live at the bottom of a photo hero and stick under the navbar
 *  (or to the very top when the navbar has scrolled away), switching on a dark
 *  backdrop once stuck. `isStatic` keeps them in the hero (About page). */
export function Pillbar({ label, children, style, isStatic = false }: { label: string; children: ReactNode; style?: CSSProperties; isStatic?: boolean }) {
  const mark = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isStatic) return;
    const b = bar.current!;
    const m = mark.current!;
    const sync = () => {
      const nav = document.getElementById('nav');
      // Layout box, not mid-transition
      const top = document.body.classList.contains('nav-hidden') || !nav ? 0 : nav.offsetTop + nav.offsetHeight + 8;
      b.style.top = `${top}px`;
      // Judge by the resting position (106px above the marker) so the navbar's slide can't fool it
      b.classList.toggle('is-stuck', m.getBoundingClientRect().bottom - 106 < top);
    };
    const mo = new MutationObserver(() => requestAnimationFrame(sync));
    mo.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    addEventListener('scroll', sync, { passive: true });
    addEventListener('resize', sync);
    sync();
    return () => (mo.disconnect(), removeEventListener('scroll', sync), removeEventListener('resize', sync));
  }, [isStatic]);

  return (
    <>
      <div ref={mark} className="h-0" aria-hidden="true" />
      <div ref={bar} className={`pillbar -mt-[106px] ${isStatic ? 'is-static' : ''}`} style={style}>
        <div className="pillbar-inner">
          <nav className="shell" aria-label={label}>
            <ul className="-mx-5 flex w-auto gap-2 overflow-x-auto px-5 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0">{children}</ul>
          </nav>
        </div>
      </div>
    </>
  );
}
