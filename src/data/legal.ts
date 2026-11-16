// Legal pages. No approved legal text yet: the sections are a layout skeleton
// with the headings these policies usually carry; bodies render as placeholders
// until BMK's legal team supplies the wording (then this becomes CMS content).

export type LegalId = 'terms' | 'privacy' | 'cookies';

export const LEGAL: Record<LegalId, { title: string; sub: string; sections: string[] }> = {
  terms: {
    title: 'Terms & Conditions',
    sub: 'The terms that apply when you use the BMK Group website.',
    sections: ['About these terms', 'Using this website', 'Product information', 'Enquiries', 'Intellectual property', 'Third-party links', 'Limitation of liability', 'Governing law', 'Changes to these terms', 'Contact us'],
  },
  privacy: {
    title: 'Privacy Policy',
    sub: 'How BMK Group collects, uses and protects your personal information.',
    sections: ['Who we are', 'Information we collect', 'How we use your information', 'Sharing your information', 'International transfers', 'How long we keep it', 'Your rights', 'Security', 'Changes to this policy', 'Contact us'],
  },
  cookies: {
    title: 'Cookie Policy',
    sub: 'What cookies this website uses and how you can control them.',
    sections: ['What cookies are', 'Cookies we use', 'Third-party cookies', 'Managing cookies', 'Changes to this policy', 'Contact us'],
  },
};

export const LEGAL_ORDER: [LegalId, string][] = [
  ['privacy', 'Privacy Policy'],
  ['cookies', 'Cookie Policy'],
  ['terms', 'Terms & Conditions'],
];
