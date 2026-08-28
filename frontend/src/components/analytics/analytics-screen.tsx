'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  analytics,
  bucketFor,
  rangeToFilter,
  type BreakdownRow,
  type FilterOptions,
  type GeoPoint,
  type HeatmapCell,
  type RangeKey,
  type ScanFilters,
  type ScanSummary,
  type TimeseriesPoint,
} from '@/lib/analytics';
import type { LinkWithDomain } from '@/lib/types';
import { ChartCard, EmptyChart } from '@/components/charts/primitives';
import { TimeseriesChart } from '@/components/charts/timeseries';
import { BarList } from '@/components/charts/bar-list';
import { LocalTimeHeatmap } from '@/components/charts/heatmap';
import { WorldMap } from '@/components/charts/world-map';
import { StatTiles } from '@/components/analytics/stat-tiles';
import { FilterBar, countryName } from '@/components/analytics/filter-bar';
import { ErrorText, Note } from '@/components/ui';

interface Data {
  summary: ScanSummary;
  series: TimeseriesPoint[];
  heatmap: HeatmapCell[];
  points: GeoPoint[];
  options: FilterOptions;
  breakdowns: Record<string, BreakdownRow[]>;
}

const BREAKDOWNS = [
  'country', 'region', 'city', 'as_org', 'network_type', 'colo',
  'device_type', 'device_vendor', 'device_model', 'os_name', 'browser_name',
  'language', 'referrer_host', 'utm_source', 'utm_medium', 'utm_campaign',
  'http_protocol', 'bot_reason',
] as const;

