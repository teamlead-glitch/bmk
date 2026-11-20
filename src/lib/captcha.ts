import { createHmac, randomBytes, randomInt, timingSafeEqual } from 'node:crypto';

/* ---------- CAPTCHA (enquiry forms) ---------- */
// A 5-digit code drawn as an SVG (strokes, not text, so the markup doesn't contain the digits),
// plus a signed token: base64url("{expiry}.{nonce}") + "." + HMAC(secret, payload + code).
// The code itself is never sent to the browser. Stateless: nothing is stored, the server
// re-computes the HMAC with the visitor's answer. Valid for TTL_MS.
// Used by GET/POST /api/captcha/ (new code, "Verify" button) and POST /api/enquiry/ (the check
// that counts). Secret: CAPTCHA_SECRET (server env), else REVALIDATE_SECRET / CMS_API_KEY.

const DIGITS = 5;
const TTL_MS = 10 * 60 * 1000;

let devSecret: string | undefined;
function secret(): string {
  const s = process.env.CAPTCHA_SECRET || process.env.REVALIDATE_SECRET || process.env.CMS_API_KEY;
  if (s) return s;
  // Local only: codes stop verifying when the server restarts
  if (process.env.NODE_ENV === 'production') console.error('[captcha] CAPTCHA_SECRET is not set: using a per-instance secret');
  return (devSecret ??= randomBytes(32).toString('hex'));
}

const b64 = (s: string) => Buffer.from(s).toString('base64url');
const sign = (payload: string, code: string) => createHmac('sha256', secret()).update(`${payload}.${code}`).digest('base64url');

/* Seven-segment digits in a 20×32 box: a top, b top-right, c bottom-right, d bottom, e bottom-left, f top-left, g middle */
const SEGMENTS: Record<string, [number, number, number, number]> = {
  a: [2, 2, 18, 2],
  b: [18, 2, 18, 16],
  c: [18, 16, 18, 30],
  d: [2, 30, 18, 30],
  e: [2, 16, 2, 30],
  f: [2, 2, 2, 16],
  g: [2, 16, 18, 16],
};
const DIGIT_SEGMENTS = ['abcdef', 'bc', 'abged', 'abgcd', 'fgbc', 'afgcd', 'afgedc', 'abc', 'abcdefg', 'abcdfg'];

const jitter = (n: number, by: number) => +(n + (Math.random() * 2 - 1) * by).toFixed(1);

function drawCode(code: string): string {
  const W = 160;
  const H = 48;
  const parts: string[] = [];
  // Background noise: faint lines across the box
  for (let i = 0; i < 5; i++) {
    parts.push(`<line x1="${jitter(0, 0)}" y1="${randomInt(4, H - 4)}" x2="${W}" y2="${randomInt(4, H - 4)}" stroke="#121212" stroke-opacity="0.18" stroke-width="1"/>`);
  }
  [...code].forEach((d, i) => {
    const x = 14 + i * 27 + randomInt(-2, 3);
    const y = 8 + randomInt(-3, 4);
    const rot = randomInt(-12, 13);
    const path = [...DIGIT_SEGMENTS[Number(d)]]
      .map((s) => {
        const [x1, y1, x2, y2] = SEGMENTS[s];
        return `M${jitter(x1, 1.2)} ${jitter(y1, 1.2)}L${jitter(x2, 1.2)} ${jitter(y2, 1.2)}`;
      })
      .join('');
    parts.push(`<path transform="translate(${x} ${y}) rotate(${rot} 10 16)" d="${path}" fill="none" stroke="#121212" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`);
  });
  // Strike-through across the digits (the design's look)
  parts.push(`<path d="M6 ${randomInt(22, 28)} Q${W / 2} ${randomInt(14, 36)} ${W - 6} ${randomInt(22, 28)}" fill="none" stroke="#121212" stroke-opacity="0.55" stroke-width="1.4"/>`);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${parts.join('')}</svg>`;
}

/** A new code: the signed token and the picture (data URI) */
export function createCaptcha(): { token: string; image: string } {
  const code = Array.from({ length: DIGITS }, () => randomInt(0, 10)).join('');
  const payload = b64(`${Date.now() + TTL_MS}.${randomBytes(9).toString('base64url')}`);
  const svg = drawCode(code);
  return { token: `${payload}.${sign(payload, code)}`, image: `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}` };
}

/** Is the answer the code of this (unexpired, untampered) token? Spaces are ignored. */
export function verifyCaptcha(token: unknown, answer: unknown): boolean {
  const t = String(token ?? '');
  const a = String(answer ?? '').replace(/\s+/g, '');
  if (!/^\d{5}$/.test(a) || t.length > 300) return false;
  const [payload, sig] = t.split('.');
  if (!payload || !sig) return false;
  const expiry = Number(Buffer.from(payload, 'base64url').toString().split('.')[0]);
  if (!Number.isFinite(expiry) || expiry < Date.now()) return false;
  const expected = Buffer.from(sign(payload, a));
  const given = Buffer.from(sig);
  return expected.length === given.length && timingSafeEqual(expected, given);
}
