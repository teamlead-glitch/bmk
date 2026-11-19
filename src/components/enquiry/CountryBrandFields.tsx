'use client';

import { useEffect, useState } from 'react';
import { CheckIcon } from '@/components/common/Icons';
import { FieldError } from '@/components/enquiry/useEnquirySubmit';
import { MAX_ENQUIRY_BRANDS } from '@/constants/enquiry';
import { loadEnquiryBrands, loadEnquiryCountries } from '@/services/enquiry';
import type { EnquiryBrand, EnquiryCountry } from '@/types/enquiry';

type FieldProps = (name: string, idPrefix: string) => object;

/** Country select (CMS countries, sent as `country_id`) and, for distribution, dealership and
 *  retail enquiries, the brands linked to that country as checkboxes (sent as `brands`).
 *  Changing the country reloads the brands and unticks those the new country doesn't have. */
export function CountryBrandFields({
  idPrefix,
  withBrands,
  errors,
  fieldProps,
}: {
  idPrefix: string;
  /** Show the Brand checkboxes; the country is then required */
  withBrands: boolean;
  errors: Record<string, string>;
  fieldProps: FieldProps;
}) {
  const [countries, setCountries] = useState<EnquiryCountry[] | null | undefined>(undefined); // undefined: loading
  const [countryId, setCountryId] = useState('');
  // Brands of the country they were loaded for; another country's list reads as "loading"
  const [loaded, setLoaded] = useState<{ code: string; list: EnquiryBrand[] | null } | null>(null);
  const [picked, setPicked] = useState<number[]>([]);

  useEffect(() => {
    let live = true;
    loadEnquiryCountries().then((list) => live && setCountries(list));
    return () => {
      live = false;
    };
  }, []);

  const code = countries?.find((c) => String(c.id) === countryId)?.code ?? '';

  useEffect(() => {
    if (!withBrands || !code) return;
    let live = true;
    loadEnquiryBrands(code).then((list) => {
      if (!live) return;
      setLoaded({ code, list });
      // Keep only the ticked brands the new country also has
      if (list) setPicked((prev) => prev.filter((id) => list.some((b) => b.id === id)));
    });
    return () => {
      live = false;
    };
  }, [withBrands, code]);

  const brands = loaded && loaded.code === code ? loaded.list : undefined; // undefined: loading
  const toggle =(id: number, on: boolean) => setPicked((prev) => (on ? (prev.includes(id) ? prev : [...prev, id]) : prev.filter((x) => x !== id)));

  // Required only when the list loaded: a CMS hiccup must not block the enquiry
  const required = withBrands && !!countries?.length;
  const brandsId = `${idPrefix}-brands-label`;

  return (
    <>
      <label className="grid gap-1.5 text-sm">
        <span className="font-medium">
          Country{!required && <span className="font-normal text-muted"> (optional)</span>}
        </span>
        <span className="select w-full">
          <select
            name="country_id"
            required={required}
            className="!w-full !rounded-xl !py-3"
            value={countryId}
            onChange={(e) => setCountryId(e.target.value)}
            disabled={countries === undefined}
            {...fieldProps('country_id', idPrefix)}
          >
            <option value="">{countries === undefined ? 'Loading countries…' : 'Select a country'}</option>
            {countries?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </span>
        {countries === null && <span className="text-xs text-muted">Countries couldn’t be loaded. You can still send your enquiry.</span>}
        <FieldError name="country_id" idPrefix={idPrefix} errors={errors} />
      </label>

      {withBrands && code && (
        <div role="group" aria-labelledby={brandsId} className="grid gap-1.5 text-sm" {...fieldProps('brands', idPrefix)}>
          <span id={brandsId} className="font-medium">
            Brands <span className="font-normal text-muted">(optional)</span>
          </span>
          {brands === undefined ? (
            <span className="text-muted">Loading brands…</span>
          ) : brands === null ? (
            <span className="text-muted">Brands couldn’t be loaded. You can name them in your message.</span>
          ) : brands.length === 0 ? (
            <span className="text-muted">No brands are listed for this country yet. You can name them in your message.</span>
          ) : (
            <div className="grid gap-1 rounded-xl border border-line p-2 sm:grid-cols-2">
              {brands.map((b) => {
                const on = picked.includes(b.id);
                return (
                  <label key={b.id} className={`check relative ${on ? 'font-medium' : ''}`}>
                    <input
                      type="checkbox"
                      name="brands"
                      value={b.id}
                      checked={on}
                      disabled={!on && picked.length >= MAX_ENQUIRY_BRANDS}
                      onChange={(e) => toggle(b.id, e.target.checked)}
                      className="sr-only"
                    />
                    <span className="check-box">{on && <CheckIcon />}</span>
                    {b.name}
                  </label>
                );
              })}
            </div>
          )}
          <FieldError name="brands" idPrefix={idPrefix} errors={errors} />
        </div>
      )}
    </>
  );
}
