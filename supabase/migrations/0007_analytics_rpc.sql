-- qrify — dashboard aggregates
--
-- supabase-js cannot express GROUP BY, so every aggregate is a Postgres function
-- called over RPC (architecture.md §5.5).
--
-- All of these are SECURITY INVOKER, which means RLS still applies: the function
-- runs as the caller, so `scan_events` is already scoped to their own rows before
-- any aggregation happens. That is the entire access control for this file. A
-- SECURITY DEFINER function here would silently expose every account's analytics
-- to every other account.

-- ---------------------------------------------------------------------------
-- The shared filter
-- ---------------------------------------------------------------------------
-- One filtered set that every aggregate builds on, rather than repeating a
-- fifteen-clause WHERE in six places where they can drift apart.
--
-- Filters arrive as jsonb so adding one does not change six function signatures.
-- Every clause is `(filter is null or column = filter)`, so an absent key means
-- "no constraint" rather than "match null".

create or replace function filtered_scans(f jsonb default '{}'::jsonb)
returns setof scan_events
language sql
stable
security invoker
set search_path = public
as $$
  select s.*
  from scan_events s
  where (f->>'from'         is null or s.created_at   >= (f->>'from')::timestamptz)
    and (f->>'to'           is null or s.created_at   <  (f->>'to')::timestamptz)
    and (f->>'link_id'      is null or s.link_id      =  (f->>'link_id')::uuid)
    and (f->>'domain_id'    is null or s.domain_id    =  (f->>'domain_id')::uuid)
    and (f->>'qr_id'        is null or s.qr_id        =  (f->>'qr_id')::uuid)
    and (f->>'country'      is null or s.country      =  f->>'country')
    and (f->>'region'       is null or s.region       =  f->>'region')
    and (f->>'city'         is null or s.city         =  f->>'city')
    and (f->>'device_type'  is null or s.device_type  =  f->>'device_type')
    and (f->>'os_name'      is null or s.os_name      =  f->>'os_name')
    and (f->>'browser_name' is null or s.browser_name =  f->>'browser_name')
    and (f->>'network_type' is null or s.network_type =  f->>'network_type')
    and (f->>'as_org'       is null or s.as_org       =  f->>'as_org')
    and (f->>'utm_source'   is null or s.utm_source   =  f->>'utm_source')
    and (f->>'utm_medium'   is null or s.utm_medium   =  f->>'utm_medium')
    and (f->>'utm_campaign' is null or s.utm_campaign =  f->>'utm_campaign')
    -- Bots are excluded unless explicitly asked for. A link-preview fetch is a
    -- real event, but counting it as a scan inflates every headline number.
    and (coalesce((f->>'include_bots')::boolean, false) or s.is_bot = false)
$$;

comment on function filtered_scans(jsonb) is
  'SECURITY INVOKER on purpose: RLS scopes scan_events to the caller before any '
  'aggregation. Changing this to DEFINER would expose every account to every other.';

-- ---------------------------------------------------------------------------
-- Summary
-- ---------------------------------------------------------------------------

create or replace function get_scan_summary(f jsonb default '{}'::jsonb)
returns json
language sql
stable
security invoker
set search_path = public
as $$
  select json_build_object(
    'scans',            count(*),
    -- Distinct visitor hashes. The salt rotates daily, so across a range longer
    -- than a day this counts a person once per day they scanned. That is the
    -- honest meaning of the number and the UI says so.
    'unique_visitors',  count(distinct visitor_hash) filter (where visitor_hash is not null),
    'first_scans',      count(*) filter (where is_first_scan),
    'returning_scans',  count(*) filter (where is_first_scan = false),
    -- Rows with a privacy signal carry no hash, so they cannot be attributed to a
    -- visitor at all. Surfaced rather than quietly folded into the totals.
    'unattributed',     count(*) filter (where visitor_hash is null),
    'gpc_scans',        count(*) filter (where gpc),
    'bot_scans',        count(*) filter (where is_bot),
    'countries',        count(distinct country) filter (where country is not null),
    'cities',           count(distinct city)    filter (where city is not null),
    'direct_scans',     count(*) filter (where referrer is null),
    'referred_scans',   count(*) filter (where referrer is not null),
    'median_rtt_ms',    percentile_cont(0.5) within group (order by tcp_rtt_ms)
                          filter (where tcp_rtt_ms is not null),
    'first_scan_at',    min(created_at),
    'last_scan_at',     max(created_at)
  )
  from filtered_scans(f);
