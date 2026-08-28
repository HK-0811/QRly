-- qrify — row level security
--
-- Every policy reduces to ownership. The Worker's service_role key bypasses all of
-- this by design; that key exists only in Worker secrets. The browser only ever
-- holds the anon key, so these policies are the entire tenant boundary.
--
-- Verified adversarially with two real accounts in tools/verify-rls.mjs. Reading
-- these and concluding they look right is not a test.

alter table profiles    enable row level security;
alter table domains     enable row level security;
alter table links       enable row level security;
alter table qr_codes    enable row level security;
alter table scan_events enable row level security;
alter table daily_salts enable row level security;

-- Force RLS even for the table owner, so a mistake elsewhere that runs as the
-- owning role cannot quietly read across tenants.
alter table profiles    force row level security;
alter table domains     force row level security;
alter table links       force row level security;
alter table qr_codes    force row level security;
alter table scan_events force row level security;
alter table daily_salts force row level security;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
-- No insert policy: rows are created by the handle_new_user trigger only.
-- No delete policy: account deletion cascades from auth.users.

create policy "profiles: owner reads"
  on profiles for select to authenticated
  using (auth.uid() = id);

create policy "profiles: owner updates"
  on profiles for update to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- domains
-- ---------------------------------------------------------------------------
-- Shared platform hostnames are readable by every signed-in account — a user must
-- be able to see the hostname their link will live on. They are not writable by
-- anyone through this path; only the Worker's service_role manages them.

create policy "domains: read own or platform"
  on domains for select to authenticated
  using (auth.uid() = user_id or (is_custom = false and user_id is null));

create policy "domains: owner inserts custom"
  on domains for insert to authenticated
  with check (auth.uid() = user_id and is_custom = true);

create policy "domains: owner updates custom"
  on domains for update to authenticated
  using (auth.uid() = user_id and is_custom = true)
  with check (auth.uid() = user_id and is_custom = true);

create policy "domains: owner deletes custom"
  on domains for delete to authenticated
  using (auth.uid() = user_id and is_custom = true);

-- ---------------------------------------------------------------------------
-- links
-- ---------------------------------------------------------------------------
-- Reads go browser -> Supabase directly (architecture.md §1) so select must work
-- here. Writes are still routed through the Worker because it owns KV cache
-- invalidation, but the policies are written as if they were the only guard,
-- because for a determined caller holding a valid JWT they are.

create policy "links: owner reads"
  on links for select to authenticated
  using (auth.uid() = user_id);

create policy "links: owner inserts"
  on links for insert to authenticated
  with check (auth.uid() = user_id);

create policy "links: owner updates"
  on links for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "links: owner deletes"
  on links for delete to authenticated
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- qr_codes
-- ---------------------------------------------------------------------------

create policy "qr_codes: owner reads"
  on qr_codes for select to authenticated
  using (auth.uid() = user_id);

create policy "qr_codes: owner inserts"
  on qr_codes for insert to authenticated
  with check (auth.uid() = user_id);

create policy "qr_codes: owner updates"
  on qr_codes for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "qr_codes: owner deletes"
  on qr_codes for delete to authenticated
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- scan_events
-- ---------------------------------------------------------------------------
-- Read-only to users. Inserts come from the Worker under service_role, which
-- bypasses RLS. There is deliberately no insert policy: if analytics could be
-- written from a browser JWT, anyone could fabricate their own scan history.

create policy "scan_events: owner reads"
  on scan_events for select to authenticated
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- daily_salts
-- ---------------------------------------------------------------------------
-- RLS is on with no policies at all, which denies every authenticated and anon
-- request. Only service_role can reach it. Leaking a salt would make every
-- visitor hash for that day reversible by brute force over the IP space.
