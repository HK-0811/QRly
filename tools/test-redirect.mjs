#!/usr/bin/env node
/**
 * End-to-end test of the redirect engine against the running Worker.
 *
 * The thing that unit tests cannot cover here is the cache. Every interesting
 * behaviour in phase 3 — write-through invalidation, the negative sentinel, the
 * warm-cache latency target — only exists in the interaction between the Worker,
 * KV and Postgres. So this drives all three.
 *
 * Requires `npm run dev` in backend/ on :8787.
 *
 *   node tools/test-redirect.mjs
 */
import { env } from './db.mjs';

// Must match PLATFORM_HOSTNAME in wrangler.toml. Both localhost:8787 and
// 127.0.0.1:8787 are seeded as separate platform domains, and a slug on one does
// not resolve on the other — which is the point of the isolation test below.
const API = process.env.API_URL || 'http://localhost:8787';
const OTHER_HOST = 'http://127.0.0.1:8787';
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

async function api(token, method, path, body) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const text = await res.text();
  return { status: res.status, body: text ? JSON.parse(text) : null };
}

/** Never follow: the whole point is to inspect the 302 itself. */
async function scan(slug, init = {}) {
  const res = await fetch(`${API}/${slug}`, { redirect: 'manual', ...init });
  const body = res.headers.get('content-type')?.includes('text/html') ? await res.text() : '';
  return {
    status: res.status,
    location: res.headers.get('location'),
    source: res.headers.get('x-qrify-source'),
    timing: res.headers.get('server-timing'),
    cacheControl: res.headers.get('cache-control'),
    robots: res.headers.get('x-robots-tag'),
    referrerPolicy: res.headers.get('referrer-policy'),
    body,
  };
}

const stamp = Date.now();
const created = [];

