import { createClient } from '@/lib/supabase/server';
import { LinksScreen } from '@/components/links/links-screen';
import type { Domain, LinkWithDomain } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function LinksPage() {
  const supabase = await createClient();

  // Read directly from Postgres with the user's own JWT. RLS scopes this to their
  // rows, so there is no proxy layer to write and nothing to get wrong in one.
  const [{ data: links, error }, { data: domains }] = await Promise.all([
    supabase
      .from('links')
      .select('*, domains(hostname, is_custom)')
      .order('created_at', { ascending: false }),
    supabase.from('domains').select('*').eq('is_active', true).order('is_custom'),
  ]);

  return (
    <LinksScreen
      initialLinks={(links as LinkWithDomain[] | null) ?? []}
      domains={(domains as Domain[] | null) ?? []}
      loadError={error?.message ?? null}
    />
  );
}