export function AnalyticsScreen({ links }: { links: LinkWithDomain[] }) {
  const [range, setRange] = useState<RangeKey>('90d');
  const [filters, setFilters] = useState<ScanFilters>({});
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const effective = useMemo<ScanFilters>(
    () => ({ ...filters, ...rangeToFilter(range) }),
    [filters, range],
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const bucket = bucketFor(range);

    Promise.all([
      analytics.summary(effective),
      analytics.timeseries(effective, bucket),
      analytics.heatmap(effective),
      analytics.geoPoints(effective),
      analytics.filterOptions(effective),
      Promise.all(BREAKDOWNS.map((d) => analytics.breakdown(effective, d, 40))),
    ])
      .then(([summary, series, heatmap, points, options, breakdownList]) => {
        if (cancelled) return;
        const breakdowns: Record<string, BreakdownRow[]> = {};
        BREAKDOWNS.forEach((d, i) => {
          breakdowns[d] = breakdownList[i] ?? [];
        });
        setData({ summary, series, heatmap, points, options, breakdowns });
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Could not load analytics.');
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [effective, range]);

  const patch = useCallback(
    (p: Partial<ScanFilters>) => setFilters((f) => ({ ...f, ...p })),
    [],
  );

  const b = (key: string) => data?.breakdowns[key] ?? [];
  const total = data?.summary.scans ?? 0;

  return (
    <div className="animate-in space-y-6">
      <div>
        <h1 className="text-[19px] font-semibold tracking-tight">Analytics</h1>
        <p className="mt-0.5 text-[13px] text-[var(--text-muted)]">
          Every scan, enriched at the edge. No JavaScript runs on the scanner&rsquo;s device
          and no consent prompt is shown, because nothing here requires either.
        </p>
      </div>

      <FilterBar
        filters={filters}
        range={range}
        options={data?.options ?? null}
        links={links}
        onRange={setRange}
        onChange={patch}
        onClear={() => setFilters({})}
      />

      {error && <ErrorText>{error}</ErrorText>}

      <StatTiles summary={data?.summary ?? null} loading={loading} />

      {data && data.summary.scans === 0 && !loading && (
        <Note title="Nothing to show for this selection">
          {Object.keys(filters).length > 0
            ? 'No scans match the current filters. Try widening the date range or clearing a filter.'
            : 'No scans have been recorded yet. Create a link, generate its QR code, and scan it.'}
        </Note>
      )}

      <ChartCard
        title="Scans over time"
        subtitle={`Bucketed by ${bucketFor(range)}`}
        note={
          data && data.summary.unattributed > 0 ? (
            <>
              {data.summary.unattributed.toLocaleString()} scans in this range carry no visitor
              identifier &mdash; {data.summary.gpc_scans.toLocaleString()} of them because the
              scanner sent a Global Privacy Control signal, which this service honours. They are
              counted as scans but cannot contribute to the unique-visitor line, so that line
              under-counts by design.
            </>
          ) : undefined
        }
      >
        <TimeseriesChart data={data?.series ?? []} bucket={bucketFor(range)} />
      </ChartCard>

      <ChartCard
        title="Where the scans happen"
        subtitle="Countries shaded by volume, cities marked by their centroid"
        note={
          <>
            <strong className="font-medium text-[var(--text-muted)]">This map is approximate.</strong>{' '}
            Location is derived from the IP address, so VPNs, proxies, carrier-grade NAT on mobile
            networks and corporate egress routinely resolve to the wrong city &mdash; sometimes the
            wrong country. The circles sit on the <em>centroid of a city</em> from the IP database,
            not on anybody&rsquo;s position. Nothing here is precise enough to be a pin, which is why
            none are drawn.
            <br />
            The outline is Natural Earth&rsquo;s 110m country topology, served from this app&rsquo;s
            own files &mdash; public domain, no tile server, no API key. At that resolution the
            smallest states (Singapore, Monaco, Malta) have no shape to shade, so they appear only
            as a city marker.
          </>
        }
      >
        <WorldMap
          byCountry={b('country')}
          points={data?.points ?? []}
          selectedCountry={filters.country ?? null}
          onSelectCountry={(code) =>
            patch({ country: filters.country === code ? null : code, region: null, city: null })
          }
        />
      </ChartCard>

      <div className="grid gap-4 lg:grid-cols-3">
        <ChartCard title="Countries">
          <BarList
            rows={b('country')}
            total={total}
            formatKey={countryName}
            selected={filters.country ?? null}
            onSelect={(k) => patch({ country: filters.country === k ? null : k, region: null, city: null })}
          />
        </ChartCard>
        <ChartCard title="Regions">
          <BarList
            rows={b('region')}
            total={total}
            selected={filters.region ?? null}
            onSelect={(k) => patch({ region: filters.region === k ? null : k, city: null })}
          />
        </ChartCard>
        <ChartCard title="Cities">
          <BarList
            rows={b('city')}
            total={total}
            selected={filters.city ?? null}
            onSelect={(k) => patch({ city: filters.city === k ? null : k })}
          />
        </ChartCard>
      </div>

      {/* -------------------- the differentiator -------------------- */}
      <div className="grid gap-4 lg:grid-cols-3">
        <ChartCard
          title="Internet provider"
          subtitle="The literal network name each scan came from"
          className="lg:col-span-2"
          note={
            <>
              Cloudflare reports the autonomous-system organisation for every request, at no cost
              and with no lookup. Most paid link shorteners do not surface this at all &mdash; it is
              the clearest example of something being withheld rather than being expensive.
            </>
          }
        >
          <BarList
            rows={b('as_org')}
            total={total}
            max={10}
            selected={filters.as_org ?? null}
            onSelect={(k) => patch({ as_org: filters.as_org === k ? null : k })}
          />
        </ChartCard>

        <ChartCard
          title="Connection type"
          note={
            <>
              Classified by matching the provider&rsquo;s name against known carriers, consumer ISPs,
              institutional networks and hosting providers. It is a heuristic over a text field, not
              a lookup against a registry &mdash; anything unrecognised is reported as{' '}
              <span className="font-mono text-[11px]">unknown</span> rather than guessed at.
            </>
          }
        >
          <BarList
            rows={b('network_type')}
            total={total}
            selected={filters.network_type ?? null}
            onSelect={(k) => patch({ network_type: filters.network_type === k ? null : k })}
          />
        </ChartCard>
      </div>

      <ChartCard
        title="When people scan, where they are standing"
        subtitle="Local hour and weekday in the scanner's own timezone"
        note={
          <>
            The hour on each row is the hour where the person scanning was, taken from the timezone
            their IP resolves to. Most analytics tools bucket by the account owner&rsquo;s timezone
            instead, which makes a lunchtime rush in Mumbai look like a 3&nbsp;a.m. anomaly to
            somebody reading the dashboard in London.
          </>
        }
      >
        <LocalTimeHeatmap cells={data?.heatmap ?? []} />
      </ChartCard>

      <div className="grid gap-4 lg:grid-cols-3">
        <ChartCard title="Device type">
          <BarList
            rows={b('device_type')}
            total={total}
            selected={filters.device_type ?? null}
            onSelect={(k) => patch({ device_type: filters.device_type === k ? null : k })}
          />
        </ChartCard>
        <ChartCard title="Operating system">
          <BarList
            rows={b('os_name')}
            total={total}
            selected={filters.os_name ?? null}
            onSelect={(k) => patch({ os_name: filters.os_name === k ? null : k })}
          />
        </ChartCard>
        <ChartCard title="Browser">
          <BarList
            rows={b('browser_name')}
            total={total}
            selected={filters.browser_name ?? null}
            onSelect={(k) => patch({ browser_name: filters.browser_name === k ? null : k })}
          />
        </ChartCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard
          title="Device model"
          note={
            <>
              <strong className="font-medium text-[var(--text-muted)]">
                Android reports a model; iOS does not.
              </strong>{' '}
              Apple removed the device model from its user agent years ago, so every iPhone in this
              list is just &ldquo;iPhone&rdquo;. The gap is Apple&rsquo;s, not a bug here, and no
              tool at any price can fill it.
            </>
          }
        >
          <BarList rows={b('device_model')} total={total} max={10} />
        </ChartCard>

        <ChartCard title="Language">
          <BarList rows={b('language')} total={total} max={10} />
        </ChartCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard
          title="How people arrived"
          subtitle="Referrer, where one was sent"
          note={
            <>
              A camera app opens a link with no referrer at all, so the absence of one is itself the
              signal that a printed code was scanned rather than a link forwarded.{' '}
              {data ? (
                <>
                  <span className="tabular">{data.summary.direct_scans.toLocaleString()}</span> of
                  these scans had no referrer.
                </>
              ) : null}
            </>
          }
        >
          <BarList
            rows={b('referrer_host')}
            total={total}
            max={10}
            emptyMessage="No referrers recorded — every scan came straight from a camera."
          />
        </ChartCard>

        <ChartCard title="Campaigns">
          <div className="space-y-5">
            <Section label="Source">
              <BarList
                rows={b('utm_source')}
                total={total}
                max={5}
                emptyMessage="No UTM parameters seen."
                selected={filters.utm_source ?? null}
                onSelect={(k) => patch({ utm_source: filters.utm_source === k ? null : k })}
              />
            </Section>
            <Section label="Medium">
              <BarList
                rows={b('utm_medium')}
                total={total}
                max={5}
                emptyMessage="No UTM parameters seen."
                selected={filters.utm_medium ?? null}
                onSelect={(k) => patch({ utm_medium: filters.utm_medium === k ? null : k })}
              />
            </Section>
            <Section label="Campaign">
              <BarList
                rows={b('utm_campaign')}
                total={total}
                max={5}
                emptyMessage="No UTM parameters seen."
                selected={filters.utm_campaign ?? null}
                onSelect={(k) => patch({ utm_campaign: filters.utm_campaign === k ? null : k })}
              />
            </Section>
          </div>
        </ChartCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard
          title="Bots and link previews"
          subtitle={
            filters.include_bots
              ? 'Included in every number above'
              : 'Excluded from every number above'
          }
          note={
            <>
              When somebody shares a short link in a messaging app, the platform fetches it to build
              a preview card. That is a real event &mdash; it means the link was shared &mdash; but
              counting it as a scan would inflate everything. Nothing is discarded; it is separated,
              and the toggle above puts it back.
            </>
          }
        >
          {b('bot_reason').length === 0 ? (
            <EmptyChart message="No bot traffic in this range." />
          ) : (
            <BarList
              rows={b('bot_reason')}
              total={b('bot_reason').reduce((s, r) => s + r.scans, 0)}
              max={10}
            />
          )}
        </ChartCard>

        <ChartCard
          title="Network quality"
          subtitle="Cloudflare edge location and protocol"
        >
          <div className="space-y-5">
            <Section label="Edge location">
              <BarList rows={b('colo')} total={total} max={6} />
            </Section>
            <Section label="HTTP protocol">
              <BarList rows={b('http_protocol')} total={total} max={4} />
            </Section>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 text-[11.5px] font-medium uppercase tracking-[0.06em] text-[var(--text-faint)]">
        {label}
      </p>
      {children}
    </div>
  );
}
