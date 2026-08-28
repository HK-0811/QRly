-- qrify — scheduled job audit trail
--
-- The Supabase free tier pauses a project after 7 days of inactivity, which would
-- take the demo down precisely when someone finally looks at it. A daily Worker
-- cron pings the database to prevent that. This table is how we know the ping is
-- actually landing rather than silently failing for a week.

create table cron_runs (
  id          bigint generated always as identity primary key,
  job         text not null,
  ran_at      timestamptz not null default now(),
  ok          boolean not null,
  duration_ms integer,
  detail      jsonb
);

create index cron_runs_job_time_idx on cron_runs (job, ran_at desc);

alter table cron_runs enable row level security;
alter table cron_runs force row level security;
-- Deliberately no policies. Operational data, reachable only by service_role.

comment on table cron_runs is
  'Written by the Worker scheduled handler. Absence of recent rows means the '
  'keep-alive stopped and the project is drifting toward auto-pause.';

-- Keep the audit trail from growing without bound. Folded into the existing purge
-- so there is one sweep, not two.
create or replace function purge_expired_scan_events()
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  removed bigint;
begin
  with doomed as (
    delete from scan_events s
    using profiles p
    where s.user_id = p.id
      and s.created_at < now() - make_interval(days => p.retention_days)
    returning 1
  )
  select count(*) into removed from doomed;

  delete from daily_salts where day < (now() at time zone 'utc')::date - 90;
  delete from cron_runs  where ran_at < now() - interval '90 days';

  return removed;
end;
$$;

revoke all on function purge_expired_scan_events() from public, anon, authenticated;
