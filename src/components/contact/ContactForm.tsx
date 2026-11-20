'use client';

import { useState } from 'react';
import { Arrow } from '@/components/common/Arrow';
import { CheckIcon } from '@/components/common/Icons';
import { CountryBrandFields } from '@/components/enquiry/CountryBrandFields';
import { FieldError, Honeypot, useEnquirySubmit } from '@/components/enquiry/useEnquirySubmit';
import { BRAND_ENQUIRY_TYPES } from '@/constants/enquiry';
import { trackLead } from '@/lib/gtm';

const ID = 'contact';

/** Send us a message: posted to the CMS through /api/enquiry/. The chosen subject
 *  is also the enquiry type; distribution, dealership and retail also ask for the
 *  company and the brands of the chosen country. */
export function ContactForm({ subjects }: { subjects: string[] }) {
  const [sent, setSent] = useState(false);
  const [subject, setSubject] = useState(subjects[0] ?? '');
  const business = BRAND_ENQUIRY_TYPES.includes(subject);
  const { pending, error, errors, onSubmit, fieldProps } = useEnquirySubmit(
    (f) => ({ ...f, type: f.subject, name: f.name, email: f.email, message: f.message }),
    (input) => {
      setSent(true);
      trackLead('contact_form', input.subject);
    },
  );

  return (
    <div className="mt-5 rounded-3xl border border-line bg-white p-6 sm:p-10">
      {sent ? (
        <div className="grid justify-items-center gap-4 py-20 text-center" role="status">
          <span className="grid size-16 place-items-center rounded-full bg-navy text-white">
            <CheckIcon size={24} />
          </span>
          <p className="text-[28px] leading-tight tracking-[-0.04em]">Thanks, your message is on its way</p>
          <p className="t-body max-w-sm text-muted">We’ll reply by email.</p>
        </div>
      ) : (
        <form className="grid gap-4" onSubmit={onSubmit}>
          <Honeypot />
          <label className="grid gap-1.5 text-sm">
            <span className="font-medium">Full name</span>
            <input name="name" required maxLength={120} className="field" autoComplete="name" {...fieldProps('name', ID)} />
            <FieldError name="name" idPrefix={ID} errors={errors} />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1.5 text-sm">
              <span className="font-medium">Email</span>
              <input name="email" type="email" required maxLength={190} className="field" autoComplete="email" {...fieldProps('email', ID)} />
              <FieldError name="email" idPrefix={ID} errors={errors} />
            </label>
            <label className="grid gap-1.5 text-sm">
              <span className="font-medium">Phone</span>
              <input name="phone" type="tel" required minLength={7} maxLength={40} className="field" autoComplete="tel" {...fieldProps('phone', ID)} />
              <FieldError name="phone" idPrefix={ID} errors={errors} />
            </label>
          </div>
          <label className="grid gap-1.5 text-sm">
            <span className="font-medium">Subject</span>
            <span className="select w-full">
              <select name="subject" className="!w-full !rounded-xl !py-3" value={subject} onChange={(e) => setSubject(e.target.value)} {...fieldProps('subject', ID)}>
                {subjects.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </span>
            <FieldError name="subject" idPrefix={ID} errors={errors} />
          </label>
          <label className="grid gap-1.5 text-sm">
            <span className="font-medium">
              Company{!business && <span className="font-normal text-muted"> (optional)</span>}
            </span>
            <input name="company" required={business} maxLength={150} className="field" autoComplete="organization" {...fieldProps('company', ID)} />
            <FieldError name="company" idPrefix={ID} errors={errors} />
          </label>
          <CountryBrandFields idPrefix={ID} withBrands={business} errors={errors} fieldProps={fieldProps} />
          <label className="grid gap-1.5 text-sm">
            <span className="font-medium">Message</span>
            <textarea name="message" rows={5} required maxLength={5000} className="field" {...fieldProps('message', ID)} />
            <FieldError name="message" idPrefix={ID} errors={errors} />
          </label>
          {error && (
            <p className="text-sm text-danger" role="alert">
              {error}
            </p>
          )}
          <button className="btn btn-navy mt-2 w-full" disabled={pending} aria-busy={pending}>
            {pending ? 'Sending…' : 'Send message'} <Arrow />
          </button>
          <p className="text-center text-xs text-muted">We’ll reply by email.</p>
        </form>
      )}
    </div>
  );
}
