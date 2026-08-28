import { createClient } from '@/lib/supabase/server';
import { AnalyticsScreen } from '@/components/analytics/analytics-screen';
import type { LinkWithDomain } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function AnalyticsPage() {
  const supabase = await createClient();

  // Only the link list is fetched server-side, to populate the filter. Every
  // aggregate is called from the client so a filter change does not round-trip
  // through a server render.
  const { data: links } = await supabase
    .from('links')
    .select('*, domains(hostname, is_custom)')
    .order('created_at', { ascending: false });

  return <AnalyticsScreen links={(links as LinkWithDomain[] | null) ?? []} />;
}
