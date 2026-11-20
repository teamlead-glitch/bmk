'use client';

/* eslint-disable @next/next/no-img-element -- generated SVG code picture (data URI) */
import { useCallback, useEffect, useState } from 'react';
import { CheckIcon } from '@/components/common/Icons';
import { api } from '@/services/api';

type Code = { token: string; image: string };
type Check = 'idle' | 'checking' | 'ok' | 'wrong';

/** CAPTCHA row of the enquiry forms (design: code picture with refresh, "Enter captcha", Verify).
 *  Sends captcha_token + captcha_answer with the form; POST /api/enquiry/ does the real check.
 *  `error` (the API's errors.captcha_answer) loads a new code: a wrong or expired one can't be reused. */
export function Captcha({ idPrefix, error }: { idPrefix: string; error?: string }) {
  const [code, setCode] = useState<Code | null>(null);
  const [answer, setAnswer] = useState('');
  const [check, setCheck] = useState<Check>('idle');
  const [failed, setFailed] = useState(false);

  const load = useCallback(async () => {
    setCheck('idle');
    setAnswer('');
    const res = await api.get<Code>('/api/captcha');
    setFailed(!res.success);
    setCode(res.success ? res.data : null);
  }, []);

  // First code on mount; a new one whenever the API rejects the code (wrong or expired)
  useEffect(() => {
    load(); // eslint-disable-line react-hooks/set-state-in-effect -- loads a code from the API
  }, [load, error]);

  const verify = async () => {
    if (!code || !/^\d{5}$/.test(answer.trim())) return setCheck('wrong');
    setCheck('checking');
    const res = await api.post<{ ok: boolean }>('/api/captcha', { token: code.token, answer: answer.trim() });
    setCheck(res.success && res.data.ok ? 'ok' : 'wrong');
  };

  // The API's message shows until the visitor starts typing the new code
  const message = (!answer && error) || (check === 'wrong' ? 'That code doesn’t match. Check it, or load a new one.' : failed ? 'The code couldn’t be loaded. Press refresh to try again.' : '');
  const id = `${idPrefix}-captcha_answer`;

  return (
    // @container: one row when the form is wide enough (popup), stacked in narrow forms (contact page, phones)
    <div className="@container grid gap-1.5 text-sm">
      <div className="flex flex-col gap-3 @md:flex-row @md:gap-4">
        {/* @md:w-auto! — .field is unlayered CSS (w-full), so a plain utility can't override it */}
        <div className="field flex shrink-0 items-center justify-between gap-3 py-1.5! @md:w-auto!">
          {code ? <img src={code.image} alt="Security code: type the 5 digits shown" width={160} height={48} className="h-10 w-auto" /> : <span className="h-10" />}
          <button type="button" className="icon-btn size-9 shrink-0 hover:bg-ink/5" onClick={load} aria-label="Load a new code">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 12a9 9 0 1 1-2.64-6.36" />
              <path d="M21 3v6h-6" />
            </svg>
          </button>
        </div>
        <div className="flex min-w-0 flex-1 gap-3">
          <input type="hidden" name="captcha_token" value={code?.token ?? ''} />
          <input
            id={id}
            name="captcha_answer"
            required
            inputMode="numeric"
            autoComplete="off"
            pattern="\d{5}"
            maxLength={5}
            placeholder="Enter captcha"
            aria-label="Enter the code from the picture"
            className="field min-w-0 flex-1"
            value={answer}
            readOnly={check === 'ok'}
            onChange={(e) => {
              setAnswer(e.target.value.replace(/\D/g, ''));
              setCheck('idle');
            }}
            {...(message ? { 'aria-invalid': true as const, 'aria-describedby': `${id}-error` } : {})}
          />
          <button type="button" className="btn btn-outline shrink-0 !px-5" onClick={verify} disabled={check === 'checking' || check === 'ok'} aria-live="polite">
            {check === 'ok' ? (
              <>
                Verified <CheckIcon size={12} />
              </>
            ) : check === 'checking' ? (
              'Checking…'
            ) : (
              'Verify'
            )}
          </button>
        </div>
      </div>
      {message && (
        <span id={`${id}-error`} className="text-xs text-danger" role="alert">
          {message}
        </span>
      )}
    </div>
  );
}
