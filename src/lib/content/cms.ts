import { DEFAULT_BRAND_COLOR } from '@/data/media';
import type { BrandColor } from '@/types/catalogue';

/* ---------- Mapping helpers for CMS answers (used by every content file) ---------- */

/** A slug the CMS can have (also keeps junk out of API URLs) */
const SLUG = /^[a-z0-9][a-z0-9-]{0,190}$/i;
export const isSlug = (v: string) => SLUG.test(v);

/** A reference to another record in a CMS answer (brand, category) */
export type CmsRef = { id?: number; slug?: string | null; name?: string | null; title?: string | null };

/** Any CMS value as trimmed text ('' for null) */
export const text = (v: unknown) => String(v ?? '').trim();

/** Absolute http(s) URL, upgraded to https (the CMS answers http:// links; the site is https) */
export function mediaUrl(url: unknown): string | null {
  const value = String(url ?? '').trim();
  if (!/^https?:\/\/[^\s"'<>]+$/i.test(value)) return null;
  return value.replace(/^http:\/\//i, 'https://');
}

/** Brand colour from the CMS ("#d12e2e"), with a black or white label colour that reads on it */
export function brandColor(hex: unknown): BrandColor {
  const m = text(hex).match(/^#?([0-9a-f]{6})$/i);
  if (!m) return DEFAULT_BRAND_COLOR;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return { color: `#${m[1].toLowerCase()}`, on: luminance > 0.4 ? '#121212' : '#ffffff' };
}
