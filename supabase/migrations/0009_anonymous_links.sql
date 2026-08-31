-- QRly — anonymous codes, claimable for 30 days
--
-- The flow this exists for: paste a URL on the landing page, get a working short
-- code and a printable file, and only sign up if you later want to change the
-- destination or read the scans. Signup stops being a gate at the front and
-- becomes the thing you do when you want the two features that need an account.
--
-- WHY user_id GOES NULLABLE RATHER THAN A PLACEHOLDER ACCOUNT
--
-- The obvious alternative is a sentinel "anonymous" auth.users row that owns every
-- unclaimed link. That would keep the not-null constraint, and it would be wrong:
-- RLS on all three tables is `user_id = auth.uid()`, so a shared owner means any
-- session that ever authenticated as that sentinel reads every unclaimed link in
-- the system. Null has no auth.uid() and therefore matches no RLS policy at all —
-- unclaimed rows are invisible to every authenticated reader, and reachable only
-- through the Worker, which holds service_role and requires the claim token.
--
-- WHAT DOES NOT CHANGE
--
-- The two ownership guards in 0002 already compare with `is distinct from`, so
-- they behave correctly against null without an edit:
--
--   guard_link_domain_access — a custom domain has a non-null user_id, so an
--     anonymous link on one raises. Anonymous codes can only ever be created on a
--     platform hostname, which is the behaviour we want and did not have to add.
--   guard_qr_ownership — null link owner and null qr owner are `not distinct`,
--     so an anonymous QR design attaches to its anonymous link and nothing else.
--
-- SCANS ARE COLLECTED BEFORE THE CLAIM
--
-- An unclaimed code is live, so it gets scanned, so those scans are recorded with
-- a null user_id and backfilled at claim time. The alternative — start counting
-- at signup — means someone who printed a poster, ran it for three weeks and then
-- signed up sees zero. The whole promise of the flow is that the data is waiting.

-- ---------------------------------------------------------------------------
-- Ownership becomes optional
-- ---------------------------------------------------------------------------

alter table links       alter column user_id drop not null;
alter table qr_codes    alter column user_id drop not null;
alter table scan_events alter column user_id drop not null;

comment on column links.user_id is
  'Null means unclaimed: created anonymously and not yet attached to an account. '
  'Null matches no RLS policy, so these rows are invisible to every authenticated '
  'reader and reachable only through the Worker with a claim token.';

-- ---------------------------------------------------------------------------
-- The claim credential
-- ---------------------------------------------------------------------------

alter table links
  add column claim_token uuid unique,
  add column claimed_at  timestamptz;

comment on column links.claim_token is
  'The single credential that can attach this link to an account. A v4 uuid, so '
  'guessing one is a 122-bit search. Set to null the moment the link is claimed, '
  'so a token captured from a browser history cannot re-point a live code.';

-- Every unclaimed link must be claimable, and no claimed link may still carry a
-- live token. Enforced as a constraint rather than left to the Worker, because an
-- orphaned unclaimed link would be undeletable-by-owner and invisible forever.
alter table links add constraint links_claim_state_valid check (
  (user_id is null     and claim_token is not null and claimed_at is null) or
  (user_id is not null and claim_token is null)
);

comment on constraint links_claim_state_valid on links is
  'Unclaimed rows carry a token and no owner; claimed rows carry an owner and no '
  'token. There is no third state, so no code path has to handle one.';

-- Partial: only unclaimed rows are ever looked up this way, and the index stays
-- small because rows leave it permanently as they are claimed.
create index links_claim_token_idx on links (claim_token) where claim_token is not null;

-- Drives the 30-day sweep below.
create index links_unclaimed_created_idx on links (created_at) where user_id is null;

-- ---------------------------------------------------------------------------
-- Claiming
-- ---------------------------------------------------------------------------

create or replace function claim_link(p_token uuid, p_user uuid)
returns links
language plpgsql
security definer
set search_path = public
as $$
declare
  claimed links;
begin
  -- One statement, so two tabs racing the same token cannot both win: the second
  -- finds no row matching `user_id is null` and returns not-found.
  update links
     set user_id    = p_user,
         claim_token = null,
         claimed_at  = now()
   where claim_token = p_token
     and user_id is null
  returning * into claimed;

  if not found then
    return null;
  end if;

  -- Backfill everything that was collected while the link had no owner. Without
  -- this the scans exist but match no RLS policy, so the new owner would see an
  -- empty dashboard for a code that has been working for weeks.
  update qr_codes    set user_id = p_user where link_id = claimed.id and user_id is null;
  update scan_events set user_id = p_user where link_id = claimed.id and user_id is null;

  return claimed;
end;
$$;

revoke all on function claim_link(uuid, uuid) from public, anon, authenticated;

comment on function claim_link(uuid, uuid) is
  'SECURITY DEFINER because it writes rows that match no RLS policy by definition. '
  'Revoked from every client role: only the Worker, holding service_role and having '
  'already verified the caller JWT, may invoke it.';

-- ---------------------------------------------------------------------------
-- Unclaimed codes expire
-- ---------------------------------------------------------------------------

create or replace function purge_unclaimed_links()
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  removed bigint;
begin
  -- qr_codes.link_id and scan_events.link_id both cascade, so the designs and the
  -- scan history go with the link. Nothing is left addressable by a stale token.
  with doomed as (
    delete from links
     where user_id is null
       and created_at < now() - interval '30 days'
    returning 1
  )
  select count(*) into removed from doomed;

  return removed;
end;
$$;

revoke all on function purge_unclaimed_links() from public, anon, authenticated;

comment on function purge_unclaimed_links() is
  'Anonymous creation is unauthenticated, so without an expiry anyone could mint '
  'permanent rows in a loop. Thirty days is long enough to print something and '
  'come back, short enough that abandoned codes do not accumulate on a free tier.';
