import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, permanentRedirect, redirect } from 'next/navigation';
import { Arrow } from '@/components/common/Arrow';
import { Crumbs } from '@/components/common/Crumbs';
import { ContentToc } from '@/components/content-page/ContentToc';
import { LEGAL_PAGES } from '@/constants/legal';
import { getCmsPage, getContact } from '@/lib/content';
import { HOME, href } from '@/lib/routes';
import { mapSeoToMetadata } from '@/lib/seo-mapper';

/** Title, description and share tags from the page's CMS `seo` block */
export async function cmsPageMetadata(slug: string, preview?: string): Promise<Metadata> {
  const page = await getCmsPage(slug, preview);
  if (!page || 'redirect' in page) return preview ? { robots: { index: false, follow: false } } : {};
  const legal = LEGAL_PAGES.find((p) => p.slug === slug);
  const meta = mapSeoToMetadata(page.seo, { path: `/${slug}/`, title: page.title || legal?.name || slug, description: legal?.sub });
  return preview ? { ...meta, robots: { index: false, follow: false } } : meta; // previews are never indexed
}

/** A CMS page (GET /v1/pages/{slug}) at /{slug}/: Privacy, Cookies, Terms or any page made in
 *  the admin. A sticky table of contents is built from its h2 headings. Unknown slug -> 404.
 *  `preview`: token from /{slug}/?preview=… (see src/proxy.ts), shows unpublished content. */
export async function ContentPage({ slug, preview }: { slug: string; preview?: string }) {
  const [page, contact] = await Promise.all([getCmsPage(slug, preview), getContact()]);
  if (!page) notFound();
  if ('redirect' in page) {
    // slug renamed in the admin (a preview keeps its token and is a temporary redirect)
    if (preview) redirect(`${href(`/${page.redirect}`)}?preview=${encodeURIComponent(preview)}`);
    permanentRedirect(href(`/${page.redirect}`));
  }
  const legal = LEGAL_PAGES.find((p) => p.slug === slug); // legal pages: subtitle and "Other policies"
  const others = legal ? LEGAL_PAGES.filter((p) => p.slug !== slug) : [];
  const title = page.title || legal?.name || slug;
  const empty = !page.intro && !page.sections.length;
  const aside = page.sections.length > 0 || others.length > 0;

  return (
    <>
      <section className="bg-mist pt-[clamp(128px,11vw,176px)] pb-[clamp(48px,5vw,80px)]">
        <div className="shell">
          <Crumbs items={[['Home', HOME], [title]]} />
          <h1 className="t-display mt-6 max-w-4xl">{title}</h1>
          {legal && <p className="t-body mt-3 max-w-2xl text-ink/80">{legal.sub}</p>}
        </div>
      </section>
      <section className="shell section-y !pt-12">
        <div className={`grid gap-12 lg:gap-20 ${aside ? 'lg:grid-cols-[280px_1fr]' : ''}`}>
          {aside && (
            <aside className="h-fit lg:sticky lg:top-32">
              {page.sections.length > 0 && <ContentToc sections={page.sections} />}
              {others.length > 0 && (
                <div className={`hidden flex-col gap-2 lg:flex ${page.sections.length ? 'mt-8 border-t border-line pt-6' : ''}`}>
                  <p className="mb-1 text-xs tracking-[0.14em] text-muted uppercase">Other policies</p>
                  {others.map((p) => (
                    <Link key={p.slug} className="group inline-flex items-center gap-2 text-[15px] hover:text-navy" href={href(`/${p.slug}`)}>
                      {p.name} <Arrow />
                    </Link>
                  ))}
                </div>
              )}
            </aside>
          )}
          <article className="legal max-w-3xl">
            {empty ? (
              <div className="legal-sec">
                <p>
                  This page is being updated. For questions, please{' '}
                  {contact.email && (
                    <>
                      email <a href={`mailto:${contact.email}`}>{contact.email}</a> or{' '}
                    </>
                  )}
                  use our <Link href={href('/contact-us')}>contact page</Link>.
                </p>
              </div>
            ) : (
              <>
                {/* Text before the first heading (e.g. "Last updated"), or the whole body of a page
                    without h2 headings (then shown as body text); cleaned in src/lib/api/pages.ts */}
                {page.intro && (
                  <div className={page.sections.length ? 'legal-intro legal-body' : 'legal-sec legal-body'} dangerouslySetInnerHTML={{ __html: page.intro }} />
                )}
                {page.sections.map((s) => (
                  <section key={s.id} id={s.id} className="legal-sec" data-section>
                    <h2>
                      <span className="n">{s.n}</span>
                      {s.title}
                    </h2>
                    <div className="legal-body" dangerouslySetInnerHTML={{ __html: s.html }} />
                  </section>
                ))}
              </>
            )}
          </article>
        </div>
      </section>
    </>
  );
}
