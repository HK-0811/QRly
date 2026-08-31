'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { api, ApiError } from '@/lib/api';
import type { LinkWithDomain } from '@/lib/types';
import { Button, cn } from '@/components/ui';

const REDIRECT_ORIGIN = process.env.NEXT_PUBLIC_REDIRECT_ORIGIN ?? 'http://localhost:8787';

/** The printed URL uses the link's own hostname, not this deployment's. */
export function shortUrlFor(link: LinkWithDomain): string {
  const hostname = link.domains?.hostname;
  if (!hostname) return `${REDIRECT_ORIGIN}/${link.slug}`;
  const scheme = hostname.startsWith('localhost') || hostname.startsWith('127.') ? 'http' : 'https';
  return `${scheme}://${hostname}/${link.slug}`;
}

/**
 * One visible action, everything else behind a menu.
 *
 * The previous build put four equal ghost buttons in every row, with Delete
 * flush against Edit at 60% opacity. Designing a code is the thing people come
 * back to do; deleting one is the thing that breaks printed posters. They should
 * not have looked the same.
 */
export function LinkRowActions({
  link,
  onEdit,
  onChanged,
}: {
  link: LinkWithDomain;
  onEdit: () => void;
  onChanged: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (!menuRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  async function toggle() {
    setBusy(true);
    setError(null);
    setOpen(false);
    try {
      await api.updateLink(link.id, { is_active: !link.is_active });
      onChanged();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  }

  async function remove(force = false) {
    setBusy(true);
    setError(null);
    setOpen(false);
    try {
      await api.deleteLink(link.id, { force });
      onChanged();
    } catch (err) {
      if (err instanceof ApiError && err.requiresConfirmation) {
        setConfirmDelete(err.message);
      } else {
        setError(err instanceof ApiError ? err.message : 'Something went wrong.');
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="lg:justify-self-end">
      <div className="flex items-center gap-2">
        <Link
          href={`/links/${link.id}?tab=qr`}
          className={cn(
            'inline-flex min-h-[36px] items-center border border-[var(--rule-strong)] px-3.5 font-mono text-[12px]',
            'transition-[border-color,background-color,color,scale] duration-[var(--dur)] ease-[var(--ease)]',
            'hover:border-[var(--rule-ink)] hover:bg-[var(--surface-hover)]',
            'active:scale-[0.96] motion-reduce:active:scale-100',
          )}
        >
          QR
        </Link>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setOpen((v) => !v)}
            disabled={busy}
            aria-haspopup="menu"
            aria-expanded={open}
            aria-label={`More actions for ${link.slug}`}
            className={cn(
              'inline-flex min-h-[36px] min-w-[36px] items-center justify-center border border-[var(--rule-strong)] text-[12px] text-[var(--text-soft)]',
              'transition-[border-color,background-color,color,scale] duration-[var(--dur)] ease-[var(--ease)]',
              'hover:border-[var(--rule-ink)] hover:bg-[var(--surface-hover)] hover:text-[var(--text)]',
              'active:scale-[0.96] motion-reduce:active:scale-100',
              'disabled:opacity-40',
              open && 'border-[var(--rule-ink)] bg-[var(--surface-hover)] text-[var(--text)]',
            )}
          >
            ···
          </button>

          {open && (
            <div
              role="menu"
              className="animate-rise absolute right-0 top-[calc(100%+4px)] z-30 w-48 border border-[var(--rule-mid)] bg-[var(--bg)] py-1 shadow-[var(--shadow-float)] duration-[var(--dur-slow)]"
            >
              <MenuItem onClick={onEdit}>Edit destination</MenuItem>
              <MenuItem onClick={toggle}>{link.is_active ? 'Turn off' : 'Turn on'}</MenuItem>
              <MenuItem href={`/links/${link.id}`}>Open scans</MenuItem>
              <div className="my-1 border-t border-[var(--rule)]" />
              <MenuItem danger onClick={() => remove(false)}>
                Delete
              </MenuItem>
            </div>
          )}
        </div>
      </div>

      {error && (
        <p className="mt-2 text-[12.5px] text-[var(--color-danger-500)]">{error}</p>
      )}

      {confirmDelete && (
        <div className="mt-3 border border-[var(--accent-line)] bg-[var(--accent-wash)] px-4 py-3.5 lg:w-[min(420px,80vw)]">
          <p className="text-[13px] leading-relaxed text-[var(--text)]">{confirmDelete}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="danger"
              loading={busy}
              onClick={() => {
                setConfirmDelete(null);
                void remove(true);
              }}
            >
              Delete anyway
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                setConfirmDelete(null);
                void toggle();
              }}
              disabled={!link.is_active}
            >
              Turn off instead
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(null)}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * One row of the overflow menu, as a button or as a link.
 *
 * The link case used to be a `<Link role="menuitem">` wrapping this component's
 * `<button role="menuitem">` — an interactive element inside another one, two
 * nested menuitem roles, and a target whose behaviour depended on which of the
 * two the pointer happened to land on. One element, chosen by whether an href
 * was passed.
 */
function MenuItem({
  children,
  onClick,
  href,
  danger,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  danger?: boolean;
}) {
  const Tag = href ? Link : 'button';
  return (
    <Tag
      // @ts-expect-error -- href is present exactly when Tag is Link.
      href={href}
      role="menuitem"
      onClick={onClick}
      className={cn(
        // 36px rows, not 30: this menu holds Delete, and a cramped target next
        // to a destructive one is how the wrong item gets clicked.
        'flex min-h-[36px] w-full items-center px-4 text-left text-[13.5px]',
        'transition-colors duration-[var(--dur-fast)] ease-[var(--ease)]',
        danger
          ? 'text-[var(--color-danger-500)] hover:bg-[rgba(176,48,48,0.07)]'
          : // --bg-subtle is #fcfcfc, a 1% step off white. As a hover state it was
            // invisible, so the menu gave no feedback at all before a click.
            'text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text)]',
      )}
    >
      {children}
    </Tag>
  );
}
