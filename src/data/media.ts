// Photography and per-brand styling (kept apart from the catalogue data, as in
// the design reference). Anything missing falls back to the studio stage with
// a category glyph. In the CMS these are admin fields on brands / products.
import type { BrandColor, ProductMedia } from '@/types/catalogue';

const M = '/assets/catalogue/';
const P = `${M}products/`;

/** Brand logos in their original colours (Figma: UI Design › brands section). */
export const brandLogos: Record<string, string> = {
  seeken: '/assets/brands/seeken.svg',
  'team-appliances': '/assets/brands/team.svg',
  nikon: '/assets/brands/nikon.svg',
  canon: '/assets/brands/canon.svg',
  fujifilm: '/assets/brands/fujifilm.svg',
  sony: '/assets/brands/sony.svg',
  samsung: '/assets/brands/samsung.svg',
  lg: '/assets/brands/lg.svg',
  sandisk: '/assets/brands/sandisk.svg',
  prestige: '/assets/brands/prestige.svg',
  sujata: '/assets/brands/sujata.svg',
  voltas: '/assets/brands/voltas.svg',
  symphony: '/assets/brands/symphony.svg',
  sharp: '/assets/brands/sharp.svg',
};

/** Brand accent drives the brand page (tabs, card stages, hover CTA) and the
 *  "More from {brand}" strip. `on` is the label colour on top of it, picked per
 *  brand in the admin ("Brand accent colour" + "Label on accent"). */
export const brandStyle: Record<string, BrandColor> = {
  nikon: { color: '#ffec33', on: '#121212', hero: `${M}heroes/brand-nikon.webp` },
  fujifilm: { color: '#e60012', on: '#ffffff' },
  samsung: { color: '#1428a0', on: '#ffffff' },
  lg: { color: '#a50034', on: '#ffffff' },
  sujata: { color: '#6d6e71', on: '#ffffff' },
};
export const DEFAULT_BRAND_COLOR: BrandColor = { color: '#1f487d', on: '#ffffff' };

/** Mega menu (brands view) picture per partner brand, 4:3 (admin field "Menu image"). */
export const brandMenuImage: Record<string, string> = {
  nikon: `${M}heroes/brand-nikon.webp`,
  fujifilm: `${P}fujifilm-x-t5.webp`,
};

/** Hero photography per category (falls back to its group, then to no image). */
export const categoryHero: Record<string, string> = {
  'mirrorless-dslr-cameras': `${M}heroes/category-mirrorless-cameras.webp`,
  imaging: `${M}heroes/category-mirrorless-cameras.webp`,
};

/** card – listing photo; brand – brand-colour shot; shots – gallery by shot name;
 *  features – one image per overview feature, in order */
export const productMedia: Record<string, ProductMedia> = {
  'nikon-zf': { card: `${P}nikon-zf.webp`, brand: `${P}nikon-zf--brand.webp` },
  'nikon-z8': {
    card: `${P}nikon-z8.webp`,
    brand: `${P}nikon-z8--brand.webp`,
    shots: { Front: `${P}nikon-z8--front.webp`, Back: `${P}nikon-z8--back.webp`, Top: `${P}nikon-z8--top.webp`, Side: `${P}nikon-z8--side.webp` },
    features: [1, 2, 3, 4].map((i) => `${M}features/nikon-z8-${i}.webp`),
  },
  'fujifilm-x-t5': { card: `${P}fujifilm-x-t5.webp` },
  'fujifilm-x-h2s': { card: `${P}fujifilm-x-h2s.webp` },
  'nikkor-z-50mm-f12-s': { card: `${P}nikkor-z-50mm-f12-s.webp`, brand: `${P}nikkor-z-50mm-f12-s.webp` },
  'nikkor-z-70-200mm-f28-vr-s-ii': { card: `${P}nikkor-z-70-200mm-f28-vr-s-ii.webp`, brand: `${P}nikkor-z-70-200mm-f28-vr-s-ii.webp` },
};
