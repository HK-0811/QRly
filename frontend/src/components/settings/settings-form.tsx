'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/lib/types';
import { Button, Card, ErrorText, Field, Input, Note } from '@/components/ui';

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

    const { error } = await createClient()
      .from('profiles')
      .update({
        display_name: displayName.trim() || null,
        retention_days: Math.min(3650, Math.max(1, Math.round(retention))),
      })
      .eq('id', profile?.id ?? '');

    if (error) setError(error.message);
    else {
      setSaved(true);
      router.refresh();
    }
    setBusy(false);
  }

  return (
    <Card className="p-5">
      <h2 className="text-[14px] font-semibold tracking-tight">Account</h2>

      <div className="mt-4 space-y-5">
        <Field label="Display name" htmlFor="name" hint="Only used to address you.">
          <Input id="name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
        </Field>

        <div>
          <label className="block text-[13px] font-medium">Keep scan history for</label>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.days}
                type="button"
                onClick={() => setRetention(p.days)}
                aria-pressed={retention === p.days}
                className={
                  'rounded-md border px-2.5 py-1.5 text-[12.5px] font-medium transition-colors ' +
                  (retention === p.days
                    ? 'border-accent-600 bg-accent-500/10 text-[var(--text)]'
                    : 'border-[var(--border-strong)] text-[var(--text-muted)] hover:text-[var(--text)]')
                }
              >
                {p.label}
              </button>
            ))}
            <Input
              type="number"
              min={1}
              max={3650}
              value={retention}
              onChange={(e) => setRetention(Number(e.target.value))}
              className="h-8 w-24 py-0 text-[12.5px]"
              aria-label="Retention in days"
            />
            <span className="text-[12.5px] text-[var(--text-muted)]">days</span>
          </div>

          <Note tone="warn" title="This deletes data, permanently and nightly">
            A scheduled job runs every night and removes scan events older than this window.
            Shortening it will delete history you already have &mdash; there is no undo and no
            backup, because keeping one would defeat the point of a retention setting. Your
            links and QR codes are never touched; only the scan history behind them is.
            {scanCount > 0 && (
              <>
                {' '}
                You currently have <span className="tabular">{scanCount.toLocaleString()}</span>{' '}
                stored scans.
              </>
            )}
          </Note>
        </div>

        <ErrorText>{error}</ErrorText>

        <div className="flex items-center gap-3">
          <Button variant="primary" loading={busy} onClick={save}>
            Save
          </Button>
          {saved && <span className="text-[12.5px] text-accent-600 dark:text-accent-400">Saved</span>}
        </div>
      </div>
    </Card>
  );
}
