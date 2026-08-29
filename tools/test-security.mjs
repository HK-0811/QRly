#!/usr/bin/env node
/**
 * Phase 9 verification: rate limits, retention purge, and the secrets audit.
 *
 * The secrets check is the one that matters most. `SUPABASE_SERVICE_KEY` bypasses
 * RLS entirely, so a single accidental `NEXT_PUBLIC_` prefix would hand every
 * account's data to every visitor. Reading the code and concluding it is fine is
 * not the same as grepping the built bundle.
 *
 * Requires `npm run dev` in backend/ on :8787.
 *
 *   node tools/test-security.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { env, ROOT } from './db.mjs';

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

async function admin(path_, init = {}) {
  const res = await fetch(`${SUPABASE_URL}${path_}`, {
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

const stamp = Date.now();
const created = [];

// ---------------------------------------------------------------------------
// Secrets audit — runs with or without a Worker
// ---------------------------------------------------------------------------

function auditSecrets() {
  console.log('\nsecrets audit');

  const serviceSignature = SERVICE.split('.')[2];
  const pepper = (() => {
    const file = path.join(ROOT, 'backend', '.dev.vars');
    if (!fs.existsSync(file)) return null;
    const line = fs
      .readFileSync(file, 'utf8')
      .split(/\r?\n/)
      .find((l) => l.startsWith('VISITOR_HASH_PEPPER='));
    return line ? line.slice('VISITOR_HASH_PEPPER='.length) : null;
  })();

  const buildDir = path.join(ROOT, 'frontend', '.next');
  if (!fs.existsSync(buildDir)) {
    console.log('  SKIP  no frontend build present — run `npm run build` in frontend/ first');
    return;
  }

  /** Everything a browser can actually download. The webpack cache is not shipped. */
  const shipped = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === 'cache') continue;
        walk(full);
      } else if (/\.(js|css|json|html|txt|map)$/.test(entry.name)) {
        shipped.push(full);
      }
    }
  };
  walk(buildDir);

  const hits = (needle) =>
    shipped.filter((f) => {
      try {
        return fs.readFileSync(f, 'utf8').includes(needle);
      } catch {
        return false;
      }
    });

  const serviceHits = hits(serviceSignature);
  check(
    'the service_role key appears in no built file',
    serviceHits.length === 0,
    serviceHits.slice(0, 3).map((f) => path.relative(ROOT, f)).join(', '),
  );

  if (pepper) {
    const pepperHits = hits(pepper);
    check(
      'the visitor-hash pepper appears in no built file',
      pepperHits.length === 0,
      pepperHits.slice(0, 3).map((f) => path.relative(ROOT, f)).join(', '),
    );
  }

  // The anon key SHOULD be there — it is the browser's credential and is
  // RLS-backed. Asserting it is present catches the opposite mistake: a build
  // that silently dropped it and falls back to something unexpected.
  const anonHits = hits(ANON.split('.')[2]);
  check('the anon key IS present, as intended — it is RLS-backed', anonHits.length > 0);

  const envSource = fs.readFileSync(path.join(ROOT, '.env'), 'utf8');
  check(
    'no secret is exposed through a NEXT_PUBLIC_ variable',
    !/NEXT_PUBLIC_[A-Z_]*SERVICE/i.test(envSource) &&
      !/NEXT_PUBLIC_[A-Z_]*PEPPER/i.test(envSource) &&
      !/NEXT_PUBLIC_[A-Z_]*SECRET/i.test(envSource),
  );

  const gitignore = fs.readFileSync(path.join(ROOT, '.gitignore'), 'utf8');
  for (const secretFile of ['.env', 'supabase.md', '.dev.vars']) {
    check(`${secretFile} is gitignored`, gitignore.includes(secretFile));
  }
}

// ---------------------------------------------------------------------------

