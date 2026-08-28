'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/components/ui';

/**
 * Copy-to-clipboard with a falls-back path. navigator.clipboard is unavailable on
 * plain HTTP outside localhost, which is exactly where this project runs during
 * development, so a silent no-op would look like a broken button.
 */
export function CopyButton({ value, label = 'Copy short URL' }: { value: string; label?: string }) {
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

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={label}
      title={state === 'copied' ? 'Copied' : label}
      className={cn(
        'inline-flex size-6 items-center justify-center rounded transition-colors',
        state === 'copied'
          ? 'text-accent-600 dark:text-accent-400'
          : state === 'failed'
            ? 'text-danger-500'
            : 'text-[var(--text-faint)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text)]',
      )}
    >
      {state === 'copied' ? (
        <svg viewBox="0 0 16 16" className="size-3.5" aria-hidden>
          <path d="M3.5 8.5l3 3 6-6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      ) : (
        <svg viewBox="0 0 16 16" className="size-3.5" aria-hidden>
          <rect x="5.25" y="5.25" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.4" fill="none" />
          <path d="M10.75 3.25a1.5 1.5 0 0 0-1.5-1.5H4.25a2.5 2.5 0 0 0-2.5 2.5v5a1.5 1.5 0 0 0 1.5 1.5" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" />
        </svg>
      )}
      <span className="sr-only">{state === 'copied' ? 'Copied' : label}</span>
    </button>
  );
}
