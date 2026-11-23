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
import { getBrandShowcase, getCompany, getGroupLocations, getHomeAbout, getHomeBanner, getTimeline } from '@/lib/content';
import { cmsSeoMetadata } from '@/lib/page-metadata';

// Hero, about, brands and timeline come from the CMS: rebuilt at most every minute, or at once via POST /api/revalidate/
export const revalidate = 60; // TODO: back to 300 after development

// SEO from the admin's "home" page (CMS: GET /v1/pages/home). The title is used as written,
// without the " | BMK Group" suffix the other pages get.
export async function generateMetadata(): Promise<Metadata> {
  const meta = await cmsSeoMetadata('home', { title: SEO_CONFIG.DEFAULT_TITLE, path: '/' });
  return { ...meta, title: { absolute: typeof meta.title === 'string' && meta.title ? meta.title : SEO_CONFIG.DEFAULT_TITLE } };
}

// Order matters: effects run top to bottom, and pinned sections (hero, history)
// must be created before the triggers below them measure the pin spacing.
export default async function HomePage() {
  const [company, brands, banner, about, timeline, locations] = await Promise.all([
    getCompany(),
    getBrandShowcase(),
    getHomeBanner(),
    getHomeAbout(),
    getTimeline(),
    getGroupLocations(),
  ]);

  return (
    <>
      <SmoothScroll />
      <HeroSection years={company.YEARS} banner={banner} />
      <AboutSection about={about} />
      <PresenceSection locations={locations} />
      <BrandsSection partner={brands.partner} own={brands.own} filters={brands.filters} />
      <HistorySection milestones={timeline} />
      <EnquiryBlock
        types={company.enquiryTypes}
        id="contact"
        animated
      />
      <HomeReveals />
    </>
  );
}
