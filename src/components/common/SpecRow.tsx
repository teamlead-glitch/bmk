'use client';

import { useEffect, useRef } from 'react';

/** Card spec row: the value may use as many lines as its label wraps to, and
 *  is truncated (…) after that. A one-line label keeps a one-line value.
 *  (fitSpecRows in the design; re-fits when the card is resized.) */
export function SpecRow({ label, value }: { label: string; value: string }) {
  const dt = useRef<HTMLElement>(null);
  const dd = useRef<HTMLElement>(null);

  useEffect(() => {
    const l = dt.current;
    const v = dd.current;
    if (!l || !v) return;
    const fit = () => {
      const lh = parseFloat(getComputedStyle(l).lineHeight) || l.offsetHeight;
      const lines = String(Math.max(1, Math.round(l.offsetHeight / lh)));
      v.style.webkitLineClamp = lines;
      v.style.setProperty('line-clamp', lines);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(l);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="flex items-start gap-3">
      <dt ref={dt} className="w-[42%] shrink-0 text-muted">
        {label}
      </dt>
      <dd ref={dd} className="line-clamp-1 min-w-0 font-medium">
        {value}
      </dd>
    </div>
  );
}
