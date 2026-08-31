'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button, ErrorText, Field, Input, InlineLink } from '@/components/ui';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);

  // Arriving here without a recovery session means the link expired or was
  // already used. Showing the form anyway would fail confusingly on submit.
  useEffect(() => {
    try {
      const supabase = createClient();
      supabase.auth
        .getSession()
        .then(({ data }) => {
          if (data.session) setReady(true);
          else setError('This reset link has expired or was already used. Request a new one.');
        })
        .catch(() => setError('Could not verify this link. Request a new one.'));
    } catch {
      setError('Could not reach the sign-in service.');
    }
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) return setError('Use at least 8 characters.');
    if (password !== confirm) return setError('The two passwords do not match.');

    setBusy(true);
    setError(null);

    // See the note in login/page.tsx for why this is wrapped.
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        setError(error.message);
        return;
      }

      router.push('/links');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update the password.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="border border-[var(--rule-mid)] bg-[var(--bg)] p-7">
      <h1 className="text-[24px] font-semibold tracking-[-0.03em]">Set a new password</h1>

      <form onSubmit={onSubmit} className="mt-8 space-y-6">
        <Field label="New password" htmlFor="password" hint="At least 8 characters.">
          <Input
            id="password"
            type="password"
            variant="ruled"
            autoComplete="new-password"
            required
            disabled={!ready}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>

        <Field label="Confirm password" htmlFor="confirm">
          <Input
            id="confirm"
            type="password"
            variant="ruled"
            autoComplete="new-password"
            required
            disabled={!ready}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </Field>

        {error && <ErrorText>{error}</ErrorText>}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={busy}
          disabled={!ready}
          className="w-full"
        >
          Update password
        </Button>
      </form>

      {!ready && (
        <p className="mt-6 text-center text-[13.5px]">
          <InlineLink href="/forgot-password">
            Request a new link
          </InlineLink>
        </p>
      )}
    </div>
  );
}
