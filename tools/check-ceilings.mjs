#!/usr/bin/env node
/**
 * Free-tier sanity check.
 *
 * The claim on the /cost page is that this runs at $0. That claim is only true
 * inside specific ceilings, and the ceiling that actually binds is not the
 * obvious one: Workers KV allows 100,000 reads a day but only **1,000 writes**.
 * Reads scale with scans, writes scale with cache misses — so the question that
 * matters is how many distinct slugs get probed in a day, not how many scans
 * happen.
 *
 * This measures the real cost of one scan and one cache fill against those
 * ceilings, using the current database, and prints where the headroom actually
 * runs out.
 *
 *   node tools/check-ceilings.mjs
 */
import { connect, env } from './db.mjs';

const CEILINGS = {
  workerRequestsPerDay: 100_000,
  kvReadsPerDay: 100_000,
  kvWritesPerDay: 1_000,
  supabaseBytes: 500 * 1024 * 1024,
  supabaseMau: 50_000,
};

const fmt = (n) => new Intl.NumberFormat('en').format(Math.round(n));
const bytes = (n) => `${(n / 1024 / 1024).toFixed(1)} MB`;

let warnings = 0;
function line(label, value, note = '') {
  console.log(`  ${label.padEnd(38)} ${String(value).padStart(14)}  ${note}`);
}
function warn(message) {
  warnings++;
  console.log(`  ⚠  ${message}`);
}

const sql = connect();

try {
  // -- storage -------------------------------------------------------------
  console.log('\nSupabase storage (ceiling: 500 MB)');

  const [size] = await sql`
    select
      pg_total_relation_size('scan_events')            as events_bytes,
      pg_database_size(current_database())             as db_bytes,
      (select count(*) from scan_events)               as events
  `;

  const perEvent = Number(size.events) > 0 ? Number(size.events_bytes) / Number(size.events) : 0;

  line('scan_events rows', fmt(size.events));
  line('scan_events size (incl. indexes)', bytes(Number(size.events_bytes)));
  line('whole database', bytes(Number(size.db_bytes)));
  line('bytes per scan event', perEvent ? `${Math.round(perEvent)} B` : '—');

  if (perEvent > 0) {
    const room = (CEILINGS.supabaseBytes - Number(size.db_bytes)) / perEvent;
    line('room for further events', fmt(room), 'before the 500 MB cap');

    // The nightly purge is the guard. Without it, storage is a countdown.
    const [retention] = await sql`
      select coalesce(min(retention_days), 365) as shortest,
             coalesce(max(retention_days), 365) as longest
      from profiles
    `;
    const perDay = Number(size.events) / 90; // events were seeded across ~90 days
    const steadyState = perDay * Number(retention.longest);
    line('longest retention window', `${retention.longest} d`);
    line('steady-state events at that window', fmt(steadyState), 'at the current rate');

    if (steadyState * perEvent > CEILINGS.supabaseBytes * 0.8) {
      warn(
        `steady state would reach ${bytes(steadyState * perEvent)}, over 80% of the 500 MB cap. ` +
          'Shorten retention or accept the ceiling.',
      );
    }
  }

  // -- the binding constraint ---------------------------------------------
  console.log('\nWorkers KV (ceilings: 100k reads/day, 1k writes/day)');

  console.log('  A scan costs 1 KV read. A scan of an uncached slug costs 1 read + 1 write.');
  console.log('  So reads bind on total scans; writes bind on distinct slugs touched per day.');
  console.log('');

  const [links] = await sql`select count(*) as total from links`;
  line('links in the system', fmt(links.total));

  // Kept in step with LINK_TTL_SECONDS in backend/src/lib/kv.ts. This number was
  // 60 seconds until this check showed a single hot link would spend the entire
  // daily write budget on its own.
  const LINK_TTL_SECONDS = 60 * 60;
  const refillsPerLinkPerDay = (24 * 60 * 60) / LINK_TTL_SECONDS;
  line('cache TTL', `${LINK_TTL_SECONDS / 60} min`);
  line('worst-case refills per link per day', fmt(refillsPerLinkPerDay));

  const worstCaseWrites = Number(links.total) * refillsPerLinkPerDay;
  line('worst-case KV writes/day', fmt(worstCaseWrites), `ceiling ${fmt(CEILINGS.kvWritesPerDay)}`);

  const sustainable = CEILINGS.kvWritesPerDay / refillsPerLinkPerDay;
  line('continuously-hot links supportable', fmt(sustainable), 'before writes bind');

  if (worstCaseWrites > CEILINGS.kvWritesPerDay) {
    console.log('');
    console.log('  The worst case assumes every link is scanned in every TTL window,');
    console.log('  all day. Real traffic is not uniform, so the binding number is the');
    console.log('  count of *continuously hot* links above, not the total.');
    console.log('  Past that the cache stops refilling and reads fall through to');
    console.log('  Postgres: slower, still correct. Nothing breaks, it degrades.');
  }

  console.log('');
  console.log('  Unknown slugs are only negative-cached on the second sighting, so a');
  console.log('  bot walking the namespace costs zero KV writes. See shouldCacheMiss');
  console.log('  in backend/src/lib/kv.ts.');

  const maxScans = CEILINGS.kvReadsPerDay;
  console.log('');
  line('max scans/day (KV reads)', fmt(maxScans));
  line('max scans/day (Worker requests)', fmt(CEILINGS.workerRequestsPerDay));
  line('binding ceiling', fmt(Math.min(maxScans, CEILINGS.workerRequestsPerDay)), 'scans/day');

  // -- accounts ------------------------------------------------------------
  console.log('\nSupabase Auth (ceiling: 50,000 MAU)');
  const [users] = await sql`select count(*) as total from profiles`;
  line('accounts', fmt(users.total), `ceiling ${fmt(CEILINGS.supabaseMau)}`);
  line('headroom', fmt(CEILINGS.supabaseMau - Number(users.total)));

  // -- index health --------------------------------------------------------
  console.log('\nHot-path index');

  const [plan] = await sql`
    explain (format json)
    select l.*, d.hostname
    from links l join domains d on d.id = l.domain_id
    where l.slug = 'nonexistent' and d.hostname = 'localhost:8787'
  `;
  const planText = JSON.stringify(plan);
  const usesIndex = /Index (Scan|Only Scan)/.test(planText);
  line('slug lookup uses an index', usesIndex ? 'yes' : 'NO');
  if (!usesIndex) {
    warn('the redirect cold path is doing a sequential scan — check links_domain_slug_unique');
  }

  console.log('');
  if (warnings === 0) {
    console.log('No ceiling is close. The $0 claim holds at the current scale.');
  } else {
    console.log(`${warnings} warning(s) above.`);
    process.exitCode = 1;
  }
} catch (err) {
  console.error('CHECK FAILED:', err.message);
  process.exitCode = 1;
} finally {
  await sql.end({ timeout: 5 }).catch(() => {});
}

void env;
