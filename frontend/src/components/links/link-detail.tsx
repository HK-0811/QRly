'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  analytics,
  bucketFor,
  rangeToFilter,
  RANGES,
  type BreakdownRow,
  type RangeKey,
  type ScanSummary,
  type TimeseriesPoint,
} from '@/lib/analytics';
import type { LinkWithDomain, QrCode } from '@/lib/types';
import { Badge, Button, ErrorText, Hairline, Note, StatTile, segmentClass, cn } from '@/components/ui';
import { CopyButton } from '@/components/copy-button';
import { QrStudio, type StudioTarget } from '@/components/qr/qr-studio';
import { LinkFormDialog } from '@/components/links/link-form-dialog';

type Tab = 'scans' | 'qr' | 'settings';
const TABS: Array<[Tab, string]> = [
  ['scans', 'Scans'],
  ['qr', 'QR code'],
  ['settings', 'Settings'],
];

export function LinkDetail({
  link,
  qr,
  userId,
  shortUrl,
}: {
  link: LinkWithDomain;
  qr: QrCode | null;
  userId: string;
  shortUrl: string;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const requested = params.get('tab');
  const [tab, setTab] = useState<Tab>(
    TABS.some(([t]) => t === requested) ? (requested as Tab) : 'scans',
  );
  const [editing, setEditing] = useState(false);

  const expired = link.expires_at !== null && new Date(link.expires_at) <= new Date();

  return (
    <div className="animate-rise">
      <Link href="/links" className="font-mono text-[13px] text-[var(--text-soft)] hover:text-[var(--text)]">
        ← Links
      </Link>

      <div className="mt-5 flex flex-wrap items-center gap-4">
        <h1 className="numeral break-all text-[28px] sm:text-[38px]">
          {link.domains?.hostname}/{link.slug}
        </h1>
        <CopyButton value={shortUrl} variant="text" />
        {link.is_active && !expired ? <Badge tone="live">Live</Badge> : null}
        {!link.is_active && <Badge>Off</Badge>}
        {expired && <Badge>Expired</Badge>}
        {link.safe_browsing_status === 'flagged' && <Badge tone="bad">Flagged</Badge>}
      </div>

      <div className="mt-3.5 flex flex-wrap items-center gap-3 text-[15px] text-[var(--text-muted)]">
        <span className="text-[var(--text-ghost)]">→</span>
        <span className="break-all">{link.destination_url}</span>
        <button
          onClick={() => setEditing(true)}
          className="text-[13px] text-[var(--accent)] hover:underline"
        >
          Edit
        </button>
      </div>
      {link.title && (
        <p className="mt-1.5 text-[14px] text-[var(--text-faint)]">{link.title}</p>
      )}

      <div className="mt-10 flex gap-7 border-b border-[var(--rule-mid)] text-[15px]">
        {TABS.map(([key, label]) => (
          <button
            key={key}
            onClick={() => {
              setTab(key);
              // Keeps the tab shareable and survives a refresh, without a
              // navigation that would re-fetch the whole page.
              window.history.replaceState(null, '', `?tab=${key}`);
            }}
            aria-current={tab === key ? 'page' : undefined}
            className={cn(
              '-mb-px inline-flex min-h-[44px] items-end border-b-2 pb-3',
              'transition-colors duration-[var(--dur)] ease-[var(--ease)]',
              tab === key
                ? 'border-[var(--rule-ink)] text-[var(--text)]'
                : 'border-transparent text-[var(--text-faint)] hover:border-[var(--rule-strong)] hover:text-[var(--text)]',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-7">
        {tab === 'scans' && <ScansTab linkId={link.id} />}

        {tab === 'qr' && (
          <div className="-mx-6 border border-[var(--rule-mid)] sm:-mx-10 lg:-mx-12">
            <QrStudio
              hostname={link.domains?.hostname ?? ''}
              slug={link.slug}
              shortUrl={shortUrl}
              target={
                {
                  kind: 'owned',
                  linkId: link.id,
                  userId,
                  domainId: link.domain_id,
                  existing: qr,
                } satisfies StudioTarget
              }
            />
          </div>
        )}

        {tab === 'settings' && <SettingsTab link={link} onEdit={() => setEditing(true)} />}
      </div>

      {editing && (
        <LinkFormDialog
          link={link}
          onClose={() => setEditing(false)}
          onSaved={() => {
            setEditing(false);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Scans
// ---------------------------------------------------------------------------

const BREAKDOWNS = ['as_org', 'referrer_host', 'country', 'device_type'] as const;

function ScansTab({ linkId }: { linkId: string }) {
  const [range, setRange] = useState<RangeKey>('7d');
  const [summary, setSummary] = useState<ScanSummary | null>(null);
  const [series, setSeries] = useState<TimeseriesPoint[]>([]);
  const [rows, setRows] = useState<Record<string, BreakdownRow[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filters = useMemo(() => ({ link_id: linkId, ...rangeToFilter(range) }), [linkId, range]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([
      analytics.summary(filters),
      analytics.timeseries(filters, bucketFor(range)),
      Promise.all(BREAKDOWNS.map((d) => analytics.breakdown(filters, d, 6))),
    ])
      .then(([s, t, lists]) => {
        if (cancelled) return;
        const next: Record<string, BreakdownRow[]> = {};
        BREAKDOWNS.forEach((d, i) => (next[d] = lists[i] ?? []));
        setSummary(s);
        setSeries(t);
        setRows(next);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Could not load scans.');
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [filters, range]);

  const total = summary?.scans ?? 0;
  const max = Math.max(1, ...series.map((p) => p.scans));

  return (
    <div>
      <div className="mb-5 flex justify-end">
        <RangePicker range={range} onChange={setRange} />
      </div>

      {error && <div className="mb-5">{error && <ErrorText>{error}</ErrorText>}</div>}

      <Hairline cols="repeat(2, minmax(0, 1fr))">
        <StatTile
          label="Scans"
          value={total.toLocaleString('en-US')}
          size="lg"
          loading={loading}
          caption={
            summary?.bot_scans
              ? `${summary.bot_scans.toLocaleString('en-US')} bot scans excluded`
              : 'Bots and link previews excluded'
          }
        />
        <StatTile
          label="Unique visitors"
          value={(summary?.unique_visitors ?? 0).toLocaleString('en-US')}
          size="lg"
          loading={loading}
          caption="Unique per day — the identifying salt rotates every 24 hours"
        />
      </Hairline>

      <Hairline cols="repeat(2, minmax(0,1fr))" className="border-t-0 sm:!grid-cols-4">
        <Small
          label="Repeat rate"
          value={
            summary && summary.first_scans + summary.returning_scans > 0
              ? `${Math.round(
                  (summary.returning_scans / (summary.first_scans + summary.returning_scans)) * 100,
                )}%`
              : '—'
          }
        />
        <Small
          label="Direct scans"
          value={summary && summary.scans ? `${Math.round((summary.direct_scans / summary.scans) * 100)}%` : '—'}
        />
        <Small label="Countries" value={summary ? String(summary.countries) : '—'} />
        <Small
          label="Median latency"
          value={summary?.median_rtt_ms != null ? `${Math.round(summary.median_rtt_ms)} ms` : '—'}
        />
      </Hairline>

      <div className="border border-t-0 border-[var(--rule-mid)] p-7">
        <div className="mb-6 text-[15px]">Scans over time</div>
        {loading ? (
          <div className="skeleton h-[180px]" />
        ) : series.length === 0 || total === 0 ? (
          <EmptyChart />
        ) : (
          <div className="flex h-[180px] items-end gap-1.5">
            {series.map((p) => (
              // `transition-opacity hover:opacity-100` was doing nothing here:
              // the bars had no resting opacity to return from, so hovering one
              // animated it from 1 to 1. Colour is the honest channel anyway —
              // the fill deepens to full accent under the pointer.
              <div
                key={p.bucket}
                className="flex-1 bg-[var(--accent-fill)] transition-colors duration-[var(--dur)] ease-[var(--ease)] hover:bg-[var(--accent-strong)]"
                style={{ height: `${Math.max(2, (p.scans / max) * 100)}%` }}
                title={`${p.bucket}: ${p.scans}`}
              />
            ))}
          </div>
        )}
      </div>

      <Hairline cols="repeat(1, minmax(0,1fr))" className="border-t-0 sm:!grid-cols-2">
        <BarPanel
          title="Internet provider"
          rows={rows.as_org ?? []}
          total={total}
          loading={loading}
          empty="No scans yet."
        />
        <BarPanel
          title="How people arrived"
          rows={rows.referrer_host ?? []}
          total={total}
          loading={loading}
          empty="No referrers recorded."
          note="No referrer is the signal that a printed QR code was scanned rather than a link forwarded."
        />
        <BarPanel
          title="Countries"
          rows={rows.country ?? []}
          total={total}
          loading={loading}
          empty="No scans yet."
        />
        <BarPanel
          title="Device type"
          rows={rows.device_type ?? []}
          total={total}
          loading={loading}
          empty="No scans yet."
        />
      </Hairline>

      <div className="mt-7">
        <Note>
          Location comes from the IP address, so VPNs, mobile carrier NAT and corporate egress
          routinely resolve to the wrong city. Nothing here is precise enough to be a pin.{' '}
          <Link href={`/analytics?link=${linkId}`}>See the full analytics</Link> for the map,
          the local-time heatmap and every other breakdown.
        </Note>
      </div>
    </div>
  );
}

export function RangePicker({
  range,
  onChange,
}: {
  range: RangeKey;
  onChange: (r: RangeKey) => void;
}) {
  return (
    <div className="flex font-mono text-[11px]">
      {RANGES.map((r, i) => (
        <button
          key={r.key}
          onClick={() => onChange(r.key)}
          aria-pressed={range === r.key}
          className={segmentClass(range === r.key, i)}
        >
          {r.label.replace('Last ', '')}
        </button>
      ))}
    </div>
  );
}

function Small({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-6">
      <div className="text-[12px] text-[var(--text-faint)]">{label}</div>
      <div className="numeral mt-2 text-[24px]">{value}</div>
    </div>
  );
}

function BarPanel({
  title,
  rows,
  total,
  loading,
  empty,
  note,
}: {
  title: string;
  rows: BreakdownRow[];
  total: number;
  loading: boolean;
  empty: string;
  note?: string;
}) {
  return (
    <div className="p-7">
      <div className="mb-5 text-[15px]">{title}</div>
      {loading ? (
        <div className="space-y-2.5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="skeleton h-6" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <p className="py-4 text-[13px] text-[var(--text-faint)]">{empty}</p>
      ) : (
        <ul>
          {rows.map((r) => (
            <li
              key={r.key ?? 'unknown'}
              className="flex items-center justify-between gap-4 border-b border-[var(--rule)] py-2.5 text-[14px] last:border-b-0"
            >
              <span className="min-w-0 truncate text-[var(--text-muted)]">
                {r.key ?? 'Unknown'}
              </span>
              <span className="numeral shrink-0 text-[14px]">
                {r.scans.toLocaleString('en-US')}
                {total > 0 && (
                  <span className="ml-2 text-[11px] text-[var(--text-faint)]">
                    {Math.round((r.scans / total) * 100)}%
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
      {note && <p className="mt-3.5 text-[12px] leading-relaxed text-[var(--text-faint)]">{note}</p>}
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="flex h-[180px] items-center justify-center border border-dashed border-[var(--rule-strong)]">
      <p className="max-w-[40ch] px-6 text-center text-[13px] text-[var(--text-faint)]">
        No scans in this range. Print the QR code, or open the short link, and the first scan appears
        here within a second or two.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

function SettingsTab({ link, onEdit }: { link: LinkWithDomain; onEdit: () => void }) {
  return (
    <div className="max-w-[720px] border border-[var(--rule-mid)]">
      <Row label="Destination" value={link.destination_url} action={{ label: 'Edit', onClick: onEdit }} />
      <Row label="Label" value={link.title ?? '—'} action={{ label: 'Edit', onClick: onEdit }} />
      <Row
        label="Expires"
        value={link.expires_at ? new Date(link.expires_at).toLocaleString('en-GB') : 'Never'}
        action={{ label: 'Edit', onClick: onEdit }}
      />
      <Row label="Link ending" value={link.slug} mono locked />
      <Row label="Hostname" value={link.domains?.hostname ?? '—'} mono locked />
      <Row
        label="Created"
        value={new Date(link.created_at).toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })}
      />

      <div className="p-6">
        <Note tone="warn" title="The link ending and domain are permanent">
          They are encoded into every printed copy of this image. Changing either would break every
          poster, sticker and card already in the world, so the database refuses it — this is not a
          setting that is merely hidden. Only the destination stays editable.
        </Note>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  action,
  mono,
  locked,
}: {
  label: string;
  value: string;
  action?: { label: string; onClick: () => void };
  mono?: boolean;
  locked?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-6 border-b border-[var(--rule)] px-6 py-4">
      <div className="min-w-0">
        <div className="text-[12px] text-[var(--text-faint)]">{label}</div>
        <div className={cn('mt-1 break-all text-[14px]', mono && 'font-mono')}>{value}</div>
      </div>
      {action && (
        <Button size="sm" variant="ghost" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
      {locked && (
        <span className="shrink-0 font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--text-ghost)]">
          Locked
        </span>
      )}
    </div>
  );
}
