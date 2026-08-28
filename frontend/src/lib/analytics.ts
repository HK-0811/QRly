/**
 * Analytics reads.
 *
 * These go browser → Supabase directly. Every function here is SECURITY INVOKER in
 * Postgres, so RLS scopes `scan_events` to the caller before any aggregation
 * happens — there is nothing for a proxy layer to enforce that the database is
 * not already enforcing (architecture.md §1, §5.5).
 */
import { createClient } from '@/lib/supabase/client';

export interface ScanFilters {
  from?: string | null;
  to?: string | null;
  link_id?: string | null;
  domain_id?: string | null;
  qr_id?: string | null;
  country?: string | null;
  region?: string | null;
  city?: string | null;
  device_type?: string | null;
  os_name?: string | null;
  browser_name?: string | null;
  network_type?: string | null;
  as_org?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  include_bots?: boolean;
}

export interface ScanSummary {
  scans: number;
  unique_visitors: number;
  first_scans: number;
  returning_scans: number;
  /** Scans with no visitor hash — a privacy signal was sent, or it was a bot. */
  unattributed: number;
  gpc_scans: number;
  bot_scans: number;
  countries: number;
  cities: number;
  direct_scans: number;
  referred_scans: number;
  median_rtt_ms: number | null;
  first_scan_at: string | null;
  last_scan_at: string | null;
}

export interface TimeseriesPoint {
  bucket: string;
  scans: number;
  unique_visitors: number;
  bot_scans: number;
}

export interface BreakdownRow {
  key: string;
  scans: number;
  unique_visitors: number;
}

export interface HeatmapCell {
  local_dow: number;
  local_hour: number;
  scans: number;
}

export interface GeoPoint {
  city: string | null;
  region: string | null;
  country: string | null;
  latitude: number;
  longitude: number;
  scans: number;
  unique_visitors: number;
}

export interface FilterOptions {
  countries: string[];
  regions: string[];
  cities: string[];
  device_types: string[];
  os_names: string[];
  browsers: string[];
  network_types: string[];
  utm_sources: string[];
  utm_mediums: string[];
  utm_campaigns: string[];
}

export type Bucket = 'hour' | 'day' | 'week' | 'month';

export type Dimension =
  | 'country' | 'region' | 'city' | 'continent' | 'timezone' | 'colo'
  | 'as_org' | 'network_type' | 'http_protocol' | 'tls_version'
  | 'device_type' | 'device_vendor' | 'device_model' | 'os_name' | 'browser_name'
  | 'language' | 'referrer_host'
  | 'utm_source' | 'utm_medium' | 'utm_campaign' | 'utm_content' | 'utm_term'
  | 'bot_reason';

/** Strips empty values so an absent key means "no constraint" in the SQL. */
function clean(filters: ScanFilters): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(filters)) {
    if (v === null || v === undefined || v === '') continue;
    out[k] = v;
  }
  return out;
}

async function rpc<T>(fn: string, args: Record<string, unknown>): Promise<T> {
  const { data, error } = await createClient().rpc(fn, args);
  if (error) throw new Error(error.message);
  return data as T;
}

export const analytics = {
  summary: (f: ScanFilters) => rpc<ScanSummary>('get_scan_summary', { f: clean(f) }),

  timeseries: (f: ScanFilters, bucket: Bucket) =>
    rpc<TimeseriesPoint[]>('get_scan_timeseries', { f: clean(f), bucket }),

  breakdown: (f: ScanFilters, dimension: Dimension, maxRows = 25) =>
    rpc<BreakdownRow[]>('get_scan_breakdown', { f: clean(f), dimension, max_rows: maxRows }),

  heatmap: (f: ScanFilters) => rpc<HeatmapCell[]>('get_local_time_heatmap', { f: clean(f) }),

  geoPoints: (f: ScanFilters, maxRows = 500) =>
    rpc<GeoPoint[]>('get_geo_points', { f: clean(f), max_rows: maxRows }),

  filterOptions: (f: ScanFilters) => rpc<FilterOptions>('get_filter_options', { f: clean(f) }),
};

// ---------------------------------------------------------------------------
// Date ranges
// ---------------------------------------------------------------------------

export const RANGES = [
  { key: '24h', label: 'Last 24 hours', days: 1, bucket: 'hour' as Bucket },
  { key: '7d', label: 'Last 7 days', days: 7, bucket: 'day' as Bucket },
  { key: '30d', label: 'Last 30 days', days: 30, bucket: 'day' as Bucket },
  { key: '90d', label: 'Last 90 days', days: 90, bucket: 'day' as Bucket },
  { key: '365d', label: 'Last 12 months', days: 365, bucket: 'week' as Bucket },
  { key: 'all', label: 'All time', days: null, bucket: 'month' as Bucket },
] as const;

export type RangeKey = (typeof RANGES)[number]['key'];

export function rangeToFilter(key: RangeKey): { from: string | null; to: string | null } {
  const range = RANGES.find((r) => r.key === key);
  if (!range || range.days === null) return { from: null, to: null };
  return {
    from: new Date(Date.now() - range.days * 86_400_000).toISOString(),
    to: null,
  };
}

export function bucketFor(key: RangeKey): Bucket {
  return RANGES.find((r) => r.key === key)?.bucket ?? 'day';
}
