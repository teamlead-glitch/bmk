/** Site contact details, from the CMS setting GET /v1/settings/contact. Empty values are null / []. */
export interface Contact {
  phone: string | null;
  email: string | null;
  /** Office address, one entry per line */
  address: string[];
  social: SocialLink[];
}

export type SocialId = 'facebook' | 'instagram' | 'linkedin' | 'x' | 'youtube';

export interface SocialLink {
  /** Also the icon file: /assets/icons/{id}.svg */
  id: SocialId;
  label: string;
  href: string;
}
