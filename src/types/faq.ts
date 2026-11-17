export interface FaqTopic {
  id: string;
  name: string;
}

/** FAQ as pages get it from src/lib/api/faqs.ts (CMS GET /v1/faqs). */
export interface Faq {
  id: string;
  topic: string;
  q: string;
  /** Answer markup, cleaned on the server */
  html: string;
  /** Answer as plain text: search and FAQPage JSON-LD */
  text: string;
}
