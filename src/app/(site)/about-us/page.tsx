import type { Metadata } from 'next';
import { Companies, Journey, MissionValues, OurBrands, WhoWeAre } from '@/components/about/AboutSections';
import { SectionPills } from '@/components/about/SectionPills';
import { EnquiryBlock } from '@/components/enquiry/EnquiryBlock';
import { PhotoHero } from '@/components/common/PhotoHero';
import { getAboutPage, getBrandShowcase, getCompany, getGroupLocations, getTimeline, toGlobePlaces } from '@/lib/content';
import { HOME } from '@/lib/routes';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'About Us',
  description: 'Who BMK Group is, what we stand for, where we operate and how we got here: eight companies across six countries since 2002.',
  path: '/about-us/',
  image: '/assets/images/about.webp',
});

const SECTIONS: [string, string][] = [
  ['who-we-are', 'Who we are'],
  ['mission', 'Mission & values'],
  ['companies', 'Our companies'],
  ['our-brands', 'Our brands'],
  ['journey', 'Our journey'],
  ['work-with-us', 'Work with us'],
];

export default async function AboutPage() {
  const [company, about, brands, timeline, groupLocations] = await Promise.all([getCompany(), getAboutPage(), getBrandShowcase(), getTimeline(), getGroupLocations()]);
  // Our companies: only locations with at least one company; the counts and globe follow them
  const locations = groupLocations.filter((l) => l.companies.length > 0);
  const companyCount = locations.reduce((n, l) => n + l.companies.length, 0);
  const countryCount = new Set(locations.map((l) => l.countryCode || l.country)).size;
  return (
    <>
      <PhotoHero
        trail={[['Home', HOME], ['About Us']]}
        title="About BMK Group"
        sub="Who we are, what we stand for, where we operate and how we got here."
        image="/assets/images/about.webp"
        imageClass="object-[66%_50%]"
        position="66% 50%"
        overlay="linear-gradient(90deg,rgb(0 0 0/.75) 0%,rgb(0 0 0/.35) 60%,rgb(0 0 0/.2) 100%)"
        className="pb-[146px]"
        titleClass="max-w-3xl"
      />
      <SectionPills sections={SECTIONS} />
      <WhoWeAre heading={about.title} html={about.html} places={toGlobePlaces(locations)} companies={companyCount} countries={countryCount} />
      <MissionValues mission={about.mission} vision={about.vision} values={about.values} />
      <Companies locations={locations} intro={about.companiesText} />
      <OurBrands own={brands.own} partners={brands.partner} title={about.brandsTitle} intro={about.brandsText} />
      <Journey milestones={timeline} />
      <EnquiryBlock types={company.enquiryTypes} />
    </>
  );
}
