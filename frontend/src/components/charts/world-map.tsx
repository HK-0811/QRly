'use client';

/**
 * World choropleth with a city-level overlay.
 *
 * **Open design question 4, resolved.** The geometry is Natural Earth's 110m
 * country topology, shipped from this app's own `public/geo/` directory: public
 * domain, 105 KB, no tile server, no API key, no per-view cost. A tile-based map
 * (Mapbox, Google) would have put a metered third-party service on the critical
 * path of the one claim this project exists to make.
 *
 * The city overlay is deliberately **not** pins. `latitude` and `longitude` come
 * from an IP database and are the centroid of the city, not a position. A pin
 * implies a street. A circle sized by volume, sitting over a city, says what the
 * data actually supports.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { geoNaturalEarth1, geoPath, type GeoPermissibleObjects } from 'd3-geo';
import { feature } from 'topojson-client';
import type { GeoPoint } from '@/lib/analytics';
import type { BreakdownRow } from '@/lib/analytics';
import { Tooltip, compact, full, useTooltip } from './primitives';

const WIDTH = 820;
const HEIGHT = 400;

type CountryFeature = {
  type: 'Feature';
  id?: string | number;
  properties: { name?: string };
  geometry: unknown;
};

export function WorldMap({
  byCountry,
  points,
  onSelectCountry,
  selectedCountry,
}: {
  byCountry: BreakdownRow[];
  points: GeoPoint[];
  onSelectCountry?: (code: string) => void;
  selectedCountry?: string | null;
}) {
  const [world, setWorld] = useState<{
    features: CountryFeature[];
    codes: Record<string, string>;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tooltip, setTooltip] = useTooltip();
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    // Loaded at render time rather than imported, so 105 KB of geometry never
    // enters the JavaScript bundle for people who only look at the link list.
    Promise.all([
      fetch('/geo/countries-110m.json').then((r) => r.json()),
      fetch('/geo/country-codes.json').then((r) => r.json()),
    ])
      .then(([topo, codes]) => {
        if (cancelled) return;
        const collection = feature(topo, topo.objects.countries) as unknown as {
          features: CountryFeature[];
        };
        setWorld({ features: collection.features, codes });
      })
      .catch(() => {
        if (!cancelled) setError('Could not load the map outline.');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const scansByCountry = useMemo(() => {
    const m = new Map<string, number>();
    for (const row of byCountry) m.set(row.key, row.scans);
    return m;
  }, [byCountry]);

  const peak = Math.max(1, ...byCountry.map((r) => r.scans));

  const { path, projection } = useMemo(() => {
    const projection = geoNaturalEarth1()
      .scale(WIDTH / 5.6)
      // Nudged up: the projection's vertical centre sits below the visual centre
      // of the landmasses because of Antarctica.
      .translate([WIDTH / 2, HEIGHT / 2 + 14]);
    return { path: geoPath(projection), projection };
  }, []);

  const maxPointScans = Math.max(1, ...points.map((p) => p.scans));

  if (error) {
    return (
      <div className="flex h-[300px] items-center justify-center rounded-md border border-dashed border-[var(--border-strong)] text-[13px] text-[var(--text-muted)]">
        {error}
      </div>
    );
  }

  return (
    <div className="relative" ref={wrap}>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full"
        role="img"
        aria-label={`World map of scans across ${byCountry.length} countries`}
        onMouseLeave={() => setTooltip(null)}
      >
        {!world && (
          <text x={WIDTH / 2} y={HEIGHT / 2} textAnchor="middle" fontSize="13" fill="var(--viz-muted)">
            Loading map…
          </text>
        )}

        {world?.features.map((f, i) => {
          const code = world.codes[String(f.id)];
          const scans = code ? (scansByCountry.get(code) ?? 0) : 0;
          const d = path(f as unknown as GeoPermissibleObjects);
          if (!d) return null;

          const isSelected = code !== undefined && code === selectedCountry;

          return (
            <path
              key={i}
              d={d}
              fill={scans > 0 ? choroplethColor(scans, peak) : 'var(--viz-land-empty)'}
              stroke="var(--bg-raised)"
              strokeWidth={isSelected ? 1.6 : 0.5}
              className={scans > 0 && onSelectCountry ? 'cursor-pointer' : undefined}
              onClick={() => {
                if (scans > 0 && code && onSelectCountry) onSelectCountry(code);
              }}
              onMouseEnter={(e) => {
                if (scans === 0) return;
                const box = wrap.current?.getBoundingClientRect();
                const target = (e.target as SVGPathElement).getBoundingClientRect();
                if (!box) return;
                setTooltip({
                  x: target.left - box.left + target.width / 2,
                  y: target.top - box.top,
                  content: (
                    <>
                      <div className="font-medium">{f.properties?.name ?? code}</div>
                      <div className="tabular text-[var(--text-muted)]">
                        {full(scans)} {scans === 1 ? 'scan' : 'scans'}
                      </div>
                    </>
                  ),
                });
              }}
            />
          );
        })}

        {world &&
          points.map((p, i) => {
            const xy = projection([p.longitude, p.latitude]);
            if (!xy) return null;
            // Area proportional to volume, so a city with four times the scans
            // looks four times as big rather than sixteen.
            const r = 2.5 + Math.sqrt(p.scans / maxPointScans) * 9;
            return (
              <circle
                key={i}
                cx={xy[0]}
                cy={xy[1]}
                r={r}
                fill="var(--viz-series-2)"
                fillOpacity="0.55"
                stroke="var(--bg-raised)"
                strokeWidth="1.5"
                onMouseEnter={(e) => {
                  const box = wrap.current?.getBoundingClientRect();
                  const target = (e.target as SVGCircleElement).getBoundingClientRect();
                  if (!box) return;
                  setTooltip({
                    x: target.left - box.left + target.width / 2,
                    y: target.top - box.top,
                    content: (
                      <>
                        <div className="font-medium">
                          {p.city ?? 'Unknown city'}
                          {p.region ? `, ${p.region}` : ''}
                        </div>
                        <div className="tabular text-[var(--text-muted)]">
                          {full(p.scans)} scans · {full(p.unique_visitors)} unique
                        </div>
                      </>
                    ),
                  });
                }}
              />
            );
          })}
      </svg>

      <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-[var(--text-muted)]">
        <span className="flex items-center gap-1.5">
          <span className="flex gap-[2px]">
            {[0.08, 0.25, 0.45, 0.7, 1].map((t) => (
              <span key={t} className="size-3 rounded-[2px]" style={{ background: choroplethColor(t * peak, peak) }} />
            ))}
          </span>
          Scans per country
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="size-2.5 rounded-full"
            style={{ background: 'var(--viz-series-2)', opacity: 0.55 }}
          />
          City, sized by volume
        </span>
        <span className="tabular ml-auto">
          {compact(byCountry.reduce((s, r) => s + r.scans, 0))} scans mapped
        </span>
      </div>

      <Tooltip state={tooltip} />
    </div>
  );
}

function choroplethColor(scans: number, peak: number): string {
  const t = Math.sqrt(scans / Math.max(1, peak));
  const index = Math.min(6, Math.max(1, Math.round(t * 6)));
  return `var(--viz-ramp-${index})`;
}
