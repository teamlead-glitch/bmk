import type { NextConfig } from 'next';
import { LEGACY_REDIRECTS } from './src/constants/legacy-redirects';

// Content-Security-Policy: one entry per directive, every third party listed with a reason.
// 'unsafe-inline' scripts: Next.js bootstrap, the js-motion flag in the root layout and GTM.
// blob: media: the hero video is fetched into memory and played from a blob URL.
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://*.googletagmanager.com https://*.google-analytics.com",
  "connect-src 'self' https://*.google-analytics.com https://*.googletagmanager.com https://*.analytics.google.com",
  "img-src 'self' data: blob: https:",
  "media-src 'self' blob:",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data:",
  "frame-src 'self' https://www.googletagmanager.com https://www.google.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  'report-uri /api/csp-report',
].join('; ');

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Every page URL ends with "/" (/about/, /brand/nikon/), as in the design reference
  trailingSlash: true,
  // Cache Components is off on purpose: the site uses the ISR model (cached pages,
  // unstable_cache in src/lib/cms-fetch.ts, revalidateTag from /api/revalidate),
  // and the homepage's GSAP pins / Lenis must unmount on navigation (Cache
  // Components keeps hidden routes mounted with <Activity>).
  cacheComponents: false,
  turbopack: {
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },
  async redirects() {
    return [...LEGACY_REDIRECTS];
  },
  async headers() {
    return [
      // Staging and previews stay out of search results (the live domain never matches)
      { source: '/:path*', has: [{ type: 'host', value: '.*\\.vercel\\.app' }], headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] },
      // Design assets and video: a day in the browser, a week at the edge (rename files when they change)
      ...['/assets/:path*', '/video/:path*', '/data/:path*'].map((source) => ({
        source,
        headers: [{ key: 'Cache-Control', value: 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=604800' }],
      })),
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), usb=(), browsing-topics=()' },
          // Report-only first: read the "[csp]" logs, then switch the key to Content-Security-Policy
          { key: 'Content-Security-Policy-Report-Only', value: CSP },
        ],
      },
    ];
  },
};

export default nextConfig;
