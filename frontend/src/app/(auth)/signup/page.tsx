'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button, Card, ErrorText, Field, Input } from '@/components/ui';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (password.length < 8) {
      setError('Use at least 8 characters.');
      return;
    }

    setBusy(true);
    setError(null);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        // Read by the handle_new_user trigger to seed profiles.display_name.
        data: { display_name: displayName.trim() || undefined },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setBusy(false);
      return;
    }

    // With email confirmation on, signUp returns a user but no session. Sending
    // them to the dashboard here would bounce them straight back to /login with
    // no explanation.
    if (data.session) {
      router.push('/links');
      router.refresh();
    } else {
      setNeedsConfirmation(true);
      setBusy(false);
    }
  }

  if (needsConfirmation) {
    return (
      <Card className="p-6">
        <h1 className="text-[17px] font-semibold tracking-tight">Check your email</h1>
        <p className="mt-2 text-[13px] leading-relaxed text-[var(--text-muted)]">
          We sent a confirmation link to <span className="text-[var(--text)]">{email}</span>. Open it
          to finish setting up your account.
        </p>
        <Link href="/login" className="mt-5 block">
          <Button className="w-full">Back to sign in</Button>
        </Link>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h1 className="text-[17px] font-semibold tracking-tight">Create an account</h1>
      <p className="mt-1 text-[13px] text-[var(--text-muted)]">Free. No card, no trial timer.</p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <Field label="Name" htmlFor="name" hint="Optional.">
          <Input
            id="name"
            autoComplete="name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Alex"
          />
        </Field>

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

        <Field label="Password" htmlFor="password" hint="At least 8 characters.">
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>

        <ErrorText>{error}</ErrorText>

        <Button type="submit" variant="primary" loading={busy} className="w-full">
          Create account
        </Button>
      </form>

      <p className="mt-5 text-center text-[13px] text-[var(--text-muted)]">
        Already have one?{' '}
        <Link href="/login" className="font-medium text-[var(--text)] hover:underline">
          Sign in
        </Link>
      </p>
    </Card>
  );
}
