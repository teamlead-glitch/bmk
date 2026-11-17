// Environment access lives here and in src/lib/* only, always with a safe fallback.

// CMS API: read by src/lib/api/ (products, listings, contact, FAQ, home banner). Content without an
// endpoint yet still comes from the designer's static content in src/static/.
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URI || '',
};

export const SEO_CONFIG = {
  SITE_NAME: 'BMK Group',
  // Site-wide OG/Twitter image used when a page has no image of its own
  DEFAULT_SHARE_IMAGE: '/og-image.jpg',
  DEFAULT_TITLE: 'BMK Group | Built on trust. Driven by innovation.',
  DEFAULT_DESCRIPTION:
    'BMK Group brings global technology brands closer to businesses through trusted sourcing, international distribution and a forward-looking approach to product development.',
  SHARE_DESCRIPTION:
    "Global technology distribution: trusted sourcing, official brand partnerships and BMK's own brands across the Middle East, Asia and Africa.",
  SHARE_IMAGE_ALT: 'BMK Group logo with the tagline Built on trust. Driven by innovation., over a dotted world map',
};

// Google Tag Manager container. Every tracking tag lives inside GTM.
// Empty → no GTM script is rendered (set it in Vercel when the container exists).
export const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID || '';
