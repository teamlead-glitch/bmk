// Legal pages: CMS pages (GET /v1/pages/{slug}) served by the dynamic route /{slug}/
// (src/app/(site)/[slug]/page.tsx), at the slug set in the admin. Listed here for the footer
// links, the sitemap, the "Other policies" links and the line under the title (the CMS page
// has no subtitle). Any other page created in the admin works at /{slug}/ too.

export const LEGAL_PAGES: { slug: string; name: string; sub: string }[] = [
  { slug: 'privacy-policy', name: 'Privacy Policy', sub: 'How BMK Group collects, uses and protects your personal information.' },
  { slug: 'cookie-policy', name: 'Cookie Policy', sub: 'What cookies this website uses and how you can control them.' },
  { slug: 'terms-and-conditions', name: 'Terms & Conditions', sub: 'The terms that apply when you use the BMK Group website.' },
];
