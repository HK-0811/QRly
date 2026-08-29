'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, ApiError } from '@/lib/api';
import type { Domain } from '@/lib/types';
import { Badge, Button, Card, EmptyState, ErrorText, Field, Input, Note, cn } from '@/components/ui';
import { CopyButton } from '@/components/copy-button';

interface VerifyResult {
  outcome: { state: 'active' | 'pending' | 'failed'; message: string; hint?: string };
  dns: {
    found: string | null;
    expected: string;
    agreed_across_resolvers: boolean;
    resolvers: Array<{ resolver: string; target: string | null; reachable: boolean }>;
  };
  certificate: { status: string | null; description: string; configured: boolean };
}

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

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setAdding(true);
    setError(null);
    setHint(null);
    try {
      await api.createDomain(hostname.trim());
      setHostname('');
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
    <div className="animate-in space-y-6">
      <div>
        <h1 className="text-[19px] font-semibold tracking-tight">Domains</h1>
        <p className="mt-0.5 text-[13px] text-[var(--text-muted)]">
          Serve your short links on your own hostname. One DNS record, and the certificate is
          issued and renewed automatically.
        </p>
      </div>

      {!cloudflareConfigured && (
        <Note tone="warn" title="Certificates cannot be issued yet">
          A Cloudflare API token and zone id are not configured on the Worker, so hostnames added
          here will not get a certificate. DNS verification still works and will report exactly
          what it finds &mdash; but a domain cannot go live until Cloudflare for SaaS can register
          it. A CNAME on its own produces a TLS error, which is the single most common
          misunderstanding about custom domains.
        </Note>
      )}

      <Card className="p-5">
        <h2 className="text-[14px] font-semibold tracking-tight">Add a domain</h2>
        <form onSubmit={add} className="mt-4 flex flex-wrap items-end gap-3">
          <div className="min-w-[260px] flex-1">
            <Field
              label="Hostname"
              htmlFor="hostname"
              hint="A subdomain, for example qr.yourcompany.com. Root domains cannot take a CNAME."
            >
              <Input
                id="hostname"
                value={hostname}
                onChange={(e) => setHostname(e.target.value)}
                placeholder="qr.yourcompany.com"
                className="font-mono"
                required
              />
            </Field>
          </div>
          <Button type="submit" variant="primary" loading={adding} className="mb-[26px]">
            Add domain
          </Button>
        </form>

        {error && (
          <div className="mt-1">
            <ErrorText>
              {error}
              {hint && <span className="mt-1 block font-normal opacity-80">{hint}</span>}
            </ErrorText>
          </div>
        )}
      </Card>

      {domains.length === 0 ? (
        <EmptyState
          title="No custom domains yet"
          description={`Your links currently live on ${platformHostname}. Adding your own hostname means printed codes carry your name instead.`}
        />
      ) : (
        <div className="space-y-4">
          {domains.map((domain) => (
            <DomainRow key={domain.id} domain={domain} onChanged={() => router.refresh()} />
          ))}
        </div>
      )}
    </div>
  );
}

