'use client';

import Link from 'next/link';
import { Arrow } from '@/components/common/Arrow';

/** Content could not be loaded (e.g. the CMS is down): a 5xx, never a fake 404. */
export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main id="main" className="grid min-h-svh place-items-center bg-mist px-5 text-center">
      <div className="max-w-xl">
        <h1 className="t-display">This page couldn’t load</h1>
        <p className="t-body mt-4 text-muted">Our content service didn’t respond. Try again in a moment, or go back to the homepage.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button type="button" className="btn btn-navy" onClick={() => reset()}>
            Try again <Arrow />
          </button>
          <Link className="btn btn-dark" href="/">
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
