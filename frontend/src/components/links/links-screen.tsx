'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Domain, LinkWithDomain } from '@/lib/types';
import { Button, EmptyState, ErrorText, Input } from '@/components/ui';
import { LinkRow } from '@/components/links/link-row';
import { LinkFormDialog } from '@/components/links/link-form-dialog';

export function LinksScreen({
  initialLinks,
  domains,
  loadError,
}: {
  initialLinks: LinkWithDomain[];
  domains: Domain[];
  loadError: string | null;
}) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [creating, setCreating] = useState(false);
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

  const active = initialLinks.filter((l) => l.is_active).length;

  return (
    <div className="animate-in">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[19px] font-semibold tracking-tight">Links</h1>
          <p className="mt-0.5 text-[13px] text-[var(--text-muted)]">
            <span className="tabular">{initialLinks.length}</span> total,{' '}
            <span className="tabular">{active}</span> active
          </p>
        </div>

        <div className="flex items-center gap-2">
          {initialLinks.length > 0 && (
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter…"
              className="h-9 w-44 py-0 text-[13px]"
              aria-label="Filter links"
            />
          )}
          <Button variant="primary" onClick={() => setCreating(true)}>
            <PlusIcon />
            New link
          </Button>
        </div>
      </div>

      {loadError && (
        <div className="mt-6">
          <ErrorText>Could not load your links: {loadError}</ErrorText>
        </div>
      )}

      <div className="mt-6">
        {initialLinks.length === 0 ? (
          <EmptyState
            title="No links yet"
            description="Create one and you get a short URL you can print as a QR code. The destination behind it stays editable forever."
            action={
              <Button variant="primary" onClick={() => setCreating(true)}>
                Create your first link
              </Button>
            }
          />
        ) : filtered.length === 0 ? (
          <EmptyState title="Nothing matches" description={`No link matches “${query}”.`} />
        ) : (
          <ul className="divide-y divide-[var(--border)] overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--bg-raised)]">
            {filtered.map((link) => (
              <LinkRow
                key={link.id}
                link={link}
                onEdit={() => setEditing(link)}
                onChanged={() => router.refresh()}
              />
            ))}
          </ul>
        )}
      </div>

      {creating && (
        <LinkFormDialog
          mode="create"
          domains={domains}
          onClose={() => setCreating(false)}
          onSaved={() => {
            setCreating(false);
            router.refresh();
          }}
        />
      )}

      {editing && (
        <LinkFormDialog
          mode="edit"
          link={editing}
          domains={domains}
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

function PlusIcon() {
  return (
    <svg viewBox="0 0 16 16" className="size-3.5" aria-hidden>
      <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}
