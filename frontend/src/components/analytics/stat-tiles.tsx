'use client';

import type { ScanSummary } from '@/lib/analytics';
import { Hairline, StatTile } from '@/components/ui';
import { full, percent } from '@/components/charts/primitives';

/**
 * Headline numbers, ranked.
 *
 * Six equally weighted tiles meant nothing read as the answer. Scans and unique
 * visitors are the two numbers anyone opens this page for, so they get the top
 * row at display size and the other four sit under them as supporting figures.
 *
 * The caption under each is where the qualification lives — "unique per day" is
 * the honest reading of the unique count, and burying that in a help page would
 * make the number a small lie.
 */
export function StatTiles({ summary, loading }: { summary: ScanSummary | null; loading: boolean }) {
  const s = summary;
  const repeatRate =
    s && s.first_scans + s.returning_scans > 0
      ? percent(s.returning_scans, s.first_scans + s.returning_scans)
      : '—';

  return (
    <div>
      <Hairline cols="repeat(2, minmax(0, 1fr))">
        <StatTile
          label="Scans"
          value={s ? full(s.scans) : '—'}
          size="lg"
          loading={loading}
          caption={
            s?.bot_scans ? `${full(s.bot_scans)} bot scans excluded` : 'Bots and link previews excluded'
          }
        />
        <StatTile
          label="Unique visitors"
          value={s ? full(s.unique_visitors) : '—'}
          size="lg"
          loading={loading}
          caption="Unique per day — the identifying salt rotates every 24 hours"
        />
      </Hairline>

      <Hairline
        cols="repeat(2, minmax(0, 1fr))"
        className="border-t-0 sm:!grid-cols-4"
      >
        <Small
          label="Repeat rate"
          value={repeatRate}
          caption={
            s
              ? `${full(s.returning_scans)} returning of ${full(s.first_scans + s.returning_scans)} attributed`
              : ''
          }
          loading={loading}
        />
        <Small
          label="Direct scans"
          value={s && s.scans ? percent(s.direct_scans, s.scans) : '—'}
          caption="No referrer — most likely a camera pointed at a printed QR code"
          loading={loading}
        />
        <Small
          label="Countries"
          value={s ? full(s.countries) : '—'}
          caption={s ? `${full(s.cities)} cities` : ''}
          loading={loading}
        />
        <Small
          label="Median latency"
          value={s?.median_rtt_ms != null ? `${Math.round(s.median_rtt_ms)} ms` : '—'}
          caption="Round-trip time to the nearest edge — a proxy for connection quality"
          loading={loading}
        />
      </Hairline>
    </div>
  );
}

function Small({
  label,
  value,
  caption,
  loading,
}: {
  label: string;
  value: string;
  caption: string;
  loading: boolean;
}) {
  return (
    <div className="p-6">
      <p className="text-[12px] text-[var(--text-faint)]">{label}</p>
      {loading ? (
        <div className="skeleton mt-2.5 h-7 w-16" />
      ) : (
        <p className="numeral mt-2 text-[24px]">{value}</p>
      )}
      {caption && (
        <p className="mt-2 max-w-[30ch] text-[11px] leading-snug text-[var(--text-faint)]">
          {caption}
        </p>
      )}
    </div>
  );
}
