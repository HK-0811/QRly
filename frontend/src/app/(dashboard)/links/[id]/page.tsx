import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { QrStudio } from '@/components/qr/qr-studio';
import { Badge, Card } from '@/components/ui';
import { CopyButton } from '@/components/copy-button';
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
  const expired = typed.expires_at !== null && new Date(typed.expires_at) <= new Date();

  return (
    <div className="animate-in">
      <Link
        href="/links"
        className="text-[13px] text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
      >
        &larr; All links
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-mono text-[17px] font-semibold tracking-tight">
              {typed.domains?.hostname}/{typed.slug}
            </h1>
            <CopyButton value={shortUrlFor(typed)} />
            {!typed.is_active && <Badge tone="neutral">Off</Badge>}
            {expired && <Badge tone="warn">Expired</Badge>}
            {typed.safe_browsing_status === 'flagged' && <Badge tone="bad">Flagged</Badge>}
          </div>
          {typed.title && <p className="mt-1 text-[13.5px] font-medium">{typed.title}</p>}
          <p className="mt-0.5 truncate text-[13px] text-[var(--text-muted)]">
            &rarr; {typed.destination_url}
          </p>
        </div>
      </div>

      <div className="mt-8">
        <QrStudio
          linkId={typed.id}
          userId={user.id}
          domainId={typed.domain_id}
          hostname={typed.domains?.hostname ?? ''}
          slug={typed.slug}
          shortUrl={shortUrlFor(typed)}
          existing={(qr as QrCode | null) ?? null}
        />
      </div>

      <Card className="mt-8 p-5">
        <h2 className="text-[14px] font-semibold tracking-tight">Scans</h2>
        <p className="mt-1.5 text-[13px] text-[var(--text-muted)]">
          Scan collection arrives in phase 5, and the analytics that read it in phase 6.
        </p>
      </Card>
    </div>
  );
}
