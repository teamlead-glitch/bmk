'use client';

import { useEffect, useState } from 'react';
import { Arrow } from '@/components/common/Arrow';
import type { EnquiryProduct } from '@/components/enquiry/EnquiryProvider';
import { EnquireProduct } from '@/components/enquiry/EnquireProduct';

const SECTIONS = [
  ['overview', 'Overview'],
  ['specifications', 'Specifications'],
  ['more', 'Related'],
] as const;

/** Bar pinned to the bottom of the window (so it never covers the navbar): links to the sections the
 *  product has (current one highlighted) and Enquire. It is the last child of the product content
 *  wrapper (ProductPage), so at the end of the page it settles right above the footer. */
export function ProductSectionBar({ product, sections }: { product: EnquiryProduct; sections: string[] }) {
  const links = SECTIONS.filter(([id]) => sections.includes(id));
  const [current, setCurrent] = useState<string>('');
  // Hidden while the summary's own buttons (Enquire about this product / View specifications) are on screen or below
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const main = document.getElementById('cta');
    const ctaIo = new IntersectionObserver(([e]) => setShown(!e.isIntersecting && e.boundingClientRect.top < 0));
    if (main) ctaIo.observe(main); // ProductSummary always renders #cta

    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && setCurrent(e.target.id)), { rootMargin: '-45% 0px -50% 0px' });
    links.forEach(([id]) => {
      const s = document.getElementById(id);
      if (s) io.observe(s);
    });
    return () => {
      io.disconnect();
      ctaIo.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sections are fixed for the page
  }, []);

  return (
    <div
      id="pdp-bar"
      aria-hidden={!shown || undefined}
      inert={!shown}
      className={`sticky bottom-0 z-30 border-t border-line bg-white/90 backdrop-blur-lg transition-[translate,opacity] duration-500 ${shown ? '' : 'pointer-events-none translate-y-full opacity-0'}`}
    >
      <div className="shell flex h-16 items-center gap-3 sm:gap-6">
        <p className="hidden max-w-[30ch] truncate font-semibold md:block">{product.name}</p>
        <nav className="-mx-1 flex min-w-0 flex-1 gap-1 overflow-x-auto [scrollbar-width:none]" aria-label="Product sections">
          {links.map(([id, label]) => (
            <a key={id} href={`#${id}`} data-anchor className={`sec-link ${current === id ? 'is-on' : ''}`} aria-current={current === id ? 'true' : undefined}>
              {label}
            </a>
          ))}
        </nav>
        <EnquireProduct product={product} className="btn btn-navy shrink-0 !py-2.5 max-sm:!px-4">
          Enquire <Arrow />
        </EnquireProduct>
      </div>
    </div>
  );
}
