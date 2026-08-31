'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Spinner, cn } from '@/components/ui';

/**
 * The landing field does not create anything. It carries what was typed into
 * /create and lets that screen own the whole creation flow.
 *
 * Submitting from here and rendering the result on the landing page would mean
 * two implementations of the same three phases, and the create screen is where
 * someone arriving from a bookmark or a second attempt lands anyway.
 */
export function HeroForm({ size = 'lg' }: { size?: 'lg' | 'md' }) {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [busy, setBusy] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const trimmed = url.trim();
    router.push(trimmed ? `/create?url=${encodeURIComponent(trimmed)}` : '/create');
  }

  return (
    <form onSubmit={submit} className="flex max-w-[560px] flex-col gap-3.5">
      {/*
        The border lives on this row, not on the input, so the focus ring has to
        be drawn here too — `focus-frame` is the rule in globals.css that does
        it. Without it, tabbing into the most important field on the site
        produced no visible change at all.
      */}
      <div className="focus-frame flex items-stretch border-[1.5px] border-[var(--rule-ink)] bg-[var(--bg)]">
        <span className="hidden items-center border-r border-[var(--rule-mid)] px-4 font-mono text-[13px] text-[var(--text-faint)] sm:flex">
          https://
        </span>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="your-menu.com/spring"
          aria-label="Destination URL"
          inputMode="url"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          className={cn(
            'min-w-0 flex-1 border-0 bg-transparent placeholder:text-[var(--text-ghost)]',
            // The ring is on the frame; a second one on the input would draw a
            // rectangle inside a rectangle.
            'focus-visible:outline-none',
            size === 'lg' ? 'px-4 py-[19px] text-[17px]' : 'px-4 py-3.5 text-[15px]',
          )}
        />
        <button
          type="submit"
          disabled={busy}
          aria-busy={busy || undefined}
          className={cn(
            'group flex items-center gap-2.5 whitespace-nowrap font-medium',
            // Ink at rest, full-strength vermilion on hover, the darker one on
            // press. The label stays white throughout — it used to flip to
            // near-black over a 60%-alpha accent, which is the washed-out state
            // this whole pass exists to remove.
            'bg-[var(--rule-ink)] text-white hover:bg-[var(--accent)] active:bg-[var(--accent-strong)]',
            'transition-[background-color,scale] duration-[var(--dur)] ease-[var(--ease)]',
            'active:scale-[0.98] motion-reduce:active:scale-100',
            'disabled:pointer-events-none disabled:opacity-60',
            size === 'lg' ? 'px-7 text-[16px]' : 'px-5 text-[14px]',
          )}
        >
          {busy ? <Spinner tone="inverted" /> : null}
          Get QR code
          <span
            className="font-mono transition-transform duration-[var(--dur)] ease-[var(--ease)] group-hover:translate-x-1"
            aria-hidden
          >
            →
          </span>
        </button>
      </div>
      <p className="font-mono text-[12px] text-[var(--text-faint)]">
        Free. The QR code appears before you decide anything else.
      </p>
    </form>
  );
}
