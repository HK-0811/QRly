import type { ReactNode } from 'react';
import { Screen, Wordmark } from '@/components/chrome';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <Screen className="flex min-h-dvh flex-col items-center justify-center px-6 py-14">
      {/* Mark first, then the form. Two beats, not one block — the wordmark is
          what tells you which product is asking for a password. */}
      <div className="stagger w-full max-w-[400px]">
        <div className="mb-10" style={{ ['--i' as string]: 0 }}>
          <Wordmark />
        </div>
        <div style={{ ['--i' as string]: 1 }}>{children}</div>
      </div>
      <p
        className="animate-rise mt-12 max-w-[400px] text-center text-[12px] leading-relaxed text-[var(--text-faint)]"
        style={{ animationDelay: '160ms' }}
      >
        Dynamic QR codes and short links, running entirely on free tiers.
      </p>
    </Screen>
  );
}