function DomainRow({ domain, onChanged }: { domain: Domain; onChanged: () => void }) {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const state = result?.outcome.state ?? domain.verification_status;

  async function verify() {
    setBusy(true);
    setError(null);
    try {
      setResult(await api.verifyDomain(domain.id));
      onChanged();
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
      setError(err instanceof ApiError ? err.message : 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[14px] font-medium">{domain.hostname}</span>
            <StatusBadge state={state} />
          </div>
          {domain.dns_verified_at && (
            <p className="mt-1 text-[12px] text-[var(--text-muted)]">
              Verified {new Date(domain.dns_verified_at).toLocaleDateString('en-GB')}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="primary" loading={busy} onClick={verify}>
            {domain.is_active ? 'Re-check' : 'Verify'}
          </Button>
          <Button size="sm" variant="ghost" onClick={remove} disabled={busy} className="hover:text-danger-500">
            Remove
          </Button>
        </div>
      </div>

      {/* The instruction, always visible until it is live. */}
      {!domain.is_active && domain.cname_target && (
        <div className="mt-4 rounded-md border border-[var(--border)] bg-[var(--bg-subtle)] p-3">
          <p className="text-[12px] font-medium uppercase tracking-[0.06em] text-[var(--text-faint)]">
            Add this record at your DNS provider
          </p>
          <div className="mt-2 grid gap-2 sm:grid-cols-[auto_1fr_auto]">
            <Cell label="Type" value="CNAME" />
            <Cell label="Name" value={domain.hostname} copyable />
            <Cell label="Value" value={domain.cname_target} copyable />
          </div>
          <p className="mt-2.5 text-[12px] leading-relaxed text-[var(--text-muted)]">
            If your DNS is hosted on Cloudflare, set this record to{' '}
            <strong className="font-medium text-[var(--text)]">DNS only</strong> (grey cloud). A
            proxied record hides the CNAME from public resolvers and verification cannot see it.
          </p>
        </div>
      )}

      {error && (
        <div className="mt-3">
          <ErrorText>{error}</ErrorText>
        </div>
      )}

      {result && (
        <div className="mt-4 space-y-3">
          <div
            className={cn(
              'rounded-md border px-3 py-2.5 text-[13px] leading-relaxed',
              result.outcome.state === 'active'
                ? 'border-accent-500/30 bg-accent-500/8'
                : result.outcome.state === 'failed'
                  ? 'border-danger-500/30 bg-danger-500/8'
                  : 'border-warn-400/35 bg-warn-400/8',
            )}
          >
            <p className="font-medium">{result.outcome.message}</p>
            {result.outcome.hint && (
              <p className="mt-1 text-[12.5px] text-[var(--text-muted)]">{result.outcome.hint}</p>
            )}
          </div>

          {/* Showing the raw answer matters: "verification failed" with nothing
              behind it is the reason people give up on custom domains. */}
          <details className="text-[12.5px]">
            <summary className="cursor-pointer text-[var(--text-muted)] hover:text-[var(--text)]">
              What we actually saw
            </summary>
            <div className="mt-2 space-y-2 rounded-md border border-[var(--border)] bg-[var(--bg-subtle)] p-3 font-mono text-[11.5px]">
              <p>
                expected: <span className="text-[var(--text)]">{result.dns.expected}</span>
              </p>
              <p>
                found: <span className="text-[var(--text)]">{result.dns.found ?? '(no CNAME)'}</span>
              </p>
              {result.dns.resolvers.map((r) => (
                <p key={r.resolver} className="text-[var(--text-muted)]">
                  {r.resolver}: {r.reachable ? (r.target ?? '(no CNAME)') : '(unreachable)'}
                </p>
              ))}
              <p className="text-[var(--text-muted)]">
                certificate: {result.certificate.status ?? 'none'} &mdash;{' '}
                {result.certificate.description}
              </p>
            </div>
          </details>
        </div>
      )}
    </Card>
  );
}

function Cell({ label, value, copyable }: { label: string; value: string; copyable?: boolean }) {
  return (
    <div>
      <p className="text-[10.5px] uppercase tracking-[0.06em] text-[var(--text-faint)]">{label}</p>
      <div className="flex items-center gap-1">
        <code className="break-all font-mono text-[12.5px]">{value}</code>
        {copyable && <CopyButton value={value} label={`Copy ${label.toLowerCase()}`} />}
      </div>
    </div>
  );
}

function StatusBadge({ state }: { state: string }) {
  if (state === 'active') return <Badge tone="good">Live</Badge>;
  if (state === 'failed') return <Badge tone="bad">Needs attention</Badge>;
  if (state === 'verifying') return <Badge tone="warn">Checking</Badge>;
  return <Badge tone="neutral">Pending</Badge>;
}
