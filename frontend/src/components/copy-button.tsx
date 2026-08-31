'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/components/ui';

/**
 * Copy-to-clipboard with a falls-back path. navigator.clipboard is unavailable on
 * plain HTTP outside localhost, which is exactly where this project runs during
 * development, so a silent no-op would look like a broken button.
 */
export function CopyButton({
  value,
  label = 'Copy short URL',
  variant = 'icon',
}: {
  value: string;
  label?: string;
  /** `text` is the outlined mono button beside a short URL; `icon` sits in a row. */
  variant?: 'icon' | 'text';
}) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  async function copy() {
    clearTimeout(timer.current);
    let ok = false;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
        ok = true;
      }
    } catch {
      ok = false;
    }

    if (!ok) {
      const el = document.createElement('textarea');
      el.value = value;
      el.setAttribute('readonly', '');
      el.style.position = 'fixed';
      el.style.opacity = '0';
      document.body.appendChild(el);
      el.select();
      try {
        ok = document.execCommand('copy');
      } catch {
        ok = false;
      }
      document.body.removeChild(el);
    }

    setState(ok ? 'copied' : 'failed');
    timer.current = setTimeout(() => setState('idle'), 1600);
  }

  if (variant === 'text') {
    return (
      <button
        type="button"
        onClick={copy}
        aria-label={label}
        className={cn(
          'inline-flex min-h-[40px] min-w-[92px] items-center justify-center border px-4 font-mono text-[13px]',
          'transition-[background-color,border-color,color,scale] duration-[var(--dur)] ease-[var(--ease)]',
          'active:scale-[0.96] motion-reduce:active:scale-100',
          state === 'failed'
            ? 'border-[var(--color-danger-500)] text-[var(--color-danger-500)]'
            : state === 'copied'
              ? // Confirmation is the accent, not the ink block. The ink block is
                // what the button looks like while you are pressing it, and
                // reusing it for the result makes "copied" read as "still armed".
                'border-[var(--accent)] bg-[var(--accent-wash)] text-[var(--accent-strong)]'
              : 'border-[var(--rule-ink)] hover:bg-[var(--rule-ink)] hover:text-white active:bg-[var(--accent-strong)] active:border-[var(--accent-strong)]',
        )}
      >
        {/* Pinned width above, because "Copy" and "Press Ctrl+C" are very
            different lengths and the row beside them must not reflow. */}
        {state === 'copied' ? 'Copied' : state === 'failed' ? 'Press Ctrl+C' : 'Copy'}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={label}
      title={state === 'copied' ? 'Copied' : label}
      className={cn(
        // The glyph is 14px; the target is 36. The extra area is padding on the
        // button itself rather than a pseudo-element, because this sits in a
        // flex row where nothing else is close enough to collide with it.
        'inline-flex size-9 items-center justify-center -m-1.5',
        'transition-[color,scale] duration-[var(--dur)] ease-[var(--ease)]',
        'active:scale-[0.9] motion-reduce:active:scale-100',
        state === 'copied'
          ? 'text-[var(--accent)]'
          : state === 'failed'
            ? 'text-[var(--color-danger-500)]'
            : 'text-[var(--text-faint)] hover:text-[var(--text)]',
      )}
    >
      {/*
        Both glyphs stay mounted and cross-fade. Swapping one element for the
        other made the confirmation appear out of nothing at the exact moment
        the pointer was still over the button; scaling and unblurring it reads
        as the check being drawn, which is what actually happened.
      */}
      <span className="relative block size-3.5">
        <svg
          viewBox="0 0 16 16"
          className="absolute inset-0 size-3.5 transition-[opacity,scale,filter] duration-[var(--dur-slow)] ease-[var(--ease)]"
          style={{
            opacity: state === 'copied' ? 1 : 0,
            scale: state === 'copied' ? '1' : '0.25',
            filter: state === 'copied' ? 'blur(0px)' : 'blur(4px)',
          }}
          aria-hidden
        >
          <path d="M3.5 8.5l3 3 6-6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
        <svg
          viewBox="0 0 16 16"
          className="absolute inset-0 size-3.5 transition-[opacity,scale,filter] duration-[var(--dur-slow)] ease-[var(--ease)]"
          style={{
            opacity: state === 'copied' ? 0 : 1,
            scale: state === 'copied' ? '0.25' : '1',
            filter: state === 'copied' ? 'blur(4px)' : 'blur(0px)',
          }}
          aria-hidden
        >
          <rect x="5.25" y="5.25" width="8" height="8" stroke="currentColor" strokeWidth="1.4" fill="none" />
          <path d="M10.75 3.25a1.5 1.5 0 0 0-1.5-1.5H4.25a2.5 2.5 0 0 0-2.5 2.5v5a1.5 1.5 0 0 0 1.5 1.5" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" />
        </svg>
      </span>
      <span className="sr-only">{state === 'copied' ? 'Copied' : label}</span>
    </button>
  );
}
