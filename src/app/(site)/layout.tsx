import { AnchorScroll } from '@/components/common/AnchorScroll';
import { SectionReveal } from '@/components/common/SectionReveal';
import { Footer } from '@/components/layout/Footer';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { getContact, getNavData } from '@/lib/content';

/** Every page except the homepage: floating navbar, full-screen mobile menu, footer. */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [nav, contact] = await Promise.all([getNavData(), getContact()]);
  return (
    <>
      <SiteHeader nav={nav} />
      <main id="main" tabIndex={-1}>
        {children}
      </main>
      <Footer groups={nav.groups} contact={contact} />
      <SectionReveal />
      <AnchorScroll />
    </>
  );
}
