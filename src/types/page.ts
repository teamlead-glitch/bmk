import type { CmsSeo } from '@/types/common';

/** One heading of a CMS page and the text under it */
export interface PageSection {
  /** Anchor id (table of contents) */
  id: string;
  /** "01", "02", … */
  n: string;
  title: string;
  /** Cleaned rich text (cleanHtml) */
  html: string;
}

/** A CMS page (GET /v1/pages/{slug}): legal pages */
export interface CmsPage {
  title: string;
  /** Text before the first heading, e.g. "Last updated" (cleaned rich text) */
  intro: string;
  /** The body split at each h2 */
  sections: PageSection[];
  seo: CmsSeo | null;
}
