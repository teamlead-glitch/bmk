import { Footer } from '@/components/footer/Footer';
import { HomeHeader } from '@/components/header/HomeHeader';
import { getContact, getNavData } from '@/lib/content';

/** Homepage chrome: the glass-pill navbar with the inline mobile menu. */
export default async function HomeLayout({ children }: { children: React.ReactNode }) {
  const [nav, contact] = await Promise.all([getNavData(), getContact()]);
  return (
    <>
      <HomeHeader nav={nav} />
      <main id="main">{children}</main>
      <Footer groups={nav.groups} contact={contact} />
    </>
  );
}
