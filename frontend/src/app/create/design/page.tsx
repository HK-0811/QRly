'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { pendingLinks, type PendingLink } from '@/lib/anon';
import { QrStudio, type StudioTarget } from '@/components/qr/qr-studio';
import { Screen, Wordmark, GUTTER } from '@/components/chrome';
import { EmptyState, Spinner, buttonClass } from '@/components/ui';

/**
 * The studio for a code that has no account behind it yet.
 *
 * Everything it needs comes from localStorage, not the database: an unclaimed
 * link matches no RLS policy, so the browser that made it is the only thing that
 * can identify it. That also means this page is honest about its one failure
 * mode — open it in a different browser and there is nothing to find.
 */
export default function PublicStudioPage() {
  return (
    <Suspense fallback={null}>
      <PublicStudio />
    </Suspense>
  );
}

function PublicStudio() {
  const params = useSearchParams();
  const slug = params.get('slug');

  const [pending, setPending] = useState<PendingLink | null>(null);
  const [ready, setReady] = useState(false);

  // localStorage is not available during the server render, so the lookup runs
  // after mount and the page shows a waiting state rather than flashing "not
  // found" at someone whose code is perfectly fine.
  useEffect(() => {
    const all = pendingLinks();
    setPending(slug ? (all.find((l) => l.slug === slug) ?? null) : (all.at(-1) ?? null));
    setReady(true);
  }, [slug]);

  return (
    <Screen>
      <header
        className={`flex items-center justify-between border-b border-[var(--rule-mid)] py-5 ${GUTTER}`}
      >
        <div className="flex items-center gap-6">
          <Wordmark href="/" size={14} />
          {pending && (
            <span className="hidden font-mono text-[15px] sm:inline">
              {pending.shortUrl.replace(/^https?:\/\//, '')}
            </span>
          )}
        </div>
        <Link href="/signup?claim=1" className={buttonClass({ variant: 'primary', size: 'sm' })}>
          Claim this QR code
        </Link>
      </header>

      {!ready ? (
        <div className="flex items-center justify-center gap-3 py-32 text-[14px] text-[var(--text-faint)]">
          <Spinner /> Looking for your QR code…
        </div>
      ) : !pending ? (
        <div className={`mx-auto max-w-[720px] py-24 ${GUTTER}`}>
          <EmptyState
            title="Nothing to design here"
            description="This browser is not holding an unclaimed QR code. They are remembered per browser, so one made on another device will not appear here. Make a new one, or sign in if you already claimed it."
            action={
              <div className="flex flex-wrap justify-center gap-3">
                <Link href="/create" className={buttonClass({ variant: 'primary' })}>
                  Make a QR code
                </Link>
                <Link href="/login" className={buttonClass({ variant: 'ghost' })}>
                  Sign in
                </Link>
              </div>
            }
          />
        </div>
      ) : (
        <QrStudio
          hostname={pending.shortUrl.replace(/^https?:\/\//, '').split('/')[0]}
          slug={pending.slug}
          shortUrl={pending.shortUrl}
          target={
            {
              kind: 'unclaimed',
              claimToken: pending.claimToken,
              existing: null,
            } satisfies StudioTarget
          }
        />
      )}
    </Screen>
  );
}
