import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { SettingsForm } from '@/components/settings/settings-form';
import { Card } from '@/components/ui';
import type { Profile } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  const { count } = await supabase
    .from('scan_events')
    .select('id', { count: 'exact', head: true });

  return (
    <div className="animate-in max-w-2xl space-y-6">
      <div>
        <h1 className="text-[19px] font-semibold tracking-tight">Settings</h1>
        <p className="mt-0.5 text-[13px] text-[var(--text-muted)]">{user.email}</p>
      </div>

      <SettingsForm profile={(profile as Profile | null) ?? null} scanCount={count ?? 0} />

      <Card className="p-5">
        <h2 className="text-[14px] font-semibold tracking-tight">What is collected</h2>
        <p className="mt-2 text-[13px] leading-relaxed text-[var(--text-muted)]">
          Every field this service records about a scan, and every field it deliberately
          does not, is listed on the privacy page &mdash; including the ones that would be
          possible to collect and are not.
        </p>
        <Link
          href="/privacy"
          className="mt-3 inline-block text-[13px] font-medium underline underline-offset-2"
        >
          Read the privacy page
        </Link>
      </Card>
    </div>
  );
}
