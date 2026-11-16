/* eslint-disable @next/next/no-img-element -- SVG brand logos */
import type { BrandLite } from '@/types/catalogue';

/** Brand mark: the client's logo where we have it, otherwise a clean wordmark. */
export function BrandMark({ brand, light = false, className = 'h-7' }: { brand: Pick<BrandLite, 'name' | 'logo'>; light?: boolean; className?: string }) {
  if (brand.logo)
    return <img src={brand.logo} alt={brand.name} className={`${className} w-auto max-w-[150px] object-contain ${light ? 'brightness-0 invert' : ''}`} />;
  return (
    <span className={`${className} inline-flex items-center text-[22px] leading-none font-bold tracking-[-0.03em] ${light ? 'text-white' : 'text-ink'}`}>{brand.name}</span>
  );
}
