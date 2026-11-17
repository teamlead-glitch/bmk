/* eslint-disable @next/next/no-img-element -- art-directed photos */
import { Arrow } from '@/components/common/Arrow';
import { enquiryImages } from '@/data/visuals';
import type { EnquiryType } from '@/types/company';

const ALT: Record<string, string> = {
  'enquiry-distribution': 'Courier unloading parcels from a delivery van',
  'enquiry-dealership': 'Store associate in an electronics showroom',
  'enquiry-retail': 'Camera body and lenses in a padded bag',
  'enquiry-general': 'Businessperson reviewing documents on a phone',
};

/** "Let's do business together": one card per enquiry type; each button opens
 *  the enquiry popup with that type set (data-enquire, EnquiryProvider).
 *  `animated` adds the homepage's GSAP reveal hooks. */
export function EnquiryBlock({
  types,
  id = 'work-with-us',
  title = 'Let’s do business together',
  sub = 'Have a business enquiry? Select the enquiry type below and get in touch with the relevant BMK Group team.',
  animated = false,
}: {
  types: EnquiryType[];
  id?: string;
  title?: string;
  sub?: string;
  animated?: boolean;
}) {
  return (
    <section id={id} className="section-y scroll-mt-24 bg-white" aria-labelledby={`${id}-title`} data-section>
      <div className="shell flex flex-col gap-10">
        <div className="flex flex-col gap-3 text-center">
          <h2 id={`${id}-title`} className="t-display" data-split={animated || undefined}>
            {title}
          </h2>
          <p className="t-body" data-reveal={animated ? 'up' : undefined}>
            {sub}
          </p>
        </div>
        <div className="mx-auto grid w-full max-w-[1292px] gap-4 rounded-3xl bg-mist p-2 sm:p-4 md:grid-cols-2" data-reveal-group={animated || undefined}>
          {types.map((t, i) => (
            <article key={t.type} className="enquiry group">
              <div className="enquiry-media">
                <img src={`/assets/images/${enquiryImages[i]}.webp`} alt={ALT[enquiryImages[i]] ?? ''} loading="lazy" />
              </div>
              <div className="enquiry-text">
                <h3>{t.title}</h3>
                <p>{t.text}</p>
              </div>
              <button type="button" className="btn btn-navy" data-enquire={t.type}>
                {t.type} <Arrow />
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
