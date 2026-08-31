'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button, ErrorText, Field, Input, InlineLink } from '@/components/ui';

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get('next') || '/links';
  const linkExpired = params.get('error') === 'link_expired';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(
    linkExpired ? 'That link has expired or was already used. Sign in, or request a new one.' : null,
  );
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    // try/finally, not a bare await: createClient() throws outright when the
    // NEXT_PUBLIC_SUPABASE_* build variables are missing, and without this the
    // throw escaped the handler, leaving the button spinning forever with no
    // message. That failure cost an afternoon once.
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        // Supabase returns the same message for a wrong password and an unknown
        // address, which is correct — telling them apart is an account-enumeration
        // oracle. Passing it through unchanged keeps that property.
        setError(error.message);
        return;
      }

      router.push(next);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not reach the sign-in service. Try again.',
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="border border-[var(--rule-mid)] bg-[var(--bg)] p-7">
      <h1 className="text-[24px] font-semibold tracking-[-0.03em]">Sign in</h1>
      <p className="mt-1.5 text-[14px] text-[var(--text-muted)]">
        Manage your QR codes and see where they get scanned.
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

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label htmlFor="password" className="eyebrow">
              Password
            </label>
            {/* -my-2 keeps the 32px target from pushing the label off the
                baseline it shares with the field below. */}
            <Link
              href="/forgot-password"
              className="-my-2 inline-flex min-h-[32px] items-center text-[12px] text-[var(--text-faint)] transition-colors duration-[var(--dur)] ease-[var(--ease)] hover:text-[var(--accent)]"
            >
              Forgot?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            variant="ruled"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && <ErrorText>{error}</ErrorText>}

        <Button type="submit" variant="primary" size="lg" loading={busy} className="w-full">
          Sign in
        </Button>
      </form>

      <p className="mt-6 text-center text-[13.5px] text-[var(--text-muted)]">
        No account?{' '}
        <InlineLink href="/signup">
          Create one
        </InlineLink>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
