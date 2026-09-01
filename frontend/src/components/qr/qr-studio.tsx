'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { api } from '@/lib/api';
import type { QrCode, QrStyle } from '@/lib/types';
import {
  DEFAULT_STYLE,
  MAX_LOGO_RATIO,
  renderSvg,
  styleAdvice,
  svgToPngBlob,
  download,
} from '@/lib/qr';
import { Button, ErrorText, Spinner, chipClass, segmentClass, cn } from '@/components/ui';

const PNG_SIZES = [512, 1024, 2048];
const MAX_LOGO_BYTES = 200 * 1024;

/** Four starting points, not a palette. The hex field below is the real control. */
const SWATCHES = ['#0A0A0A', 'oklch(0.58 0.215 32)', '#1B3A5C', '#5C4B1B'];

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

/**
 * How the design is persisted.
 *
 * `owned` writes straight to Supabase with the reader's own JWT, because RLS
 * already enforces ownership and there is no cache to invalidate.
 * `unclaimed` goes through the Worker with the claim token, because the row has
 * no owner and therefore matches no RLS policy.
 * `ephemeral` saves nothing — used where there is no token to save against, and
 * the UI says so rather than pretending.
 */
export type StudioTarget =
  | { kind: 'owned'; linkId: string; userId: string; domainId: string; existing: QrCode | null }
  | { kind: 'unclaimed'; claimToken: string; existing: QrStyle | null }
  | { kind: 'ephemeral' };

