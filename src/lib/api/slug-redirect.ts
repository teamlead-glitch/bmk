/* ---------- RENAMED SLUGS ---------- */
// When a slug is changed in the CMS, the old one answers 301 with the current slug (and a
// Location header to the new record). fetch follows it, so the record comes back with a
// different slug than the one asked for: the page then redirects the visitor (308).

export type DetailsResult<T> = T | { redirect: string } | null;

/** The current slug when the CMS answered for a renamed one, else null */
export function getRedirectSlug(requested: string, current: string): string | null {
  return current && current.toLowerCase() !== requested.toLowerCase() ? current : null;
}
