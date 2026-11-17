/* eslint-disable @next/next/no-img-element -- city icon (SVG) */
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ContactForm } from '@/components/contact/ContactForm';
import { ContactOffices, ContactOfficesFromUrl } from '@/components/contact/ContactOffices';
import { EnquiryBlock } from '@/components/enquiry/EnquiryBlock';
import { MailIcon, PhoneIcon } from '@/components/common/Icons';
import { PhotoHero } from '@/components/common/PhotoHero';
import { getCompany, getContact, telHref } from '@/lib/content';
import { HOME } from '@/lib/routes';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Contact Us',
  description: 'Reach the right BMK Group company in the UAE, India, Singapore, Malaysia, Zambia or the DR Congo, or send us a message.',
  path: '/contact/',
  image: '/assets/images/contact-hero.webp',
});

export default async function ContactPage() {
  const [company, contact] = await Promise.all([getCompany(), getContact()]);
  const hasOffice = contact.address.length > 0 || contact.phone || contact.email;
  return (
    <>
      <PhotoHero trail={[['Home', HOME], ['Contact Us']]} title="Get in touch" sub="Reach the right BMK Group company, or send us a message." image="/assets/images/contact-hero.webp" />
      <section className="shell section-y !pt-12">
        <div className="grid items-start gap-10 lg:grid-cols-[688fr_608fr] lg:gap-16">
          <Suspense fallback={<ContactOffices locations={company.locations} />}>
            <ContactOfficesFromUrl locations={company.locations} />
          </Suspense>
          <div className="lg:sticky lg:top-32">
            <h2 className="text-[28px] leading-tight tracking-[-0.04em]">Send us a message</h2>
            <ContactForm subjects={company.enquiryTypes.map((t) => t.type)} />
          </div>
        </div>
      </section>
      {/* Head office: contact details from the CMS (settings/contact) */}
      {hasOffice && (
        <section className="shell">
          <div className="flex flex-col gap-6 rounded-3xl bg-navy p-6 text-white sm:p-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <span className="grid size-14 shrink-0 place-items-center rounded-full bg-white">
                <img src="/assets/icons/loc-dubai.svg" alt="" width={32} height={32} />
              </span>
              <div>
                <p className="text-xs tracking-[0.14em] text-white/60 uppercase">Head office</p>
                {contact.address.length > 0 && <p className="mt-1 text-xl leading-7 font-semibold">{contact.address.join(', ')}</p>}
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              {contact.phone && (
                <a className="btn bg-white text-ink hover:bg-accent hover:text-white" href={telHref(contact.phone)}>
                  <PhoneIcon /> {contact.phone}
                </a>
              )}
              {contact.email && (
                <a className="btn btn-outline-light" href={`mailto:${contact.email}`}>
                  <MailIcon /> {contact.email}
                </a>
              )}
            </div>
          </div>
        </section>
      )}
      <EnquiryBlock types={company.enquiryTypes} id="business-enquiries" title="Business enquiries" />
    </>
  );
}
