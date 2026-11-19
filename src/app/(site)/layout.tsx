import { AnchorScroll } from '@/components/common/AnchorScroll';
import { SectionReveal } from '@/components/common/SectionReveal';
import { Footer } from '@/components/footer/Footer';
import { SiteHeader } from '@/components/header/SiteHeader';
import { getContact, getNavData } from '@/lib/content';

// The footer's contact details come from the CMS: pages rebuild at most every minute, or at once via POST /api/revalidate/
export const revalidate = 60; // TODO: back to 300 after development

/** Every page except the homepage: floating navbar, full-screen mobile menu, footer. */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [nav, contact] = await Promise.all([getNavData(), getContact()]);
  return (
    <>
      <SiteHeader nav={nav} />
      <main id="main" tabIndex={-1}>
        {children}
      </main>
      <Footer categories={nav.categories} contact={contact} />
      <SectionReveal />
      <AnchorScroll />
    </>
  );
}
