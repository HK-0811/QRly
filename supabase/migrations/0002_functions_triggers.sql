-- qrify — functions and triggers

-- ---------------------------------------------------------------------------
-- updated_at maintenance
-- ---------------------------------------------------------------------------

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger links_set_updated_at
  before update on links
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- profiles auto-provision
-- ---------------------------------------------------------------------------
-- Runs as the definer so it can write to public.profiles during the auth
-- transaction, where the acting role has no rights of its own. search_path is
-- pinned because a definer function with a mutable search_path is a privilege
-- escalation vector.

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Keep profiles.email in step with a verified email change.
create or replace function handle_user_email_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.email is distinct from old.email then
    update public.profiles set email = new.email where id = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_email_changed on auth.users;
create trigger on_auth_user_email_changed
  after update of email on auth.users
  for each row execute function handle_user_email_change();

-- ---------------------------------------------------------------------------
-- immutability guards
-- ---------------------------------------------------------------------------
-- A printed QR code encodes one hostname forever. If locked_domain_id could be
-- changed after generation, every physical copy already in the world would break
-- with no way to recall it. The database refuses rather than trusting the UI.

create or replace function guard_locked_domain()
returns trigger
language plpgsql
as $$
begin
  if new.locked_domain_id is distinct from old.locked_domain_id then
    raise exception
      'locked_domain_id is immutable: % is already encoded into printed copies of this QR code',
      old.locked_domain_id
      using errcode = 'restrict_violation';
  end if;
  return new;
end;
$$;

create trigger qr_codes_guard_locked_domain
  before update on qr_codes
  for each row execute function guard_locked_domain();

-- A slug is the permanent identity of a link. Editing the destination is the whole
-- product; editing the slug silently breaks every printed code pointing at it.

create or replace function guard_link_identity()
returns trigger
language plpgsql
as $$
begin
  if new.slug is distinct from old.slug then
    raise exception 'slug is immutable once created (was %, got %)', old.slug, new.slug
      using errcode = 'restrict_violation';
  end if;
  if new.domain_id is distinct from old.domain_id then
    raise exception 'domain_id is immutable once created'
      using errcode = 'restrict_violation';
  end if;
  if new.user_id is distinct from old.user_id then
    raise exception 'links cannot be transferred between accounts'
      using errcode = 'restrict_violation';
  end if;
  return new;
end;
$$;

create trigger links_guard_identity
  before update on links
  for each row execute function guard_link_identity();

-- ---------------------------------------------------------------------------
-- ownership consistency
-- ---------------------------------------------------------------------------
-- RLS alone would let a user attach their QR code to their own link but stamp a
-- different user_id, or point a link at a custom domain they do not own. These
-- are cheap checks that close both.

create or replace function guard_link_domain_access()
returns trigger
language plpgsql
as $$
declare
  d record;
begin
  select is_custom, user_id, is_active into d from domains where id = new.domain_id;
  if not found then
    raise exception 'domain % does not exist', new.domain_id using errcode = 'foreign_key_violation';
  end if;
  if d.is_custom and d.user_id is distinct from new.user_id then
    raise exception 'domain % is not owned by this account', new.domain_id
      using errcode = 'insufficient_privilege';
  end if;
  return new;
end;
$$;

create trigger links_guard_domain_access
  before insert on links
  for each row execute function guard_link_domain_access();

create or replace function guard_qr_ownership()
returns trigger
language plpgsql
as $$
declare
  owner uuid;
begin
  select user_id into owner from links where id = new.link_id;
  if not found then
    raise exception 'link % does not exist', new.link_id using errcode = 'foreign_key_violation';
  end if;
  if owner is distinct from new.user_id then
    raise exception 'a QR code must belong to the same account as its link'
      using errcode = 'insufficient_privilege';
  end if;
  return new;
end;
$$;

create trigger qr_codes_guard_ownership
  before insert on qr_codes
  for each row execute function guard_qr_ownership();

-- ---------------------------------------------------------------------------
-- daily salt rotation
-- ---------------------------------------------------------------------------
-- Idempotent so the cron can fire twice, or late, without producing two salts for
-- one day. Two salts for one day would split a visitor's identity mid-day and
-- silently inflate the unique-visitor count.

create or replace function ensure_daily_salt(p_day date default (now() at time zone 'utc')::date)
returns text
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  s text;
begin
  insert into daily_salts (day, salt)
  values (p_day, encode(gen_random_bytes(32), 'hex'))
  on conflict (day) do nothing;

  select salt into s from daily_salts where day = p_day;
  return s;
end;
$$;

revoke all on function ensure_daily_salt(date) from public, anon, authenticated;

-- Retention purge. Each account chooses its own window; the sweep honours all of
-- them in one pass rather than one statement per user.

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

  return removed;
end;
$$;

revoke all on function purge_expired_scan_events() from public, anon, authenticated;
