import type { Metadata } from 'next';
import { SEO_CONFIG } from '@/constants/config';
import { siteUrl } from '@/lib/site-url';

/* ---------- PAGE METADATA ---------- */
// Canonical and og:url always use this site's host (from env), the path given here.
// When the CMS delivers SEO records (meta title, description, robots, OG fields,
// schema markup), map them into this same function in src/lib/content.ts.
export interface PageSeo {
  title: string;
  description?: string;
  /** Path with trailing slash, e.g. "/about/" */
  path: string;
  image?: string | null;
  /** false → noindex, follow (search results, utility pages) */
  index?: boolean;
}

export function pageMetadata({ title, description, path, image, index = true }: PageSeo): Metadata {
  const desc = description || SEO_CONFIG.DEFAULT_DESCRIPTION;
  const canonical = siteUrl(path);
  const img = image ? siteUrl(image) : siteUrl(SEO_CONFIG.DEFAULT_SHARE_IMAGE);
  const images = [{ url: img, width: image ? undefined : 1200, height: image ? undefined : 630, alt: image ? title : SEO_CONFIG.SHARE_IMAGE_ALT }];
  return {
    title,
    description: desc,
    alternates: { canonical },
    robots: index ? undefined : { index: false, follow: true },
    openGraph: { type: 'website', siteName: SEO_CONFIG.SITE_NAME, title, description: desc, url: canonical, images },
    twitter: { card: 'summary_large_image', title, description: desc, images: [img] },
  };
}

/** "Nikon" → "Nikon | BMK Group" (the design's title format) */
export const withSiteName = (title: string) => `${title} | ${SEO_CONFIG.SITE_NAME}`;

/** JSON-LD script body: escape "<" so the content can't close the script tag */
export const jsonLd = (data: unknown) => JSON.stringify(data).replace(/</g, '\\u003c');
