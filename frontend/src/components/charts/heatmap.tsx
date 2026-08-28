'use client';

import { useMemo, useRef } from 'react';
import type { HeatmapCell } from '@/lib/analytics';
import { Tooltip, full, useTooltip } from './primitives';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * Number of steps in the sequential ramp. The steps themselves are CSS custom
 * properties (--viz-ramp-1 … --viz-ramp-6 in globals.css) so light and dark are
 * defined once, in one place, as two selected sets rather than an inversion.
 *
 * One hue, light → dark, because the cell colour encodes magnitude. A rainbow
 * would imply the steps are unordered categories.
 */
const RAMP_STEPS = 6;

/**
 * Time-of-day heatmap **in the scanner's local timezone**.
 *
 * This is the chart most analytics products get wrong. They bucket by the account
 * owner's timezone, so a campaign in Mumbai read from an office in London appears
 * to peak in the middle of the night. The hour stored on each row is already the
 * hour where the person scanning was standing.
 */
export function LocalTimeHeatmap({ cells }: { cells: HeatmapCell[] }) {
  const [tooltip, setTooltip] = useTooltip();
  const wrap = useRef<HTMLDivElement>(null);

  const { grid, peak, total } = useMemo(() => {
    const grid = new Map<string, number>();
    let peak = 0;
    let total = 0;
    for (const c of cells) {
      grid.set(`${c.local_dow}:${c.local_hour}`, c.scans);
      peak = Math.max(peak, c.scans);
      total += c.scans;
    }
    return { grid, peak, total };
  }, [cells]);

  if (total === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-md border border-dashed border-[var(--border-strong)] text-[13px] text-[var(--text-muted)]">
        No scans with a resolvable timezone yet.
      </div>
    );
  }

  return (
    <div className="relative" ref={wrap}>
      <div className="overflow-x-auto">
        {/* table-fixed is load-bearing: most hour headers are intentionally blank, so
            an auto layout sizes each column to its content and collapses the empty
            ones into their neighbours. */}
        <table className="w-full min-w-[620px] table-fixed border-separate border-spacing-[2px]">
          <caption className="sr-only">
            Scans by local hour and weekday, in the timezone of whoever scanned
          </caption>
          <thead>
            <tr>
              <th className="w-10" />
              {Array.from({ length: 24 }, (_, h) => (
                <th
                  key={h}
                  scope="col"
                  className="w-auto pb-1 text-center text-[9.5px] font-normal text-[var(--text-faint)]"
                >
                  {h % 3 === 0 ? String(h).padStart(2, '0') : ''}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DAYS.map((day, dow) => (
              <tr key={day}>
                <th
                  scope="row"
                  className="pr-2 text-right text-[10.5px] font-normal text-[var(--text-muted)]"
                >
                  {day}
                </th>
                {Array.from({ length: 24 }, (_, hour) => {
                  const scans = grid.get(`${dow}:${hour}`) ?? 0;
                  return (
                    <td key={hour} className="p-0">
                      <div
                        className="h-5 w-full cursor-default rounded-[3px] transition-transform hover:scale-[1.18]"
                        style={{ background: cellColor(scans, peak) }}
                        onMouseEnter={(e) => {
                          const box = wrap.current?.getBoundingClientRect();
                          const cell = e.currentTarget.getBoundingClientRect();
                          if (!box) return;
                          setTooltip({
                            x: cell.left - box.left + cell.width / 2,
                            y: cell.top - box.top,
                            content: (
                              <>
                                <div className="font-medium">
                                  {day} {String(hour).padStart(2, '0')}:00
                                </div>
                                <div className="tabular text-[var(--text-muted)]">
                                  {full(scans)} {scans === 1 ? 'scan' : 'scans'}
                                </div>
                              </>
                            ),
                          });
                        }}
                        onMouseLeave={() => setTooltip(null)}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex items-center gap-2 text-[11px] text-[var(--text-muted)]">
        <span>Fewer</span>
        <div className="flex gap-[2px]">
          {[0, 0.05, 0.25, 0.45, 0.65, 0.85, 1].map((t) => (
            <span
              key={t}
              className="size-3 rounded-[2px]"
              style={{ background: cellColor(t * peak, peak) }}
            />
          ))}
        </div>
        <span>More</span>
        <span className="tabular ml-auto">peak {full(peak)}</span>
      </div>

      <Tooltip state={tooltip} />
    </div>
  );
}

function cellColor(value: number, peak: number): string {
  if (value === 0) return 'var(--viz-empty-cell)';
  // Square root, not linear. Against one dominant peak a linear ramp leaves every
  // other cell indistinguishable from empty, which hides the pattern the chart
  // exists to show.
  const t = Math.sqrt(value / Math.max(1, peak));
  const index = Math.min(RAMP_STEPS, Math.max(1, Math.round(t * RAMP_STEPS)));
  return `var(--viz-ramp-${index})`;
}
