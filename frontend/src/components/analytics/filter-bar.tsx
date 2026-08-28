'use client';

import type { FilterOptions, RangeKey, ScanFilters } from '@/lib/analytics';
import { RANGES } from '@/lib/analytics';
import type { LinkWithDomain } from '@/lib/types';
import { Button, cn } from '@/components/ui';

/**
 * Filters, in one row above the charts.
 *
 * Active filters are shown as removable chips rather than only as select values,
 * so it is never possible to be looking at a narrowed dataset without seeing why.
 * That is the failure mode that makes people mistrust a dashboard: a number that
 * looks wrong because a filter three controls away is still applied.
 */
export function FilterBar({
  filters,
  range,
  options,
  links,
  onRange,
  onChange,
  onClear,
}: {
  filters: ScanFilters;
  range: RangeKey;
  options: FilterOptions | null;
  links: LinkWithDomain[];
  onRange: (r: RangeKey) => void;
  onChange: (patch: Partial<ScanFilters>) => void;
  onClear: () => void;
}) {
  const active = ACTIVE_KEYS.filter((k) => filters[k]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex rounded-md border border-[var(--border-strong)] p-0.5">
          {RANGES.map((r) => (
            <button
              key={r.key}
              type="button"
              onClick={() => onRange(r.key)}
              aria-pressed={range === r.key}
              className={cn(
                'rounded px-2.5 py-1 text-[12.5px] font-medium transition-colors',
                range === r.key
                  ? 'bg-[var(--bg-subtle)] text-[var(--text)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text)]',
              )}
            >
              {r.label.replace('Last ', '')}
            </button>
          ))}
        </div>

        <Select
          value={filters.link_id ?? ''}
          onChange={(v) => onChange({ link_id: v || null })}
          aria-label="Link"
        >
          <option value="">All links</option>
          {links.map((l) => (
            <option key={l.id} value={l.id}>
              /{l.slug}
              {l.title ? ` — ${l.title}` : ''}
            </option>
          ))}
        </Select>

        <Select
          value={filters.country ?? ''}
          onChange={(v) => onChange({ country: v || null, region: null, city: null })}
          aria-label="Country"
        >
          <option value="">All countries</option>
          {options?.countries.map((c) => (
            <option key={c} value={c}>
              {countryName(c)}
            </option>
          ))}
        </Select>

        <Select
          value={filters.device_type ?? ''}
          onChange={(v) => onChange({ device_type: v || null })}
          aria-label="Device"
        >
          <option value="">All devices</option>
          {options?.device_types.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </Select>

        <Select
          value={filters.network_type ?? ''}
          onChange={(v) => onChange({ network_type: v || null })}
          aria-label="Network"
        >
          <option value="">All networks</option>
          {options?.network_types.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </Select>

        <Select
          value={filters.utm_campaign ?? ''}
          onChange={(v) => onChange({ utm_campaign: v || null })}
          aria-label="Campaign"
        >
          <option value="">All campaigns</option>
          {options?.utm_campaigns.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>

        <label className="ml-auto flex cursor-pointer select-none items-center gap-2 text-[12.5px] text-[var(--text-muted)]">
          <input
            type="checkbox"
            checked={Boolean(filters.include_bots)}
            onChange={(e) => onChange({ include_bots: e.target.checked })}
            className="size-3.5 accent-[var(--color-accent-500)]"
          />
          Include bots and link previews
        </label>
      </div>

      {active.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {active.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => onChange({ [key]: null } as Partial<ScanFilters>)}
              className="inline-flex items-center gap-1.5 rounded border border-[var(--border-strong)] bg-[var(--bg-subtle)] px-2 py-1 text-[12px] transition-colors hover:border-danger-500/40"
            >
              <span className="text-[var(--text-muted)]">{LABELS[key]}</span>
              <span className="font-medium">
                {key === 'link_id'
                  ? `/${links.find((l) => l.id === filters.link_id)?.slug ?? '…'}`
                  : key === 'country'
                    ? countryName(String(filters[key]))
                    : String(filters[key])}
              </span>
              <span aria-hidden className="text-[var(--text-faint)]">
                ×
              </span>
              <span className="sr-only">Remove filter</span>
            </button>
          ))}
          <Button size="sm" variant="ghost" onClick={onClear}>
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}

const ACTIVE_KEYS = [
  'link_id',
  'country',
  'region',
  'city',
  'device_type',
  'os_name',
  'browser_name',
  'network_type',
  'as_org',
  'utm_source',
  'utm_medium',
  'utm_campaign',
] as const;

const LABELS: Record<(typeof ACTIVE_KEYS)[number], string> = {
  link_id: 'Link',
  country: 'Country',
  region: 'Region',
  city: 'City',
  device_type: 'Device',
  os_name: 'OS',
  browser_name: 'Browser',
  network_type: 'Network',
  as_org: 'ISP',
  utm_source: 'Source',
  utm_medium: 'Medium',
  utm_campaign: 'Campaign',
};

function Select({
  value,
  onChange,
  children,
  ...rest
}: {
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
  // Omit the native onChange so the string-valued one above is not widened by it.
} & Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'value' | 'onChange' | 'children'>) {
  return (
    <select
      {...rest}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-8 max-w-[190px] rounded-md border border-[var(--border-strong)] bg-[var(--bg-raised)] px-2 text-[12.5px]"
    >
      {children}
    </select>
  );
}

let displayNames: Intl.DisplayNames | null = null;
export function countryName(code: string): string {
  if (!code) return code;
  try {
    displayNames ??= new Intl.DisplayNames(['en'], { type: 'region' });
    return displayNames.of(code) ?? code;
  } catch {
    return code;
  }
}
