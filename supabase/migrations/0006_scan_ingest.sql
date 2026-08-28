-- qrify — scan ingestion
--
-- is_first_scan is resolved here rather than in the Worker.
--
-- The Worker could read the table, decide, and then insert, but that is two
-- network round trips and it races: two scans from the same visitor arriving at
-- two edges within the same moment would both read "not seen" and both claim to
-- be the first. Doing it in a BEFORE INSERT trigger makes it one statement and
-- one round trip, and the row is decided against the table as it exists at insert
-- time.

create or replace function set_is_first_scan()
returns trigger
language plpgsql
as $$
begin
  -- A null visitor_hash means the scanner sent a privacy signal, so there is
  -- nothing to attribute and nothing to compare against. Leaving is_first_scan
  -- null keeps those rows out of first-versus-returning rather than silently
  -- counting them as new.
  if new.visitor_hash is null then
    new.is_first_scan := null;
    return new;
  end if;

  if new.is_first_scan is null then
    new.is_first_scan := not exists (
      select 1 from scan_events s
      where s.link_id = new.link_id
        and s.visitor_hash = new.visitor_hash
    );
  end if;

  return new;
end;
$$;

create trigger scan_events_set_is_first_scan
  before insert on scan_events
  for each row execute function set_is_first_scan();

comment on function set_is_first_scan() is
  'Resolves is_first_scan inside the insert. Uses the partial index on '
  '(link_id, visitor_hash, created_at), so it is an index probe rather than a scan.';
