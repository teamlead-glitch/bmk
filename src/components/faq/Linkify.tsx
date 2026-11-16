import type { ReactNode } from 'react';

// Domains, the email and the head-office number in the client's copy become links
const PATTERN = /(\b[a-z0-9-]+\.(?:com|co\.in|co)\b(?![\w@])|\binfo@bmkintl\.com\b|\+971 4 232 4747)/g;

export function Linkify({ text }: { text: string }) {
  const out: ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(PATTERN)) {
    const t = m[0];
    const i = m.index ?? 0;
    // A domain inside the email address is part of the email, not a link of its own
    if (text[i - 1] === '@') continue;
    out.push(text.slice(last, i));
    const to = t.includes('@') ? `mailto:${t}` : t.startsWith('+') ? `tel:${t.replace(/\s/g, '')}` : `https://${t}`;
    out.push(
      <a key={i} href={to} {...(to.startsWith('https') ? { target: '_blank', rel: 'noopener' } : {})}>
        {t}
      </a>,
    );
    last = i + t.length;
  }
  out.push(text.slice(last));
  return <>{out}</>;
}
