'use client';

import { useState } from 'react';
import { Arrow } from '@/components/common/Arrow';
import { CheckIcon } from '@/components/common/Icons';
import { trackLead } from '@/lib/gtm';

/** Send us a message. TODO(back end): POST to the CMS enquiry endpoint before
 *  showing the success state (the design only shows the success state). */
export function ContactForm({ subjects }: { subjects: string[] }) {
  const [sent, setSent] = useState(false);
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
        <form
          className="grid gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            const subject = String(new FormData(e.currentTarget).get('subject') || '');
            setSent(true);
            trackLead('contact_form', subject);
          }}
        >
          <label className="grid gap-1.5 text-sm">
            <span className="font-medium">Full name</span>
            <input name="name" required className="field" autoComplete="name" />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1.5 text-sm">
              <span className="font-medium">Email</span>
              <input name="email" type="email" required className="field" autoComplete="email" />
            </label>
            <label className="grid gap-1.5 text-sm">
              <span className="font-medium">Phone</span>
              <input name="phone" type="tel" className="field" autoComplete="tel" />
            </label>
          </div>
          <label className="grid gap-1.5 text-sm">
            <span className="font-medium">Subject</span>
            <span className="select w-full">
              <select name="subject" className="!w-full !rounded-xl !py-3">
                {subjects.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </span>
          </label>
          <label className="grid gap-1.5 text-sm">
            <span className="font-medium">Message</span>
            <textarea name="message" rows={5} required className="field" />
          </label>
          <button className="btn btn-navy mt-2 w-full">
            Send message <Arrow />
          </button>
          <p className="text-center text-xs text-muted">We’ll reply by email.</p>
        </form>
      )}
    </div>
  );
}
