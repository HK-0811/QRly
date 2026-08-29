import { createClient } from '@/lib/supabase/server';
import { DomainsScreen } from '@/components/domains/domains-screen';
import type { Domain } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function DomainsPage() {
  const supabase = await createClient();

  // RLS returns this account's custom domains plus the shared platform ones.
  const { data } = await supabase
    .from('domains')
    .select('*')
    .order('is_custom')
    .order('created_at', { ascending: false });

  const all = (data as Domain[] | null) ?? [];
  const platform = all.find((d) => !d.is_custom);

  return (
    <DomainsScreen
      domains={all.filter((d) => d.is_custom)}
      platformHostname={platform?.hostname ?? 'localhost:8787'}
      // Surfaced from the client so the UI can say plainly that certificates
      // cannot be issued yet, rather than letting verification fail mysteriously.
      cloudflareConfigured={process.env.NEXT_PUBLIC_CLOUDFLARE_CONFIGURED === 'true'}
    />
  );
}
