// All tags are configured inside Google Tag Manager; never push personal data.
type DataLayerWindow = Window & { dataLayer?: Record<string, unknown>[] };

export function pushToDataLayer(data: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  const w = window as DataLayerWindow;
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push(data);
}

/** After a successful form submit (enquiry popup, contact form) */
export function trackLead(formName: string, enquiryType?: string) {
  pushToDataLayer({ event: 'generate_lead', form_name: formName, enquiry_type: enquiryType || undefined });
}
