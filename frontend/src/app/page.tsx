import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-dvh">
      <header className="border-b border-[var(--border)]">
        <div className="mx-auto flex h-14 max-w-5xl items-center px-5">
          <Link href="/" className="flex items-center gap-2">
            <Mark />
            <span className="text-[15px] font-semibold tracking-tight">qrify</span>
          </Link>
          <nav className="ml-auto flex items-center gap-1 text-[13.5px]">
            {user ? (
              <Link
                href="/links"
                className="rounded-md bg-accent-600 px-3 py-1.5 font-medium text-white hover:bg-accent-700"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-md px-3 py-1.5 text-[var(--text-muted)] hover:text-[var(--text)]"
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="rounded-md bg-accent-600 px-3 py-1.5 font-medium text-white hover:bg-accent-700"
                >
                  Get started
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5">
        <section className="animate-in py-20 sm:py-28">
          <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-accent-600 dark:text-accent-400">
            $0.00 / month
          </p>
          <h1 className="mt-4 max-w-2xl text-[34px] font-semibold leading-[1.1] tracking-[-0.02em] sm:text-[46px]">
            Dynamic QR codes, and the receipts showing what they actually cost.
          </h1>
          <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-[var(--text-muted)]">
            Print a code once. Change where it goes forever. See who scanned it, from what
            network, in what city, at what time of day where they were standing.
          </p>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-[var(--text-muted)]">
            The whole platform &mdash; edge redirects, Postgres, auth, SSL, custom domains,
            analytics &mdash; runs on free tiers. That is the point of this project: the
            incumbents charge thousands a year for it.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={user ? '/links' : '/signup'}
              className="rounded-md bg-accent-600 px-4 py-2.5 text-[14px] font-medium text-white hover:bg-accent-700"
            >
              {user ? 'Open dashboard' : 'Create a free account'}
            </Link>
            <Link
              href="/cost"
              className="rounded-md border border-[var(--border-strong)] px-4 py-2.5 text-[14px] font-medium hover:bg-[var(--bg-subtle)]"
            >
              See what it costs
            </Link>
          </div>
        </section>

        <section className="grid gap-px overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--border)] sm:grid-cols-3">
          <Panel
            title="Edge redirects"
            body="A scan resolves at the nearest Cloudflare location from a warm cache, then the analytics write happens after the response. Telemetry never slows down a scan."
          />
          <Panel
            title="Network-level analytics"
            body="Carrier and ISP name, mobile versus broadband versus corporate, connection quality. Most paid tiers do not surface any of this."
          />
          <Panel
            title="Honest about limits"
            body="IP geolocation is approximate. iOS reports no device model. Edge caches take a minute to catch up. All of it is stated in the product, not buried."
          />
        </section>

        <footer className="border-t border-[var(--border)] py-8 text-[12.5px] text-[var(--text-faint)]">
          A demonstration project. Built on Cloudflare Workers and Supabase.{' · '}
          <Link href="/cost" className="underline underline-offset-2 hover:text-[var(--text-muted)]">
            What it costs
          </Link>{' · '}
          <Link href="/privacy" className="underline underline-offset-2 hover:text-[var(--text-muted)]">
            Privacy
          </Link>
        </footer>
      </main>
    </div>
  );
}

function Panel({ title, body }: { title: string; body: string }) {
  return (
    <div className="bg-[var(--bg)] p-6">
      <h2 className="text-[14px] font-semibold tracking-tight">{title}</h2>
      <p className="mt-2 text-[13px] leading-relaxed text-[var(--text-muted)]">{body}</p>
    </div>
  );
}

function Mark() {
  return (
    <svg viewBox="0 0 24 24" className="size-[22px]" aria-hidden>
      <rect x="1" y="1" width="9" height="9" rx="1.5" className="fill-none stroke-current" strokeWidth="2" />
      <rect x="14" y="1" width="9" height="9" rx="1.5" className="fill-none stroke-current" strokeWidth="2" />
      <rect x="1" y="14" width="9" height="9" rx="1.5" className="fill-none stroke-current" strokeWidth="2" />
      <rect x="14.5" y="14.5" width="3.5" height="3.5" className="fill-accent-500" />
      <rect x="19.5" y="19.5" width="3.5" height="3.5" className="fill-accent-500" />
      <rect x="14.5" y="19.5" width="3.5" height="3.5" className="fill-current opacity-40" />
      <rect x="19.5" y="14.5" width="3.5" height="3.5" className="fill-current opacity-40" />
    </svg>
  );
}
