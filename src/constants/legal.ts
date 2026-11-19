// Legal pages: site path -> CMS page slug (GET /v1/pages/{slug}), the name in the
// "Other policies" links and the line under the title (the CMS page has no subtitle).

export type LegalId = 'privacy' | 'cookies' | 'terms';

export const LEGAL_PAGES: Record<LegalId, { slug: string; name: string; sub: string }> = {
  privacy: { slug: 'privacy-policy', name: 'Privacy Policy', sub: 'How BMK Group collects, uses and protects your personal information.' },
  cookies: { slug: 'cookie-policy', name: 'Cookie Policy', sub: 'What cookies this website uses and how you can control them.' },
  terms: { slug: 'terms-and-conditions', name: 'Terms & Conditions', sub: 'The terms that apply when you use the BMK Group website.' },
};

/** Order of the "Other policies" links */
export const LEGAL_ORDER: LegalId[] = ['privacy', 'cookies', 'terms'];
