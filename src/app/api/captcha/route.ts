import { NextRequest, NextResponse } from 'next/server';
import { createCaptcha, verifyCaptcha } from '@/lib/captcha';

/* ---------- CAPTCHA FOR THE ENQUIRY FORMS ---------- */
// GET  /api/captcha/                    → { token, image }: a new code (src/lib/captcha.ts)
// POST /api/captcha/ { token, answer }  → { ok }: the form's "Verify" button
// The check that counts is in POST /api/enquiry/. Never cached.

const NO_STORE = { 'Cache-Control': 'no-store' };

export function GET() {
  return NextResponse.json(createCaptcha(), { headers: NO_STORE });
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as { token?: unknown; answer?: unknown } | null;
  return NextResponse.json({ ok: verifyCaptcha(body?.token, body?.answer) }, { headers: NO_STORE });
}
