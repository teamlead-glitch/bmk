import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Arrow } from '@/components/common/Arrow';
import { Crumbs } from '@/components/common/Crumbs';
import { LegalToc } from '@/components/legal/LegalToc';
import { LEGAL_ORDER, LEGAL_PAGES, type LegalId } from '@/constants/legal';
import { getCmsPage, getContact } from '@/lib/content';
import { HOME, href } from '@/lib/routes';
import { mapSeoToMetadata } from '@/lib/seo-mapper';

/** Title, description and share tags from the page's CMS `seo` block */
export async function legalMetadata(id: LegalId): Promise<Metadata> {
  const meta = LEGAL_PAGES[id];
  const page = await getCmsPage(meta.slug);
  return mapSeoToMetadata(page?.seo, { path: `/${id}/`, title: page?.title || meta.name, description: meta.sub });
}

/** Privacy / Cookies / Terms: the CMS page (GET /v1/pages/{slug}) with a sticky table of
 *  contents built from its h2 headings. Unknown page in the CMS -> 404. */
export async function LegalPage({ id }: { id: LegalId }) {
  const meta = LEGAL_PAGES[id];
  const [page, contact] = await Promise.all([getCmsPage(meta.slug), getContact()]);
  if (!page) notFound();
  const title = page.title || meta.name;
  const empty = !page.intro && !page.sections.length;

  return (
    <>
      <section className="bg-mist pt-[clamp(128px,11vw,176px)] pb-[clamp(48px,5vw,80px)]">
        <div className="shell">
          <Crumbs items={[['Home', HOME], [title]]} />
          <h1 className="t-display mt-6 max-w-4xl">{title}</h1>
          <p className="t-body mt-3 max-w-2xl text-ink/80">{meta.sub}</p>
        </div>
      </section>
      <section className="shell section-y !pt-12">
        <div className="grid gap-12 lg:grid-cols-[280px_1fr] lg:gap-20">
          <aside className="h-fit lg:sticky lg:top-32">
            {page.sections.length > 0 && <LegalToc sections={page.sections} />}
            <div className={`hidden flex-col gap-2 lg:flex ${page.sections.length ? 'mt-8 border-t border-line pt-6' : ''}`}>
              <p className="mb-1 text-xs tracking-[0.14em] text-muted uppercase">Other policies</p>
              {LEGAL_ORDER.filter((k) => k !== id).map((k) => (
                <Link key={k} className="group inline-flex items-center gap-2 text-[15px] hover:text-navy" href={href(`/${k}`)}>
                  {LEGAL_PAGES[k].name} <Arrow />
                </Link>
              ))}
            </div>
          </aside>
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
                  use our <Link href={href('/contact')}>contact page</Link>.
                </p>
              </div>
            ) : (
              <>
                {/* Text before the first heading (e.g. "Last updated"); cleaned in src/lib/api/pages.ts */}
                {page.intro && <div className="legal-intro" dangerouslySetInnerHTML={{ __html: page.intro }} />}
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
