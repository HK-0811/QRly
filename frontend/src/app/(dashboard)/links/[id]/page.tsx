import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { LinkDetail } from '@/components/links/link-detail';
import type { LinkWithDomain, QrCode } from '@/lib/types';

export const dynamic = 'force-dynamic';

function shortUrlFor(link: LinkWithDomain): string {
  const hostname = link.domains?.hostname ?? 'localhost:8787';
  const scheme = hostname.startsWith('localhost') || hostname.startsWith('127.') ? 'http' : 'https';
  return `${scheme}://${hostname}/${link.slug}`;
}

export default async function LinkDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: link } = await supabase
    .from('links')
    .select('*, domains(hostname, is_custom)')
    .eq('id', id)
    .maybeSingle();

  // RLS already scopes this to the owner, so "no row" and "someone else's row"
  // are the same case and both land here.
  if (!link || !user) notFound();

  const { data: qr } = await supabase
    .from('qr_codes')
    .select('*')
    .eq('link_id', id)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  const typed = link as LinkWithDomain;

  return (
    // useSearchParams reads the active tab, so the tree below needs a boundary.
    <Suspense fallback={null}>
      <LinkDetail
        link={typed}
        qr={(qr as QrCode | null) ?? null}
        userId={user.id}
        shortUrl={shortUrlFor(typed)}
      />
    </Suspense>
  );
}
