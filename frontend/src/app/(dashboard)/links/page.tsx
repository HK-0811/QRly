import { createClient } from '@/lib/supabase/server';
import { LinksScreen, type LinkStats } from '@/components/links/links-screen';
import type { LinkWithDomain } from '@/lib/types';

export const dynamic = 'force-dynamic';

const WINDOW_DAYS = 7;

export default async function LinksPage() {
  const supabase = await createClient();

  // Read directly from Postgres with the user's own JWT. RLS scopes this to their
  // rows, so there is no proxy layer to write and nothing to get wrong in one.
  const [{ data: links, error }, { data: spark }] = await Promise.all([
    supabase
      .from('links')
      .select('*, domains(hostname, is_custom)')
      .order('created_at', { ascending: false }),
    // One call for every row's sparkline. Per-link timeseries calls would be one
    // round trip per row for a question the list answers at a glance.
    supabase.rpc('get_link_sparklines', { days: WINDOW_DAYS }),
  ]);

  const stats: Record<string, LinkStats> = {};
  for (const row of (spark as Array<{ link_id: string; scans: number }> | null) ?? []) {
    const entry = (stats[row.link_id] ??= { series: [], total: 0 });
    // The RPC returns a dense series ordered by day, so pushing preserves it.
    entry.series.push(Number(row.scans));
    entry.total += Number(row.scans);
  }

  return (
    <LinksScreen
      initialLinks={(links as LinkWithDomain[] | null) ?? []}
      stats={stats}
      loadError={error?.message ?? null}
    />
  );
}
