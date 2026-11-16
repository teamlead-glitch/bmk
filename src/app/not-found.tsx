import type { Metadata } from 'next';
import Link from 'next/link';
import { AnchorScroll } from '@/components/common/AnchorScroll';
import { Arrow } from '@/components/common/Arrow';
import { NotFoundWall } from '@/components/legal/NotFoundWall';
import { Footer } from '@/components/layout/Footer';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { getContact, getNavData } from '@/lib/content';
import { HOME, href } from '@/lib/routes';

export const metadata: Metadata = { title: 'Page not found', robots: { index: false } };

/** 404 (any unknown URL, unknown product/category/brand): the 4/0 wall with three ways out. */
export default async function NotFound() {
  const [nav, contact] = await Promise.all([getNavData(), getContact()]);
  return (
    <>
      <SiteHeader nav={nav} />
      <main id="main" tabIndex={-1}>
        <section className="nf" aria-labelledby="nf-title">
          <h1 id="nf-title" className="sr-only">
            Page not found (404)
          </h1>
          <NotFoundWall />
          <div className="nf-actions">
            <Link className="btn nf-btn" href={href('/products')}>
              Browse all products <Arrow />
            </Link>
            <Link className="btn nf-btn" href={HOME}>
              Back to home <Arrow />
            </Link>
            <Link className="btn nf-btn" href={href('/contact')}>
              Contact us <Arrow />
            </Link>
          </div>
        </section>
      </main>
      <Footer groups={nav.groups} contact={contact} />
      <AnchorScroll />
    </>
  );
}
