/* ---------- About page content (CMS: GET /v1/settings/about/page) ---------- */

export interface CoreValue {
  name: string;
  text: string;
  /** Local SVG path for the CMS icon key (verified badge when the key is unknown); null = "None" */
  icon: string | null;
}

/** Empty strings mean "not set in the CMS": the component leaves that text out. */
export interface AboutPage {
  /** Who we are */
  title: string;
  /** Cleaned rich text (cleanHtml) */
  html: string;
  mission: string;
  vision: string;
  values: CoreValue[];
  /** Our companies: intro line */
  companiesText: string;
  /** Our brands: heading and intro line */
  brandsTitle: string;
  brandsText: string;
}
