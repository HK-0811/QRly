'use client';

import { useEffect, useRef, useState } from 'react';
import { api, ApiError } from '@/lib/api';
import type { Domain, LinkWithDomain } from '@/lib/types';
import { Button, ErrorText, Field, Input, Note } from '@/components/ui';

type Props = {
  domains: Domain[];
  onClose: () => void;
  onSaved: () => void;
} & ({ mode: 'create'; link?: undefined } | { mode: 'edit'; link: LinkWithDomain });

export function LinkFormDialog({ mode, link, domains, onClose, onSaved }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const [destination, setDestination] = useState(link?.destination_url ?? '');
  const [title, setTitle] = useState(link?.title ?? '');
  const [slug, setSlug] = useState('');
  const [domainId, setDomainId] = useState(link?.domain_id ?? domains[0]?.id ?? '');
  const [expiresAt, setExpiresAt] = useState(
    link?.expires_at ? toLocalInputValue(link.expires_at) : '',
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
      if (mode === 'create') {
        await api.createLink({
          destination_url: destination,
          title: title.trim() || undefined,
          slug: slug.trim() || undefined,
          domain_id: domainId || undefined,
          expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
        });
      } else {
        await api.updateLink(link.id, {
          destination_url: destination,
          title: title.trim() || null,
          expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
        });
      }
      onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong.');
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
      className="m-auto w-[min(520px,calc(100vw-2rem))] rounded-xl border border-[var(--border)] bg-[var(--bg-raised)] p-0 text-[var(--text)] shadow-2xl backdrop:bg-black/40 backdrop:backdrop-blur-[2px]"
    >
      <form onSubmit={submit} className="p-5">
        <h2 className="text-[16px] font-semibold tracking-tight">
          {mode === 'create' ? 'New link' : 'Edit link'}
        </h2>
        {mode === 'edit' && (
          <p className="mt-0.5 font-mono text-[12.5px] text-[var(--text-muted)]">
            {link.domains?.hostname}/{link.slug}
          </p>
        )}

        <div className="mt-5 space-y-4">
          <Field
            label="Destination URL"
            htmlFor="destination"
            hint="Where the code sends people. You can change this any time without reprinting."
          >
            <Input
              id="destination"
              required
              autoFocus
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="https://example.com/spring-menu"
            />
          </Field>

          <Field label="Label" htmlFor="title" hint="Only you see this. Optional.">
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Café table tents"
            />
          </Field>

          {mode === 'create' && (
            <>
              {domains.length > 1 && (
                <Field label="Domain" htmlFor="domain">
                  <select
                    id="domain"
                    value={domainId}
                    onChange={(e) => setDomainId(e.target.value)}
                    className="w-full rounded-md border border-[var(--border-strong)] bg-[var(--bg-raised)] px-3 py-2 text-sm"
                  >
                    {domains.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.hostname}
                        {d.is_custom ? '' : ' (shared)'}
                      </option>
                    ))}
                  </select>
                </Field>
              )}

              <Field
                label="Custom short code"
                htmlFor="slug"
                hint="Leave empty for a generated one. Letters, numbers, hyphens and underscores."
              >
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="spring-menu"
                  className="font-mono"
                />
              </Field>
            </>
          )}

          <Field
            label="Expires"
            htmlFor="expires"
            hint="After this, the code shows an expired page instead of redirecting. Optional."
          >
            <Input
              id="expires"
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
            />
          </Field>

          {mode === 'edit' && (
            <Note tone="warn" title="Changes take up to 60 seconds to reach every location">
              Destinations are cached at Cloudflare&rsquo;s edge so a scan resolves in
              milliseconds instead of making a round trip to the database. That cache is
              eventually consistent: for up to a minute, someone scanning in a different part
              of the world may still land on the old destination. It is not broken — it is
              catching up.
            </Note>
          )}

          {mode === 'create' && (
            <Note title="The short code is permanent">
              Once you print a QR code, its hostname and short code can never change &mdash;
              every printed copy would break. Only the destination stays editable.
            </Note>
          )}

          <ErrorText>{error}</ErrorText>
        </div>

        <div className="mt-5 flex justify-end gap-2 border-t border-[var(--border)] pt-4">
          <Button type="button" variant="ghost" onClick={() => dialogRef.current?.close()}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={busy}>
            {mode === 'create' ? 'Create link' : 'Save changes'}
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