export function QrStudio({
  hostname,
  slug,
  shortUrl,
  target,
}: {
  hostname: string;
  slug: string;
  shortUrl: string;
  target: StudioTarget;
}) {
  const initial =
    target.kind === 'owned'
      ? target.existing?.style
      : target.kind === 'unclaimed'
        ? target.existing
        : null;

  const [style, setStyle] = useState<QrStyle>({ ...DEFAULT_STYLE, ...(initial ?? {}) });
  const [pngSize, setPngSize] = useState(1024);
  const [save, setSave] = useState<SaveState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
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

  // ---------------------------------------------------------------------
  // Persistence
  //
  // Autosaved on a trailing debounce. The previous build made this a button,
  // which meant a code could be downloaded and printed carrying a design that
  // was never stored — the file existed, the settings did not.
  // ---------------------------------------------------------------------

  const persist = useCallback(
    async (next: QrStyle) => {
      if (target.kind === 'ephemeral') return;
      setSave('saving');
      setError(null);
      try {
        if (target.kind === 'unclaimed') {
          await api.saveAnonymousQr(target.claimToken, next);
        } else {
          const supabase = createClient();
          const { error } = target.existing
            ? await supabase.from('qr_codes').update({ style: next }).eq('id', target.existing.id)
            : await supabase.from('qr_codes').insert({
                user_id: target.userId,
                link_id: target.linkId,
                locked_domain_id: target.domainId,
                style: next,
              });
          if (error) throw new Error(error.message);
        }
        setSave('saved');
      } catch (err) {
        setSave('error');
        setError(err instanceof Error ? err.message : 'Could not save the design.');
      }
    },
    // `existing` is read at call time; the first save creates the row and later
    // ones update it, which the Supabase upsert semantics above already handle.
    [target],
  );

  const pending = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dirty = useRef(false);

  function patch(next: Partial<QrStyle>) {
    setStyle((s) => {
      const merged = { ...s, ...next };
      dirty.current = true;
      if (pending.current) clearTimeout(pending.current);
      pending.current = setTimeout(() => {
        dirty.current = false;
        void persist(merged);
      }, 700);
      return merged;
    });
  }

  useEffect(() => () => { if (pending.current) clearTimeout(pending.current); }, []);

  /** Downloading flushes any pending save first, so the file and the row agree. */
  async function flush() {
    if (pending.current) {
      clearTimeout(pending.current);
      pending.current = null;
    }
    if (dirty.current) {
      dirty.current = false;
      await persist(style);
    }
  }

  async function downloadPng() {
    if (!svg) return;
    setExporting(true);
    setError(null);
    try {
      await flush();
      download(await svgToPngBlob(svg, pngSize), `${slug}-${pngSize}.png`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed.');
    } finally {
      setExporting(false);
    }
  }

  async function downloadSvg() {
    if (!svg) return;
    await flush();
    download(new Blob([svg], { type: 'image/svg+xml' }), `${slug}.svg`);
  }

  function onLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);

    if (file.size > MAX_LOGO_BYTES) {
      setError('Keep the logo under 200 KB — it is embedded in the QR code itself, not uploaded.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => patch({ logoDataUrl: String(reader.result) });
    reader.onerror = () => setError('Could not read that file.');
    reader.readAsDataURL(file);
  }

  return (
    // `items-start` so the two columns size to their own content: a stretched
    // grid item cannot be sticky, because it is already as tall as the row.
    <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(340px,420px)] lg:items-start">
      {/*
        ------------------------- preview -------------------------

        Pinned below the header from `lg` up. The panel of controls to the right
        is several screens tall, and every one of those controls changes what
        this preview looks like — a preview you have to scroll away from to
        reach the control that edits it is not a preview.

        This used to be `min-h-[calc(100dvh-71px)]` with the QR centred inside
        it, which assumed the studio owned the viewport. It does not: it sits
        under the link header and the tab bar, about 450px down, so centring in
        a viewport-tall column put the QR below the fold on first paint. Now the
        column is only as tall as it needs to be and starts at the top.

        `top-71px` clears the sticky dashboard header. The QR is capped against
        `dvh` as well as width so the whole column fits beside the header
        without needing to scroll internally.

        No `overflow` here, deliberately. Capping the height and adding
        `overflow-y: auto` looks like the safe way to handle a pane taller than
        the viewport, but `overflow-y` on one axis forces the other from
        `visible` to `auto`, which makes this a clipping box — and `box-shadow`
        is ink overflow, not scrollable overflow, so it gets clipped rather than
        scrolled. That severed the panel's 18px offset shadow into floating
        fragments, and moved the cut around as the QR resized under the
        controls. The height cap on the QR is what keeps the column short
        enough that no scrolling is needed.
      */}
      <div className="flex min-w-0 flex-col items-center gap-5 px-6 py-8 lg:sticky lg:top-[71px]">
        <div
          className="border border-[var(--rule-mid)] bg-white p-6"
          style={{ boxShadow: 'var(--shadow-block)' }}
        >
          <div
            className="qr-fit aspect-square w-[min(340px,70vw,34dvh)]"
            // Generated in this file from a URL we control; there is no
            // user-authored markup anywhere in it.
            dangerouslySetInnerHTML={{ __html: svg ?? '' }}
            data-testid="qr-preview"
          />
        </div>

        <p className="break-all text-center font-mono text-[13px] text-[var(--text-soft)]">
          encodes {shortUrl}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-2.5">
          <div className="flex font-mono text-[12px]">
            {PNG_SIZES.map((s, i) => (
              <button
                key={s}
                onClick={() => setPngSize(s)}
                aria-pressed={pngSize === s}
                className={segmentClass(pngSize === s, i)}
              >
                {s}
              </button>
            ))}
          </div>
          <Button variant="primary" size="sm" loading={exporting} onClick={downloadPng}>
            Download PNG
          </Button>
          <Button variant="ghost" size="sm" onClick={downloadSvg}>
            SVG
          </Button>
        </div>

        <div className="flex max-w-[52ch] gap-3.5 border-t border-[var(--rule)] pt-5">
          <span className="font-mono text-[13px] text-[var(--accent)]" aria-hidden>
            !
          </span>
          <p className="text-[13px] leading-relaxed text-[var(--text-muted)]">
            This QR code is locked to one address forever. The image encodes{' '}
            <span className="font-mono">
              {hostname}/{slug}
            </span>
            . Once it is printed, that address can never change — every physical copy would break.
            Only the destination behind it stays editable.
          </p>
        </div>
      </div>

      {/* ------------------------- controls ------------------------- */}
      <aside className="flex min-w-0 flex-col gap-8 border-t border-[var(--rule-mid)] bg-[var(--bg)] px-7 py-8 pb-24 lg:border-l lg:border-t-0">
        <section>
          <div className="eyebrow mb-4">Appearance</div>

          <Swatches
            label="Module colour"
            value={style.fgColor}
            onChange={(v) => patch({ fgColor: v })}
          />
          <div className="mt-6">
            <Swatches
              label="Background"
              value={style.bgColor}
              onChange={(v) => patch({ bgColor: v })}
              swatches={['#FFFFFF', '#FCFCFC', '#F0F0F0', '#0A0A0A']}
            />
          </div>

          <Choice
            className="mt-6"
            label="Module shape"
            value={style.moduleShape}
            onChange={(v) => patch({ moduleShape: v as QrStyle['moduleShape'] })}
            options={[
              ['square', 'Square'],
              ['rounded', 'Round'],
              ['dots', 'Dots'],
            ]}
          />

          <Choice
            className="mt-6"
            label="Finder shape"
            value={style.eyeShape}
            onChange={(v) => patch({ eyeShape: v as QrStyle['eyeShape'] })}
            options={[
              ['square', 'Square'],
              ['rounded', 'Round'],
              ['circle', 'Ring'],
            ]}
          />

          <Choice
            className="mt-6"
            label="Error correction"
            value={style.errorCorrection}
            onChange={(v) => patch({ errorCorrection: v as QrStyle['errorCorrection'] })}
            options={[
              ['L', 'L'],
              ['M', 'M'],
              ['Q', 'Q'],
              ['H', 'H'],
            ]}
          />
          <p className="mt-2 text-[12px] leading-relaxed text-[var(--text-faint)]">
            How much of the printed QR code can be damaged, covered or dirty and still decode. Higher
            levels make the grid denser.
          </p>

          <div className="mt-6">
            <div className="mb-2.5 flex justify-between text-[13px] text-[var(--text-muted)]">
              <span>Quiet zone</span>
              <span className="font-mono text-[var(--text)]">{style.margin} modules</span>
            </div>
            <input
              type="range"
              min={0}
              max={8}
              value={style.margin}
              onChange={(e) => patch({ margin: Number(e.target.value) })}
              className="w-full accent-[var(--accent)]"
              aria-label="Quiet zone in modules"
            />
          </div>
        </section>

        <section className="border-t border-[var(--rule)] pt-6">
          <div className="eyebrow mb-4">Logo</div>
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/svg+xml,image/webp"
            onChange={onLogo}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-full border border-dashed border-[rgba(10,10,10,0.28)] px-5 py-5 text-[13px] text-[var(--text-soft)] transition-colors hover:border-[var(--accent)] hover:text-[var(--text)]"
          >
            {style.logoDataUrl ? 'Replace image' : 'Drop an image, under 200 KB'}
          </button>

          {style.logoDataUrl && (
            <div className="mt-4">
              <div className="mb-2.5 flex justify-between text-[13px] text-[var(--text-muted)]">
                <span>Size</span>
                <span className="font-mono text-[var(--text)]">
                  {Math.round(style.logoSizeRatio * 100)}%
                </span>
              </div>
              <input
                type="range"
                min={8}
                max={Math.round(MAX_LOGO_RATIO[style.errorCorrection] * 100)}
                value={Math.round(style.logoSizeRatio * 100)}
                onChange={(e) => patch({ logoSizeRatio: Number(e.target.value) / 100 })}
                className="w-full accent-[var(--accent)]"
                aria-label="Logo size"
              />
              <div className="mt-2 flex items-center justify-between">
                <p className="text-[12px] text-[var(--text-faint)]">
                  Capped at {Math.round(MAX_LOGO_RATIO[style.errorCorrection] * 100)}% for level{' '}
                  {style.errorCorrection}.
                </p>
                <button
                  onClick={() => {
                    patch({ logoDataUrl: null });
                    if (fileRef.current) fileRef.current.value = '';
                  }}
                  className="text-[12px] text-[var(--text-soft)] underline underline-offset-2"
                >
                  Remove
                </button>
              </div>
            </div>
          )}

          <p className="mt-3 font-mono text-[11px] text-[var(--text-faint)]">
            Embedded in the file. Never uploaded.
          </p>
        </section>

        <section className="border-t border-[var(--rule)] pt-6">
          <div className="eyebrow mb-4">Scannability</div>
          <ul className="flex flex-col gap-3">
            {advice.map((a, i) => (
              <li key={i} className="flex gap-3 text-[13px] leading-relaxed">
                <span
                  className={cn(
                    'font-mono',
                    a.level === 'warn' ? 'text-[var(--accent)]' : 'text-[var(--text-ghost)]',
                  )}
                  aria-hidden
                >
                  {a.level === 'warn' ? '!' : '✓'}
                </span>
                <span
                  className={a.level === 'warn' ? 'text-[var(--text)]' : 'text-[var(--text-muted)]'}
                >
                  {a.text}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {error && <ErrorText>{error}</ErrorText>}

        <div className="mt-auto flex items-center justify-between border-t border-[var(--rule)] pt-5">
          <SaveIndicator state={save} target={target} />
          <button
            onClick={() => {
              setStyle(DEFAULT_STYLE);
              dirty.current = true;
              if (pending.current) clearTimeout(pending.current);
              pending.current = setTimeout(() => void persist(DEFAULT_STYLE), 700);
            }}
            className="text-[13px] text-[var(--text-soft)] underline decoration-[var(--rule-strong)] underline-offset-2 hover:text-[var(--text)]"
          >
            Reset
          </button>
        </div>
      </aside>
    </div>
  );
}

function SaveIndicator({ state, target }: { state: SaveState; target: StudioTarget }) {
  if (target.kind === 'ephemeral') {
    return (
      <span className="max-w-[26ch] text-[12px] text-[var(--text-faint)]">
        Not saved anywhere. Download the file, or claim the QR code to keep this design.
      </span>
    );
  }

  const label =
    state === 'saving'
      ? 'Saving…'
      : state === 'error'
        ? 'Not saved'
        : state === 'saved'
          ? 'Saved'
          : 'Saved automatically. Downloading saves first.';

  return (
    <span className="flex items-center gap-2.5 text-[12px] text-[var(--text-faint)]">
      {state === 'saving' ? (
        <Spinner size={11} />
      ) : (
        <span
          aria-hidden
          className="size-1.5 rounded-full"
          style={{
            background: state === 'error' ? 'var(--color-danger-500)' : 'var(--accent)',
          }}
        />
      )}
      <span className="max-w-[28ch]">{label}</span>
    </span>
  );
}

function Swatches({
  label,
  value,
  onChange,
  swatches = SWATCHES,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  swatches?: string[];
}) {
  return (
    <div>
      <div className="mb-2.5 text-[13px] text-[var(--text-muted)]">{label}</div>
      <div className="flex items-center gap-2.5">
        {swatches.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onChange(c)}
            aria-label={`${label}: ${c}`}
            aria-pressed={value.toLowerCase() === c.toLowerCase()}
            className="size-9 shrink-0"
            style={{
              background: c,
              boxShadow:
                value.toLowerCase() === c.toLowerCase()
                  ? '0 0 0 1.5px #fff inset, 0 0 0 1.5px #0A0A0A'
                  : '0 0 0 1px rgba(10,10,10,0.15)',
            }}
          />
        ))}
        <input
          type="color"
          value={/^#[0-9a-f]{6}$/i.test(value) ? value : '#000000'}
          onChange={(e) => onChange(e.target.value)}
          className="size-9 shrink-0 cursor-pointer border border-[var(--rule-strong)] bg-transparent p-0.5"
          aria-label={`${label}: pick a colour`}
        />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 min-w-0 flex-1 border border-[var(--rule-strong)] px-2 font-mono text-[12px] uppercase"
          aria-label={`${label} value`}
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
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Array<[string, string]>;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="mb-2.5 text-[13px] text-[var(--text-muted)]">{label}</div>
      <div className="flex gap-2">
        {options.map(([v, text]) => (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            aria-pressed={value === v}
            className={chipClass(value === v, 'flex-1 px-2')}
          >
            {text}
          </button>
        ))}
      </div>
    </div>
  );
}
