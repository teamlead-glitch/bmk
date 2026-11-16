'use client';

import { useEffect, useState } from 'react';
import { Pillbar } from '@/components/common/Pillbar';

/** About: "On this page" pills in the hero; the one for the section in view is
 *  highlighted. Also scrolls to ?section= / ?company= on arrival (homepage links). */
export function SectionPills({ sections }: { sections: [string, string][] }) {
  const [current, setCurrent] = useState(sections[0][0]);

  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && setCurrent(e.target.id)), { rootMargin: '-40% 0px -55% 0px' });
    sections.forEach(([id]) => {
      const s = document.getElementById(id);
      if (s) io.observe(s);
    });
    const params = new URLSearchParams(location.search);
    const target = params.get('section') || params.get('company');
    if (target) requestAnimationFrame(() => document.getElementById(target)?.scrollIntoView({ block: 'start' }));
    return () => io.disconnect();
  }, [sections]);

  return (
    <Pillbar label="On this page" isStatic>
      {sections.map(([id, label]) => (
        <li key={id}>
          <a className={`pill-dark ${current === id ? 'is-on' : ''}`} href={`#${id}`} data-anchor>
            {label}
          </a>
        </li>
      ))}
    </Pillbar>
  );
}
