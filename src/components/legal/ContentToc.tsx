'use client';

import { useEffect, useState } from 'react';

/** "On this page": highlights the last section whose top has passed 35% of the viewport. */
export function LegalToc({ sections }: { sections: { id: string; title: string; n: string }[] }) {
  const [current, setCurrent] = useState(sections[0]?.id);

  useEffect(() => {
    const els = sections.map((s) => document.getElementById(s.id)).filter((x): x is HTMLElement => !!x);
    const update = () => {
      const line = innerHeight * 0.35;
      const cur = els.filter((s) => s.getBoundingClientRect().top < line).pop() || els[0];
      if (cur) setCurrent(cur.id);
    };
    update();
    addEventListener('scroll', update, { passive: true });
    return () => removeEventListener('scroll', update);
  }, [sections]);

  return (
    <nav aria-label="On this page" className="legal-toc">
      <p className="mb-3 text-xs tracking-[0.14em] text-muted uppercase">On this page</p>
      <ol>
        {sections.map((s) => (
          <li key={s.id}>
            <a data-anchor href={`#${s.id}`} className={current === s.id ? 'is-on' : ''} aria-current={current === s.id ? 'true' : undefined}>
              <span className="n">{s.n}</span>
              {s.title}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
