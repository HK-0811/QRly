'use client';

import { useEffect, useRef, useState } from 'react';
import { api, ApiError } from '@/lib/api';
import type { LinkWithDomain } from '@/lib/types';
import { Button, ErrorText, Field, Input, Note } from '@/components/ui';

/**
 * Editing only. Creation lives at /create, which is the same screen a signed-out
 * visitor uses — one implementation of "make a code", not two that drift.
 *
 * Slug and domain are absent rather than disabled: they are immutable in the
 * database, and a greyed-out field invites someone to look for the way to enable
 * it.
 */
export function LinkFormDialog({
  link,
  onClose,
  onSaved,
}: {
  link: LinkWithDomain;
  onClose: () => void;
  onSaved: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const [destination, setDestination] = useState(link.destination_url);
  const [title, setTitle] = useState(link.title ?? '');
  const [expiresAt, setExpiresAt] = useState(
    link.expires_at ? toLocalInputValue(link.expires_at) : '',
  );
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const el = dialogRef.current;
    if (el && !el.open) el.showModal();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    try {
      await api.updateLink(link.id, {
        destination_url: destination,
        title: title.trim() || null,
        expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
      });
      onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(e) => {
        // Clicking the backdrop closes. The dialog element reports backdrop
        // clicks as clicks on itself, so compare the target.
        if (e.target === dialogRef.current) dialogRef.current?.close();
      }}
      className="m-auto w-[min(540px,calc(100vw-2rem))] border border-[var(--rule-ink)] bg-[var(--bg)] p-0 text-[var(--text)] backdrop:bg-[rgba(10,10,10,0.4)] backdrop:backdrop-blur-[2px]"
    >
      <form onSubmit={submit} className="p-7">
        <div className="eyebrow mb-2">Edit</div>
        <h2 className="font-mono text-[19px] tracking-[-0.02em]">
          {link.domains?.hostname}/{link.slug}
        </h2>

        <div className="mt-7 space-y-6">
          <Field
            label="Destination URL"
            htmlFor="destination"
            hint="Where the QR code sends people. Changing this reprints nothing — the QR code itself stays exactly as it is."
          >
            <Input
              id="destination"
              required
              autoFocus
              variant="ruled"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="https://example.com/spring-menu"
            />
          </Field>

          <Field label="Label" htmlFor="title" hint="Only you see this. Optional.">
            <Input
              id="title"
              variant="ruled"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Café table tents"
            />
          </Field>

          <Field
            label="Expires"
            htmlFor="expires"
            hint="After this, the QR code shows an expired page instead of redirecting. Optional."
          >
            <Input
              id="expires"
              variant="ruled"
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
            />
          </Field>

          <Note tone="warn" title="Changes take up to 60 seconds to reach every location">
            Destinations are cached at Cloudflare&rsquo;s edge so a scan resolves in milliseconds
            instead of making a round trip to the database. That cache is eventually consistent:
            for up to a minute, someone scanning in a different part of the world may still land on
            the old destination. It is not broken — it is catching up.
          </Note>

          {error && <ErrorText>{error}</ErrorText>}
        </div>

        <div className="mt-7 flex justify-end gap-3 border-t border-[var(--rule)] pt-5">
          <Button type="button" variant="ghost" onClick={() => dialogRef.current?.close()}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={busy}>
            Save changes
          </Button>
        </div>
      </form>
    </dialog>
  );
}

/** datetime-local wants a local `YYYY-MM-DDTHH:mm`, not an ISO UTC string. */
function toLocalInputValue(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(
    d.getMinutes(),
  )}`;
}
