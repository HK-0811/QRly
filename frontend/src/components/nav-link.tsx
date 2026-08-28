'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { cn } from '@/components/ui';

export function NavLink({ href, children }: { href: string; children: ReactNode }) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'rounded-md px-2.5 py-1.5 text-[13.5px] font-medium transition-colors',
        active
          ? 'bg-[var(--bg-subtle)] text-[var(--text)]'
          : 'text-[var(--text-muted)] hover:text-[var(--text)]',
      )}
    >
      {children}
    </Link>
  );
}
