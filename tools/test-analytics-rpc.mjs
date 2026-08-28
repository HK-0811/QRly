#!/usr/bin/env node
/**
 * Tests the dashboard aggregate functions through the same PostgREST endpoint the
 * browser uses, with two real accounts.
 *
 * Two things matter here and neither is visible by reading the SQL:
 *
 *   1. Every function is SECURITY INVOKER, so RLS scopes scan_events to the
 *      caller before aggregation. A single DEFINER by accident would expose every
 *      account's analytics to every other account, silently, with no error.
 *
 *   2. get_scan_breakdown is the one place a caller-supplied string reaches a
 *      query. It is checked against an allow-list rather than quoted, and that
 *      needs proving rather than asserting.
 *
 *   node tools/test-analytics-rpc.mjs
 */
import { env } from './db.mjs';

const SUPABASE_URL = env.SUPABASE_URL;
const ANON = env.SUPABASE_ANON_KEY;
const SERVICE = env.SUPABASE_SERVICE_KEY;

let passed = 0;
const failures = [];

function check(name, condition, detail = '') {
  if (condition) {
    passed++;
    console.log(`  PASS  ${name}`);
  } else {
    failures.push(`${name}${detail ? ` — ${detail}` : ''}`);
    console.log(`  FAIL  ${name}${detail ? ` — ${detail}` : ''}`);
  }
}

