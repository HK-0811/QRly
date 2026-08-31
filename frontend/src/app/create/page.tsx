import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Screen, Wordmark, GUTTER } from '@/components/chrome';
import { CreateFlow } from '@/components/create/create-flow';
import type { Domain } from '@/lib/types';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Make a QR code' };

export default async function CreatePage({
  searchParams,
}: {
  searchParams: Promise<{ url?: string }>;
}) {
  const { url } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Signed out, RLS returns only the shared platform hostname, which is exactly
  // the list an anonymous code may use. No branch needed.
  const { data: domains } = await supabase
    .from('domains')
    .select('*')
    .eq('is_active', true)
    .order('is_custom');

  return (
    <Screen className="flex min-h-dvh flex-col">
      <header className={`flex items-center justify-between py-6 ${GUTTER}`}>
        <Wordmark />
        {user ? (
          <Link href="/links" className="text-[14px] text-[var(--text-soft)] hover:text-[var(--text)]">
            Your QR codes
          </Link>
        ) : (
          <Link href="/login" className="text-[14px] text-[var(--text-soft)] hover:text-[var(--text)]">
            Sign in
          </Link>
        )}
      </header>

      <div className={`flex flex-1 items-center justify-center py-10 pb-28 ${GUTTER}`}>
        <CreateFlow
          initialUrl={url ?? ''}
          signedIn={Boolean(user)}
          domains={(domains as Domain[] | null) ?? []}
        />
      </div>
    </Screen>
  );
}
