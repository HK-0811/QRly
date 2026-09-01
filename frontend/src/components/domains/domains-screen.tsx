'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, ApiError, type DomainVerification } from '@/lib/api';
import type { Domain } from '@/lib/types';
import { Badge, Button, ErrorText, Input, Note, cn } from '@/components/ui';
import { CopyButton } from '@/components/copy-button';

export function DomainsScreen({
  domains,
  platformHostname,
  cloudflareConfigured,
}: {
  domains: Domain[];
  platformHostname: string;
  cloudflareConfigured: boolean;
}) {
  const router = useRouter();
  const [hostname, setHostname] = useState('');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(domains.length === 0);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setAdding(true);
    setError(null);
    setHint(null);
    try {
      await api.createDomain(hostname.trim());
      setHostname('');
      setShowForm(false);
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        setHint(typeof err.body?.hint === 'string' ? err.body.hint : null);
      } else {
        setError('Something went wrong.');
      }
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="animate-rise">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-semibold tracking-[-0.03em] sm:text-[34px]">Domains</h1>
          <p className="mt-2 max-w-[62ch] text-[15px] text-[var(--text-soft)]">
            A QR code prints the domain into itself, so it has to be working before you
            print. Verification is DNS, which takes minutes to hours.
          </p>
        </div>
        {!showForm && (
          <Button variant="primary" onClick={() => setShowForm(true)}>
            Add a domain
          </Button>
        )}
      </div>

      {!cloudflareConfigured && (
        <div className="mb-6">
          <Note tone="warn" title="Certificates cannot be issued yet">
            A Cloudflare API token and zone id are not configured on the Worker, so hostnames added
            here will not get a certificate. DNS verification still works and will report exactly
            what it finds — but a domain cannot go live until Cloudflare for SaaS can register it.
            A CNAME on its own produces a TLS error, which is the single most common
            misunderstanding about custom domains.
          </Note>
        </div>
      )}

      {showForm && (
        <form onSubmit={add} className="animate-rise mb-6 border border-[var(--rule-mid)] p-6">
          <div className="eyebrow mb-4">Add a domain</div>
          <div className="flex flex-wrap items-end gap-4">
            <div className="min-w-[260px] flex-1">
              <Input
                id="hostname"
                value={hostname}
                onChange={(e) => setHostname(e.target.value)}
                placeholder="qr.yourcompany.com"
                className="font-mono"
                variant="ruled"
                required
                aria-label="Hostname"
              />
              <p className="mt-2 text-[12px] text-[var(--text-faint)]">
                A subdomain. Root domains cannot take a CNAME.
              </p>
            </div>
            <div className="flex gap-2 pb-[26px]">
              <Button type="submit" variant="primary" loading={adding}>
                Add domain
              </Button>
              {domains.length > 0 && (
                <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              )}
            </div>
          </div>

          {error && (
            <div className="mt-4">
              <ErrorText>
                {error}
                {hint && <span className="mt-1 block font-normal opacity-80">{hint}</span>}
              </ErrorText>
            </div>
          )}
        </form>
      )}

      <div className="border border-[var(--rule-mid)]">
        <div className="flex items-center justify-between gap-4 border-b border-[var(--rule)] px-6 py-5">
          <div>
            <div className="font-mono text-[16px]">{platformHostname}</div>
            <div className="mt-1.5 text-[13px] text-[var(--text-faint)]">
              Shared default. Always available.
            </div>
          </div>
          <Badge tone="live">Live</Badge>
        </div>

        {domains.map((domain) => (
          <DomainRow key={domain.id} domain={domain} onChanged={() => router.refresh()} />
        ))}
      </div>

      {domains.length === 0 && (
        <p className="mt-5 max-w-[62ch] text-[13.5px] leading-relaxed text-[var(--text-faint)]">
          Your QR codes currently print {platformHostname}. Adding your own hostname means new ones
          carry your name instead — existing ones cannot move, because the hostname is already in
          the printed image.
        </p>
      )}
    </div>
  );
}

