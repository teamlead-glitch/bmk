import type { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/site-url';

// Staging (*.vercel.app) is kept out of Google by the X-Robots-Tag header in next.config.ts
export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();
  return { rules: [{ userAgent: '*', allow: '/', disallow: ['/api/'] }], sitemap: `${siteUrl}/sitemap.xml` };
}
