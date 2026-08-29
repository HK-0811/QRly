'use client';

/**
 * Chart primitives.
 *
 * Hand-rolled SVG rather than a charting library: the charts here are simple
 * enough that a library would be mostly configuration, and this keeps the client
 * bundle small — which matters for a project whose whole claim is that it costs
 * nothing to run.
 *
 * Colour follows the validated reference palette. Series slots 1 and 2 (blue,
 * orange) were run through the palette validator against this app's own light
 * (#ffffff) and dark (#16191e) surfaces: all six checks pass in both modes, worst
 * adjacent CVD ΔE 24.7 light / 26.8 dark against a floor of 8. Do not substitute
 * hues here without re-running that check.
 */
import { useId, useState, type ReactNode } from 'react';
import { cn } from '@/components/ui';

export const SERIES = {
  primary: 'var(--viz-series-1)',
  secondary: 'var(--viz-series-2)',
} as const;

// ---------------------------------------------------------------------------
// Shell
// ---------------------------------------------------------------------------

export function ChartCard({
  title,
  subtitle,
  right,
  note,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  /** An accuracy caveat. Rendered next to the data, never hidden in settings. */
  note?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        'viz rounded-lg border border-[var(--border)] bg-[var(--bg-raised)] p-5',
        'shadow-[var(--shadow-card)]',
        className,
      )}
    >
      <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-[14px] font-semibold tracking-tight">{title}</h2>
          {subtitle && (
            <p className="mt-0.5 text-[12.5px] text-[var(--text-muted)]">{subtitle}</p>
          )}
        </div>
        {right}
      </header>

      {children}

      {note && (
        <p className="mt-4 border-t border-[var(--border)] pt-3 text-[11.5px] leading-relaxed text-[var(--text-faint)]">
          {note}
        </p>
      )}
    </section>
  );
}

export function Legend({ items }: { items: Array<{ label: string; color: string }> }) {
  return (
    <ul className="flex flex-wrap items-center gap-x-4 gap-y-1">
      {items.map((i) => (
        <li key={i.label} className="flex items-center gap-1.5 text-[12px] text-[var(--text-muted)]">
          <span className="size-2 rounded-[2px]" style={{ background: i.color }} aria-hidden />
          {i.label}
        </li>
      ))}
    </ul>
  );
}

export function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex h-40 items-center justify-center rounded-md border border-dashed border-[var(--border-strong)] text-[13px] text-[var(--text-muted)]">
      {message}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Number formatting
// ---------------------------------------------------------------------------

export function compact(n: number): string {
  if (!Number.isFinite(n)) return '—';
  if (Math.abs(n) < 1000) return String(n);
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(n);
}

export function full(n: number): string {
  // Locale pinned. 'en' alone resolves to the host's regional variant, and an
  // Indian-locale render turns 250,000 into 2,50,000 mid-chart.
  return new Intl.NumberFormat('en-US').format(n);
}

export function percent(part: number, whole: number): string {
  if (!whole) return '0%';
  const p = (part / whole) * 100;
  return `${p < 1 && p > 0 ? p.toFixed(1) : Math.round(p)}%`;
}

// ---------------------------------------------------------------------------
// Tooltip
// ---------------------------------------------------------------------------

export interface TooltipState {
  x: number;
  y: number;
  content: ReactNode;
}

export function Tooltip({ state }: { state: TooltipState | null }) {
  if (!state) return null;
  return (
    <div
      role="tooltip"
      className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-md border border-[var(--border-strong)] bg-[var(--bg-raised)] px-2.5 py-1.5 text-[12px] leading-snug shadow-lg"
      style={{ left: state.x, top: state.y - 8 }}
    >
      {state.content}
    </div>
  );
}

export function useTooltip() {
  return useState<TooltipState | null>(null);
}

export { useId };
