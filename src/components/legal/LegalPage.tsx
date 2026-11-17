import type { Metadata } from 'next';
import Link from 'next/link';
import { Arrow } from '@/components/common/Arrow';
import { Crumbs } from '@/components/common/Crumbs';
import { LegalToc } from '@/components/legal/LegalToc';
import { LEGAL, LEGAL_ORDER, type LegalId } from '@/data/legal';
import { getContact } from '@/lib/content';
import { HOME, href } from '@/lib/routes';
import { pageMetadata } from '@/lib/seo';

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

export const legalMetadata = (id: LegalId): Metadata => pageMetadata({ title: LEGAL[id].title, description: LEGAL[id].sub, path: `/${id}/` });

/** Privacy / Cookies / Terms: one template with a sticky table of contents. */
export async function LegalPage({ id }: { id: LegalId }) {
  const doc = LEGAL[id];
  const contact = await getContact(); // email from the CMS (settings/contact)
  const sections = doc.sections.map((t, i) => ({ id: slug(t), title: t, n: String(i + 1).padStart(2, '0') }));
  return (
    <>
      <section className="bg-mist pt-[clamp(128px,11vw,176px)] pb-[clamp(48px,5vw,80px)]">
        <div className="shell">
          <Crumbs items={[['Home', HOME], [doc.title]]} />
          <h1 className="t-display mt-6 max-w-4xl">{doc.title}</h1>
          <p className="t-body mt-3 max-w-2xl text-ink/80">{doc.sub}</p>
          <p className="mt-6 text-sm text-muted">
            Last updated: <span className="legal-tbc">date to be confirmed</span>
          </p>
        </div>
      </section>
      <section className="shell section-y !pt-12">
        <div className="grid gap-12 lg:grid-cols-[280px_1fr] lg:gap-20">
          <aside className="h-fit lg:sticky lg:top-32">
            <LegalToc sections={sections} />
            <div className="mt-8 hidden flex-col gap-2 border-t border-line pt-6 lg:flex">
              <p className="mb-1 text-xs tracking-[0.14em] text-muted uppercase">Other policies</p>
              {LEGAL_ORDER.filter(([k]) => k !== id).map(([k, n]) => (
                <Link key={k} className="group inline-flex items-center gap-2 text-[15px] hover:text-navy" href={href(`/${k}`)}>
                  {n} <Arrow />
                </Link>
              ))}
            </div>
          </aside>
          <article className="legal max-w-3xl">
            <div className="legal-note" role="note">
              <strong>Placeholder text.</strong> BMK Group’s legal team will supply the final wording. The headings show the expected structure.
            </div>
            {sections.map((s) => (
              <section key={s.id} id={s.id} className="legal-sec" data-section>
                <h2>
                  <span className="n">{s.n}</span>
                  {s.title}
                </h2>
                {s.title === 'Contact us' ? (
                  <p>
                    Questions about this {doc.title === 'Terms & Conditions' ? 'page' : 'policy'} can be sent{' '}
                    {contact.email && (
                      <>
                        to <a href={`mailto:${contact.email}`}>{contact.email}</a>, or{' '}
                      </>
                    )}
                    through our <Link href={href('/contact')}>contact page</Link>.
                  </p>
                ) : (
                  <>
                    <p className="legal-ph" />
                    <p className="legal-ph w-[92%]" />
                    <p className="legal-ph w-[70%]" />
                  </>
                )}
              </section>
            ))}
          </article>
        </div>
      </section>
    </>
  );
}
