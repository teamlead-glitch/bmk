import type { Metadata } from 'next';
import { permanentRedirect, redirect } from 'next/navigation';
import { href } from '@/lib/routes';

/* ---------- CMS PREVIEW (?preview={token} from the admin) ---------- */
// src/proxy.ts rewrites /{slug}/, /product/{slug}/, /brand/{slug}/ and /category/{slug}/ with
// ?preview= to the internal route /cms-preview/{kind}/{slug}/{token}/, which renders the same
// page with the token passed to the CMS (unpublished records), uncached and noindex.

export const PREVIEW_KINDS = ['page', 'product', 'brand', 'category'] as const;
export type PreviewKind = (typeof PREVIEW_KINDS)[number];

/** Metadata of a preview: never indexed */
export function previewMetadata(meta: Metadata, preview?: string): Metadata {
  return preview ? { ...meta, robots: { index: false, follow: false } } : meta;
}

/** Slug renamed in the CMS: 308 to the new URL, or for a preview a temporary redirect that keeps the token */
export function redirectRenamed(path: string, preview?: string): never {
  if (preview) redirect(`${href(path)}?preview=${encodeURIComponent(preview)}`);
  permanentRedirect(href(path));
}
