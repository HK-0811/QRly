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
        // The active item is marked by an accent rule under it rather than a
        // filled pill: nothing else in this design is a filled pill, and one
        // here would read as a button.
        //
        // The rule is a pseudo-free child element instead of a border so it can
        // grow from the left on hover. A border can only appear, and an
        // underline that blinks into existence reads as a rendering glitch.
        'group relative inline-flex min-h-[40px] items-center whitespace-nowrap',
        'transition-colors duration-[var(--dur)] ease-[var(--ease)]',
        active ? 'text-[var(--text)]' : 'text-[var(--text-faint)] hover:text-[var(--text)]',
      )}
    >
      {children}
      <span
        aria-hidden
        className={cn(
          'absolute inset-x-0 bottom-[6px] h-[1.5px] origin-left bg-[var(--accent)]',
          'transition-transform duration-[var(--dur-slow)] ease-[var(--ease)]',
          active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100',
        )}
      />
    </Link>
  );
}
