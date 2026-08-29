#!/usr/bin/env node
/**
 * End-to-end test of the Worker's privileged API against the real Supabase project.
 *
 * Unit tests cover the pure logic. This covers what they cannot: that a real
 * Supabase-issued ES256 token verifies against the live JWKS, that PostgREST
 * accepts the shapes we send it, and that ownership filtering actually holds when
 * the Worker is using a service_role key that bypasses RLS entirely.
 *
 * That last one matters most. Inside the Worker, RLS is off. Every ownership check
 * in routes/links.ts is a hand-written `user_id=eq.` filter, and a missing one is
 * invisible until someone else's link changes.
 *
 * Requires `npm run dev` in backend/ (or `wrangler dev`) on :8787.
 *
 *   node tools/test-api.mjs
 */
import { env } from './db.mjs';

const API = process.env.API_URL || 'http://127.0.0.1:8787';
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
  let parsed = null;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {
    parsed = text;
  }
  return { status: res.status, body: parsed };
}

async function signIn(email, password) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: ANON, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const body = await res.json();
  if (!body.access_token) throw new Error(`sign-in failed: ${JSON.stringify(body)}`);
  return body.access_token;
}

const stamp = Date.now();
const created = [];

async function main() {
  const health = await api(null, 'GET', '/api/health');
  if (health.status !== 200) {
    throw new Error(`Worker is not running at ${API}. Start it with: cd backend && npm run dev`);
  }

  const users = [
    { tag: 'A', email: `api-a-${stamp}@qrly.test`, password: `Aa1!${stamp}aa` },
    { tag: 'B', email: `api-b-${stamp}@qrly.test`, password: `Bb1!${stamp}bb` },
  ];
  for (const u of users) {
    const res = await admin('/auth/v1/admin/users', {
      method: 'POST',
      body: JSON.stringify({ email: u.email, password: u.password, email_confirm: true }),
    });
    if (res.status >= 300) throw new Error(`create ${u.tag}: ${JSON.stringify(res.body)}`);
    u.id = res.body.id;
    created.push(u.id);
    u.jwt = await signIn(u.email, u.password);
  }
  const [A, B] = users;

  // -- authentication ------------------------------------------------------
  console.log('\nauthentication');

  check(
    'no token is rejected',
    (await api(null, 'POST', '/api/links', { destination_url: 'https://example.com' })).status === 401,
  );

  check(
    'a garbage token is rejected',
    (await api('not.a.jwt', 'POST', '/api/links', { destination_url: 'https://example.com' })).status === 401,
  );

  // The anon key IS a JWT, but an HS256 API key rather than an ES256 user token.
  // If the verifier ever accepted it, every anonymous caller would become a user
  // with no id. The algorithm pin in lib/auth.ts is what stops this.
  const anonAsUser = await api(ANON, 'POST', '/api/links', { destination_url: 'https://example.com' });
  check(
    'the anon API key is NOT accepted as a user session',
    anonAsUser.status === 401,
    `status=${anonAsUser.status}`,
  );

  const serviceAsUser = await api(SERVICE, 'POST', '/api/links', {
    destination_url: 'https://example.com',
  });
  check(
    'the service_role key is NOT accepted as a user session',
    serviceAsUser.status === 401,
    `status=${serviceAsUser.status}`,
  );

  check('unknown /api routes 404 rather than 401', (await api(A.jwt, 'GET', '/api/nope')).status === 404);

  // -- creation ------------------------------------------------------------
  console.log('\nlink creation');

  const auto = await api(A.jwt, 'POST', '/api/links', {
    destination_url: 'example.com/landing',
    title: 'Launch poster',
  });
  check('creates a link with a generated slug', auto.status === 201, JSON.stringify(auto.body).slice(0, 200));
  check('normalises a bare hostname to https', auto.body?.link?.destination_url === 'https://example.com/landing');
  check('returns a usable short URL', auto.body?.short_url === `https://localhost:8787/${auto.body?.link?.slug}`,
    auto.body?.short_url);
  check('generated slug avoids ambiguous glyphs', /^[23456789A-HJ-NP-Za-km-z]{7}$/.test(auto.body?.link?.slug ?? ''),
    auto.body?.link?.slug);
  check('new links start unchecked by Safe Browsing', auto.body?.link?.safe_browsing_status === 'unchecked');

  const customSlug = `promo-${stamp}`;
  const custom = await api(A.jwt, 'POST', '/api/links', {
    destination_url: 'https://example.com/promo',
    slug: customSlug,
  });
  check('accepts a custom slug', custom.status === 201, JSON.stringify(custom.body).slice(0, 200));

  const dupe = await api(B.jwt, 'POST', '/api/links', {
    destination_url: 'https://example.com/other',
    slug: customSlug,
  });
  check(
    'a taken slug conflicts even across accounts — the namespace is per hostname',
    dupe.status === 409 && dupe.body?.error === 'slug_taken',
    `status=${dupe.status}`,
  );

  // -- validation ----------------------------------------------------------
  console.log('\nvalidation');

  const cases = [
    ['javascript: scheme', { destination_url: 'javascript:alert(1)' }, 'scheme_not_allowed'],
    ['data: scheme', { destination_url: 'data:text/html,<h1>x' }, 'scheme_not_allowed'],
    ['private IP', { destination_url: 'http://192.168.1.1/admin' }, 'private_ip'],
    ['cloud metadata IP', { destination_url: 'http://169.254.169.254/' }, 'private_ip'],
    ['decimal-encoded loopback', { destination_url: 'http://2130706433/' }, 'private_ip'],
    ['localhost', { destination_url: 'http://localhost:9000/' }, 'private_host'],
    ['embedded credentials', { destination_url: 'https://paypal.com@evil.example/' }, 'embedded_credentials'],
    ['reserved slug', { destination_url: 'https://example.com', slug: 'api' }, 'reserved'],
    ['slug with a space', { destination_url: 'https://example.com', slug: 'my code' }, 'invalid_characters'],
    ['expiry in the past', { destination_url: 'https://example.com', expires_at: '2020-01-01T00:00:00Z' }, 'invalid_expiry'],
  ];
  for (const [label, body, expected] of cases) {
    const res = await api(A.jwt, 'POST', '/api/links', body);
    check(
      `rejects ${label}`,
      res.status === 400 && res.body?.error === expected,
      `status=${res.status} error=${res.body?.error}`,
    );
    if (res.status === 400) {
      check(`  ...with a message a person can act on`, (res.body?.message?.length ?? 0) > 10, res.body?.message);
    }
  }

  // -- cross-tenant --------------------------------------------------------
  console.log('\ncross-tenant isolation (service_role bypasses RLS here — these filters are the only guard)');

  const aId = auto.body.link.id;

  const bReads = await api(B.jwt, 'PATCH', `/api/links/${aId}`, {
    destination_url: 'https://attacker.example/',
  });
  check("B cannot edit A's link", bReads.status === 404, `status=${bReads.status}`);

  const bDeletes = await api(B.jwt, 'DELETE', `/api/links/${aId}`);
  check("B cannot delete A's link", bDeletes.status === 404, `status=${bDeletes.status}`);

  const stillMine = await api(A.jwt, 'PATCH', `/api/links/${aId}`, { title: 'still here' });
  check("A's link survived both attempts", stillMine.status === 200 && stillMine.body?.link?.title === 'still here');

  // -- editing -------------------------------------------------------------
  console.log('\nediting');

  const edited = await api(A.jwt, 'PATCH', `/api/links/${aId}`, {
    destination_url: 'https://example.com/moved',
  });
  check('destination can be changed — the entire point of a dynamic QR code',
    edited.status === 200 && edited.body?.link?.destination_url === 'https://example.com/moved');
  check('a changed destination resets the Safe Browsing verdict',
    edited.body?.link?.safe_browsing_status === 'unchecked');
  check('the response states the cache propagation window',
    edited.body?.cache_propagation_seconds === 60);

  const badEdit = await api(A.jwt, 'PATCH', `/api/links/${aId}`, {
    destination_url: 'javascript:alert(1)',
  });
  check('edits are validated as strictly as creates', badEdit.status === 400);

  const toggled = await api(A.jwt, 'PATCH', `/api/links/${aId}`, { is_active: false });
  check('a link can be switched off', toggled.status === 200 && toggled.body?.link?.is_active === false);

  const empty = await api(A.jwt, 'PATCH', `/api/links/${aId}`, {});
  check('an empty patch is rejected rather than silently succeeding', empty.status === 400);

  const missing = await api(A.jwt, 'PATCH', '/api/links/00000000-0000-0000-0000-000000000000', {
    title: 'x',
  });
  check('editing a nonexistent link 404s', missing.status === 404);

  // -- deletion guard ------------------------------------------------------
  console.log('\ndeletion');

  const qrLink = await api(A.jwt, 'POST', '/api/links', { destination_url: 'https://example.com/print' });
  const qrLinkId = qrLink.body.link.id;
  const domainRes = await fetch(
    `${SUPABASE_URL}/rest/v1/domains?hostname=eq.localhost%3A8787&select=id`,
    { headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` } },
  );
  const domainId = (await domainRes.json())[0].id;

  await admin('/rest/v1/qr_codes', {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({ user_id: A.id, link_id: qrLinkId, locked_domain_id: domainId }),
  });

  const guarded = await api(A.jwt, 'DELETE', `/api/links/${qrLinkId}`);
  check(
    'deleting a link with printed QR codes requires confirmation',
    guarded.status === 409 && guarded.body?.requires_confirmation === true,
    `status=${guarded.status}`,
  );

  const forced = await api(A.jwt, 'DELETE', `/api/links/${qrLinkId}?force=true`);
  check('deletion still possible when confirmed', forced.status === 204, `status=${forced.status}`);

  const plainDelete = await api(A.jwt, 'DELETE', `/api/links/${aId}`);
  check('a link with no QR codes deletes without a prompt', plainDelete.status === 204);

  const gone = await api(A.jwt, 'PATCH', `/api/links/${aId}`, { title: 'x' });
  check('the deleted link is really gone', gone.status === 404);
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
