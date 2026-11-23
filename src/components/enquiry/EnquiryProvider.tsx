'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Arrow } from '@/components/common/Arrow';
import { CloseIcon } from '@/components/common/Icons';
import { Stage } from '@/components/common/Stage';
import { CountryBrandFields } from '@/components/enquiry/CountryBrandFields';
import { Captcha } from '@/components/enquiry/Captcha';
import { FieldError, Honeypot, useEnquirySubmit } from '@/components/enquiry/useEnquirySubmit';
import { BRAND_ENQUIRY_TYPES } from '@/constants/enquiry';
import { trackLead } from '@/lib/gtm';
import type { TemplateId } from '@/types/catalogue';

/* ---------- ENQUIRY POPUP (every page) ---------- */
// Any element with data-enquire="Distribution Enquiry" (or an empty value) opens
// the popup with that type preselected, so server components need no JS of their
// own. Product pages call useEnquiry().open({ product }).
// The form is posted to the CMS through /api/enquiry/ (src/services/enquiry.ts); a product
// enquiry carries the product slug and is saved against that product;
// trackLead runs only after the CMS saved it.

const ENQUIRY_TYPES = ['Distribution Enquiry', 'Dealership Enquiry', 'Retail Sales Enquiry', 'General Enquiry'];
const ID = 'enq';

