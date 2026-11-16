/* eslint-disable @next/next/no-img-element -- small SVG icons, no optimisation needed */

/** The design's arrow icon (orange, white, dark, light). */
export function Arrow({ tone = 'orange', className = 'btn-icon' }: { tone?: 'orange' | 'white' | 'dark' | 'light'; className?: string }) {
  return <img src={`/assets/icons/arrow-${tone}.svg`} alt="" className={className} width={16} height={16} />;
}

/** Arrow drawn as a mask so CSS can recolour it (brand-colour hovers). */
export function ArrowMask({ className = 'btn-icon' }: { className?: string }) {
  return <span className={`arrow-mask ${className}`} aria-hidden="true" />;
}
