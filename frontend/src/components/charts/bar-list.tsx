'use client';

import type { BreakdownRow } from '@/lib/analytics';
import { cn } from '@/components/ui';
import { full, percent } from './primitives';

/**
 * Ranked breakdown.
 *
 * A bar list rather than a pie: the job is comparing magnitudes and reading exact
 * values, and both are things a pie chart is bad at. The bar carries the
 * proportion and the number is printed beside it, so nothing depends on judging
 * the length of a wedge.
 *
 * One series, so no legend — the card title names what is being counted.
 */
export function BarList({
  rows,
  total,
  emptyMessage = 'No data yet.',
  onSelect,
  selected,
  formatKey,
  max = 8,
}: {
  rows: BreakdownRow[];
  /** Denominator for the percentages. The filtered total, not the sum of rows,
   *  so a truncated long tail does not silently inflate every share. */
  total: number;
  emptyMessage?: string;
  onSelect?: (key: string) => void;
  selected?: string | null;
  formatKey?: (key: string) => string;
  max?: number;
}) {
  if (rows.length === 0) {
    return <p className="py-6 text-center text-[13px] text-[var(--text-muted)]">{emptyMessage}</p>;
  }

  const shown = rows.slice(0, max);
  const peak = Math.max(1, ...shown.map((r) => r.scans));
  const remainder = rows.slice(max).reduce((s, r) => s + r.scans, 0);

  return (
    <div>
      <ul className="space-y-1">
        {shown.map((row) => {
          const isSelected = selected === row.key;
          const Element = onSelect ? 'button' : 'div';

          return (
            <li key={row.key}>
              <Element
                {...(onSelect
                  ? {
                      type: 'button' as const,
                      onClick: () => onSelect(row.key),
                      'aria-pressed': isSelected,
                    }
                  : {})}
                className={cn(
                  'relative flex w-full items-center gap-3 px-2 py-1.5 text-left',
                  onSelect && 'cursor-pointer transition-colors hover:bg-[var(--bg-subtle)]',
                  isSelected && 'bg-[var(--bg-subtle)]',
                )}
              >
                {/* The bar sits behind the text rather than beside it, so a long
                    label never squeezes the plot into uselessness. */}
                <span
                  aria-hidden
                  className="absolute inset-y-0.5 left-0 "
                  style={{
                    width: `${Math.max(2, (row.scans / peak) * 100)}%`,
                    background: 'var(--viz-series-1)',
                    opacity: 0.16,
                  }}
                />
                <span className="relative min-w-0 flex-1 truncate text-[13px]">
                  {formatKey ? formatKey(row.key) : row.key}
                </span>
                <span className="tabular relative shrink-0 text-[12.5px] text-[var(--text-muted)]">
                  {percent(row.scans, total)}
                </span>
                <span className="tabular relative w-14 shrink-0 text-right text-[13px] font-medium">
                  {full(row.scans)}
                </span>
              </Element>
            </li>
          );
        })}
      </ul>

      {remainder > 0 && (
        <p className="mt-2 border-t border-[var(--rule-mid)] pt-2 text-[12px] text-[var(--text-muted)]">
          <span className="tabular">{full(remainder)}</span> more across{' '}
          <span className="tabular">{rows.length - max}</span> other{' '}
          {rows.length - max === 1 ? 'value' : 'values'}
        </p>
      )}
    </div>
  );
}