$$;

-- ---------------------------------------------------------------------------
-- Time series
-- ---------------------------------------------------------------------------

create or replace function get_scan_timeseries(
  f       jsonb default '{}'::jsonb,
  bucket  text  default 'day'
)
returns json
language plpgsql
stable
security invoker
set search_path = public
as $$
declare
  unit text;
  result json;
begin
  -- Whitelisted rather than interpolated: date_trunc takes the unit as a string,
  -- and passing a caller-supplied one through would be an injection point.
  unit := case lower(bucket)
            when 'hour'  then 'hour'
            when 'day'   then 'day'
            when 'week'  then 'week'
            when 'month' then 'month'
            else 'day'
          end;

  select coalesce(json_agg(row_to_json(t) order by t.bucket), '[]'::json) into result
  from (
    select
      date_trunc(unit, created_at) as bucket,
      count(*)                     as scans,
      count(distinct visitor_hash) filter (where visitor_hash is not null) as unique_visitors,
      count(*) filter (where is_bot) as bot_scans
    from filtered_scans(f)
    group by 1
  ) t;

  return result;
end;
$$;

-- ---------------------------------------------------------------------------
-- Generic breakdown
-- ---------------------------------------------------------------------------
-- One function rather than a dozen near-identical ones. The dimension is checked
-- against an explicit allow-list, not quoted and hoped for: this is the only
-- place in the schema where a caller-supplied string reaches a query.

create or replace function get_scan_breakdown(
  f          jsonb   default '{}'::jsonb,
  dimension  text    default 'country',
  max_rows   integer default 50
)
returns json
language plpgsql
stable
security invoker
set search_path = public
as $$
declare
  col    text;
  result json;
begin
  col := case dimension
    when 'country'       then 'country'
    when 'region'        then 'region'
    when 'city'          then 'city'
    when 'continent'     then 'continent'
    when 'timezone'      then 'timezone'
    when 'colo'          then 'colo'
    when 'as_org'        then 'as_org'
    when 'network_type'  then 'network_type'
    when 'http_protocol' then 'http_protocol'
    when 'tls_version'   then 'tls_version'
    when 'device_type'   then 'device_type'
    when 'device_vendor' then 'device_vendor'
    when 'device_model'  then 'device_model'
    when 'os_name'       then 'os_name'
    when 'browser_name'  then 'browser_name'
    when 'language'      then 'language'
    when 'referrer_host' then 'referrer_host'
    when 'utm_source'    then 'utm_source'
    when 'utm_medium'    then 'utm_medium'
    when 'utm_campaign'  then 'utm_campaign'
    when 'utm_content'   then 'utm_content'
    when 'utm_term'      then 'utm_term'
    when 'bot_reason'    then 'bot_reason'
    else null
  end;

  if col is null then
    raise exception 'unsupported breakdown dimension: %', dimension
      using errcode = 'invalid_parameter_value';
  end if;

  execute format($q$
    select coalesce(json_agg(row_to_json(t) order by t.scans desc, t.key), '[]'::json)
    from (
      select
        %1$I::text as key,
        count(*)   as scans,
        count(distinct visitor_hash) filter (where visitor_hash is not null) as unique_visitors
      from filtered_scans($1)
      where %1$I is not null
      group by 1
      order by scans desc
      limit $2
    ) t
  $q$, col)
  into result
  using f, greatest(1, least(max_rows, 500));

  return result;
