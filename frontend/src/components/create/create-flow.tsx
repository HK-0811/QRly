'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { api, ApiError } from '@/lib/api';
import { remember } from '@/lib/anon';
import { DEFAULT_STYLE, renderSvg, svgToPngBlob, download } from '@/lib/qr';
import type { Domain, Link as LinkRow } from '@/lib/types';
import { Button, ErrorText, Input, buttonClass, cn } from '@/components/ui';
import { CopyButton } from '@/components/copy-button';

type Phase = 'idle' | 'building' | 'done';

interface Created {
  link: LinkRow;
  shortUrl: string;
  claimToken: string | null;
}

/**
 * The four things the server actually does, in the order it does them. Shown
 * while the request is in flight.
 *
 * They are not fake progress: the request really does validate the destination,
 * allocate a slug against a unique constraint, resolve the platform hostname and
 * seed the edge cache. What we cannot know is which one it is on right now, so
 * the steps advance on a timer and the last one only completes when the response
 * lands. If the response arrives early the list finishes immediately — it never
 * claims to still be working on something that is already done.
 */
const STEPS = [
  'Checking the destination',
  'Reserving the short link',
  'Locking the hostname',
  'Seeding the edge cache',
];

export function CreateFlow({
  initialUrl,
  signedIn,
  domains,
}: {
  initialUrl: string;
  signedIn: boolean;
  domains: Domain[];
}) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [step, setStep] = useState(0);
  const [url, setUrl] = useState(initialUrl);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [domainId, setDomainId] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [moreOpen, setMoreOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<Created | null>(null);

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  async function submit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!url.trim()) return;

    setError(null);
    setPhase('building');
    setStep(0);

    timers.current.forEach(clearTimeout);
    timers.current = [260, 560, 880].map((t, i) => setTimeout(() => setStep(i + 1), t));

    const body = {
      destination_url: url.trim().replace(/^(?!https?:\/\/)/i, 'https://'),
      title: title.trim() || undefined,
      slug: slug.trim() || undefined,
      domain_id: domainId || undefined,
      expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
    };

    try {
      // Signed-in visitors get a normal owned link. There is no reason to make
      // someone claim a code they created while already authenticated.
      const res = signedIn
        ? { ...(await api.createLink(body)), claim_token: null }
        : await api.createAnonymousLink(body);

      const shortUrl = res.short_url;
      const claimToken = res.claim_token ?? null;

      if (claimToken) {
        remember({
          claimToken,
          slug: res.link.slug,
          shortUrl,
          destination: res.link.destination_url,
          createdAt: res.link.created_at,
        });
      }

      timers.current.forEach(clearTimeout);
      setStep(STEPS.length);
      setCreated({ link: res.link, shortUrl, claimToken });
      // A beat so the last step reads as completed rather than skipped.
      timers.current = [setTimeout(() => setPhase('done'), 260)];
    } catch (err) {
      timers.current.forEach(clearTimeout);
      setPhase('idle');
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Try again.');
    }
  }

  function reset() {
    setCreated(null);
    setUrl('');
    setTitle('');
    setSlug('');
    setExpiresAt('');
    setMoreOpen(false);
    setError(null);
    setPhase('idle');
  }

  if (phase === 'building') return <Building step={step} />;
  if (phase === 'done' && created) {
    return <Result created={created} signedIn={signedIn} onAnother={reset} />;
  }

  return (
    <form onSubmit={submit} className="animate-rise w-full max-w-[720px]">
      <div className="eyebrow mb-4">Step 1 of 1</div>
      <h1 className="mb-8 text-[32px] font-semibold leading-[1.05] tracking-[-0.03em] sm:text-[44px]">
        Where should the QR code point?
      </h1>

      {/* Same wrapped-border shape as the landing field, so the same
          focus-frame rule has to carry the ring. */}
      <div className="focus-frame flex items-stretch border-[1.5px] border-[var(--rule-ink)]">
        <span className="hidden items-center border-r border-[var(--rule-mid)] px-4 font-mono text-[13px] text-[var(--text-faint)] sm:flex">
          https://
        </span>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="your-menu.com/spring"
          aria-label="Destination URL"
          inputMode="url"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          autoFocus
          required
          className="min-w-0 flex-1 border-0 bg-transparent px-4 py-4 text-[17px] placeholder:text-[var(--text-ghost)] focus-visible:outline-none sm:py-[22px] sm:text-[20px]"
        />
      </div>

      <button
        type="button"
        onClick={() => setMoreOpen((v) => !v)}
        aria-expanded={moreOpen}
        className="mt-4 flex min-h-[40px] w-fit items-center gap-2.5 text-[14px] text-[var(--text-soft)] transition-colors duration-[var(--dur)] ease-[var(--ease)] hover:text-[var(--text)]"
      >
        {/* One glyph rotated rather than two swapped, so the state change is a
            movement the eye can follow instead of a substitution it has to
            re-read. */}
        <span
          className="font-mono text-[15px] leading-none text-[var(--accent)] transition-transform duration-[var(--dur-slow)] ease-[var(--ease)]"
          style={{ transform: moreOpen ? 'rotate(45deg)' : 'none' }}
          aria-hidden
        >
          +
        </span>
        More options
        <span className="hidden font-mono text-[12px] text-[var(--text-faint)] sm:inline">
          label · custom ending · expiry{domains.length > 1 ? ' · domain' : ''}
        </span>
      </button>

      {moreOpen && (
        <div className="animate-rise mt-5 grid gap-6 border border-[var(--rule-mid)] p-6 sm:grid-cols-2">
          <Ruled label="Label" hint="Only you see this.">
            <Input
              variant="ruled"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Spring menu poster"
            />
          </Ruled>

          <Ruled label="Custom ending" hint="Leave empty and we invent one.">
            {/* No gap: the prefix and the field are one URL, and a 6px space
                after the slash reads as though the slug will contain one. */}
            <div className="flex min-h-[44px] items-baseline border-b border-[var(--rule-strong)] py-2 transition-colors duration-[var(--dur)] ease-[var(--ease)] focus-within:border-[var(--rule-ink)]">
              <span className="font-mono text-[15px] text-[var(--text-faint)]">qrly.lol/</span>
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="spring"
                className="min-w-0 flex-1 border-0 bg-transparent p-0 font-mono text-[15px] placeholder:text-[var(--text-faint)]"
              />
            </div>
          </Ruled>

          <Ruled label="Expires" hint="After this, scans get an expired page.">
            <Input
              variant="ruled"
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
            />
          </Ruled>

          {domains.length > 1 ? (
            <Ruled label="Domain" hint="Locked once the QR code is saved.">
              <select
                value={domainId}
                onChange={(e) => setDomainId(e.target.value)}
                className="w-full border-0 border-b border-[var(--rule-strong)] bg-transparent py-2 font-mono text-[15px]"
              >
                {domains.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.hostname}
                    {d.is_custom ? '' : ' (shared)'}
                  </option>
                ))}
              </select>
            </Ruled>
          ) : (
            <Ruled label="Domain" hint="Locked once the QR code is saved.">
              <div className="flex items-center justify-between border-b border-[var(--rule-strong)] py-2 font-mono text-[15px]">
                {domains[0]?.hostname ?? 'qrly.lol'}
                <Link href={signedIn ? '/domains' : '/signup'} className="text-[12px]">
                  Add your own
                </Link>
              </div>
            </Ruled>
          )}

          <div className="flex gap-3.5 border-t border-[var(--rule)] pt-4 sm:col-span-2">
            <span className="font-mono text-[13px] text-[var(--accent)]" aria-hidden>
              !
            </span>
            <p className="max-w-[62ch] text-[13px] leading-relaxed text-[var(--text-muted)]">
              The short link is permanent. Once the QR code is printed, neither the domain nor
              the ending can ever change. Only the destination stays editable.
            </p>
          </div>
        </div>
      )}

      {error && <div className="mt-5">{error && <ErrorText>{error}</ErrorText>}</div>}

      <button
        type="submit"
        className={buttonClass({
          variant: 'primary',
          size: 'lg',
          className: 'group mt-8 w-full gap-3 py-5 text-[17px]',
        })}
      >
        Make the QR code
        <span
          className="font-mono transition-transform duration-[var(--dur)] ease-[var(--ease)] group-hover:translate-y-0.5"
          aria-hidden
        >
          ↵
        </span>
      </button>

      <p className="mt-5 text-center text-[13px] text-[var(--text-faint)]">
        {signedIn ? (
          <>
            Saved to your account.{' '}
            <Link href="/links" className="text-[var(--text-soft)] underline underline-offset-2">
              All your QR codes
            </Link>
          </>
        ) : (
          'No account needed. You can claim it afterwards.'
        )}
      </p>
    </form>
  );
}

