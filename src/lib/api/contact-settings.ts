import { cache } from 'react';
import { mediaUrl } from '@/lib/api/cms-mappers';
import { serverGetData } from '@/lib/api/server-api';
import type { Contact, SocialId } from '@/types/contact';

/* ---------- Site contact details (CMS: GET /v1/settings/contact) ---------- */
// { data: { phone, email, office_address, social: { facebook, twitter, youtube, instagram, linkedin } } }
// Footer, Contact Us and the legal pages. Empty fields are hidden.

type CmsContact = { phone?: string | null; email?: string | null; office_address?: string | null; social?: Record<string, string | null> | null };

// Footer order (the design's), CMS key -> icon
const SOCIALS: { key: string; id: SocialId; label: string }[] = [
  { key: 'facebook', id: 'facebook', label: 'Facebook' },
  { key: 'instagram', id: 'instagram', label: 'Instagram' },
  { key: 'linkedin', id: 'linkedin', label: 'LinkedIn' },
  { key: 'twitter', id: 'x', label: 'X' },
  { key: 'youtube', id: 'youtube', label: 'YouTube' },
];

const NO_CONTACT: Contact = { phone: null, email: null, address: [], social: [] };

export const getContact = cache(async (): Promise<Contact> => {
  const data = await serverGetData<CmsContact>('/v1/settings/contact');
  if (!data) return NO_CONTACT;

  const email = String(data.email ?? '').trim();
  const social = data.social ?? {};
  return {
    phone: String(data.phone ?? '').trim() || null,
    email: /^[^\s@<>"']+@[^\s@<>"']+$/.test(email) ? email : null,
    address: String(data.office_address ?? '')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean),
    social: SOCIALS.flatMap(({ key, id, label }) => {
      const url = mediaUrl(social[key]);
      return url ? [{ id, label, href: url }] : [];
    }),
  };
});

/** tel: link for a phone number as typed in the CMS ("+971 4 232 4747" -> "tel:+97142324747") */
export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, '')}`;
}
