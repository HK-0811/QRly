'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { QrCode, QrStyle } from '@/lib/types';
import {
  DEFAULT_STYLE,
  MAX_LOGO_RATIO,
  renderSvg,
  styleAdvice,
  svgToPngBlob,
  download,
} from '@/lib/qr';
import { Button, Card, ErrorText, Note, cn } from '@/components/ui';

const PNG_SIZES = [512, 1024, 2048];
const MAX_LOGO_BYTES = 200 * 1024;

export function QrStudio({
  linkId,
  userId,
  domainId,
  hostname,
  slug,
  shortUrl,
  existing,
}: {
  linkId: string;
  userId: string;
  domainId: string;
  hostname: string;
  slug: string;
  shortUrl: string;
  existing: QrCode | null;
}) {
  const [style, setStyle] = useState<QrStyle>({ ...DEFAULT_STYLE, ...(existing?.style ?? {}) });
  const [pngSize, setPngSize] = useState(1024);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const svg = useMemo(() => {
    try {
      return renderSvg({ value: shortUrl, style });
    } catch (err) {
      console.error(err);
      return null;
    }
  }, [shortUrl, style]);

  const advice = useMemo(() => styleAdvice(style, shortUrl), [style, shortUrl]);

  useEffect(() => {
    if (!saved) return;
    const t = setTimeout(() => setSaved(false), 2200);
    return () => clearTimeout(t);
  }, [saved]);

  function patch(next: Partial<QrStyle>) {
    setStyle((s) => ({ ...s, ...next }));
    setSaved(false);
  }

  async function onLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);

    if (file.size > MAX_LOGO_BYTES) {
      setError('Keep the logo under 200 KB — it is embedded in the code itself, not uploaded.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => patch({ logoDataUrl: String(reader.result) });
    reader.onerror = () => setError('Could not read that file.');
    reader.readAsDataURL(file);
  }

  async function saveStyle() {
    setSaving(true);
    setError(null);
    const supabase = createClient();

    // Reads and this write both go straight to Supabase: no cache to invalidate,
    // so there is nothing for the Worker to do here (architecture.md §1).
    const { error } = existing
      ? await supabase.from('qr_codes').update({ style }).eq('id', existing.id)
      : await supabase.from('qr_codes').insert({
          user_id: userId,
          link_id: linkId,
          locked_domain_id: domainId,
          style,
        });

    if (error) setError(error.message);
    else setSaved(true);
    setSaving(false);
  }

  async function downloadPng() {
    if (!svg) return;
    setError(null);
    try {
      download(await svgToPngBlob(svg, pngSize), `${slug}-${pngSize}.png`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed.');
    }
  }

  function downloadSvg() {
    if (!svg) return;
    download(new Blob([svg], { type: 'image/svg+xml' }), `${slug}.svg`);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,340px)_1fr]">
      {/* ---------------- preview ---------------- */}
      <div className="space-y-4">
        <Card className="p-5">
          <div
            className="mx-auto aspect-square w-full max-w-[280px] overflow-hidden rounded-md border border-[var(--border)]"
            // The SVG is generated in this file from a URL we control; there is
            // no user-authored markup anywhere in it.
            dangerouslySetInnerHTML={{ __html: svg ?? '' }}
            data-testid="qr-preview"
          />
          <p className="mt-4 break-all text-center font-mono text-[12px] text-[var(--text-muted)]">
            {shortUrl}
          </p>
        </Card>

        <div className="flex flex-wrap gap-2">
          <select
            value={pngSize}
            onChange={(e) => setPngSize(Number(e.target.value))}
            className="h-9 rounded-md border border-[var(--border-strong)] bg-[var(--bg-raised)] px-2 text-[13px]"
            aria-label="PNG size"
          >
            {PNG_SIZES.map((s) => (
              <option key={s} value={s}>
                {s} × {s}
              </option>
            ))}
          </select>
          <Button variant="primary" onClick={downloadPng}>
            Download PNG
          </Button>
          <Button onClick={downloadSvg}>Download SVG</Button>
        </div>

        <Note tone="warn" title="This code is locked to one address forever">
          The image encodes <span className="font-mono">{hostname}/{slug}</span>. Once it is
          printed, that address can never change &mdash; every physical copy would break.
          Only the destination behind it stays editable.
        </Note>
      </div>

      {/* ---------------- controls ---------------- */}
      <div className="space-y-5">
        <Card className="p-5">
          <h3 className="text-[14px] font-semibold tracking-tight">Appearance</h3>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <ColorField
              label="Modules"
              value={style.fgColor}
              onChange={(v) => patch({ fgColor: v })}
            />
            <ColorField
              label="Background"
              value={style.bgColor}
              onChange={(v) => patch({ bgColor: v })}
            />
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Choice
              label="Module shape"
              value={style.moduleShape}
              onChange={(v) => patch({ moduleShape: v as QrStyle['moduleShape'] })}
              options={[
                ['square', 'Square'],
                ['rounded', 'Rounded'],
                ['dots', 'Dots'],
              ]}
            />
            <Choice
              label="Finder shape"
              value={style.eyeShape}
              onChange={(v) => patch({ eyeShape: v as QrStyle['eyeShape'] })}
              options={[
                ['square', 'Square'],
                ['rounded', 'Rounded'],
                ['circle', 'Ring'],
              ]}
            />
          </div>

          <div className="mt-5">
            <Choice
              label="Error correction"
              value={style.errorCorrection}
              onChange={(v) => patch({ errorCorrection: v as QrStyle['errorCorrection'] })}
              options={[
                ['L', 'L · 7%'],
                ['M', 'M · 15%'],
                ['Q', 'Q · 25%'],
                ['H', 'H · 30%'],
              ]}
            />
            <p className="mt-1.5 text-[12px] leading-relaxed text-[var(--text-muted)]">
              How much of the printed code can be damaged, covered or dirty and still
              decode. Higher levels make the grid denser.
            </p>
          </div>

          <div className="mt-5">
            <label className="block text-[13px] font-medium">
              Quiet zone{' '}
              <span className="tabular text-[var(--text-muted)]">{style.margin} modules</span>
            </label>
            <input
              type="range"
              min={0}
              max={8}
              value={style.margin}
              onChange={(e) => patch({ margin: Number(e.target.value) })}
              className="mt-2 w-full accent-[var(--color-accent-500)]"
            />
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="text-[14px] font-semibold tracking-tight">Logo</h3>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/svg+xml,image/webp"
              onChange={onLogo}
              className="hidden"
            />
            <Button onClick={() => fileRef.current?.click()}>
              {style.logoDataUrl ? 'Replace image' : 'Add an image'}
            </Button>
            {style.logoDataUrl && (
              <Button
                variant="ghost"
                onClick={() => {
                  patch({ logoDataUrl: null });
                  if (fileRef.current) fileRef.current.value = '';
                }}
              >
                Remove
              </Button>
            )}
          </div>

          {style.logoDataUrl && (
            <div className="mt-4">
              <label className="block text-[13px] font-medium">
                Size{' '}
                <span className="tabular text-[var(--text-muted)]">
                  {Math.round(style.logoSizeRatio * 100)}% of width
                </span>
              </label>
              <input
                type="range"
                min={8}
                max={Math.round(MAX_LOGO_RATIO[style.errorCorrection] * 100)}
                value={Math.round(style.logoSizeRatio * 100)}
                onChange={(e) => patch({ logoSizeRatio: Number(e.target.value) / 100 })}
                className="mt-2 w-full accent-[var(--color-accent-500)]"
              />
              <p className="mt-1.5 text-[12px] text-[var(--text-muted)]">
                Capped at {Math.round(MAX_LOGO_RATIO[style.errorCorrection] * 100)}% for error
                correction level {style.errorCorrection}.
              </p>
            </div>
          )}

          <p className="mt-3 text-[12px] leading-relaxed text-[var(--text-muted)]">
            The image is embedded into the code itself and never uploaded anywhere.
          </p>
        </Card>

        <Card className="p-5">
          <h3 className="text-[14px] font-semibold tracking-tight">Scannability</h3>
          <ul className="mt-3 space-y-2">
            {advice.map((a, i) => (
              <li key={i} className="flex gap-2 text-[12.5px] leading-relaxed">
                <span
                  className={cn(
                    'mt-[6px] size-1.5 shrink-0 rounded-full',
                    a.level === 'warn' ? 'bg-warn-400' : 'bg-accent-500',
                  )}
                />
                <span className={a.level === 'warn' ? 'text-[var(--text)]' : 'text-[var(--text-muted)]'}>
                  {a.text}
                </span>
              </li>
            ))}
          </ul>
        </Card>

        <ErrorText>{error}</ErrorText>

        <div className="flex items-center gap-3">
          <Button variant="primary" loading={saving} onClick={saveStyle}>
            {existing ? 'Save style' : 'Save this design'}
          </Button>
          {saved && (
            <span className="text-[12.5px] text-accent-600 dark:text-accent-400">Saved</span>
          )}
          <Button variant="ghost" onClick={() => setStyle(DEFAULT_STYLE)}>
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-[13px] font-medium">{label}</label>
      <div className="mt-1.5 flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="size-9 cursor-pointer rounded border border-[var(--border-strong)] bg-transparent p-0.5"
          aria-label={`${label} colour`}
        />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-full rounded-md border border-[var(--border-strong)] bg-[var(--bg-raised)] px-2 font-mono text-[12.5px] uppercase"
          aria-label={`${label} hex`}
        />
      </div>
    </div>
  );
}

function Choice({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Array<[string, string]>;
}) {
  return (
    <div>
      <label className="block text-[13px] font-medium">{label}</label>
      <div className="mt-1.5 flex rounded-md border border-[var(--border-strong)] p-0.5">
        {options.map(([v, text]) => (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            aria-pressed={value === v}
            className={cn(
              'flex-1 rounded px-2 py-1.5 text-[12.5px] font-medium transition-colors',
              value === v
                ? 'bg-[var(--bg-subtle)] text-[var(--text)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text)]',
            )}
          >
            {text}
          </button>
        ))}
      </div>
    </div>
  );
}