async function main() {
  auditSecrets();

  if ((await fetch(`${API}/api/health`).catch(() => ({ status: 0 }))).status !== 200) {
    console.log('\n  SKIP  Worker not running — rate limit and purge checks need it');
    return;
  }

  const email = `sec-${stamp}@qrly.test`;
  const password = `Ss1!${stamp}ss`;
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

  // -- API write limit -----------------------------------------------------
  console.log('\nAPI rate limit');

  const responses = await Promise.all(
    Array.from({ length: 80 }, (_, i) =>
      fetch(`${API}/api/links`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${jwt}` },
        body: JSON.stringify({ destination_url: `https://example.com/burst-${i}` }),
      }),
    ),
  );

  const statuses = responses.map((r) => r.status);
  const limited = statuses.filter((s) => s === 429);
  const succeeded = statuses.filter((s) => s === 201);

  check('a burst of 80 writes is throttled', limited.length > 0, `statuses: ${[...new Set(statuses)].join(', ')}`);
  check('but the first requests still succeed', succeeded.length > 0, `${succeeded.length} created`);
  check(
    'the throttled response carries Retry-After',
    responses.find((r) => r.status === 429)?.headers.get('retry-after') !== null,
  );

  const body = await responses.find((r) => r.status === 429)?.json();
  check(
    'and explains itself in words, not a bare 429',
    typeof body?.message === 'string' && body.message.length > 20,
    body?.message,
  );

  // -- redirect limit ------------------------------------------------------
  console.log('\nredirect rate limit');

  const created201 = responses.find((r) => r.status === 201);
  const link = (await created201.json()).link;

  const scans = await Promise.all(
    Array.from({ length: 200 }, () =>
      fetch(`${API}/${link.slug}`, {
        redirect: 'manual',
        headers: { 'CF-Connecting-IP': '198.51.100.250', 'User-Agent': 'burst-test' },
      }),
    ),
  );
  const scanStatuses = scans.map((r) => r.status);
  check(
    'a burst of 200 scans from one address is throttled',
    scanStatuses.includes(429),
    `statuses: ${[...new Set(scanStatuses)].join(', ')}`,
  );
  check('legitimate scans in the same burst still redirect', scanStatuses.includes(302));

  const other = await fetch(`${API}/${link.slug}`, {
    redirect: 'manual',
    headers: { 'CF-Connecting-IP': '203.0.113.99', 'User-Agent': 'other-client' },
  });
  check(
    'a different client is unaffected by that burst',
    other.status === 302,
    `status=${other.status}`,
  );

  // -- retention purge -----------------------------------------------------
  console.log('\nretention purge');

  await admin(`/rest/v1/profiles?id=eq.${u.body.id}`, {
    method: 'PATCH',
    body: JSON.stringify({ retention_days: 1 }),
  });

  const old = new Date(Date.now() - 10 * 86_400_000).toISOString();
  const recent = new Date().toISOString();
  await admin('/rest/v1/scan_events', {
    method: 'POST',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify([
      { link_id: link.id, user_id: u.body.id, created_at: old, country: 'IN', is_bot: false },
      { link_id: link.id, user_id: u.body.id, created_at: recent, country: 'IN', is_bot: false },
    ]),
  });

  const before = (await admin(`/rest/v1/scan_events?user_id=eq.${u.body.id}&select=id`)).body ?? [];
  check('two events stored, one old and one recent', before.length >= 2, `${before.length}`);

  await admin('/rest/v1/rpc/purge_expired_scan_events', { method: 'POST', body: '{}' });

  const after = (await admin(`/rest/v1/scan_events?user_id=eq.${u.body.id}&select=id,created_at`)).body ?? [];
  check('the event past the retention window is gone', after.length < before.length,
    `${before.length} -> ${after.length}`);
  check(
    'the recent event survives',
    after.some((r) => Math.abs(new Date(r.created_at) - new Date(recent)) < 60_000),
  );

  // -- flagged links keep resolving ---------------------------------------
  console.log('\nflagged destinations');

  // A second account, because the burst above deliberately exhausted the first
  // one's write allowance — the invalidating PATCH below would be throttled by
  // the limiter this same test just proved works.
  const email2 = `sec2-${stamp}@qrly.test`;
  const u2 = await admin('/auth/v1/admin/users', {
    method: 'POST',
    body: JSON.stringify({ email: email2, password, email_confirm: true }),
  });
  created.push(u2.body.id);
  const jwt2 = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: ANON, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email2, password }),
  })
    .then((r) => r.json())
    .then((b) => b.access_token);

  const flaggedLink = await fetch(`${API}/api/links`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${jwt2}` },
    body: JSON.stringify({ destination_url: 'https://example.com/will-be-flagged' }),
  })
    .then((r) => r.json())
    .then((b) => b.link);

  await admin(`/rest/v1/links?id=eq.${flaggedLink.id}`, {
    method: 'PATCH',
    body: JSON.stringify({ safe_browsing_status: 'flagged' }),
  });

  // Any write through the Worker refreshes the cached record, which is how a
  // verdict written straight to Postgres reaches the edge.
  const invalidate = await fetch(`${API}/api/links/${flaggedLink.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${jwt2}` },
    body: JSON.stringify({ title: 'flagged' }),
  });
  check('the invalidating write was not itself throttled', invalidate.status === 200,
    `status=${invalidate.status}`);

  const link_ = { slug: flaggedLink.slug };
  const flaggedScan = await fetch(`${API}/${link_.slug}`, {
    redirect: 'manual',
    headers: { 'CF-Connecting-IP': '203.0.113.98' },
  });
  const flaggedBody = await flaggedScan.text();
  check(
    'a flagged link serves a warning page rather than 404ing',
    flaggedScan.status === 200 && flaggedBody.includes('flagged as unsafe'),
    `status=${flaggedScan.status}`,
  );
  check('and does not auto-redirect', flaggedScan.headers.get('location') === null);
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
  console.log('\ntest account cleaned up');
}

console.log(`\n${passed} passed, ${failures.length} failed`);
if (failures.length) {
  console.log('\nFAILURES:');
  for (const f of failures) console.log(`  - ${f}`);
  process.exit(1);
}