/** The popup's form. Its own component so the sending state resets with each open. */
function EnquiryForm({ type, product, onSent }: { type?: string; product?: EnquiryProduct | null; onSent: () => void }) {
  const [chosen, setChosen] = useState(type && ENQUIRY_TYPES.includes(type) ? type : '');
  // Distribution, dealership and retail: company required, brands of the chosen country
  const business = !product && BRAND_ENQUIRY_TYPES.includes(chosen);
  const { pending, error, errors, captchaPrompt, onSubmit, fieldProps } = useEnquirySubmit(
    (f) => ({
      ...f,
      name: f.name,
      email: f.email,
      message: f.message,
      type: product ? 'Product Enquiry' : f.type,
      subject: product ? `Product enquiry: ${product.brandName} ${product.name}`.slice(0, 200) : f.type,
      ...(product ? { product: product.slug } : {}),
    }),
    (input) => {
      onSent();
      trackLead('enquiry_popup', product ? 'Product Enquiry' : input.type);
    },
  );

  return (
    <form className="grid gap-4" onSubmit={onSubmit}>
      <Honeypot />
      {product ? (
        <div className="flex items-center gap-4 rounded-2xl bg-mist p-3">
          <div className="w-20 shrink-0">
            <Stage name={product.name} glyph={product.glyph} src={product.thumb} className="!rounded-lg" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted">
              {product.brandName} · {product.categoryName}
            </p>
            <p className="truncate font-semibold">{product.name}</p>
          </div>
        </div>
      ) : (
        <label className="grid gap-1.5 text-sm">
          <span className="font-medium">Enquiry type</span>
          <select name="type" required className="field" value={chosen} onChange={(e) => setChosen(e.target.value)} {...fieldProps('type', ID)}>
            <option value="" disabled>
              Select a type
            </option>
            {ENQUIRY_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <FieldError name="type" idPrefix={ID} errors={errors} />
        </label>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1.5 text-sm">
          <span className="font-medium">Full name</span>
          <input name="name" required maxLength={120} className="field" autoComplete="name" {...fieldProps('name', ID)} />
          <FieldError name="name" idPrefix={ID} errors={errors} />
        </label>
        <label className="grid gap-1.5 text-sm">
          <span className="font-medium">
            Company{!business && <span className="font-normal text-muted"> (optional)</span>}
          </span>
          <input name="company" required={business} maxLength={150} className="field" autoComplete="organization" {...fieldProps('company', ID)} />
          <FieldError name="company" idPrefix={ID} errors={errors} />
        </label>
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
      <CountryBrandFields idPrefix={ID} withBrands={business} errors={errors} fieldProps={fieldProps} />
      <label className="grid gap-1.5 text-sm">
        <span className="font-medium">Message</span>
        <textarea
          name="message"
          rows={3}
          required
          maxLength={5000}
          className="field"
          defaultValue={product ? `I'd like more information about the ${product.name}.` : ''}
          {...fieldProps('message', ID)}
        />
        <FieldError name="message" idPrefix={ID} errors={errors} />
      </label>
      <Captcha idPrefix={ID} error={errors.captcha_answer} prompt={captchaPrompt} />
      {error && (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      )}
      <button className="btn btn-navy mt-1 w-full" disabled={pending} aria-busy={pending}>
        {pending ? 'Sending…' : 'Send enquiry'} <Arrow />
      </button>
    </form>
  );
}

export interface EnquiryProduct {
  /** Product slug: the enquiry is saved against this product in the CMS */
  slug: string;
  name: string;
  brandName: string;
  categoryName: string;
  thumb?: string;
  glyph: TemplateId;
}

interface OpenArgs {
  type?: string;
  product?: EnquiryProduct | null;
}

const EnquiryContext = createContext<{ open: (args?: OpenArgs) => void; close: () => void }>({ open: () => {}, close: () => {} });
export const useEnquiry = () => useContext(EnquiryContext);

/** Tell the navbar panels (mega menu, search, mobile menu) to close */
const closeNavPanels = () => document.dispatchEvent(new CustomEvent('bmk:panel', { detail: 'enquiry' }));

const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

export function EnquiryProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<(OpenArgs & { key: number }) | null>(null);
  const [sent, setSent] = useState(false);
  const dialog = useRef<HTMLDivElement>(null);
  const closing = useRef(false);

  const open = useCallback((args: OpenArgs = {}) => {
    closeNavPanels();
    closing.current = false;
    setSent(false);
    setState({ ...args, key: Date.now() });
  }, []);

  const close = useCallback(() => {
    const el = dialog.current;
    if (!el || closing.current) return;
    closing.current = true;
    document.body.classList.remove('no-scroll');
    if (reduced()) return setState(null);
    // Fade out with the Web Animations API (a CSS class can't override the entry animation)
    el.style.pointerEvents = 'none';
    const o: KeyframeAnimationOptions = { duration: 220, easing: 'cubic-bezier(0.4, 0, 1, 1)', fill: 'forwards' };
    const backdrop = el.querySelector<HTMLElement>('.modal-backdrop');
    const card = el.querySelector<HTMLElement>('.modal-card');
    backdrop?.getAnimations().forEach((x) => x.cancel());
    card?.getAnimations().forEach((x) => x.cancel());
    backdrop?.animate({ opacity: [1, 0] }, o);
    const a = card?.animate({ opacity: [1, 0], transform: ['none', 'translateY(12px) scale(0.98)'] }, o);
    if (a) a.onfinish = () => setState(null);
    else setState(null);
  }, []);

  // data-enquire buttons anywhere on the page
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const b = (e.target as Element | null)?.closest<HTMLElement>('[data-enquire]');
      if (!b) return;
      e.preventDefault();
      open({ type: b.dataset.enquire || '' });
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [open]);

  useEffect(() => {
    if (!state) return;
    document.body.classList.add('no-scroll');
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, [state, close]);

  const value = useMemo(() => ({ open, close }), [open, close]);
  const product = state?.product;

  return (
    <EnquiryContext.Provider value={value}>
      {children}
      {state &&
        createPortal(
          <div ref={dialog} key={state.key} className="fixed inset-0 z-[80] grid place-items-end sm:place-items-center" role="dialog" aria-modal="true" aria-labelledby="enq-title">
            <div className="modal-backdrop absolute inset-0 bg-ink/50 backdrop-blur-sm" onClick={close} />
            <div data-lenis-prevent className="modal-card relative max-h-[94svh] w-full overflow-y-auto rounded-t-3xl bg-white p-6 sm:max-w-xl sm:rounded-3xl sm:p-8">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <span className="chip border-line text-ink">Business enquiry</span>
                  <h2 id="enq-title" className="mt-4 text-[28px] leading-tight tracking-[-0.04em]">
                    {product ? 'Enquire about this product' : 'Let’s do business together'}
                  </h2>
                </div>
                <button type="button" onClick={close} className="icon-btn shrink-0 bg-ink/5" aria-label="Close">
                  <CloseIcon />
                </button>
              </div>
              {sent ? (
                <div className="grid justify-items-center gap-3 py-10 text-center">
                  <div className="grid size-14 place-items-center rounded-full bg-navy">
                    <svg width="24" height="24" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                      <path d="m2.5 6.2 2.3 2.3L9.5 3.8" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <p className="text-xl font-semibold">Thank you</p>
                  <p className="max-w-sm text-muted">We’ve received your enquiry. The relevant BMK Group team will get back to you by email.</p>
                  <button type="button" className="btn btn-dark mt-3" onClick={close}>
                    Close
                  </button>
                </div>
              ) : (
                <EnquiryForm type={state.type} product={product} onSent={() => setSent(true)} />
              )}
            </div>
          </div>,
          document.body,
        )}
    </EnquiryContext.Provider>
  );
}
