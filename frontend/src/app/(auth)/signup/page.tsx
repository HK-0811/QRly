'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { pendingLinks, type PendingLink } from '@/lib/anon';
import { Button, ErrorText, Field, Input, InlineLink, buttonClass } from '@/components/ui';

function SignupForm() {
  const router = useRouter();
  const params = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [pending, setPending] = useState<PendingLink[]>([]);

  // Read after mount: localStorage does not exist during the server render.
  useEffect(() => setPending(pendingLinks()), []);

  const claiming = params.get('claim') === '1' && pending.length > 0;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (password.length < 8) {
      setError('Use at least 8 characters.');
      return;
    }

    setBusy(true);
    setError(null);

    // See the note in login/page.tsx: createClient() can throw, and without the
    // finally the button spins with nothing on screen to explain why.
    try {
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
        return;
      }

      // With email confirmation on, signUp returns a user but no session. Sending
      // them to the dashboard here would bounce them straight back to /login with
      // no explanation. The claim happens on /links either way — see ClaimPending.
      if (data.session) {
        router.push('/links');
        router.refresh();
      } else {
        setNeedsConfirmation(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not reach the sign-up service.');
    } finally {
      setBusy(false);
    }
  }

  if (needsConfirmation) {
    return (
      <div className="border border-[var(--rule-mid)] bg-[var(--bg)] p-7">
        <h1 className="text-[24px] font-semibold tracking-[-0.03em]">Check your email</h1>
        <p className="mt-2.5 text-[14px] leading-relaxed text-[var(--text-muted)]">
          We sent a confirmation link to <span className="text-[var(--text)]">{email}</span>. Open
          it to finish setting up your account.
        </p>
        {pending.length > 0 && (
          <p className="mt-4 text-[13px] leading-relaxed text-[var(--text-faint)]">
            Open it in <strong className="font-medium">this browser</strong>. The{' '}
            {pending.length === 1 ? 'QR code you made' : `${pending.length} QR codes you made`} before
            signing up {pending.length === 1 ? 'is' : 'are'} remembered here, and that is where
            they get attached to your account.
          </p>
        )}
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
      {claiming && (
        <div className="mb-6 border-l-2 border-[var(--accent)] bg-[var(--accent-wash)] py-3 pl-4 pr-3">
          <p className="text-[13px] leading-relaxed text-[var(--text-muted)]">
            Signing up keeps{' '}
            <span className="font-mono text-[var(--text)]">
              {pending.at(-1)!.shortUrl.replace(/^https?:\/\//, '')}
            </span>
            {pending.length > 1 && ` and ${pending.length - 1} more`}. The printed QR code never
            changes — an account is what lets you re-point it and read its scans.
          </p>
        </div>
      )}

      <h1 className="text-[24px] font-semibold tracking-[-0.03em]">
        {claiming ? 'Claim your QR code' : 'Create an account'}
      </h1>
      <p className="mt-1.5 text-[14px] text-[var(--text-muted)]">Free. No card, no trial timer.</p>

      <form onSubmit={onSubmit} className="mt-8 space-y-6">
        <Field label="Name" htmlFor="name" hint="Optional.">
          <Input
            id="name"
            variant="ruled"
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
            variant="ruled"
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
            variant="ruled"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>

        {error && <ErrorText>{error}</ErrorText>}

        <Button type="submit" variant="primary" size="lg" loading={busy} className="w-full">
          {claiming ? 'Create account and claim' : 'Create account'}
        </Button>
      </form>

      <p className="mt-6 text-center text-[13.5px] text-[var(--text-muted)]">
        Already have one?{' '}
        <InlineLink href="/login">
          Sign in
        </InlineLink>
      </p>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupForm />
    </Suspense>
  );
}
