'use client';

import { createBrowserClient } from '@supabase/ssr';

/**
 * Browser Supabase client. Carries the anon key, which is safe to ship: every
 * table it can reach is behind RLS keyed on auth.uid().
 *
 * Reads go through this client directly (architecture.md §1). Writes to links go
 * through the Worker instead, because the Worker owns KV cache invalidation.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
