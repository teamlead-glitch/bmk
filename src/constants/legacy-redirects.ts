/* ---------- OLD URL REDIRECTS (301, single hop) ---------- */
// Add the old live site's URLs here when it is replaced. Order matters: exact
// rows above the slug rules. Destinations end with "/" (trailingSlash: true).
type LegacyRedirect = { source: string; destination: string; permanent: true };

const EXACT_REDIRECTS: [string, string][] = [
  // Design reference: the catalogue app lived at /catalogue/
  ['/catalogue', '/products/'],
  // About, Contact and FAQ moved to the admin's slugs (query kept: /contact/?office=1 still works)
  ['/about', '/about-us/'],
  ['/contact', '/contact-us/'],
  ['/faq', '/faqs/'],
];

// Pattern rules: old folder -> new folder, slug kept
const SLUG_RULES: [string, string][] = [
  // ["/old-products/", "/product/"],
];

export const LEGACY_REDIRECTS: LegacyRedirect[] = [
  ...EXACT_REDIRECTS.map(([source, destination]) => ({ source, destination, permanent: true as const })),
  ...SLUG_RULES.map(([from, to]) => ({ source: `${from}:slug`, destination: `${to}:slug/`, permanent: true as const })),
];

export function isLegacySlugPath(path: string): boolean {
  return SLUG_RULES.some(([from]) => path.startsWith(from));
}

/** Final destination for a (lowercased) old path, or null */
export function resolveLegacyRedirect(path: string): string | null {
  const clean = path.replace(/\/+$/, '') || '/';
  const exact = EXACT_REDIRECTS.find(([source]) => source === clean);
  if (exact) return exact[1];
  const rule = SLUG_RULES.find(([from]) => path.startsWith(from));
  return rule ? `${rule[1]}${path.slice(rule[0].length).replace(/\/+$/, '')}/` : null;
}
