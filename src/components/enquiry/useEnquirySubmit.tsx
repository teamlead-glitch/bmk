'use client';

import { useState, type FormEvent } from 'react';
import { readEnquiryForm, sendEnquiry } from '@/services/enquiry';
import type { EnquiryInput } from '@/types/enquiry';

/** Shared submit logic for the contact form and the enquiry popup:
 *  sending state, the error message and per-field errors from the API. */
export function useEnquirySubmit(build: (fields: Record<string, string>) => EnquiryInput, onSent: (input: EnquiryInput) => void) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (pending) return;
    const form = e.currentTarget;
    const input = build(readEnquiryForm(form));
    setPending(true);
    setError('');
    setErrors({});
    const result = await sendEnquiry(input);
    setPending(false);
    if (result.ok) return onSent(input);
    setError(result.message);
    setErrors(result.errors ?? {});
    // Move focus to the first field the API flagged
    const first = Object.keys(result.errors ?? {})[0];
    if (first) form.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
  };

  /** Props for an input: marks it invalid and links it to its error text */
  const fieldProps = (name: string, idPrefix: string) =>
    errors[name] ? { 'aria-invalid': true as const, 'aria-describedby': `${idPrefix}-${name}-error` } : {};

  return { pending, error, errors, onSubmit, fieldProps };
}

export function FieldError({ name, idPrefix, errors }: { name: string; idPrefix: string; errors: Record<string, string> }) {
  if (!errors[name]) return null;
  return (
    <span id={`${idPrefix}-${name}-error`} className="text-xs text-danger">
      {errors[name]}
    </span>
  );
}

/** Off-screen field that only bots fill in (the API drops those enquiries) */
export function Honeypot() {
  return (
    <label className="sr-only" aria-hidden="true">
      Website
      <input name="website" tabIndex={-1} autoComplete="off" />
    </label>
  );
}
