'use client';

import { useState } from 'react';
import Link from 'next/link';
import { api, ApiError } from '@/lib/api';
import type { LinkWithDomain } from '@/lib/types';
import { Badge, Button, cn } from '@/components/ui';
import { CopyButton } from '@/components/copy-button';

const REDIRECT_ORIGIN = process.env.NEXT_PUBLIC_REDIRECT_ORIGIN ?? 'http://localhost:8787';

/** The printed URL uses the link's own hostname, not this deployment's. */
export function shortUrlFor(link: LinkWithDomain): string {
  const hostname = link.domains?.hostname;
  if (!hostname) return `${REDIRECT_ORIGIN}/${link.slug}`;
  const scheme = hostname.startsWith('localhost') || hostname.startsWith('127.') ? 'http' : 'https';
  return `${scheme}://${hostname}/${link.slug}`;
}

export function LinkRow({
  link,
  onEdit,
  onChanged,
}: {
  link: LinkWithDomain;
  onEdit: () => void;
  onChanged: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const shortUrl = shortUrlFor(link);
  const expired = link.expires_at !== null && new Date(link.expires_at) <= new Date();

  async function toggle() {
    setBusy(true);
    setError(null);
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
    <li className="group px-4 py-3.5 transition-colors hover:bg-[var(--bg-subtle)]">
      <div className="flex items-start gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <a
              href={shortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'font-mono text-[13.5px] font-medium tracking-tight',
                link.is_active && !expired ? 'text-[var(--text)]' : 'text-[var(--text-faint)]',
                'hover:text-accent-600 dark:hover:text-accent-400',
              )}
            >
              {link.domains?.hostname ?? '—'}/<span className="font-semibold">{link.slug}</span>
            </a>

            <CopyButton value={shortUrl} />

            {!link.is_active && <Badge tone="neutral">Off</Badge>}
            {expired && <Badge tone="warn">Expired</Badge>}
            {link.safe_browsing_status === 'flagged' && <Badge tone="bad">Flagged</Badge>}
            {link.domains?.is_custom && <Badge tone="good">Custom domain</Badge>}
          </div>

          {link.title && (
            <p className="mt-1 truncate text-[13px] font-medium text-[var(--text)]">{link.title}</p>
          )}

          <p className="mt-0.5 flex items-center gap-1.5 truncate text-[12.5px] text-[var(--text-muted)]">
            <ArrowIcon />
            <span className="truncate">{link.destination_url}</span>
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1 opacity-100 sm:opacity-60 sm:transition-opacity sm:group-hover:opacity-100 sm:focus-within:opacity-100">
          <Button size="sm" variant="ghost" onClick={toggle} disabled={busy}>
            {link.is_active ? 'Turn off' : 'Turn on'}
          </Button>
          <Link href={`/links/${link.id}`}>
            <Button size="sm" variant="ghost" disabled={busy}>
              QR code
            </Button>
          </Link>
          <Button size="sm" variant="ghost" onClick={onEdit} disabled={busy}>
            Edit
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => remove(false)}
            disabled={busy}
            className="hover:text-danger-500"
          >
            Delete
          </Button>
        </div>
      </div>

      {error && <p className="mt-2 text-[12.5px] text-danger-500">{error}</p>}

      {confirmDelete && (
        <div className="mt-3 rounded-md border border-warn-400/35 bg-warn-400/8 px-3 py-2.5">
          <p className="text-[12.5px] leading-relaxed text-[var(--text)]">{confirmDelete}</p>
          <div className="mt-2.5 flex gap-2">
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
    </li>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 16 16" className="size-3 shrink-0 opacity-50" aria-hidden>
      <path
        d="M3 8h9M9 5l3 3-3 3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