async function main() {
  if ((await fetch(`${API}/api/health`)).status !== 200) {
    throw new Error(`Worker is not running at ${API}. Start it with: cd backend && npm run dev`);
  }

  const email = `redir-${stamp}@qrify.test`;
  const password = `Rr1!${stamp}rr`;
  const u = await admin('/auth/v1/admin/users', {
    method: 'POST',
    body: JSON.stringify({ email, password, email_confirm: true }),
  });
  if (u.status >= 300) throw new Error(`create user: ${JSON.stringify(u.body)}`);
  created.push(u.body.id);

  const tokenRes = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: ANON, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const jwt = (await tokenRes.json()).access_token;

  const mk = async (props) => {
    const r = await api(jwt, 'POST', '/api/links', {
      destination_url: 'https://example.com/base',
      ...props,
    });
    if (r.status !== 201) throw new Error(`create link: ${JSON.stringify(r.body)}`);
    return r.body.link;
  };

  // -- the happy path ------------------------------------------------------
  console.log('\nredirect');

  const live = await mk({ destination_url: 'https://example.com/live', slug: `live${stamp}` });
  const first = await scan(live.slug);

  check('a scan returns 302', first.status === 302, `status=${first.status}`);
  check('Location is the destination', first.location === 'https://example.com/live', first.location);
  check(
    'the response is served from cache, seeded at creation time',
    first.source === 'kv',
    `source=${first.source}`,
  );
  check(
    '302 not 301 — a permanent redirect would be cached in the scanner browser forever',
    first.status === 302,
  );
  check('the redirect is not cacheable', /no-store/.test(first.cacheControl ?? ''), first.cacheControl);
  check('short links are marked noindex', /noindex/.test(first.robots ?? ''), first.robots);
  check(
    'the short URL is not leaked to the destination via Referer',
    first.referrerPolicy === 'no-referrer',
    first.referrerPolicy,
  );
  check('Server-Timing is emitted for measurement', /resolve;dur=\d+/.test(first.timing ?? ''), first.timing);

  // -- cache invalidation --------------------------------------------------
  console.log('\ncache invalidation (the reason writes go through the Worker at all)');

  await api(jwt, 'PATCH', `/api/links/${live.id}`, {
    destination_url: 'https://example.com/moved',
  });
  const afterEdit = await scan(live.slug);
  check(
    'an edited destination takes effect immediately at this edge',
    afterEdit.location === 'https://example.com/moved',
    afterEdit.location,
  );
  check('and it is still a cache hit, not a Postgres round trip', afterEdit.source === 'kv',
    `source=${afterEdit.source}`);

  // -- cold path -----------------------------------------------------------
  console.log('\ncold cache');

  // Inserting straight into Postgres, bypassing the Worker, produces exactly the
  // cold-miss case: a link that exists but has never been cached.
  const domain = await admin('/rest/v1/domains?hostname=eq.localhost%3A8787&select=id');
  const directSlug = `direct${stamp}`;
  await admin('/rest/v1/links', {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({
      user_id: u.body.id,
      domain_id: domain.body[0].id,
      slug: directSlug,
      destination_url: 'https://example.com/direct',
    }),
  });

  const coldHit = await scan(directSlug);
  check(
    'a link never seen by the Worker resolves from Postgres',
    coldHit.status === 302 && coldHit.source === 'db',
    `status=${coldHit.status} source=${coldHit.source}`,
  );
  check('and lands on the right destination', coldHit.location === 'https://example.com/direct');

  const warmed = await scan(directSlug);
  check('the miss populated the cache', warmed.source === 'kv', `source=${warmed.source}`);

  // -- negative cache ------------------------------------------------------
  console.log('\nunknown slugs');

  const ghost = `ghost${stamp}`;
  const miss1 = await scan(ghost);
  check('an unknown slug returns 404', miss1.status === 404);
  check('  ...from Postgres the first time', miss1.source === 'db', `source=${miss1.source}`);
  check('  ...with a branded page, not a bare error', miss1.body.includes('does not point anywhere'));
  check('  ...that is marked noindex', /noindex/.test(miss1.robots ?? ''));

  const miss2 = await scan(ghost);
  check(
    'the second probe still reaches Postgres — the first miss is deliberately not cached',
    miss2.source === 'db',
    `source=${miss2.source}`,
  );

  const miss3 = await scan(ghost);
  check(
    'the third is served from the negative cache, sparing Postgres from then on',
    miss3.source === 'kv-negative',
    `source=${miss3.source}`,
  );

  // A bot walking random slugs never repeats one, so it never crosses the
  // second-sighting threshold and never spends a KV write. The free tier allows
  // 1,000 writes a day, so caching every first miss would let a single crawl
  // exhaust the entire cache.
  const walkSources = [];
  for (let i = 0; i < 12; i++) {
    walkSources.push((await scan(`walk-${stamp}-${i}`)).source);
  }
  check(
    'a namespace walk writes nothing to KV',
    walkSources.every((src) => src === 'db'),
    `sources: ${[...new Set(walkSources)].join(', ')}`,
  );

  // -- states --------------------------------------------------------------
  console.log('\nlink states');

  const off = await mk({ destination_url: 'https://example.com/off', slug: `off${stamp}` });
  await api(jwt, 'PATCH', `/api/links/${off.id}`, { is_active: false });
  const offScan = await scan(off.slug);
  check('a disabled link does not redirect', offScan.status !== 302, `status=${offScan.status}`);
  check('  ...and says it was turned off, not that it is broken',
    offScan.body.includes('turned off'));

  const exp = await mk({
    destination_url: 'https://example.com/exp',
    slug: `exp${stamp}`,
    expires_at: new Date(Date.now() + 2000).toISOString(),
  });
  check('a link expiring in 2s still redirects now', (await scan(exp.slug)).status === 302);

  await new Promise((r) => setTimeout(r, 2600));
  // The cached copy carries expires_at, so expiry is evaluated at read time and
  // needs no invalidation.
  const expScan = await scan(exp.slug);
  check('once past its expiry it stops redirecting, with no cache invalidation needed',
    expScan.status === 410, `status=${expScan.status}`);
  check('  ...and says it expired', expScan.body.includes('expired'));

  const flagged = await mk({ destination_url: 'https://example.com/bad', slug: `bad${stamp}` });
  await admin(`/rest/v1/links?id=eq.${flagged.id}`, {
    method: 'PATCH',
    body: JSON.stringify({ safe_browsing_status: 'flagged' }),
  });
  // Written directly to Postgres, so the cache still holds the clean copy. Force
  // a cold read by waiting out the 60s TTL would be slow; instead check that the
  // Worker's own edit path invalidates.
  await api(jwt, 'PATCH', `/api/links/${flagged.id}`, { title: 'flagged' });
  const flagScan = await scan(flagged.slug);
  check('a flagged link does NOT 404 — the printed code must keep resolving',
    flagScan.status === 200, `status=${flagScan.status}`);
  check('  ...it serves a warning page', flagScan.body.includes('flagged as unsafe'));
  check('  ...naming the destination host but not auto-following it',
    flagScan.body.includes('example.com') && flagScan.location === null);

  const deleted = await mk({ destination_url: 'https://example.com/del', slug: `del${stamp}` });
  await api(jwt, 'DELETE', `/api/links/${deleted.id}`);
  const delScan = await scan(deleted.slug);
  check('a deleted link 404s immediately, from the negative sentinel',
    delScan.status === 404 && delScan.source === 'kv-negative',
    `status=${delScan.status} source=${delScan.source}`);

  // -- host handling -------------------------------------------------------
  console.log('\nhostnames and reserved paths');

  // 127.0.0.1:8787 is a separate registered platform domain. A slug created on
  // localhost:8787 must not resolve there — the unique constraint is
  // (domain_id, slug), not slug alone, and the cache key carries the hostname.
  const otherHost = await fetch(`${OTHER_HOST}/${live.slug}`, { redirect: 'manual' });
  check(
    'a slug does not resolve on a different registered hostname',
    otherHost.status === 404,
    `status=${otherHost.status}`,
  );

  const unregistered = await fetch(`${API}/${live.slug}`, {
    redirect: 'manual',
    headers: { Host: 'evil.example' },
  });
  const spoofSource = unregistered.headers.get('x-qrify-source');
  if (spoofSource === 'unknown-host') {
    check('an unregistered Host header is refused before Postgres is touched', true);
  } else {
    // Node's fetch silently drops a Host override, so this cannot be exercised
    // from here. Saying so beats a check that passes for the wrong reason.
    console.log(
      '  SKIP  spoofed Host header — Node fetch will not send it ' +
        `(source=${spoofSource}). Covered by the hostname allow-list in redirect.ts.`,
    );
  }

  const robots = await fetch(`${API}/robots.txt`);
  check('robots.txt disallows crawling — a crawler would inflate scan counts',
    robots.status === 200 && (await robots.text()).includes('Disallow: /'));

  const favicon = await fetch(`${API}/favicon.ico`);
  check('favicon returns 204 rather than consuming a slug lookup', favicon.status === 204);

  const root = await fetch(`${API}/`, { redirect: 'manual' });
  check('the bare hostname explains itself instead of erroring',
    root.status === 404 && (await root.text()).includes('Nothing to redirect to'));

  const apiStillWorks = await fetch(`${API}/api/health`);
  check('registering the catch-all last did not shadow /api', apiStillWorks.status === 200);

  // -- latency -------------------------------------------------------------
  console.log('\nwarm-cache latency (target: p50 under 20ms)');

  const samples = [];
  for (let i = 0; i < 60; i++) {
    const t0 = process.hrtime.bigint();
    const res = await fetch(`${API}/${live.slug}`, { redirect: 'manual' });
    const t1 = process.hrtime.bigint();
    const worker = Number(/dur=(\d+)/.exec(res.headers.get('server-timing') ?? '')?.[1] ?? NaN);
    samples.push({ wall: Number(t1 - t0) / 1e6, worker });
  }

  const pct = (arr, p) => {
    const s = [...arr].sort((a, b) => a - b);
    return s[Math.min(s.length - 1, Math.floor((p / 100) * s.length))];
  };

  const workerTimes = samples.map((s) => s.worker).filter((n) => Number.isFinite(n));
  const wallTimes = samples.map((s) => s.wall);

  console.log(
    `        worker resolve: p50 ${pct(workerTimes, 50)}ms  p95 ${pct(workerTimes, 95)}ms  max ${Math.max(...workerTimes)}ms`,
  );
  console.log(
    `        wall clock:     p50 ${pct(wallTimes, 50).toFixed(1)}ms  p95 ${pct(wallTimes, 95).toFixed(1)}ms`,
  );

  check(
    'warm-cache resolve p50 is under 20ms',
    pct(workerTimes, 50) < 20,
    `p50=${pct(workerTimes, 50)}ms`,
  );
  check('warm-cache resolve p95 is under 50ms', pct(workerTimes, 95) < 50, `p95=${pct(workerTimes, 95)}ms`);
  console.log(
    '        note: measured against local Miniflare KV, which is a disk read rather ' +
      'than an edge lookup. Directionally right, not a production number.',
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
  console.log('\ntest account cleaned up');
}

console.log(`\n${passed} passed, ${failures.length} failed`);
if (failures.length) {
  console.log('\nFAILURES:');
  for (const f of failures) console.log(`  - ${f}`);
  process.exit(1);
}
