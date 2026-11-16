'use client';

import { useEffect, useRef } from 'react';
import { ChevIcon, PlusIcon } from '@/components/common/Icons';
import type { SpecValue } from '@/types/catalogue';

type Group = { group: string; rows: { key: string; label: string; value: SpecValue }[] };

function Value({ v }: { v: SpecValue }) {
  if (Array.isArray(v))
    return (
      <ul className="grid gap-1.5">
        {v.map((x) => (
          <li key={x} className="flex gap-2.5">
            <span className="mt-2 size-1 shrink-0 rounded-full bg-accent" aria-hidden="true" />
            {x}
          </li>
        ))}
      </ul>
    );
  if (v && typeof v === 'object')
    return (
      <dl className="grid gap-1.5">
        {Object.entries(v).map(([k, x]) => (
          <div key={k} className="flex gap-4">
            <dt className="w-14 shrink-0 text-muted">{k}</dt>
            <dd>{x}</dd>
          </div>
        ))}
      </dl>
    );
  return <>{v}</>;
}

const Rows = ({ rows }: { rows: Group['rows'] }) =>
  rows.map((r) => (
    <div key={r.key} className="spec-row">
      <dt className="text-[15px] text-muted">{r.label}</dt>
      <dd className="text-[15px]">
        <Value v={r.value} />
      </dd>
    </div>
  ));

/** Technical details: grouped accordions with a side index when there are 3+ groups. */
export function ProductSpecs({ groups }: { groups: Group[] }) {
  const root = useRef<HTMLDivElement>(null);
  const fields = groups.reduce((n, x) => n + x.rows.length, 0);
  const many = groups.length >= 3;

  // Phones: only the first group starts open
  useEffect(() => {
    if (many && matchMedia('(max-width: 1023px)').matches) root.current?.querySelectorAll('details').forEach((d, i) => (d.open = i === 0));
  }, [many]);

  const expand = (open: boolean) => root.current?.querySelectorAll('details').forEach((d) => (d.open = open));

  return (
    <section id="specifications" className="section-y scroll-mt-24 bg-mist" data-section>
      <div ref={root} className="shell">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <div>
            <h2 className="t-display">Technical details</h2>
            <p className="t-body mt-2 text-muted">
              {fields} specifications{many ? ` in ${groups.length} groups` : ''}
            </p>
          </div>
          {many && (
            <div className="flex gap-2">
              <button type="button" className="pill" onClick={() => expand(true)}>
                <PlusIcon /> Expand all
              </button>
              <button type="button" className="pill" onClick={() => expand(false)}>
                Collapse all
              </button>
            </div>
          )}
        </div>
        {many ? (
          <div className="grid gap-10 lg:grid-cols-[240px_1fr]">
            <nav className="hidden lg:block" aria-label="Specification groups">
              <ul className="sticky top-40 grid gap-1">
                {groups.map((x, i) => (
                  <li key={x.group}>
                    <a href={`#sg-${i}`} data-anchor className="flex items-center justify-between rounded-lg px-4 py-2.5 text-[15px] text-muted transition-colors hover:bg-white hover:text-ink">
                      {x.group}
                      <span className="text-xs">{x.rows.length}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="grid gap-3">
              {groups.map((x, i) => (
                <details key={x.group} id={`sg-${i}`} className="spec-group scroll-mt-40" open>
                  <summary>
                    {x.group}
                    <ChevIcon />
                  </summary>
                  <dl className="px-6 pb-2">
                    <Rows rows={x.rows} />
                  </dl>
                </details>
              ))}
            </div>
          </div>
        ) : (
          <dl className="spec-group px-6 py-2 [&>.spec-row:first-child]:border-t-0">
            {groups.map((x) => (
              <Rows key={x.group} rows={x.rows} />
            ))}
          </dl>
        )}
        <p className="mt-5 text-xs text-muted">Specifications are provided by the manufacturer and may vary by region.</p>
      </div>
    </section>
  );
}