function Ruled({
  label,
  hint,
  children,
}: {
  label: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="eyebrow mb-2">{label}</div>
      {children}
      <p className="mt-2 text-[12px] text-[var(--text-faint)]">{hint}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Building
// ---------------------------------------------------------------------------

function Building({ step }: { step: number }) {
  return (
    <div className="animate-rise grid w-full max-w-[720px] items-center gap-10 sm:grid-cols-[280px_1fr] sm:gap-16">
      <div
        className="relative flex aspect-square items-center justify-center overflow-hidden border border-[var(--rule-mid)]"
        style={{ ['--scan-distance' as string]: '100%' }}
      >
        {/*
          Deliberately not a preview of the code being made: the slug does not
          exist yet, so anything drawn here would be invented. A field of inert
          modules under a scan line says "working" without claiming to be the
          result.
        */}
        <div
          aria-hidden
          className="size-full opacity-[0.07]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #0a0a0a 1px, transparent 1px),' +
              'linear-gradient(to bottom, #0a0a0a 1px, transparent 1px)',
            backgroundSize: '12px 12px',
          }}
        />
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-0.5 bg-[var(--accent)]"
          style={{
            boxShadow: '0 0 24px 6px oklch(0.58 0.215 32 / 0.35)',
            animation: 'scanline 1.1s cubic-bezier(0.4,0,0.6,1) infinite alternate',
          }}
        />
      </div>

      <div>
        <div className="eyebrow mb-6">Building</div>
        <ul className="flex flex-col gap-4 font-mono text-[15px]">
          {STEPS.map((label, i) => (
            <li
              key={label}
              className="flex items-center gap-3.5 transition-opacity duration-200"
              style={{ opacity: i <= step ? 1 : 0.3 }}
            >
              <span className="w-3.5 text-[var(--accent)]" aria-hidden>
                {i < step ? '✓' : i === step ? '→' : '·'}
              </span>
              <span>{label}</span>
            </li>
          ))}
        </ul>
        <div className="mt-8 h-0.5 w-full max-w-[300px] bg-[rgba(10,10,10,0.1)]">
          <div
            className="h-0.5 bg-[var(--rule-ink)] transition-[width] duration-300"
            style={{ width: `${(step / STEPS.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Result
// ---------------------------------------------------------------------------

function Result({
  created,
  signedIn,
  onAnother,
}: {
  created: Created;
  signedIn: boolean;
  onAnother: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const svg = useMemo(
    () => renderSvg({ value: created.shortUrl, style: DEFAULT_STYLE, animate: true }),
    [created.shortUrl],
  );
  const still = useMemo(
    () => renderSvg({ value: created.shortUrl, style: DEFAULT_STYLE }),
    [created.shortUrl],
  );

  const printed = created.shortUrl.replace(/^https?:\/\//, '');

  async function downloadPng() {
    setBusy(true);
    setError(null);
    try {
      download(await svgToPngBlob(still, 1024), `${created.link.slug}-1024.png`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="animate-rise w-full max-w-[980px]">
      <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:gap-12">
        <div
          className="border border-[var(--rule-mid)] p-6"
          style={{ boxShadow: 'var(--shadow-block-sm)' }}
        >
          <div className="aspect-square w-full" dangerouslySetInnerHTML={{ __html: svg }} />
        </div>

        <div>
          <div className="eyebrow mb-4 text-[var(--accent)]">Ready · nothing left to do</div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="numeral break-all text-[30px] sm:text-[40px]">{printed}</div>
            <CopyButton value={created.shortUrl} variant="text" />
          </div>

          <p className="mt-3.5 break-all text-[15px] text-[var(--text-soft)]">
            → {created.link.destination_url}
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              href={`/create/design?slug=${encodeURIComponent(created.link.slug)}`}
              className={buttonClass({ variant: 'primary', size: 'lg' })}
            >
              Design the QR code
            </Link>
            <Button variant="secondary" size="lg" loading={busy} onClick={downloadPng}>
              Download PNG
            </Button>
          </div>

          {error && <div className="mt-4">{error && <ErrorText>{error}</ErrorText>}</div>}

          {!signedIn && created.claimToken && (
            <div className="mt-10 flex gap-3.5 border-t border-[var(--rule)] pt-5">
              <span className="font-mono text-[13px] text-[var(--accent)]" aria-hidden>
                *
              </span>
              <p className="max-w-[56ch] text-pretty text-[14px] leading-relaxed text-[var(--text-muted)]">
                The file is yours already.{' '}
                <Link href="/signup?claim=1">Create a free account</Link> to change where this QR
                code points later, or to see who scans it. The QR code itself never changes.
              </p>
            </div>
          )}

          {signedIn && (
            <div className="mt-10 flex gap-3.5 border-t border-[var(--rule)] pt-5">
              <span className="font-mono text-[13px] text-[var(--text-faint)]" aria-hidden>
                i
              </span>
              <p className="max-w-[56ch] text-[14px] leading-relaxed text-[var(--text-muted)]">
                Saved to your account.{' '}
                <Link href={`/links/${created.link.id}`}>Open it</Link> to edit the destination or
                watch the scans arrive.
              </p>
            </div>
          )}

          <button
            onClick={onAnother}
            className={cn(
              'mt-6 w-fit text-[14px] text-[var(--text-faint)] transition-colors',
              'hover:text-[var(--text)]',
            )}
          >
            Make another →
          </button>
        </div>
      </div>
    </div>
  );
}
