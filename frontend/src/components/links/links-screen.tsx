'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { LinkWithDomain } from '@/lib/types';
import { Badge, EmptyState, ErrorText, Note, Sparkline, buttonClass, cn } from '@/components/ui';
import { LinkRowActions } from '@/components/links/link-row';
import { LinkFormDialog } from '@/components/links/link-form-dialog';
import { ClaimPending } from '@/components/links/claim-pending';

export interface LinkStats {
  /** Newest day last, one entry per day in the window. */
  series: number[];
  total: number;
}

export function LinksScreen({
  initialLinks,
  stats,
  loadError,
}: {
  initialLinks: LinkWithDomain[];
  stats: Record<string, LinkStats>;
  loadError: string | null;
}) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<LinkWithDomain | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return initialLinks;
    return initialLinks.filter(
      (l) =>
        l.slug.toLowerCase().includes(q) ||
        l.destination_url.toLowerCase().includes(q) ||
        (l.title ?? '').toLowerCase().includes(q),
    );
  }, [initialLinks, query]);

  const weekTotal = Object.values(stats).reduce((sum, s) => sum + s.total, 0);

  return (
    <div className="animate-rise">
      <ClaimPending />

      <div className="mb-8 flex flex-wrap items-baseline justify-between gap-4">
        <h1 className="text-[28px] font-semibold tracking-[-0.03em] sm:text-[34px]">Your QR codes</h1>
        <div className="flex items-center gap-4">
          {initialLinks.length > 0 && (
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter…"
              aria-label="Filter links"
              type="search"
              className="h-10 w-36 border-b border-[var(--rule-strong)] bg-transparent text-[13px] placeholder:text-[var(--text-ghost)] transition-colors duration-[var(--dur)] ease-[var(--ease)] hover:border-[var(--rule-ink)] focus:border-[var(--rule-ink)]"
            />
          )}
          <div className="font-mono text-[12px] text-[var(--text-faint)]">
            <span className="tabular">{initialLinks.length}</span>{' '}
            {initialLinks.length === 1 ? 'link' : 'links'} ·{' '}
            <span className="tabular">{weekTotal.toLocaleString('en-US')}</span> scans in 7 days
          </div>
        </div>
      </div>

      {loadError && (
        <div className="mb-6">
          <ErrorText>Could not load your links: {loadError}</ErrorText>
        </div>
      )}

      {initialLinks.length === 0 ? (
        <EmptyState
          title="No QR codes yet"
          description="Make one and you get a short link you can print immediately. The destination behind it stays editable forever — the printed QR code never changes."
          action={
            <Link href="/create" className={buttonClass({ variant: 'primary', size: 'lg' })}>
              Make your first QR code
            </Link>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState title="Nothing matches" description={`No QR code matches “${query}”.`} />
      ) : (
        <div className="border border-[var(--rule-mid)] bg-[var(--bg)]">
          {filtered.map((link) => (
            <Row
              key={link.id}
              link={link}
              stats={stats[link.id]}
              onEdit={() => setEditing(link)}
              onChanged={() => router.refresh()}
            />
          ))}
        </div>
      )}

      {initialLinks.length > 0 && (
        <div className="mt-7">
          <Note>
            Destination changes take up to 60 seconds to reach every edge location, because
            destinations are cached at the edge so scans resolve in milliseconds. It is catching
            up, not broken.
          </Note>
        </div>
      )}

      {editing && (
        <LinkFormDialog
          link={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

function Row({
  link,
  stats,
  onEdit,
  onChanged,
}: {
  link: LinkWithDomain;
  stats?: LinkStats;
  onEdit: () => void;
  onChanged: () => void;
}) {
  const expired = link.expires_at !== null && new Date(link.expires_at) <= new Date();
  const dimmed = !link.is_active || expired;

  return (
    <div
      className={cn(
        'group grid grid-cols-1 items-center gap-x-6 gap-y-4 border-b border-[var(--rule)] px-6 py-5',
        'last:border-b-0 transition-colors duration-[var(--dur)] ease-[var(--ease)]',
        'hover:bg-[var(--accent-tint)]',
        'lg:grid-cols-[minmax(0,1fr)_150px_110px_auto]',
      )}
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-3">
          {/* The whole identity is the link to the detail page — one target, and
              a big one, rather than a small "open" affordance at the end. */}
          <Link
            href={`/links/${link.id}`}
            className={cn(
              'inline-flex min-h-[28px] items-center font-mono text-[16px]',
              'transition-colors duration-[var(--dur)] ease-[var(--ease)] hover:text-[var(--accent)]',
              dimmed ? 'text-[var(--text-faint)]' : 'text-[var(--text)]',
            )}
          >
            {link.domains?.hostname ?? '—'}/{link.slug}
          </Link>

          {!link.is_active && <Badge>Off</Badge>}
          {expired && <Badge>Expired</Badge>}
          {link.safe_browsing_status === 'flagged' && <Badge tone="bad">Flagged</Badge>}
          {link.domains?.is_custom && <Badge tone="live">Custom</Badge>}
        </div>

        <p className="mt-1.5 truncate text-[14px] text-[var(--text-soft)]">
          {link.title && <span className="text-[var(--text-muted)]">{link.title} </span>}
          <span className="text-[var(--text-ghost)]">→</span> {link.destination_url}
        </p>
      </div>

      {stats && stats.total > 0 ? (
        <Sparkline values={stats.series} className="hidden lg:flex" />
      ) : (
        <div className="hidden lg:block" />
      )}

      <div className="lg:text-right">
        <div
          className={cn(
            'numeral text-[20px] transition-colors duration-[var(--dur)] ease-[var(--ease)]',
            stats && stats.total > 0 ? 'group-hover:text-[var(--accent)]' : 'text-[var(--text-ghost)]',
          )}
        >
          {stats ? stats.total.toLocaleString('en-US') : '—'}
        </div>
        <div className="mt-0.5 text-[11px] text-[var(--text-faint)]">7-day scans</div>
      </div>

      <LinkRowActions link={link} onEdit={onEdit} onChanged={onChanged} />
    </div>
  );
}
