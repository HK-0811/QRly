'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button, Card, ErrorText, Field, Input } from '@/components/ui';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });

    if (error) {
      setError(error.message);
      setBusy(false);
      return;
    }

    // Confirmed regardless of whether the address exists. Saying "no such
    // account" here would turn this form into an account-enumeration oracle.
    setSent(true);
    setBusy(false);
  }

  if (sent) {
    return (
      <Card className="p-6">
        <h1 className="text-[17px] font-semibold tracking-tight">Check your email</h1>
        <p className="mt-2 text-[13px] leading-relaxed text-[var(--text-muted)]">
          If an account exists for <span className="text-[var(--text)]">{email}</span>, a reset link
          is on its way.
        </p>
        <Link href="/login" className="mt-5 block">
          <Button className="w-full">Back to sign in</Button>
        </Link>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h1 className="text-[17px] font-semibold tracking-tight">Reset your password</h1>
      <p className="mt-1 text-[13px] text-[var(--text-muted)]">
        We&rsquo;ll email you a link to set a new one.
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <Field label="Email" htmlFor="email">
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </Field>

        <ErrorText>{error}</ErrorText>

        <Button type="submit" variant="primary" loading={busy} className="w-full">
          Send reset link
        </Button>
      </form>

      <p className="mt-5 text-center text-[13px] text-[var(--text-muted)]">
        <Link href="/login" className="font-medium text-[var(--text)] hover:underline">
          Back to sign in
        </Link>
      </p>
    </Card>
  );
}
