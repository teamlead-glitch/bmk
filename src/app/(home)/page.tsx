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
import { getBrandShowcase, getCompany, getHomeBanner, getTimeline } from '@/lib/content';
import { pageMetadata } from '@/lib/seo';

// Hero, brands and timeline come from the CMS: rebuilt at most every 5 minutes, or at once via POST /api/revalidate/
export const revalidate = 300;

export const metadata: Metadata = {
  ...pageMetadata({ title: SEO_CONFIG.DEFAULT_TITLE, path: '/' }),
  title: { absolute: SEO_CONFIG.DEFAULT_TITLE },
};

// Order matters: effects run top to bottom, and pinned sections (hero, history)
// must be created before the triggers below them measure the pin spacing.
export default async function HomePage() {
  const [company, brands, banner, timeline] = await Promise.all([getCompany(), getBrandShowcase(), getHomeBanner(), getTimeline()]);

  return (
    <>
      <SmoothScroll />
      <HeroSection years={company.YEARS} banner={banner} />
      <AboutSection heading={company.intro.heading} paragraphs={company.intro.short} />
      <PresenceSection locations={company.locations} defaultLocation={company.defaultLocation} />
      <BrandsSection partner={brands.partner} own={brands.own} filters={brands.filters} />
      <HistorySection milestones={timeline} />
      <EnquiryBlock types={company.enquiryTypes} id="contact" title="Let's do business together" animated />
      <HomeReveals />
    </>
  );
}
