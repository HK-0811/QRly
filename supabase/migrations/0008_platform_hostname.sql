-- QRly — production platform hostname
--
-- qrly.lol is a *platform* hostname: is_custom = false and user_id null, so it
-- belongs to no account and every account creates links on it. When a create-link
-- request names no domain, routes/links.ts resolves PLATFORM_HOSTNAME to this row
-- and uses it. Without the row that lookup returns no_platform_domain, and the
-- redirect path refuses the hostname outright — a deploy without this 404s every
-- scan even though nothing is broken.
--
-- A new file rather than an edit to 0004_seed.sql: migrations are checksummed and
-- forward-only. tools/migrate.mjs compares each file's hash against
-- schema_migrations and reports DRIFT on an applied file that has changed.
--
-- The development hostnames seeded in 0004 stay. They cost nothing, they are not
-- resolvable in production, and removing them would break local development.
--
-- Once a QR code has been printed against this hostname the row can never be
-- deleted: links.domain_id and qr_codes.locked_domain_id are `on delete restrict`,
-- because a deleted hostname is a permanently dead printed code.

insert into domains (hostname, is_custom, is_active, verification_status, cname_target)
values ('qrly.lol', false, true, 'active', null)
on conflict (hostname) do nothing;
