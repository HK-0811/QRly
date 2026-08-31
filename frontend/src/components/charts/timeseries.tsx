'use client';

import { useMemo, useRef } from 'react';
import type { Bucket, TimeseriesPoint } from '@/lib/analytics';
import { Legend, SERIES, Tooltip, compact, full, useTooltip } from './primitives';

const PAD = { top: 12, right: 8, bottom: 26, left: 40 };
const HEIGHT = 260;

/**
 * Scans over time.
 *
 * Two series on ONE axis, both counts of the same thing, so they are directly
 * comparable. A second y-axis would let the two lines be scaled into any
 * relationship you like — which is why there isn't one.
 */
export function TimeseriesChart({
  data,
  bucket,
  showUnique = true,
}: {
  data: TimeseriesPoint[];
  bucket: Bucket;
  showUnique?: boolean;
}) {
  const [tooltip, setTooltip] = useTooltip();
  const wrap = useRef<HTMLDivElement>(null);

  const { points, max, width } = useMemo(() => {
    const width = 720;
    const max = Math.max(1, ...data.map((d) => Math.max(d.scans, showUnique ? d.unique_visitors : 0)));
    const plotW = width - PAD.left - PAD.right;
    const plotH = HEIGHT - PAD.top - PAD.bottom;
    const step = data.length > 1 ? plotW / (data.length - 1) : 0;

    const points = data.map((d, i) => ({
      d,
      x: PAD.left + (data.length > 1 ? i * step : plotW / 2),
      yScans: PAD.top + plotH - (d.scans / max) * plotH,
      yUnique: PAD.top + plotH - (d.unique_visitors / max) * plotH,
    }));

    return { points, max, width };
  }, [data, showUnique]);

  if (data.length === 0) {
    return (
      <div className="flex h-[260px] items-center justify-center border border-dashed border-[var(--rule-strong)] text-[13px] text-[var(--text-muted)]">
        No scans in this range.
      </div>
    );
  }

  const plotH = HEIGHT - PAD.top - PAD.bottom;
  const line = (key: 'yScans' | 'yUnique') =>
    points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p[key].toFixed(1)}`).join('');
  const area =
    points.length > 0
      ? `${line('yScans')}L${points[points.length - 1]!.x.toFixed(1)},${PAD.top + plotH}L${points[0]!.x.toFixed(1)},${PAD.top + plotH}Z`
      : '';

  // Four gridlines, at values a person can actually hold in their head.
  const ticks = Array.from({ length: 5 }, (_, i) => Math.round((max / 4) * i));

  return (
    <div className="relative" ref={wrap}>
      <div className="mb-3">
        <Legend
          items={
            showUnique
              ? [
                  { label: 'Scans', color: SERIES.primary },
                  { label: 'Unique visitors', color: SERIES.secondary },
                ]
              : [{ label: 'Scans', color: SERIES.primary }]
          }
        />
      </div>

      <svg
        viewBox={`0 0 ${width} ${HEIGHT}`}
        className="w-full"
        role="img"
        aria-label={`Scans over time, ${data.length} ${bucket} buckets, peak ${max}`}
        onMouseLeave={() => setTooltip(null)}
      >
        <defs>
          <linearGradient id="ts-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={SERIES.primary} stopOpacity="0.18" />
            <stop offset="100%" stopColor={SERIES.primary} stopOpacity="0.01" />
          </linearGradient>
        </defs>

        {ticks.map((t, i) => {
          const y = PAD.top + plotH - (t / max) * plotH;
          return (
            <g key={i}>
              <line
                x1={PAD.left}
                x2={width - PAD.right}
                y1={y}
                y2={y}
                stroke="var(--viz-grid)"
                strokeWidth="1"
              />
              <text
                x={PAD.left - 8}
                y={y + 3.5}
                textAnchor="end"
                className="tabular"
                fontSize="10.5"
                fill="var(--viz-muted)"
              >
                {compact(t)}
              </text>
            </g>
          );
        })}

        <path d={area} fill="url(#ts-fill)" />
        <path d={line('yScans')} fill="none" stroke={SERIES.primary} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {showUnique && (
          <path
            d={line('yUnique')}
            fill="none"
            stroke={SERIES.secondary}
            strokeWidth="2"
            strokeDasharray="4 3"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )}

        {/* x labels: at most six, so they never collide */}
        {points.map((p, i) => {
          const every = Math.max(1, Math.ceil(points.length / 6));
          if (i % every !== 0 && i !== points.length - 1) return null;
          return (
            <text
              key={i}
              x={p.x}
              y={HEIGHT - 8}
              textAnchor={i === 0 ? 'start' : i === points.length - 1 ? 'end' : 'middle'}
              fontSize="10.5"
              fill="var(--viz-muted)"
            >
              {formatBucket(p.d.bucket, bucket)}
            </text>
          );
        })}

        {/* Hit targets wider than the marks. */}
        {points.map((p, i) => (
          <rect
            key={`hit-${i}`}
            x={p.x - (points.length > 1 ? (width - PAD.left - PAD.right) / points.length / 2 : 20)}
            y={PAD.top}
            width={points.length > 1 ? (width - PAD.left - PAD.right) / points.length : 40}
            height={plotH}
            fill="transparent"
            onMouseEnter={() => {
              const box = wrap.current?.getBoundingClientRect();
              const scale = (box?.width ?? width) / width;
              setTooltip({
                x: p.x * scale,
                y: Math.min(p.yScans, p.yUnique) * scale,
                content: (
                  <>
                    <div className="font-medium">{formatBucketLong(p.d.bucket, bucket)}</div>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className="size-2 " style={{ background: SERIES.primary }} />
                      <span className="tabular">{full(p.d.scans)}</span>
                      <span className="text-[var(--text-muted)]">scans</span>
                    </div>
                    {showUnique && (
                      <div className="flex items-center gap-1.5">
                        <span className="size-2 " style={{ background: SERIES.secondary }} />
                        <span className="tabular">{full(p.d.unique_visitors)}</span>
                        <span className="text-[var(--text-muted)]">unique</span>
                      </div>
                    )}
                  </>
                ),
              });
            }}
          />
        ))}

        {/* Crosshair on the hovered bucket */}
        {tooltip &&
          points.map((p, i) => {
            const box = wrap.current?.getBoundingClientRect();
            const scale = (box?.width ?? width) / width;
            if (Math.abs(p.x * scale - tooltip.x) > 0.5) return null;
            return (
              <g key={`cross-${i}`}>
                <line
                  x1={p.x}
                  x2={p.x}
                  y1={PAD.top}
                  y2={PAD.top + plotH}
                  stroke="var(--viz-grid)"
                  strokeWidth="1.5"
                />
                <circle cx={p.x} cy={p.yScans} r="4" fill={SERIES.primary} stroke="var(--bg)" strokeWidth="2" />
                {showUnique && (
                  <circle cx={p.x} cy={p.yUnique} r="4" fill={SERIES.secondary} stroke="var(--bg)" strokeWidth="2" />
                )}
              </g>
            );
          })}
      </svg>

      <Tooltip state={tooltip} />
    </div>
  );
}

function formatBucket(iso: string, bucket: Bucket): string {
  const d = new Date(iso);
  if (bucket === 'hour') return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  if (bucket === 'month') return d.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' });
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function formatBucketLong(iso: string, bucket: Bucket): string {
  const d = new Date(iso);
  if (bucket === 'hour') {
    return d.toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  }
  if (bucket === 'week') {
    return `Week of ${d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`;
  }
  if (bucket === 'month') return d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}
