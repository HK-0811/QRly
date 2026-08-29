#!/usr/bin/env node
/**
 * End-to-end analytics test: drive real scans at the running Worker, then read
 * back what actually landed in Postgres.
 *
 * Unit tests cover enrichment. This covers what they cannot — that the row
 * survives PostgREST, that the is_first_scan trigger fires correctly across
 * repeat visits, that the write really happens after the response rather than
 * blocking it, and that no raw IP reaches the database.
 *
 * Requires `npm run dev` in backend/ on :8787.
 *
 *   node tools/test-analytics.mjs
 */
import { env } from './db.mjs';

const API = process.env.API_URL || 'http://localhost:8787';
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

const PHONE =
  'Mozilla/5.0 (Linux; Android 14; SM-S911B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36';
const IPHONE =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1';
const DESKTOP =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

async function scan(slug, { ua = PHONE, ip = '203.0.113.7', headers = {}, query = '' } = {}) {
  return fetch(`${API}/${slug}${query}`, {
    redirect: 'manual',
    headers: {
      'User-Agent': ua,
      'CF-Connecting-IP': ip,
      'Accept-Language': 'en-IN,en;q=0.9',
      'Sec-Fetch-Dest': 'document',
      ...headers,
    },
  });
}

/** waitUntil work is not finished when the response returns — that is the point. */
async function settle(ms = 1500) {
  await new Promise((r) => setTimeout(r, ms));
}

const stamp = Date.now();
const created = [];

