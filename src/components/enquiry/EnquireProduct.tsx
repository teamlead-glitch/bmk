'use client';

import type { ReactNode } from 'react';
import { useEnquiry, type EnquiryProduct } from '@/components/enquiry/EnquiryProvider';

/** Button that opens the enquiry popup for this product. */
export function EnquireProduct({ product, className, children }: { product: EnquiryProduct; className: string; children: ReactNode }) {
  const { open } = useEnquiry();
  return (
    <button type="button" className={className} onClick={() => open({ product })}>
      {children}
    </button>
  );
}
