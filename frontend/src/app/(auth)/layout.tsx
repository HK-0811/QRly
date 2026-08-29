import Link from 'next/link';
import type { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-[380px] animate-in">
        <Link href="/" className="mb-8 flex items-center gap-2">
          <Mark />
          <span className="text-[15px] font-semibold tracking-tight">QRly</span>
        </Link>
        {children}
      </div>
      <p className="mt-10 max-w-[380px] text-center text-[12px] leading-relaxed text-[var(--text-faint)]">
        Dynamic QR codes and short links, running entirely on free tiers.
      </p>
    </div>
  );
}

function Mark() {
  return (
    <svg viewBox="0 0 24 24" className="size-6" aria-hidden>
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
