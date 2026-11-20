'use client';

import { useEffect, useRef, useState } from 'react';
import { Arrow } from '@/components/common/Arrow';
import type { EnquiryProduct } from '@/components/enquiry/EnquiryProvider';
import { EnquireProduct } from '@/components/enquiry/EnquireProduct';

const SECTIONS = [
  ['overview', 'Overview'],
  ['specifications', 'Specifications'],
  ['more', 'Related'],
] as const;

/** Sticky bar under the navbar: links to the sections the product has (current one highlighted) and
 *  Enquire; plus the phone-only bottom CTA once the main CTA scrolls away. */
export function ProductSectionBar({ product, sections }: { product: EnquiryProduct; sections: string[] }) {
  const links = SECTIONS.filter(([id]) => sections.includes(id));
  const bar = useRef<HTMLDivElement>(null);
  const cta = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState<string>('');

  useEffect(() => {
    // Sits below the navbar when it is showing
    const b = bar.current!;
    const sync = () => {
      const nav = document.getElementById('nav');
      b.style.top = document.body.classList.contains('nav-hidden') || !nav ? '0px' : `${nav.getBoundingClientRect().bottom + 8}px`;
    };
    const mo = new MutationObserver(sync);
    mo.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    sync();

    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && setCurrent(e.target.id)), { rootMargin: '-45% 0px -50% 0px' });
    links.forEach(([id]) => {
      const s = document.getElementById(id);
      if (s) io.observe(s);
    });

    const mobile = cta.current!;
    const main = document.getElementById('cta');
    const io2 = new IntersectionObserver(([e]) => mobile.classList.toggle('translate-y-full', e.isIntersecting || e.boundingClientRect.top > 0));
    if (main) io2.observe(main);

    // The phone bar is fixed over the page end: the footer's last strip (copyright, legal links)
    // reserves its height through --mobile-cta (Footer.tsx), only while this page is open
    const root = document.documentElement;
    const ro = new ResizeObserver(() => root.style.setProperty('--mobile-cta', `${mobile.offsetHeight}px`));
    ro.observe(mobile);
    return () => {
      mo.disconnect();
      io.disconnect();
      io2.disconnect();
      ro.disconnect();
      root.style.removeProperty('--mobile-cta');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sections are fixed for the page
  }, []);

  return (
    <>
      <div ref={bar} id="pdp-bar" className="sticky top-0 z-30 mt-16 border-y border-line bg-white/90 backdrop-blur-lg transition-[top] duration-500">
        <div className="shell flex h-16 items-center gap-6">
          <p className="hidden max-w-[30ch] truncate font-semibold md:block">{product.name}</p>
          <nav className="-mx-1 flex flex-1 gap-1 overflow-x-auto [scrollbar-width:none]" aria-label="Product sections">
            {links.map(([id, label]) => (
              <a key={id} href={`#${id}`} data-anchor className={`sec-link ${current === id ? 'is-on' : ''}`} aria-current={current === id ? 'true' : undefined}>
                {label}
              </a>
            ))}
          </nav>
          <EnquireProduct product={product} className="btn btn-navy hidden !py-2.5 sm:inline-flex">
            Enquire <Arrow />
          </EnquireProduct>
        </div>
      </div>
      <div ref={cta} className="fixed inset-x-0 bottom-0 z-40 translate-y-full border-t border-line bg-white/95 p-3 backdrop-blur transition-transform duration-500 sm:hidden">
        <EnquireProduct product={product} className="btn btn-navy w-full">
          Enquire about this product <Arrow />
        </EnquireProduct>
      </div>
    </>
  );
}