function DomainRow({ domain, onChanged }: { domain: Domain; onChanged: () => void }) {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<DomainVerification | null>(null);
  const [error, setError] = useState<string | null>(null);

  const state = result?.outcome.state ?? domain.verification_status;

  /**
   * Check on demand only.
   *
   * This used to poll every 30 seconds for as long as the page was open. That was
   * cheap while the Worker held no Cloudflare credentials, because the certificate
   * half of the check was skipped — but a configured Worker calls the Cloudflare
   * API on every verify (routes/domains.ts), so an open tab became a standing
   * stream of external requests against a fact that changes on DNS-propagation
   * timescales: minutes to hours. Someone waiting knows to press the button.
   */
  async function verify() {
    setBusy(true);
    setError(null);
    try {
      const res = await api.verifyDomain(domain.id);
      setResult(res);
      if (res.outcome.state === 'active') onChanged();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    setBusy(true);
    setError(null);
    try {
      await api.deleteDomain(domain.id);
      onChanged();
    } catch (err) {
      // The API refuses while links still live on the hostname, because those
      // codes are printed. That message is the useful one, so it passes through.
      setError(err instanceof ApiError ? err.message : 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="border-b border-[var(--rule)] px-6 py-5 last:border-b-0">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="font-mono text-[16px]">{domain.hostname}</div>
          <div className="mt-1.5 text-[13px] text-[var(--text-faint)]">
            {state === 'active' && domain.dns_verified_at
              ? `Verified ${new Date(domain.dns_verified_at).toLocaleDateString('en-GB')}`
              : state === 'failed'
                ? (result?.outcome.message ?? 'Verification failed.')
                : 'Not printable yet.'}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <StatusBadge state={state} />
          <Button size="sm" variant="ghost" loading={busy} onClick={verify}>
            {state === 'active' ? 'Re-check' : 'Check now'}
          </Button>
          <Button size="sm" variant="ghost-danger" disabled={busy} onClick={remove}>
            Remove
          </Button>
        </div>
      </div>

      {/* The instruction, always visible until it is live. */}
      {state !== 'active' && domain.cname_target && (
        <div className="mt-5 border border-[var(--rule-mid)] bg-[var(--bg-subtle)]">
          <div className="grid grid-cols-[70px_1fr_1.4fr] gap-4 border-b border-[var(--rule)] px-4 py-3 font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--text-faint)]">
            <span>Type</span>
            <span>Name</span>
            <span>Value</span>
          </div>
          <div className="grid grid-cols-[70px_1fr_1.4fr] items-center gap-4 px-4 py-3.5 font-mono text-[13px]">
            <span>CNAME</span>
            <span className="flex min-w-0 items-center gap-2">
              <span className="truncate">{domain.hostname}</span>
              <CopyButton value={domain.hostname} label="Copy name" />
            </span>
            <span className="flex min-w-0 items-center gap-2">
              <span className="truncate">{domain.cname_target}</span>
              <CopyButton value={domain.cname_target} label="Copy value" />
            </span>
          </div>
        </div>
      )}

      {state !== 'active' && (
        <p className="mt-3.5 max-w-[70ch] text-[13px] leading-relaxed text-[var(--text-faint)]">
          If your DNS is hosted on Cloudflare, set this record to{' '}
          <strong className="font-medium text-[var(--text)]">DNS only</strong> (grey cloud). A
          proxied record hides the CNAME from public resolvers and verification cannot see it.
          {state !== 'failed' && ' DNS takes minutes to hours — press Check now when you are ready.'}
        </p>
      )}

      {error && (
        <div className="mt-4">
          <ErrorText>{error}</ErrorText>
        </div>
      )}

      {result && (
        <div className="mt-4">
          <div
            className={cn(
              'border-l-2 py-2.5 pl-4 pr-3 text-[13.5px] leading-relaxed',
              result.outcome.state === 'active'
                ? 'border-[var(--accent)] bg-[var(--accent-wash)]'
                : result.outcome.state === 'failed'
                  ? 'border-[var(--color-danger-500)] bg-[rgba(176,48,48,0.05)]'
                  : 'border-[var(--rule-strong)] bg-[var(--bg-subtle)]',
            )}
          >
            <p className="font-medium">{result.outcome.message}</p>
            {result.outcome.hint && (
              <p className="mt-1 text-[13px] text-[var(--text-muted)]">{result.outcome.hint}</p>
            )}
          </div>

          {/* Showing the raw answer matters: "verification failed" with nothing
              behind it is the reason people give up on custom domains. */}
          <details className="mt-3 text-[13px]">
            <summary className="cursor-pointer text-[var(--text-faint)] hover:text-[var(--text)]">
              What we actually saw
            </summary>
            <div className="mt-2.5 space-y-1.5 border border-[var(--rule-mid)] bg-[var(--bg-subtle)] p-4 font-mono text-[11.5px] text-[var(--text-muted)]">
              <p>
                expected: <span className="text-[var(--text)]">{result.dns.expected}</span>
              </p>
              <p>
                found: <span className="text-[var(--text)]">{result.dns.found ?? '(no CNAME)'}</span>
              </p>
              {result.dns.resolvers.map((r) => (
                <p key={r.resolver}>
                  {r.resolver}: {r.reachable ? (r.target ?? '(no CNAME)') : '(unreachable)'}
                </p>
              ))}
              <p>
                registration:{' '}
                <span className="text-[var(--text)]">
                  {result.certificate.registered
                    ? 'registered'
                    : result.certificate.configured
                      ? 'not registered'
                      : 'not configured'}
                </span>
              </p>
              <p>
                certificate: {result.certificate.status ?? 'none'} —{' '}
                {result.certificate.description}
              </p>
              {/* The line that would have ended a fifteen-minute wait in five
                  seconds: a swallowed registration error, shown. */}
              {result.certificate.registration_error && (
                <p className="text-[var(--color-danger-500)]">
                  registration error: {result.certificate.registration_error}
                </p>
              )}
            </div>
          </details>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ state }: { state: string }) {
  if (state === 'active') return <Badge tone="live">Live</Badge>;
  if (state === 'failed') return <Badge tone="bad">Failed</Badge>;
  if (state === 'verifying') return <Badge>Checking</Badge>;
  return <Badge>Pending</Badge>;
}
