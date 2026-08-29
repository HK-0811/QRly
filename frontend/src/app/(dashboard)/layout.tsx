import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { createClient } from '@/lib/supabase/server';
import { SignOutButton } from '@/components/sign-out-button';
import { NavLink } from '@/components/nav-link';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // The middleware already redirects, but a server component that renders on the
  // assumption of a user and gets null is a crash, not a redirect.
  if (!user) redirect('/login');

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[var(--bg)]/85 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4 sm:px-6">
          <Link href="/links" className="flex items-center gap-2 shrink-0">
            <Mark />
            <span className="text-[15px] font-semibold tracking-tight">QRly</span>
          </Link>

          <nav className="flex items-center gap-0.5">
            <NavLink href="/links">Links</NavLink>
            <NavLink href="/analytics">Analytics</NavLink>
            <NavLink href="/domains">Domains</NavLink>
            <NavLink href="/settings">Settings</NavLink>
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <span
              className="hidden text-[12.5px] text-[var(--text-muted)] sm:block"
              title={user.email ?? ''}
            >
              {user.email}
            </span>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}

function Mark() {
  return (
    <svg viewBox="0 0 24 24" className="size-[22px]" aria-hidden>
      <rect x="1" y="1" width="9" height="9" rx="1.5" className="fill-none stroke-current" strokeWidth="2" />
      <rect x="14" y="1" width="9" height="9" rx="1.5" className="fill-none stroke-current" strokeWidth="2" />
      <rect x="1" y="14" width="9" height="9" rx="1.5" className="fill-none stroke-current" strokeWidth="2" />
      <rect x="14.5" y="14.5" width="3.5" height="3.5" className="fill-accent-500" />
      <rect x="19.5" y="19.5" width="3.5" height="3.5" className="fill-accent-500" />
      <rect x="14.5" y="19.5" width="3.5" height="3.5" className="fill-current opacity-40" />
      <rect x="19.5" y="14.5" width="3.5" height="3.5" className="fill-current opacity-40" />
    </svg>
  );
}
