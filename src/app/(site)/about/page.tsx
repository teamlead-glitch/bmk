import type { Metadata } from 'next';
import { Companies, Journey, MissionValues, OurBrands, WhoWeAre } from '@/components/about/AboutSections';
import { SectionPills } from '@/components/about/SectionPills';
import { EnquiryBlock } from '@/components/enquiry/EnquiryBlock';
import { PhotoHero } from '@/components/common/PhotoHero';
import { getBrandShowcase, getCompany } from '@/lib/content';
import { HOME } from '@/lib/routes';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'About Us',
  description: 'Who BMK Group is, what we stand for, where we operate and how we got here: eight companies across six countries since 2002.',
  path: '/about/',
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
  const [company, brands] = await Promise.all([getCompany(), getBrandShowcase()]);
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
      <WhoWeAre heading={company.intro.heading} paragraphs={company.intro.paragraphs} companies={company.entities.length} countries={company.countries.length} />
      <MissionValues mission={company.mission} vision={company.vision} values={company.values} />
      <Companies locations={company.locations} />
      <OurBrands own={brands.own} partners={brands.partner} />
      <Journey milestones={company.milestones} />
      <EnquiryBlock types={company.enquiryTypes} title="Work with BMK" sub="Distribution, dealership, retail supply or something else." />
    </>
  );
}
