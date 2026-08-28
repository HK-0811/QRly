'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button, Card, ErrorText, Field, Input } from '@/components/ui';

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get('next') || '/links';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });

    if (error) {
      // Supabase returns the same message for a wrong password and an unknown
      // address, which is correct — telling them apart is an account-enumeration
      // oracle. Passing it through unchanged keeps that property.
      setError(error.message);
      setBusy(false);
      return;
    }

    router.push(next);
    router.refresh();
  }

  return (
    <Card className="p-6">
      <h1 className="text-[17px] font-semibold tracking-tight">Sign in</h1>
      <p className="mt-1 text-[13px] text-[var(--text-muted)]">
        Manage your links and see where your codes get scanned.
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

        <div className="space-y-1.5">
          <div className="flex items-baseline justify-between">
            <label htmlFor="password" className="block text-[13px] font-medium">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-[12px] text-[var(--text-muted)] hover:text-[var(--text)]"
            >
              Forgot?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <ErrorText>{error}</ErrorText>

        <Button type="submit" variant="primary" loading={busy} className="w-full">
          Sign in
        </Button>
      </form>

      <p className="mt-5 text-center text-[13px] text-[var(--text-muted)]">
        No account?{' '}
        <Link href="/signup" className="font-medium text-[var(--text)] hover:underline">
          Create one
        </Link>
      </p>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
