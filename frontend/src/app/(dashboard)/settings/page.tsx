import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { SettingsForm } from '@/components/settings/settings-form';
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
    <div className="animate-rise max-w-[760px]">
      <h1 className="text-[28px] font-semibold tracking-[-0.03em] sm:text-[34px]">Settings</h1>
      <p className="mt-2 font-mono text-[13px] text-[var(--text-faint)]">{user.email}</p>

      <div className="mt-8">
        <SettingsForm profile={(profile as Profile | null) ?? null} scanCount={count ?? 0} />
      </div>

      <div className="mt-6 border border-[var(--rule-mid)] p-7">
        <div className="eyebrow mb-4">What is collected</div>
        <p className="max-w-[62ch] text-[14px] leading-relaxed text-[var(--text-muted)]">
          Every field this service records about a scan, and every field it deliberately does not,
          is listed on the privacy page — including the ones that would be possible to collect and
          are not.
        </p>
        <Link
          href="/privacy"
          className="mt-4 inline-block text-[14px] font-medium underline underline-offset-2"
        >
          Read the privacy page
        </Link>
      </div>
    </div>
  );
}