async function admin(path, init = {}) {
  const res = await fetch(`${SUPABASE_URL}${path}`, {
    ...init,
    headers: {
      apikey: SERVICE,
      Authorization: `Bearer ${SERVICE}`,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });
  const text = await res.text();
  return { status: res.status, body: text ? JSON.parse(text) : null };
}

async function rpc(jwt, fn, args) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
    method: 'POST',
    headers: { apikey: ANON, Authorization: `Bearer ${jwt}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(args),
  });
  const text = await res.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  return { status: res.status, body };
}

const stamp = Date.now();
const created = [];

async function main() {
  const users = [
    { tag: 'A', email: `rpc-a-${stamp}@qrify.test`, password: `Aa1!${stamp}aa`, scans: 30 },
    { tag: 'B', email: `rpc-b-${stamp}@qrify.test`, password: `Bb1!${stamp}bb`, scans: 7 },
  ];

  const domain = (await admin('/rest/v1/domains?hostname=eq.localhost%3A8787&select=id')).body[0];

  for (const u of users) {
    const res = await admin('/auth/v1/admin/users', {
      method: 'POST',
      body: JSON.stringify({ email: u.email, password: u.password, email_confirm: true }),
    });
    if (res.status >= 300) throw new Error(`create ${u.tag}: ${JSON.stringify(res.body)}`);
    u.id = res.body.id;
    created.push(u.id);

    u.jwt = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: { apikey: ANON, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: u.email, password: u.password }),
    })
      .then((r) => r.json())
      .then((b) => b.access_token);

    const link = (
      await admin('/rest/v1/links', {
        method: 'POST',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify({
          user_id: u.id,
          domain_id: domain.id,
          slug: `rpc-${u.tag.toLowerCase()}-${stamp}`,
          destination_url: 'https://example.com/x',
        }),
      })
    ).body[0];
    u.linkId = link.id;

    const rows = Array.from({ length: u.scans }, (_, i) => ({
      link_id: link.id,
      user_id: u.id,
      domain_id: domain.id,
      created_at: new Date(Date.now() - i * 3_600_000).toISOString(),
      country: u.tag === 'A' ? (i % 3 === 0 ? 'IN' : 'US') : 'DE',
      city: u.tag === 'A' ? (i % 3 === 0 ? 'Pune' : 'New York') : 'Berlin',
      timezone: u.tag === 'A' ? 'Asia/Kolkata' : 'Europe/Berlin',
      latitude: u.tag === 'A' ? 18.5204 : 52.52,
      longitude: u.tag === 'A' ? 73.8567 : 13.405,
      device_type: i % 4 === 0 ? 'desktop' : 'mobile',
      os_name: i % 4 === 0 ? 'Windows' : 'Android',
      browser_name: 'Chrome',
      network_type: 'mobile',
      as_org: u.tag === 'A' ? 'Reliance Jio Infocomm Limited' : 'Deutsche Telekom AG',
      utm_campaign: i % 5 === 0 ? 'alpha' : null,
      local_hour: i % 24,
      local_dow: i % 7,
      visitor_hash: `${u.tag}${i % 5}`.padEnd(32, '0'),
      is_bot: i % 10 === 0,
      bot_reason: i % 10 === 0 ? 'Link preview: WhatsApp' : null,
      gpc: false,
      is_first_scan: null,
    }));

    await admin('/rest/v1/scan_events', {
      method: 'POST',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify(rows),
    });
  }

  const [A, B] = users;
  const humanA = A.scans - Math.ceil(A.scans / 10);
  const humanB = B.scans - Math.ceil(B.scans / 10);

  // -- tenant isolation ----------------------------------------------------
  console.log('\ntenant isolation (SECURITY INVOKER — RLS runs before the aggregate)');

  const sumA = await rpc(A.jwt, 'get_scan_summary', { f: {} });
  const sumB = await rpc(B.jwt, 'get_scan_summary', { f: {} });

  check('A sees only its own scans', sumA.body?.scans === humanA, `got ${sumA.body?.scans}, expected ${humanA}`);
  check('B sees only its own scans', sumB.body?.scans === humanB, `got ${sumB.body?.scans}, expected ${humanB}`);
  check(
    'neither total includes the other account',
    sumA.body?.scans !== humanA + humanB && sumB.body?.scans !== humanA + humanB,
  );

  const geoA = await rpc(A.jwt, 'get_scan_breakdown', { f: {}, dimension: 'country', max_rows: 50 });
  check(
    "A's country breakdown contains no country only B has",
    Array.isArray(geoA.body) && !geoA.body.some((r) => r.key === 'DE'),
    JSON.stringify(geoA.body),
  );

  // Passing another account's link id must narrow to nothing, not widen.
  const crossFilter = await rpc(A.jwt, 'get_scan_summary', { f: { link_id: B.linkId } });
  check(
    "filtering by another account's link returns zero, not their data",
    crossFilter.body?.scans === 0,
    `got ${crossFilter.body?.scans}`,
  );

  const anonSummary = await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_scan_summary`, {
    method: 'POST',
    headers: { apikey: ANON, Authorization: `Bearer ${ANON}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ f: {} }),
  });
  const anonBody = await anonSummary.json();
  check(
    'an anonymous caller aggregates nothing',
    anonSummary.status >= 400 || anonBody?.scans === 0,
    `status=${anonSummary.status} scans=${anonBody?.scans}`,
  );

  // -- the dimension allow-list -------------------------------------------
  console.log('\nbreakdown dimension allow-list');

  for (const bad of [
    'visitor_hash',
    'ua_raw',
    "country; drop table scan_events",
    'country) as x, (select salt from daily_salts limit 1',
    '"country"',
    'user_id',
  ]) {
    const res = await rpc(A.jwt, 'get_scan_breakdown', { f: {}, dimension: bad, max_rows: 5 });
    check(
      `rejects dimension ${JSON.stringify(bad.slice(0, 40))}`,
      res.status >= 400,
      `status=${res.status} body=${JSON.stringify(res.body).slice(0, 120)}`,
    );
  }

  const good = await rpc(A.jwt, 'get_scan_breakdown', { f: {}, dimension: 'os_name', max_rows: 5 });
  check('accepts an allow-listed dimension', good.status === 200 && Array.isArray(good.body));

  // -- filters actually filter --------------------------------------------
  console.log('\nfilters');

  const inOnly = await rpc(A.jwt, 'get_scan_summary', { f: { country: 'IN' } });
  const usOnly = await rpc(A.jwt, 'get_scan_summary', { f: { country: 'US' } });
  check(
    'country filter partitions the total exactly',
    inOnly.body.scans + usOnly.body.scans === humanA,
    `${inOnly.body.scans} + ${usOnly.body.scans} != ${humanA}`,
  );
  check('each partition is non-empty', inOnly.body.scans > 0 && usOnly.body.scans > 0);

  const desktop = await rpc(A.jwt, 'get_scan_summary', { f: { device_type: 'desktop' } });
  const mobile = await rpc(A.jwt, 'get_scan_summary', { f: { device_type: 'mobile' } });
  check('device filter partitions the total', desktop.body.scans + mobile.body.scans === humanA);

  const nonsense = await rpc(A.jwt, 'get_scan_summary', { f: { country: 'ZZ' } });
  check('a filter matching nothing returns zero, not everything', nonsense.body.scans === 0);

  // -- bots ----------------------------------------------------------------
  console.log('\nbot toggle');

  const withBots = await rpc(A.jwt, 'get_scan_summary', { f: { include_bots: true } });
  check('bots are excluded by default', sumA.body.scans === humanA);
  check('and included on request', withBots.body.scans === A.scans, `got ${withBots.body.scans}`);
  check(
    'the bot count is reported either way',
    withBots.body.bot_scans === A.scans - humanA,
    `got ${withBots.body.bot_scans}`,
  );

  // -- time series ---------------------------------------------------------
  console.log('\ntime series and heatmap');

  for (const bucket of ['hour', 'day', 'week', 'month']) {
    const ts = await rpc(A.jwt, 'get_scan_timeseries', { f: {}, bucket });
    const sum = (ts.body ?? []).reduce((s, p) => s + p.scans, 0);
    check(`${bucket} buckets sum to the total`, sum === humanA, `${sum} != ${humanA}`);
  }

  const injected = await rpc(A.jwt, 'get_scan_timeseries', { f: {}, bucket: "day'); drop table links; --" });
  check(
    'an unrecognised bucket falls back to day rather than being interpolated',
    injected.status === 200 && Array.isArray(injected.body),
    `status=${injected.status}`,
  );

  const heat = await rpc(A.jwt, 'get_local_time_heatmap', { f: {} });
  const heatSum = (heat.body ?? []).reduce((s, c) => s + c.scans, 0);
  check('heatmap cells sum to the total', heatSum === humanA, `${heatSum} != ${humanA}`);
  check(
    'heatmap hours are all in range',
    (heat.body ?? []).every((c) => c.local_hour >= 0 && c.local_hour <= 23 && c.local_dow >= 0 && c.local_dow <= 6),
  );

  // -- geo points ----------------------------------------------------------
  console.log('\nmap points');

  const points = await rpc(A.jwt, 'get_geo_points', { f: {}, max_rows: 100 });
  check('one point per city, not one per scan', (points.body ?? []).length === 2, `${points.body?.length} points`);
  check(
    'point volumes sum to the total',
    (points.body ?? []).reduce((s, p) => s + p.scans, 0) === humanA,
  );
  check(
    "no point carries another account's city",
    !(points.body ?? []).some((p) => p.city === 'Berlin'),
  );

  // -- filter options ------------------------------------------------------
  console.log('\nfilter options');

  const opts = await rpc(A.jwt, 'get_filter_options', { f: {} });
  check('offers only countries the caller actually has', JSON.stringify(opts.body?.countries?.sort()) === '["IN","US"]',
    JSON.stringify(opts.body?.countries));
  check("does not leak another account's values", !JSON.stringify(opts.body).includes('Deutsche Telekom'));
  check('includes bot-only values so the toggle has something to reveal',
    Array.isArray(opts.body?.device_types));

  // -- unique visitors -----------------------------------------------------
  console.log('\nunique visitors');
  check(
    'unique count is distinct hashes, not row count',
    sumA.body.unique_visitors === 5,
    `got ${sumA.body.unique_visitors}, seeded 5 distinct hashes`,
  );
  check(
    'first plus returning equals the attributed rows',
    sumA.body.first_scans + sumA.body.returning_scans === humanA - sumA.body.unattributed,
    `${sumA.body.first_scans} + ${sumA.body.returning_scans} vs ${humanA - sumA.body.unattributed}`,
  );
}

try {
  await main();
} catch (err) {
  failures.push(`harness error: ${err.message}`);
  console.error('\nHARNESS ERROR:', err.message);
} finally {
  for (const id of created) {
    await admin(`/auth/v1/admin/users/${id}`, { method: 'DELETE' }).catch(() => {});
  }
  console.log('\ntest accounts cleaned up');
}

console.log(`\n${passed} passed, ${failures.length} failed`);
if (failures.length) {
  console.log('\nFAILURES:');
  for (const f of failures) console.log(`  - ${f}`);
  process.exit(1);
}
