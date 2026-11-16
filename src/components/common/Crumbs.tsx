import Link from 'next/link';
import { Fragment } from 'react';

/** Breadcrumb trail: [label, href] pairs; the last item is the current page. */
export function Crumbs({ items, light = false }: { items: [string, string?][]; light?: boolean }) {
  return (
    <nav aria-label="Breadcrumb" className={`flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] ${light ? 'text-white/60' : 'text-muted'}`}>
      {items.map(([label, to], i) =>
        i < items.length - 1 && to ? (
          <Fragment key={i}>
            <Link href={to} className={`transition-colors ${light ? 'hover:text-white' : 'hover:text-ink'}`}>
              {label}
            </Link>
            <span aria-hidden="true">/</span>
          </Fragment>
        ) : (
          <span key={i} aria-current="page" className={light ? 'text-white' : 'text-ink'}>
            {label}
          </span>
        ),
      )}
    </nav>
  );
}
