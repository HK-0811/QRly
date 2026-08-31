import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { createClient } from '@/lib/supabase/server';
import { SignOutButton } from '@/components/sign-out-button';
import { NavLink } from '@/components/nav-link';
import { Screen, Wordmark, GUTTER } from '@/components/chrome';
import { buttonClass } from '@/components/ui';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // The middleware already redirects, but a server component that renders on the
  // assumption of a user and gets null is a crash, not a redirect.
  if (!user) redirect('/login');

  return (
    <Screen>
      <header
        className={`sticky top-0 z-20 flex items-center justify-between gap-6 border-b border-[var(--rule-mid)] bg-[var(--bg)]/85 py-4 backdrop-blur-md ${GUTTER}`}
      >
        <div className="flex min-w-0 items-center gap-6 lg:gap-10">
          <Wordmark href="/links" size={14} />
          <nav className="-mx-1 flex min-w-0 items-center gap-5 overflow-x-auto text-[14px]">
            <NavLink href="/links">Links</NavLink>
            <NavLink href="/analytics">Analytics</NavLink>
            <NavLink href="/domains">Domains</NavLink>
            <NavLink href="/settings">Settings</NavLink>
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-4">
          <span
            className="hidden font-mono text-[13px] text-[var(--text-faint)] lg:block"
            title={user.email ?? ''}
          >
            {user.email}
          </span>
          <SignOutButton />
          <Link href="/create" className={buttonClass({ variant: 'primary', size: 'sm' })}>
            New QR code
          </Link>
        </div>
      </header>

      <main className={`mx-auto max-w-[1240px] py-12 pb-28 ${GUTTER}`}>{children}</main>
    </Screen>
  );
}
