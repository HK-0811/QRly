-- QRly — let an unclaimed link gain an owner, once
--
-- Migration 0009 made links.user_id nullable so a code could exist before an
-- account did. It did not notice that guard_link_identity (0002) refuses *any*
-- change to user_id, which made claim_link() unreachable in practice: the
-- function ran, the trigger raised, and the whole flow ended at
-- "links cannot be transferred between accounts".
--
-- The guard is right and stays. A link that belongs to somebody must never move
-- to somebody else — its code is printed, and a transfer would silently hand a
-- stranger control of what a poster in the world points at.
--
-- What this adds is exactly one legal transition:
--
--     null -> a user      allowed   (claiming; the reason 0009 exists)
--     user -> a user      blocked   (transfer, unchanged)
--     user -> null        blocked   (un-claiming, which would orphan a live code
--                                    and put it back on the 30-day purge list)
--     null -> null        no change
--
-- slug and domain_id stay immutable exactly as before. Only the ownership clause
-- is rewritten; the rest of the function is reproduced verbatim because
-- `create or replace` takes the whole body.

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

  -- Guarding on OLD rather than on the pair: once a link has an owner its
  -- user_id is frozen, and an unclaimed one may be adopted exactly once. After
  -- the adoption this branch is live for every subsequent update, so a claimed
  -- link is as immutable as it ever was.
  if old.user_id is not null and new.user_id is distinct from old.user_id then
    raise exception 'links cannot be transferred between accounts'
      using errcode = 'restrict_violation';
  end if;

  return new;
end;
$$;

comment on function guard_link_identity() is
  'slug and domain_id are immutable forever. user_id is immutable once set, but '
  'null may become a user exactly once — that transition is the claim in 0009, '
  'and it is the only way a link ever acquires an owner after creation.';
