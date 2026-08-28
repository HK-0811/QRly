-- qrify — core schema
-- Mirrors architecture.md §5. Read that before changing anything here.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- profiles — extends auth.users
-- ---------------------------------------------------------------------------

create table profiles (
  id             uuid primary key references auth.users(id) on delete cascade,
  email          text not null,
  display_name   text,
  retention_days integer not null default 365
                 check (retention_days between 1 and 3650),
  created_at     timestamptz not null default now()
);

comment on column profiles.retention_days is
  'Scan events older than this are deleted by the nightly purge cron.';

-- ---------------------------------------------------------------------------
-- domains
-- ---------------------------------------------------------------------------
-- user_id is nullable, which is a deliberate departure from architecture.md §5.1.
-- The shared platform hostname belongs to no user; every account creates links on
-- it. A custom domain always has an owner. The check constraint enforces exactly
-- that pairing rather than leaving it to application code.

create table domains (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid references auth.users(id) on delete cascade,
  hostname              text not null unique
                        check (hostname = lower(hostname) and length(hostname) between 3 and 253),
  is_custom             boolean not null default true,
  is_active             boolean not null default false,
  verification_status   text not null default 'pending'
                        check (verification_status in ('pending','verifying','active','failed')),
  cf_custom_hostname_id text,
  cname_target          text,
  ssl_status            text,
  dns_verified_at       timestamptz,
  created_at            timestamptz not null default now(),

  constraint domain_ownership check (
    (is_custom = true  and user_id is not null) or
    (is_custom = false and user_id is null)
  )
);

comment on table domains is
  'Platform hostnames (is_custom=false, user_id null) are shared by all accounts. '
  'Custom hostnames are owned. A hostname row can never be deleted while links or '
  'QR codes reference it — printed QR codes would break permanently.';

-- ---------------------------------------------------------------------------
-- links
-- ---------------------------------------------------------------------------

create table links (
  id                       uuid primary key default gen_random_uuid(),
  user_id                  uuid not null references auth.users(id) on delete cascade,
  domain_id                uuid not null references domains(id) on delete restrict,
  slug                     text not null
                           check (slug ~ '^[A-Za-z0-9_-]{1,64}$'),
  destination_url          text not null
                           check (length(destination_url) between 1 and 2048),
  title                    text check (title is null or length(title) <= 200),
  is_active                boolean not null default true,
  expires_at               timestamptz,
  safe_browsing_status     text not null default 'unchecked'
                           check (safe_browsing_status in ('unchecked','clean','flagged')),
  safe_browsing_checked_at timestamptz,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now(),

  constraint links_domain_slug_unique unique (domain_id, slug)
);

comment on constraint links_domain_slug_unique on links is
  'The hot-path index. Slug collisions are resolved by catching a violation of this '
  'constraint and retrying — a read-then-write pre-check races.';

-- ---------------------------------------------------------------------------
-- qr_codes
-- ---------------------------------------------------------------------------

create table qr_codes (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  link_id          uuid not null references links(id) on delete cascade,
  locked_domain_id uuid not null references domains(id) on delete restrict,
  label            text check (label is null or length(label) <= 200),
  style            jsonb not null default '{}'::jsonb,
  created_at       timestamptz not null default now()
);

comment on column qr_codes.locked_domain_id is
  'The hostname encoded into the printed image. Immutable by trigger: changing it '
  'would break every physical copy already in the world.';

-- ---------------------------------------------------------------------------
-- scan_events — the wide table
-- ---------------------------------------------------------------------------

create table scan_events (
  id              bigint generated always as identity primary key,
  link_id         uuid not null references links(id) on delete cascade,
  user_id         uuid not null references auth.users(id) on delete cascade,
  domain_id       uuid references domains(id) on delete set null,
  qr_id           uuid references qr_codes(id) on delete set null,
  event_type      text not null default 'redirect',
  created_at      timestamptz not null default now(),

  -- geography (IP-derived, approximate — see context.md §6)
  country         text,
  region          text,
  region_code     text,
  city            text,
  postal_code     text,
  continent       text,
  latitude        numeric(9,6),
  longitude       numeric(9,6),
  timezone        text,
  is_eu           boolean,

  -- network
  asn             integer,
  as_org          text,
  colo            text,
  network_type    text check (network_type is null or
                    network_type in ('mobile','broadband','corporate','datacenter','unknown')),
  tcp_rtt_ms      integer,
  http_protocol   text,
  tls_version     text,

  -- device
  device_type     text check (device_type is null or
                    device_type in ('mobile','tablet','desktop','bot','unknown')),
  device_vendor   text,
  device_model    text,
  os_name         text,
  os_version      text,
  browser_name    text,
  browser_version text,
  ua_raw          text,

  -- locale
  language        text,
  languages       text[],

  -- acquisition
  referrer        text,
  referrer_host   text,
  utm_source      text,
  utm_medium      text,
  utm_campaign    text,
  utm_term        text,
  utm_content     text,

  -- derived in the scanner's own timezone, not the account owner's
  local_hour      smallint check (local_hour is null or local_hour between 0 and 23),
  local_dow       smallint check (local_dow  is null or local_dow  between 0 and 6),

  -- identity and quality
  visitor_hash    text,
  is_first_scan   boolean,
  is_bot          boolean not null default false,
  bot_reason      text,
  gpc             boolean
);

comment on column scan_events.latitude is
  'City centroid from the IP database. NOT the scanner position. Never plot as a pin.';
comment on column scan_events.user_id is
  'Denormalised from links deliberately: without it every RLS check and every '
  'dashboard aggregate needs a join back through links.';
comment on column scan_events.device_model is
  'Android usually reports a real model string. iOS reports only iPhone/iPad. '
  'The dashboard must show that asymmetry rather than hiding it.';
comment on column scan_events.event_type is
  'Reserved for a possible future non-redirect event. One value today. context.md §8.';

-- ---------------------------------------------------------------------------
-- daily_salts — powers the privacy-safe visitor hash
-- ---------------------------------------------------------------------------

create table daily_salts (
  day        date primary key,
  salt       text not null,
  created_at timestamptz not null default now()
);

comment on table daily_salts is
  'Rotating salt for sha256(salt + ip + ua + link_id). Rotating daily is what makes '
  '"unique visitor" honestly mean "unique per day" and makes the hash self-expiring.';

-- ---------------------------------------------------------------------------
-- indexes (architecture.md §5.3)
-- ---------------------------------------------------------------------------

create index links_user_created_idx    on links (user_id, created_at desc);
create index links_domain_idx          on links (domain_id);
create index domains_user_idx          on domains (user_id);
create index qr_codes_user_idx         on qr_codes (user_id, created_at desc);
create index qr_codes_link_idx         on qr_codes (link_id);
create index qr_codes_locked_domain_idx on qr_codes (locked_domain_id);

create index scan_events_link_time_idx on scan_events (link_id, created_at desc);
create index scan_events_user_time_idx on scan_events (user_id, created_at desc);
create index scan_events_created_idx   on scan_events (created_at);
create index scan_events_user_country_idx on scan_events (user_id, country);
create index scan_events_user_campaign_idx on scan_events (user_id, utm_campaign)
  where utm_campaign is not null;

-- Supports the is_first_scan conditional insert and the unique-visitor aggregate.
create index scan_events_visitor_idx on scan_events (link_id, visitor_hash, created_at)
  where visitor_hash is not null;
