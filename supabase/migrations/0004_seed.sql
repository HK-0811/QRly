-- qrify — seed data
--
-- Platform hostnames. These belong to no user (is_custom = false, user_id null)
-- and every account creates links on them.
--
-- A hostname row is never deleted once a QR code has been printed against it: the
-- on delete restrict from links and qr_codes enforces that at the database level.
-- Adding a production hostname later is a new migration, not an edit to this one.

insert into domains (hostname, is_custom, is_active, verification_status, cname_target)
values
  ('localhost:8787', false, true, 'active', null),
  ('127.0.0.1:8787', false, true, 'active', null)
on conflict (hostname) do nothing;

-- Seed today's visitor-hash salt so the very first scan after a fresh deploy is
-- attributed correctly rather than falling back to an unsalted hash.
select ensure_daily_salt();
