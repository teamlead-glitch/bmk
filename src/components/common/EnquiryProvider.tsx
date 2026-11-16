'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Arrow } from '@/components/common/Arrow';
import { CloseIcon } from '@/components/common/Icons';
import { Stage } from '@/components/common/Stage';
import { trackLead } from '@/lib/gtm';
import type { TemplateId } from '@/types/catalogue';

/* ---------- ENQUIRY POPUP (every page) ---------- */
// Any element with data-enquire="Distribution Enquiry" (or an empty value) opens
// the popup with that type preselected, so server components need no JS of their
// own. Product pages call useEnquiry().open({ product }).
// TODO(back end): forms only show the success state, as in the design. POST the
// fields to the CMS enquiry endpoint (handoff doc: "Enquiry management") before
// calling trackLead.

export const ENQUIRY_TYPES = ['Distribution Enquiry', 'Dealership Enquiry', 'Retail Sales Enquiry', 'General Enquiry'];

export interface EnquiryProduct {
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
export const closeNavPanels = () => document.dispatchEvent(new CustomEvent('bmk:panel', { detail: 'enquiry' }));

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
                <form
                  className="grid gap-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const type = (e.currentTarget.elements.namedItem('type') as HTMLSelectElement | null)?.value;
                    setSent(true);
                    trackLead('enquiry_popup', product ? 'Product Enquiry' : type);
                  }}
                >
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
                      <select name="type" required className="field" defaultValue={state.type && ENQUIRY_TYPES.includes(state.type) ? state.type : ''}>
                        <option value="" disabled>
                          Select a type
                        </option>
                        {ENQUIRY_TYPES.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="grid gap-1.5 text-sm">
                      <span className="font-medium">Full name</span>
                      <input name="name" required className="field" autoComplete="name" />
                    </label>
                    <label className="grid gap-1.5 text-sm">
                      <span className="font-medium">Company</span>
                      <input name="company" className="field" autoComplete="organization" />
                    </label>
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
                    <span className="font-medium">Country</span>
                    <input name="country" className="field" autoComplete="country-name" />
                  </label>
                  <label className="grid gap-1.5 text-sm">
                    <span className="font-medium">Message</span>
                    <textarea name="message" rows={3} className="field" defaultValue={product ? `I'd like more information about the ${product.name}.` : ''} />
                  </label>
                  <button className="btn btn-navy mt-1 w-full">
                    Send enquiry <Arrow />
                  </button>
                </form>
              )}
            </div>
          </div>,
          document.body,
        )}
    </EnquiryContext.Provider>
  );
}
