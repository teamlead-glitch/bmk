'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, type CSSProperties } from 'react';

const TEXT = 'Built on trust. Driven by innovation.';

/** Footer tagline: characters rise in sequence inside word masks when it
 *  scrolls into view; replays after every page change. */
export function FooterTagline() {
  const el = useRef<HTMLParagraphElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const p = el.current;
    if (!p) return;
    p.classList.remove('is-in');
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (p.classList.add('is-in'), io.disconnect()), { rootMargin: '0px 0px -8% 0px' });
    io.observe(p);
    return () => io.disconnect();
  }, [pathname]);

  let i = 0;
  const words = TEXT.split(' ');
  return (
    <p
      ref={el}
      className="footer-tagline px-2 text-center text-[clamp(2.5rem,5.8cqi,6rem)] leading-[1.25] font-bold tracking-[-1px] lg:whitespace-nowrap"
      aria-label={TEXT}
    >
      {words.map((w, k) => (
        <span key={k}>
          <span className="tw" aria-hidden="true">
            {[...w].map((c) => (
              <span key={i} className="tc" style={{ '--i': i++ } as CSSProperties}>
                {c}
              </span>
            ))}
          </span>
          {k < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </p>
  );
}
