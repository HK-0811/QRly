-- QRly — per-link daily counts for the links list
--
-- The list shows a scan count and a sparkline on every row. Calling
-- get_scan_timeseries once per link would be one round trip per row, and the
-- point of the list is to answer "which of these is working?" at a glance — a
-- question that should cost one query, not one per answer.
--
-- Returns a dense series: a day with no scans comes back as zero rather than
-- being absent, so the client can render bars without reconstructing the
-- calendar and without a gap reading as missing data.

create or replace function get_link_sparklines(days integer default 7)
returns table (link_id uuid, day date, scans bigint)
language sql
stable
security invoker
set search_path = public
as $$
  with span as (
    select generate_series(
      (now() at time zone 'utc')::date - (greatest(1, least(days, 90)) - 1),
      (now() at time zone 'utc')::date,
      interval '1 day'
    )::date as day
  ),
  -- RLS on links scopes this to the caller before anything is joined, which is
  -- why the function is INVOKER. A DEFINER here would expose every account's
  -- links to every other.
  mine as (
    select l.id from links l
  )
  select
    m.id as link_id,
    s.day,
    count(e.id) as scans
  from mine m
  cross join span s
  left join scan_events e
    on e.link_id = m.id
   and e.is_bot = false
   and (e.created_at at time zone 'utc')::date = s.day
  group by m.id, s.day
  order by m.id, s.day
$$;

comment on function get_link_sparklines(integer) is
  'SECURITY INVOKER on purpose: RLS scopes links and scan_events to the caller '
  'before aggregation. Bots are excluded to match every other headline number.';
