import type { Metadata } from 'next';
import { mediaUrl } from '@/lib/api/cms-mappers';
import { pageMetadata } from '@/lib/seo';
import type { CmsSeo } from '@/types/common';

/* ---------- CMS SEO -> PAGE METADATA (detail pages: products, brands) ---------- */
// The CMS `seo` block gives title, description, robots and the Open Graph / Twitter fields.
// Canonical and og:url always use this site's address with the page's own path (never the
// CMS host). The site renders no JSON-LD structured data (the CMS `schema` field is ignored).

export function mapSeoToMetadata(
  seo: CmsSeo | null | undefined,
  page: {
    /** Path with trailing slash, e.g. "/product/nikon-z8/" */
    path: string;
    /** Used when the CMS has no SEO title / description */
    title: string;
    description?: string;
    /** The page's own photo, when the CMS has no share image */
    image?: string | null;
  },
): Metadata {
  const title = seo?.meta_title?.trim() || page.title;
  const description = seo?.meta_description?.trim() || page.description;
  const ogImage = mediaUrl(seo?.open_graph?.image?.url) ?? page.image ?? null;
  const base = pageMetadata({ title, description, path: page.path, image: ogImage, index: seo?.robots?.index !== false });

  const og = seo?.open_graph;
  const tw = seo?.twitter;
  const twImage = mediaUrl(tw?.image?.url);
  return {
    ...base,
    openGraph: {
      ...base.openGraph,
      title: og?.title?.trim() || title,
      ...(og?.description?.trim() && { description: og.description.trim() }),
    },
    twitter: {
      ...base.twitter,
      title: tw?.title?.trim() || og?.title?.trim() || title,
      ...((tw?.description?.trim() || og?.description?.trim()) && { description: tw?.description?.trim() || og?.description?.trim() }),
      ...(twImage && { images: [twImage] }),
      ...(tw?.card === 'summary' || tw?.card === 'summary_large_image' ? { card: tw.card } : {}),
      ...(tw?.site && { site: tw.site }),
      ...(tw?.creator && { creator: tw.creator }),
    },
  };
}
