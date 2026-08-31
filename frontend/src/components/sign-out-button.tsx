'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/components/ui';

export function SignOutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  return (
    <button
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        await createClient().auth.signOut();
        router.push('/login');
        router.refresh();
      }}
      className={cn(
        'inline-flex min-h-[40px] items-center whitespace-nowrap text-[13px] text-[var(--text-faint)]',
        'transition-colors duration-[var(--dur)] ease-[var(--ease)]',
        'hover:text-[var(--text)] disabled:opacity-50',
      )}
    >
      Sign out
    </button>
  );
}
