/* eslint-disable @next/next/no-img-element -- product photos come from the CMS at any size */
import type { CSSProperties, ReactNode } from 'react';
import type { TemplateId } from '@/types/catalogue';

// Line glyphs per spec template, drawn in the product stage until photos arrive.
const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 2.2, strokeLinejoin: 'round' as const };
const glyphs: Partial<Record<TemplateId, ReactNode>> & { generic: ReactNode } = {
  camera: (
    <svg viewBox="0 0 120 80" {...stroke}>
      <path d="M8 26c0-4 3-7 7-7h14l6-9h26l6 9h38c4 0 7 3 7 7v40c0 4-3 7-7 7H15c-4 0-7-3-7-7z" />
      <circle cx="60" cy="46" r="20" />
      <circle cx="60" cy="46" r="12" />
      <path d="M92 28h12" />
    </svg>
  ),
  lens: (
    <svg viewBox="0 0 120 80" {...stroke}>
      <rect x="14" y="16" width="70" height="48" rx="6" />
      <path d="M84 22h16v36H84M100 26h8v28h-8" />
      <path d="M30 16v48M44 16v48M62 16v48" />
    </svg>
  ),
  instantCamera: (
    <svg viewBox="0 0 120 80" {...stroke}>
      <rect x="22" y="6" width="76" height="68" rx="14" />
      <circle cx="56" cy="40" r="16" />
      <circle cx="56" cy="40" r="8" />
      <rect x="78" y="14" width="12" height="9" rx="2" />
    </svg>
  ),
  film: (
    <svg viewBox="0 0 120 80" {...stroke}>
      <rect x="34" y="6" width="52" height="68" rx="3" />
      <rect x="40" y="12" width="40" height="44" rx="1" />
    </svg>
  ),
  printer: (
    <svg viewBox="0 0 120 80" {...stroke}>
      <rect x="30" y="14" width="60" height="58" rx="12" />
      <path d="M42 14V4h36v10" />
      <path d="M44 30h32" />
    </svg>
  ),
  phone: (
    <svg viewBox="0 0 120 80" {...stroke}>
      <rect x="40" y="2" width="40" height="76" rx="8" />
      <rect x="46" y="10" width="28" height="12" rx="6" />
    </svg>
  ),
  watch: (
    <svg viewBox="0 0 120 80" {...stroke}>
      <circle cx="60" cy="40" r="22" />
      <path d="M48 21 51 4h18l3 17M48 59l3 17h18l3-17M82 36h4v8h-4" />
    </svg>
  ),
  generic: (
    <svg viewBox="0 0 120 80" fill="none" stroke="currentColor" strokeWidth="2.2">
      <rect x="30" y="10" width="60" height="60" rx="8" />
    </svg>
  ),
};

export interface StageProps {
  /** Product name, for the alt text */
  name: string;
  glyph: TemplateId;
  label?: string;
  ratio?: string;
  dark?: boolean;
  className?: string;
  src?: string;
  brand?: boolean;
  eager?: boolean;
}

/** Product image stage: the photo when there is one, otherwise a studio stage
 *  with the category glyph. `label` names the shot (Front, Back…). */
export function Stage({ name, glyph, label = '', ratio = '4 / 3', dark = false, className = '', src = '', brand = false, eager = false }: StageProps) {
  const alt = `${name}${label ? `, ${label}` : ''}`;
  const style: CSSProperties = { aspectRatio: ratio };
  if (src)
    return (
      <div className={`stage stage-photo ${brand ? 'stage-brand' : ''} ${className}`} style={style}>
        <img className="stage-img" src={src} alt={alt} {...(eager ? { fetchPriority: 'high' as const } : { loading: 'lazy' as const })} decoding="async" />
      </div>
    );
  return (
    <div className={`stage ${dark ? 'stage-dark' : ''} ${brand ? 'stage-brand' : ''} ${className}`} style={style} role="img" aria-label={`${alt} (image to come)`}>
      {glyphs[glyph] || glyphs.generic}
      {label && <span className="stage-label">{label}</span>}
    </div>
  );
}
