'use client';

/* eslint-disable @next/next/no-img-element -- art-directed photo */
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Arrow } from '@/components/common/Arrow';
import { PlusIcon, SearchIcon } from '@/components/common/Icons';
import { PhotoHero } from '@/components/common/PhotoHero';
import { HOME, href } from '@/lib/routes';
import type { Faq, FaqTopic } from '@/types/faq';

const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Accordion item: the answer's height eases open and closed (height and the
 *  bottom padding animate together, so closing has no final jump). */
function FaqItem({ f, forceOpen }: { f: Faq; forceOpen: boolean }) {
  const onClick = (e: React.MouseEvent<HTMLElement>) => {
    if (reduced()) return;
    e.preventDefault();
    const d = e.currentTarget.parentElement as HTMLDetailsElement;
    const a = d.querySelector<HTMLElement>('.faq-a')!;
    a.getAnimations().forEach((x) => x.cancel());
    const pb = getComputedStyle(a).paddingBottom;
    if (!d.open) {
      d.open = true;
      const h = a.offsetHeight;
      a.animate({ height: ['0px', `${h}px`], paddingBottom: ['0px', pb], opacity: [0, 1] }, { duration: 420, easing: 'cubic-bezier(0.33, 1, 0.68, 1)' });
    } else {
      d.classList.add('is-closing');
      const anim = a.animate(
        { height: [`${a.offsetHeight}px`, '0px'], paddingBottom: [pb, '0px'], opacity: [1, 0] },
        { duration: 340, easing: 'cubic-bezier(0.65, 0, 0.35, 1)', fill: 'forwards' },
      );
      anim.onfinish = () => {
        d.open = false;
        d.classList.remove('is-closing');
        anim.cancel();
      };
    }
  };
  return (
    <details className="faq" open={forceOpen || undefined}>
      <summary onClick={onClick}>
        <span>{f.q}</span>
        <span className="faq-icon" aria-hidden="true">
          <PlusIcon />
        </span>
      </summary>
      {/* CMS rich text, cleaned on the server (src/lib/html.ts) */}
      <div className="faq-a" dangerouslySetInnerHTML={{ __html: f.html }} />
    </details>
  );
}

/** FAQ page body: hero with question search, topic filters, accordions, help card. */
export function FaqExplorer({ faqs, topics }: { faqs: Faq[]; topics: FaqTopic[] }) {
  const [q, setQ] = useState('');
  const [topic, setTopic] = useState('');
  const term = q.trim().toLowerCase();

  const visible = useMemo(() => {
    const text = (f: Faq) => `${f.q} ${f.text}`.toLowerCase();
    return new Set(faqs.filter((f) => (!topic || f.topic === topic) && (!term || term.split(/\s+/).every((t) => text(f).includes(t)))));
  }, [faqs, topic, term]);

  return (
    <>
      <PhotoHero
        trail={[['Home', HOME], ['FAQ']]}
        title="Frequently asked questions"
        sub="Answers to common questions about BMK Group, our brands and partnering with us."
        image="/assets/images/faq-hero.webp"
        position="75% center"
      >
        <label className="mt-8 flex max-w-xl items-center gap-3 rounded-full border border-ink/15 bg-white py-1.5 pr-1.5 pl-5 text-ink transition-colors focus-within:border-navy">
          <SearchIcon />
          <input type="search" placeholder="Search questions" className="min-w-0 flex-1 bg-transparent py-2.5 outline-none" aria-label="Search questions" value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
      </PhotoHero>

      <section className="shell section-y !pt-12">
        <div className="mb-10 flex flex-wrap gap-2" role="group" aria-label="Topics">
          <button type="button" className={`pill ${topic ? '' : 'is-on'}`} aria-pressed={!topic} onClick={() => setTopic('')}>
            All <span className="n">{faqs.length}</span>
          </button>
          {topics.map((t) => (
            <button key={t.id} type="button" className={`pill ${topic === t.id ? 'is-on' : ''}`} aria-pressed={topic === t.id} onClick={() => setTopic(t.id)}>
              {t.name} <span className="n">{faqs.filter((f) => f.topic === t.id).length}</span>
            </button>
          ))}
        </div>
        <div className="grid gap-12 lg:grid-cols-[1fr_360px] lg:gap-16">
          {/* content-start: a short list stacks at the top instead of spreading to the help card's height */}
          <div className="grid content-start gap-12">
            {topics.map((t) => {
              const items = faqs.filter((f) => f.topic === t.id && visible.has(f));
              if (!items.length) return null;
              return (
                <section key={t.id}>
                  <h2 className="mb-2 text-xs tracking-[0.14em] text-muted uppercase">{t.name}</h2>
                  {items.map((f) => (
                    <FaqItem key={f.id} f={f} forceOpen={!!term} />
                  ))}
                </section>
              );
            })}
            {visible.size === 0 && (
              <div className="rounded-2xl bg-mist p-10">
                <p className="text-[28px] leading-tight tracking-[-0.04em]">{faqs.length ? 'No questions match your search' : 'No questions yet'}</p>
                <p className="t-body mt-3 text-muted">{faqs.length ? 'Try other words, or ask our team directly.' : 'Ask our team directly and we will get back to you.'}</p>
              </div>
            )}
          </div>
          <aside className="h-fit rounded-3xl bg-navy p-8 text-white lg:sticky lg:top-32">
            <img src="/assets/images/faq-help.webp" alt="" className="aspect-[296/280] w-full rounded-2xl object-cover" loading="lazy" />
            <p className="mt-3 text-[28px] leading-tight tracking-[-0.04em]">Still have a question?</p>
            <p className="t-body mt-3 text-white/75">Our team will get back to you.</p>
            <div className="mt-8 grid gap-3">
              <button type="button" className="btn bg-white text-ink hover:bg-accent hover:text-white" data-enquire="General Enquiry">
                Send an enquiry <Arrow />
              </button>
              <Link className="btn btn-outline-light" href={href('/contact')}>
                Contact us
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
