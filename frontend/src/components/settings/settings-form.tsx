'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/lib/types';
import { Button, ErrorText, Input, Note, chipClass } from '@/components/ui';

const PRESETS = [
  { days: 30, label: '30 days' },
  { days: 90, label: '90 days' },
  { days: 365, label: '1 year' },
  { days: 730, label: '2 years' },
];

export function SettingsForm({ profile, scanCount }: { profile: Profile | null; scanCount: number }) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(profile?.display_name ?? '');
  const [retention, setRetention] = useState(profile?.retention_days ?? 365);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setBusy(true);
    setError(null);
    setSaved(false);

    try {
      const { error } = await createClient()
        .from('profiles')
        .update({
          display_name: displayName.trim() || null,
          retention_days: Math.min(3650, Math.max(1, Math.round(retention))),
        })
        .eq('id', profile?.id ?? '');

      if (error) {
        setError(error.message);
        return;
      }
      setSaved(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="border border-[var(--rule-mid)]">
      <section className="border-b border-[var(--rule)] p-7">
        <div className="eyebrow mb-5">Account</div>
        <label htmlFor="name" className="mb-2 block text-[13px] text-[var(--text-muted)]">
          Display name
        </label>
        <Input
          id="name"
          variant="ruled"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Alex"
        />
        <p className="mt-2 text-[12px] text-[var(--text-faint)]">Only used to address you.</p>
      </section>

      <section className="border-b border-[var(--rule)] p-7">
        <div className="eyebrow mb-5">Keep scan history for</div>

        <div className="flex flex-wrap items-center gap-2.5">
          {PRESETS.map((p) => (
            <button
              key={p.days}
              type="button"
              onClick={() => setRetention(p.days)}
              aria-pressed={retention === p.days}
              className={chipClass(retention === p.days)}
            >
              {p.label}
            </button>
          ))}
          <input
            type="number"
            min={1}
            max={3650}
            value={retention}
            onChange={(e) => setRetention(Number(e.target.value))}
            className="h-10 w-24 border border-[var(--rule-strong)] px-2.5 font-mono text-[13px] transition-colors duration-[var(--dur)] ease-[var(--ease)] hover:border-[var(--rule-ink)] focus:border-[var(--rule-ink)]"
            aria-label="Retention in days"
          />
          <span className="text-[13px] text-[var(--text-faint)]">days</span>
        </div>

        <div className="mt-6">
          <Note tone="warn" title="This deletes data, permanently and nightly">
            A scheduled job runs every night and removes scan events older than this window.
            Shortening it will delete history you already have — there is no undo and no backup,
            because keeping one would defeat the point of a retention setting. Your links and QR
            QR codes are never touched; only the scan history behind them is.
            {scanCount > 0 && (
              <>
                {' '}
                You currently have{' '}
                <span className="tabular font-medium text-[var(--text)]">
                  {scanCount.toLocaleString('en-US')}
                </span>{' '}
                stored scans.
              </>
            )}
          </Note>
        </div>
      </section>

      <div className="flex items-center gap-4 p-7">
        <Button variant="primary" loading={busy} onClick={save}>
          Save
        </Button>
        {saved && <span className="text-[13px] text-[var(--accent)]">Saved</span>}
        {error && (
          <div className="flex-1">
            <ErrorText>{error}</ErrorText>
          </div>
        )}
      </div>
    </div>
  );
}
