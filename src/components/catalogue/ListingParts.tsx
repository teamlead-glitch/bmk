import Link from 'next/link';
import type { ReactNode } from 'react';
import { CheckIcon, ChevIcon } from '@/components/common/Icons';
import type { CountedOption } from '@/types/listing';

/* ---------- Listing building blocks (CMS listings and search results) ---------- */

/** One filter option: a link that toggles it in the URL, shown as a checkbox */
export function FacetCheck({ on, label, n, to }: { on: boolean; label: string; n: number; to: string }) {
  return (
    <Link scroll={false} className="check" href={to} role="checkbox" aria-checked={on}>
      <span className="check-box">{on && <CheckIcon />}</span>
      {label}
      <span className="check-count">{n}</span>
    </Link>
  );
}

/** A filter group (Category, Brand) in the sidebar and the phone filter sheet */
export function Facet({ title, options, selected, to, divider = false }: { title: string; options: CountedOption[]; selected: string[]; to: (id: string) => string; divider?: boolean }) {
  return (
    <details className={`facet ${divider ? 'border-b border-line' : ''}`} open>
      <summary>
        {title} <ChevIcon />
      </summary>
      <div className="facet-list pb-4">
        {options.map((o) => (
          <FacetCheck key={o.id} on={selected.includes(o.id)} label={o.name} n={o.n} to={to(o.id)} />
        ))}
      </div>
    </details>
  );
}

/** Empty states: nothing listed yet, no matches, or a failed load */
export function EmptyBox({ title, body, children }: { title: string; body: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl bg-mist p-10 sm:p-14">
      <p className="text-[28px] leading-tight tracking-[-0.04em]">{title}</p>
      <p className="t-body mt-3 max-w-xl text-muted">{body}</p>
      <div className="mt-8 flex flex-wrap gap-3">{children}</div>
    </div>
  );
}