async function main() {
  if ((await fetch(`${API}/api/health`)).status !== 200) {
    throw new Error(`Worker is not running at ${API}. Start it with: cd backend && npm run dev`);
  }

  const email = `an-${stamp}@qrly.test`;
  const password = `An1!${stamp}an`;
  const u = await admin('/auth/v1/admin/users', {
    method: 'POST',
    body: JSON.stringify({ email, password, email_confirm: true }),
  });
  if (u.status >= 300) throw new Error(`create user: ${JSON.stringify(u.body)}`);
  created.push(u.body.id);

  const jwt = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: ANON, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
    .then((r) => r.json())
    .then((b) => b.access_token);

  const mk = async (slug) => {
    const r = await fetch(`${API}/api/links`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${jwt}` },
      body: JSON.stringify({ destination_url: 'https://example.com/menu', slug }),
    });
    const b = await r.json();
    if (r.status !== 201) throw new Error(`create link: ${JSON.stringify(b)}`);
    return b.link;
  };

  const events = async (linkId, select = '*') =>
    (await admin(`/rest/v1/scan_events?link_id=eq.${linkId}&select=${select}&order=id`)).body ?? [];

  // -- the write happens after the response --------------------------------
  console.log('\ntelemetry never blocks a scan');

  const link = await mk(`an${stamp}`);

  // How long a round trip to Supabase actually takes from here. If the insert
  // were on the critical path, the redirect could not be faster than this.
  const probeStart = Date.now();
  await admin('/rest/v1/domains?select=hostname&limit=1');
  const supabaseRtt = Date.now() - probeStart;

  const before = Date.now();
  const res = await scan(link.slug);
  const elapsed = Date.now() - before;

  check('the scan still 302s', res.status === 302);
  check(
    'the redirect returns far faster than a Supabase round trip',
    elapsed < supabaseRtt / 2,
    `redirect ${elapsed}ms vs Supabase round trip ${supabaseRtt}ms — the insert is on the critical path`,
  );

  await settle();
  const after = await events(link.id);
  check('the event lands shortly afterwards', after.length === 1, `${after.length} rows`);

  // -- the row itself ------------------------------------------------------
  console.log('\nwhat gets recorded');

  const row = after[0] ?? {};
  check('attributed to the right link and account', row.link_id === link.id && row.user_id === u.body.id);
  check('device parsed from the user agent', row.device_type === 'mobile', `device_type=${row.device_type}`);
  check('Android reports its real model', row.device_model === 'SM-S911B', `model=${row.device_model}`);
  check('OS and browser recorded', row.os_name === 'Android' && row.browser_name === 'Chrome');
  check('language preference recorded', row.language === 'en-IN', `language=${row.language}`);
  check('not flagged as a bot', row.is_bot === false, `bot_reason=${row.bot_reason}`);
  check('privacy signal absent', row.gpc === false);
  check('event_type is the reserved single value', row.event_type === 'redirect');

  console.log('\nno raw IP anywhere');
  const dump = JSON.stringify(after);
  check('the row does not contain the client IP', !dump.includes('203.0.113.7'));
  check('a visitor hash was computed instead', typeof row.visitor_hash === 'string' && row.visitor_hash.length === 32,
    `visitor_hash=${row.visitor_hash}`);
  check('the hash is opaque hex', /^[0-9a-f]{32}$/.test(row.visitor_hash ?? ''));

  // -- first vs returning --------------------------------------------------
  console.log('\nfirst versus returning (resolved by the database, not the Worker)');

  check('the first scan is marked as first', row.is_first_scan === true);

  await scan(link.slug);
  await settle();
  const twice = await events(link.id);
  check('a second scan from the same visitor is recorded', twice.length === 2);
  const sameVisitor = twice.filter((r) => r.visitor_hash === row.visitor_hash);
  check('  ...and carries the same visitor hash', sameVisitor.length === 2, `${sameVisitor.length} rows`);
  check('  ...with exactly one of them marked as first',
    sameVisitor.filter((r) => r.is_first_scan === true).length === 1,
    JSON.stringify(sameVisitor.map((r) => r.is_first_scan)));

  await scan(link.slug, { ip: '198.51.100.20', ua: IPHONE });
  await settle();
  const three = await events(link.id);
  const other = three.find((r) => r.visitor_hash !== row.visitor_hash);
  check('a different visitor gets a different hash', other !== undefined);
  check('  ...and is marked as first', other?.is_first_scan === true, `is_first_scan=${other?.is_first_scan}`);
  check('iOS reports no device model, which is Apple behaviour rather than a bug',
    other?.device_model === 'iPhone', `model=${other?.device_model}`);

  // -- concurrency ---------------------------------------------------------
  console.log('\nconcurrent scans');

  const raceLink = await mk(`race${stamp}`);
  await Promise.all(Array.from({ length: 8 }, () => scan(raceLink.slug, { ip: '198.51.100.77' })));
  await settle(2500);
  const raced = await events(raceLink.id, 'id,is_first_scan,visitor_hash');
  check('every concurrent scan was recorded', raced.length === 8, `${raced.length} rows`);
  const firsts = raced.filter((r) => r.is_first_scan === true).length;
  // A read-then-insert in the Worker would let several edges each believe they
  // were first. Resolving it inside the insert bounds that.
  check('at most one is marked as the first scan', firsts <= 1, `${firsts} rows claim to be first`);

  // -- bots ----------------------------------------------------------------
  console.log('\nbots and link previews');

  const botLink = await mk(`bot${stamp}`);
  await scan(botLink.slug, { ua: 'WhatsApp/2.23.20.0 A' });
  await scan(botLink.slug, { ua: 'Googlebot/2.1 (+http://www.google.com/bot.html)' });
  await scan(botLink.slug, { ua: 'curl/8.4.0' });
  await scan(botLink.slug, { ua: DESKTOP });
  await settle(2500);

  const botRows = await events(botLink.id, 'is_bot,bot_reason,device_type');
  // Matched by content, not by position: the inserts run in waitUntil after each
  // response, so they can land in any order.
  const reasons = botRows.map((r) => r.bot_reason);
  check('all four were recorded — nothing is silently dropped', botRows.length === 4, `${botRows.length} rows`);
  check('the WhatsApp preview is flagged and named',
    reasons.includes('Link preview: WhatsApp'), JSON.stringify(reasons));
  check('Googlebot is flagged as a crawler', reasons.includes('Crawler: Googlebot'), JSON.stringify(reasons));
  check('curl is flagged as automation',
    reasons.includes('Automated: Command-line client'), JSON.stringify(reasons));
  const human = botRows.find((r) => r.is_bot === false);
  check('the real desktop browser is not flagged',
    human?.device_type === 'desktop', `device=${human?.device_type}`);
  check('bots are counted separately rather than excluded',
    botRows.filter((r) => r.is_bot).length === 3);

  // -- acquisition ---------------------------------------------------------
  console.log('\nacquisition');

  const utmLink = await mk(`utm${stamp}`);
  await scan(utmLink.slug, {
    query: '?utm_source=poster&utm_medium=qr&utm_campaign=spring2026',
    headers: { Referer: 'https://news.example.com/article' },
  });
  await settle();
  const utmRow = (await events(utmLink.id, 'utm_source,utm_medium,utm_campaign,referrer_host'))[0] ?? {};
  check('UTM parameters captured', utmRow.utm_source === 'poster' && utmRow.utm_campaign === 'spring2026');
  check('referrer host captured', utmRow.referrer_host === 'news.example.com', utmRow.referrer_host);

  // -- privacy signal ------------------------------------------------------
  console.log('\nGlobal Privacy Control');

  const gpcLink = await mk(`gpc${stamp}`);
  await scan(gpcLink.slug, { headers: { 'Sec-GPC': '1' } });
  await scan(gpcLink.slug, { headers: { DNT: '1' }, ip: '198.51.100.42' });
  await settle(2000);

  const gpcRows = await events(
    gpcLink.id,
    'gpc,visitor_hash,is_first_scan,postal_code,latitude,longitude,ua_raw,country,device_type',
  );
  check('the scan is still counted', gpcRows.length === 2, `${gpcRows.length} rows`);
  check('Sec-GPC is honoured', gpcRows[0]?.gpc === true);
  check('DNT is honoured too', gpcRows[1]?.gpc === true);
  check('no visitor hash, so nothing links the request to another one',
    gpcRows.every((r) => r.visitor_hash === null));
  check('  ...and therefore no first-versus-returning attribution',
    gpcRows.every((r) => r.is_first_scan === null));
  check('precise geography dropped',
    gpcRows.every((r) => r.postal_code === null && r.latitude === null && r.longitude === null));
  check('raw user agent dropped', gpcRows.every((r) => r.ua_raw === null));
  check('device class kept — aggregate by construction',
    gpcRows.every((r) => r.device_type === 'mobile'));

  // -- what is NOT recorded ------------------------------------------------
  console.log('\nevents that should not be recorded at all');

  const ghostBefore = (await admin('/rest/v1/scan_events?select=id&limit=1&order=id.desc')).body ?? [];
  await scan(`nosuchslug${stamp}`);
  await settle();
  const ghostAfter = (await admin('/rest/v1/scan_events?select=id&limit=1&order=id.desc')).body ?? [];
  check(
    'an unknown slug records nothing — otherwise anyone could inflate your numbers by walking the namespace',
    ghostBefore[0]?.id === ghostAfter[0]?.id,
    `${ghostBefore[0]?.id} -> ${ghostAfter[0]?.id}`,
  );

  // -- disabled links still record -----------------------------------------
  const offLink = await mk(`off${stamp}`);
  await fetch(`${API}/api/links/${offLink.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${jwt}` },
    body: JSON.stringify({ is_active: false }),
  });
  await scan(offLink.slug);
  await settle();
  const offRows = await events(offLink.id, 'id,is_bot');
  check(
    'a scan of a disabled link is still recorded — someone scanned a real printed code',
    offRows.length === 1,
    `${offRows.length} rows`,
  );

  // -- latency -------------------------------------------------------------
  console.log('\nredirect latency with analytics enabled');

  const perfLink = await mk(`perf${stamp}`);
  await scan(perfLink.slug);
  const samples = [];
  for (let i = 0; i < 40; i++) {
    const r = await scan(perfLink.slug);
    const dur = Number(/dur=(\d+)/.exec(r.headers.get('server-timing') ?? '')?.[1] ?? NaN);
    if (Number.isFinite(dur)) samples.push(dur);
  }
  const sorted = [...samples].sort((a, b) => a - b);
  const p50 = sorted[Math.floor(sorted.length * 0.5)];
  const p95 = sorted[Math.floor(sorted.length * 0.95)];
  console.log(`        resolve: p50 ${p50}ms  p95 ${p95}ms  max ${Math.max(...samples)}ms`);
  check(
    'analytics did not change redirect latency — it runs after the response',
    p50 < 20,
    `p50=${p50}ms`,
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
  console.log('\ntest account cleaned up (scan events cascade with it)');
}

console.log(`\n${passed} passed, ${failures.length} failed`);
if (failures.length) {
  console.log('\nFAILURES:');
  for (const f of failures) console.log(`  - ${f}`);
  process.exit(1);
}
