'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button, ErrorText, Field, Input, InlineLink, buttonClass } from '@/components/ui';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    // See the note in login/page.tsx for why this is wrapped.
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
      });

      if (error) {
        setError(error.message);
        return;
      }

      // Confirmed regardless of whether the address exists. Saying "no such
      // account" here would turn this form into an account-enumeration oracle.
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not reach the service. Try again.');
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <div className="border border-[var(--rule-mid)] bg-[var(--bg)] p-7">
        <h1 className="text-[24px] font-semibold tracking-[-0.03em]">Check your email</h1>
        <p className="mt-2.5 text-[14px] leading-relaxed text-[var(--text-muted)]">
          If an account exists for <span className="text-[var(--text)]">{email}</span>, a reset link
          is on its way.
        </p>
        <Link
          href="/login"
          className={buttonClass({ variant: 'secondary', className: 'mt-6 w-full' })}
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="border border-[var(--rule-mid)] bg-[var(--bg)] p-7">
      <h1 className="text-[24px] font-semibold tracking-[-0.03em]">Reset your password</h1>
      <p className="mt-1.5 text-[14px] text-[var(--text-muted)]">
        We&rsquo;ll email you a link to set a new one.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-6">
        <Field label="Email" htmlFor="email">
          <Input
            id="email"
            type="email"
            variant="ruled"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </Field>

        {error && <ErrorText>{error}</ErrorText>}

        <Button type="submit" variant="primary" size="lg" loading={busy} className="w-full">
          Send reset link
        </Button>
      </form>

      <p className="mt-6 text-center text-[13.5px]">
        <InlineLink href="/login">
          Back to sign in
        </InlineLink>
      </p>
    </div>
  );
}
