'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, ApiError } from '@/lib/api';
import { forget, pendingLinks, type PendingLink } from '@/lib/anon';
import { Spinner } from '@/components/ui';

/**
 * Attaches anonymously created codes to the account, once, on arrival.
 *
 * Mounted in the dashboard shell rather than wired into each auth form on
 * purpose: there are four ways to end up signed in — password login, signup with
 * an immediate session, the email-confirmation callback, and a session that was
 * simply still valid — and claiming has to happen on all of them. The dashboard
 * is the one place they all converge.
 *
 * A failed claim is not an error the reader can act on. The token is either
 * already spent or past its thirty days, and in both cases the right thing is to
 * drop it and stop trying on every page load.
 */
export function ClaimPending() {
  const router = useRouter();
  const [claiming, setClaiming] = useState<PendingLink[]>([]);
  const [done, setDone] = useState(0);
  const ran = useRef(false);

  useEffect(() => {
    // React runs effects twice in development. Claiming is idempotent server-side
    // — the second call finds no unclaimed row — but the flicker is not worth it.
    if (ran.current) return;
    ran.current = true;

    const pending = pendingLinks();
    if (pending.length === 0) return;

    setClaiming(pending);

    void (async () => {
      let claimed = 0;

      for (const link of pending) {
        try {
          await api.claimLink(link.claimToken);
          claimed++;
        } catch (err) {
          // 404 is the expected outcome for an expired or already-claimed token.
          // Anything else — a network blip, a 500 — keeps the token so the next
          // visit can try again.
          if (err instanceof ApiError && err.status === 404) forget(link.claimToken);
          continue;
        }
        forget(link.claimToken);
        setDone((n) => n + 1);
      }

      setClaiming([]);
      if (claimed > 0) router.refresh();
    })();
  }, [router]);

  if (claiming.length === 0) return null;

  return (
    <div className="mb-6 flex items-center gap-3.5 border border-[var(--rule-mid)] px-5 py-4">
      <Spinner />
      <p className="text-[13.5px] text-[var(--text-muted)]">
        Adding{' '}
        <span className="tabular">
          {claiming.length === 1 ? 'the QR code' : `${claiming.length} QR codes`}
        </span>{' '}
        you made before signing up
        {done > 0 && (
          <span className="text-[var(--text-faint)]">
            {' '}
            · <span className="tabular">{done}</span> of{' '}
            <span className="tabular">{claiming.length}</span>
          </span>
        )}
        . Their scans come with them.
      </p>
    </div>
  );
}
