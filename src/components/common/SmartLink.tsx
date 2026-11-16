import Link from 'next/link';
import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { brandLinkProps } from '@/lib/routes';

type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & { href: string; children: ReactNode };

/** Internal paths use next/link (client navigation); anything else is a plain <a>. */
export function SmartLink({ href, children, ...rest }: Props) {
  if (/^(https?:|mailto:|tel:|#)/.test(href)) {
    return (
      <a href={href} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} {...rest}>
      {children}
    </Link>
  );
}

/** Brand link: partner brands → their page, BMK's own brands → their website (new tab) */
export function BrandLink({ brand, children, ...rest }: Omit<Props, 'href'> & { brand: { id: string; inHouse?: boolean; sites?: [string, string][] } }) {
  const p = brandLinkProps(brand);
  return p.external ? (
    <a href={p.href} target={p.target} rel={p.rel} {...rest}>
      {children}
    </a>
  ) : (
    <Link href={p.href} {...rest}>
      {children}
    </Link>
  );
}
