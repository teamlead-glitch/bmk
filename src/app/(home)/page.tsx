import type { Metadata } from 'next';
import { EnquiryBlock } from '@/components/enquiry/EnquiryBlock';
import { AboutSection } from '@/components/home/AboutSection';
import { BrandsSection } from '@/components/home/brands/BrandsSection';
import { HeroSection } from '@/components/home/hero/HeroSection';
import { HistorySection } from '@/components/home/history/HistorySection';
import { HomeReveals } from '@/components/home/HomeReveals';
import { PresenceSection } from '@/components/home/presence/PresenceSection';
import { SmoothScroll } from '@/components/home/SmoothScroll';
import { SEO_CONFIG } from '@/constants/config';
import { getCompany, getContact, getHomeBanner, getHomeBrands } from '@/lib/content';
import { jsonLd, pageMetadata } from '@/lib/seo';
import { getSiteUrl } from '@/lib/site-url';

// Hero background comes from the CMS: rebuilt at most every 5 minutes, or at once via POST /api/revalidate/
export const revalidate = 300;

export const metadata: Metadata = {
  ...pageMetadata({ title: SEO_CONFIG.DEFAULT_TITLE, path: '/' }),
  title: { absolute: SEO_CONFIG.DEFAULT_TITLE },
};

// Order matters: effects run top to bottom, and pinned sections (hero, history)
// must be created before the triggers below them measure the pin spacing.
export default async function HomePage() {
  const [company, brands, banner, contact] = await Promise.all([getCompany(), getHomeBrands(), getHomeBanner(), getContact()]);
  const site = getSiteUrl();
  // Contact details and social profiles from the CMS (settings/contact); empty ones are left out
  const organization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'BMK Group',
    url: site,
    logo: `${site}/assets/logo/bmk.svg`,
    foundingDate: String(company.FOUNDED),
    ...(contact.email && { email: contact.email }),
    ...(contact.phone && { telephone: contact.phone }),
    ...(contact.address.length > 0 && { address: contact.address.join(', ') }),
    ...(contact.social.length > 0 && { sameAs: contact.social.map((s) => s.href) }),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(organization) }} />
      <SmoothScroll />
      <HeroSection years={company.YEARS} banner={banner} />
      <AboutSection heading={company.intro.heading} paragraphs={company.intro.short} />
      <PresenceSection locations={company.locations} defaultLocation={company.defaultLocation} />
      <BrandsSection partner={brands.partner} own={brands.own} filters={brands.filters} />
      <HistorySection milestones={company.milestones} />
      <EnquiryBlock types={company.enquiryTypes} id="contact" title="Let's do business together" animated />
      <HomeReveals />
    </>
  );
}
