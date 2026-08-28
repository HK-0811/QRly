'use client';

import type { ScanSummary } from '@/lib/analytics';
import { Card, cn } from '@/components/ui';
import { full, percent } from '@/components/charts/primitives';

/**
 * Headline numbers.
 *
 * A hero figure with a caption beats a chart when the answer is one number, so
 * these are tiles rather than gauges. The caption under each is where the
 * qualification lives — "unique per day" is the honest reading of the unique
 * count, and burying that in a help page would make the number a small lie.
 */
export function StatTiles({ summary, loading }: { summary: ScanSummary | null; loading: boolean }) {
  const s = summary;
  const repeatRate =
    s && s.first_scans + s.returning_scans > 0
      ? percent(s.returning_scans, s.first_scans + s.returning_scans)
      : '—';

  const tiles = [
    {
      label: 'Scans',
      value: s ? full(s.scans) : '—',
      caption: s?.bot_scans ? `${full(s.bot_scans)} bot scans excluded` : 'Bots excluded',
    },
    {
      label: 'Unique visitors',
      value: s ? full(s.unique_visitors) : '—',
      caption: 'Unique per day — the identifying salt rotates every 24 hours',
    },
    {
      label: 'Repeat rate',
      value: repeatRate,
      caption: s ? `${full(s.returning_scans)} returning of ${full(s.first_scans + s.returning_scans)} attributed` : '',
    },
    {
      label: 'Direct scans',
      value: s && s.scans ? percent(s.direct_scans, s.scans) : '—',
      caption: 'No referrer — most likely a camera pointed at a printed code',
    },
    {
      label: 'Countries',
      value: s ? full(s.countries) : '—',
      caption: s ? `${full(s.cities)} cities` : '',
    },
    {
      label: 'Median latency',
      value: s?.median_rtt_ms != null ? `${Math.round(s.median_rtt_ms)} ms` : '—',
      caption: 'Round-trip time to the nearest edge — a proxy for connection quality',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
      {tiles.map((t) => (
        <Card key={t.label} className="p-4">
          <p className="text-[11.5px] font-medium uppercase tracking-[0.06em] text-[var(--text-faint)]">
            {t.label}
          </p>
          <p
            className={cn(
              'tabular mt-1.5 text-[24px] font-semibold leading-none tracking-[-0.02em]',
              loading && 'opacity-40',
            )}
          >
            {t.value}
          </p>
          {t.caption && (
            <p className="mt-2 text-[11px] leading-snug text-[var(--text-muted)]">{t.caption}</p>
          )}
        </Card>
      ))}
    </div>
  );
}