end;
$$;

-- ---------------------------------------------------------------------------
-- Local-time heatmap
-- ---------------------------------------------------------------------------
-- The hour and weekday stored on each row are already in the *scanner's* own
-- timezone. Most analytics products show the account owner's timezone, so a
-- campaign in Mumbai read from an office in London appears to peak at 3am.

create or replace function get_local_time_heatmap(f jsonb default '{}'::jsonb)
returns json
language sql
stable
security invoker
set search_path = public
as $$
  select coalesce(json_agg(row_to_json(t) order by t.local_dow, t.local_hour), '[]'::json)
  from (
    select local_dow, local_hour, count(*) as scans
    from filtered_scans(f)
    where local_dow is not null and local_hour is not null
    group by 1, 2
  ) t;
$$;

-- ---------------------------------------------------------------------------
-- Map points
-- ---------------------------------------------------------------------------
-- Grouped by city rather than returned per row. The coordinates are the city
-- centroid from the IP database, not a position, so returning one point per scan
-- would imply a precision that does not exist. One point per city with a count is
-- both smaller and more honest.

create or replace function get_geo_points(f jsonb default '{}'::jsonb, max_rows integer default 500)
returns json
language sql
stable
security invoker
set search_path = public
as $$
  select coalesce(json_agg(row_to_json(t) order by t.scans desc), '[]'::json)
  from (
    select
      city,
      region,
      country,
      -- Every row for a city carries the same centroid, so avg is just that
      -- centroid; it guards against an IP database revision mid-range.
      round(avg(latitude), 4)  as latitude,
      round(avg(longitude), 4) as longitude,
      count(*)                 as scans,
      count(distinct visitor_hash) filter (where visitor_hash is not null) as unique_visitors
    from filtered_scans(f)
    where latitude is not null and longitude is not null
    group by city, region, country
    order by scans desc
    limit greatest(1, least(max_rows, 2000))
  ) t;
$$;

-- ---------------------------------------------------------------------------
-- Filter options
-- ---------------------------------------------------------------------------
-- Only values that actually occur in the caller's own data, so no filter can be
-- selected that returns nothing, and the option list itself leaks nothing about
-- other accounts.

create or replace function get_filter_options(f jsonb default '{}'::jsonb)
returns json
language sql
stable
security invoker
set search_path = public
as $$
  with scoped as (select * from filtered_scans(f || '{"include_bots":true}'::jsonb))
  select json_build_object(
    'countries',     (select coalesce(json_agg(distinct country      order by country),      '[]'::json) from scoped where country      is not null),
    'regions',       (select coalesce(json_agg(distinct region       order by region),       '[]'::json) from scoped where region       is not null),
    'cities',        (select coalesce(json_agg(distinct city         order by city),         '[]'::json) from scoped where city         is not null),
    'device_types',  (select coalesce(json_agg(distinct device_type  order by device_type),  '[]'::json) from scoped where device_type  is not null),
    'os_names',      (select coalesce(json_agg(distinct os_name      order by os_name),      '[]'::json) from scoped where os_name      is not null),
    'browsers',      (select coalesce(json_agg(distinct browser_name order by browser_name), '[]'::json) from scoped where browser_name is not null),
    'network_types', (select coalesce(json_agg(distinct network_type order by network_type), '[]'::json) from scoped where network_type is not null),
    'utm_sources',   (select coalesce(json_agg(distinct utm_source   order by utm_source),   '[]'::json) from scoped where utm_source   is not null),
    'utm_mediums',   (select coalesce(json_agg(distinct utm_medium   order by utm_medium),   '[]'::json) from scoped where utm_medium   is not null),
    'utm_campaigns', (select coalesce(json_agg(distinct utm_campaign order by utm_campaign), '[]'::json) from scoped where utm_campaign is not null)
  );
$$;
