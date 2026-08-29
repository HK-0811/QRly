#!/usr/bin/env node
/**
 * Custom domain flow, end to end.
 *
 * **What this cannot prove.** Phase 8's acceptance criterion — a real subdomain
 * on a real registrar resolving over HTTPS with a valid certificate — needs a
 * registered domain on a Cloudflare zone, which this project does not have. Every
 * check below runs without one, and the Cloudflare API client is exercised only
 * for its "not configured" path. That gap is real and is recorded in plan.md
 * rather than papered over.
 *
 * **What it does prove.** The registration and verification flow works against
 * live DNS, tenant isolation holds, apex domains are refused before anything is
 * created, and a domain with links on it cannot be deleted.
 *
 * Requires `npm run dev` in backend/ on :8787.
 *
 *   node tools/test-domains.mjs
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

async function api(jwt, method, path, body) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${jwt}` },
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

const stamp = Date.now();
const created = [];
const createdDomains = [];

async function main() {
  if ((await fetch(`${API}/api/health`).catch(() => ({ status: 0 }))).status !== 200) {
    throw new Error(`Worker is not running at ${API}.`);
  }

  const users = [
    { tag: 'A', email: `dom-a-${stamp}@qrify.test`, password: `Da1!${stamp}aa` },
    { tag: 'B', email: `dom-b-${stamp}@qrify.test`, password: `Db1!${stamp}bb` },
  ];

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
  }
  const [A, B] = users;

  // -- validation ----------------------------------------------------------
  console.log('\nhostname validation');

  const apex = await api(A.jwt, 'POST', '/api/domains', { hostname: 'example.com' });
  check(
    'a root domain is refused before anything is created',
    apex.status === 400 && apex.body?.error === 'apex_not_supported',
    `status=${apex.status} error=${apex.body?.error}`,
  );
  check('  ...and suggests a subdomain instead', String(apex.body?.hint).includes('qr.example.com'));

  const apexUk = await api(A.jwt, 'POST', '/api/domains', { hostname: 'example.co.uk' });
  check(
    'a two-label public suffix is recognised as a root domain',
    apexUk.status === 400 && apexUk.body?.error === 'apex_not_supported',
    `status=${apexUk.status}`,
  );

  for (const bad of ['', 'nodot', 'has space.com', '-bad.example.com']) {
    const res = await api(A.jwt, 'POST', '/api/domains', { hostname: bad });
    check(`rejects ${JSON.stringify(bad)}`, res.status === 400, `status=${res.status}`);
  }

  // -- registration --------------------------------------------------------
  console.log('\nregistration');

  const hostname = `qr-${stamp}.qrify-test.example`;
  const add = await api(A.jwt, 'POST', '/api/domains', { hostname });
  check('a subdomain is accepted', add.status === 201, JSON.stringify(add.body).slice(0, 200));
  if (add.body?.domain?.id) createdDomains.push(add.body.domain.id);

  check('it starts pending, not active', add.body?.domain?.verification_status === 'pending');
  check('  ...and is not servable yet', add.body?.domain?.is_active === false);
  check('the CNAME instruction is returned with the record', add.body?.instructions?.record_type === 'CNAME');
  check('  ...naming the exact hostname and target',
    add.body?.instructions?.name === hostname && typeof add.body?.instructions?.value === 'string');
  check('  ...and warning about proxied Cloudflare records',
    String(add.body?.instructions?.note).includes('DNS only'));
  check(
    'the missing Cloudflare credentials are reported rather than hidden',
    typeof add.body?.cloudflare_error === 'string' && add.body.cloudflare_error.includes('not configured'),
    String(add.body?.cloudflare_error),
  );

  const dupe = await api(A.jwt, 'POST', '/api/domains', { hostname });
  check('the same account cannot add it twice', dupe.status === 409 && dupe.body?.error === 'hostname_taken');

  const stolen = await api(B.jwt, 'POST', '/api/domains', { hostname });
  check(
    'another account cannot claim a hostname already registered',
    stolen.status === 409,
    `status=${stolen.status}`,
  );
  check(
    "  ...without being told whose it is",
    !String(stolen.body?.message).includes(A.email),
    stolen.body?.message,
  );

  // -- verification against live DNS ---------------------------------------
  console.log('\nverification against real DNS');

  const verify = await api(A.jwt, 'POST', `/api/domains/${add.body.domain.id}/verify`);
  check('verify returns a result', verify.status === 200, `status=${verify.status}`);
  check(
    'a hostname with no record reports pending, not failed',
    verify.body?.outcome?.state === 'pending',
    `state=${verify.body?.outcome?.state} message=${verify.body?.outcome?.message}`,
  );
  check(
    '  ...telling the person what record to add',
    String(verify.body?.outcome?.hint).includes('CNAME'),
    verify.body?.outcome?.hint,
  );
  check(
    'both resolvers were consulted',
    Array.isArray(verify.body?.dns?.resolvers) && verify.body.dns.resolvers.length === 2,
    JSON.stringify(verify.body?.dns?.resolvers),
  );
  check(
    'at least one resolver answered',
    verify.body?.dns?.resolvers?.some((r) => r.reachable),
  );
  check(
    'the certificate state says it is not configured, rather than claiming pending',
    verify.body?.certificate?.configured === false,
  );
  check('the domain did not go live on DNS alone', verify.body?.domain?.is_active === false);

  // A hostname that DOES have a CNAME, pointing somewhere else. Proves the
  // wrong-target branch against a real answer rather than a fixture.
  const realCname = await api(A.jwt, 'POST', '/api/domains', { hostname: 'www.github.com' });
  if (realCname.status === 201) {
    createdDomains.push(realCname.body.domain.id);
    const v = await api(A.jwt, 'POST', `/api/domains/${realCname.body.domain.id}/verify`);
    check(
      'a real CNAME pointing elsewhere is reported as failed, naming what it found',
      v.body?.outcome?.state === 'failed' && String(v.body?.outcome?.message).includes('github.com'),
      `state=${v.body?.outcome?.state} message=${v.body?.outcome?.message}`,
    );
    check('  ...and shows the actual resolved value', v.body?.dns?.found === 'github.com',
      String(v.body?.dns?.found));
  } else {
    check('could add a hostname with a real CNAME', false, `status=${realCname.status}`);
  }

  // -- tenant isolation ----------------------------------------------------
  console.log('\ntenant isolation');

  const bVerifies = await api(B.jwt, 'POST', `/api/domains/${add.body.domain.id}/verify`);
  check("B cannot verify A's domain", bVerifies.status === 404, `status=${bVerifies.status}`);

  const bDeletes = await api(B.jwt, 'DELETE', `/api/domains/${add.body.domain.id}`);
  check("B cannot delete A's domain", bDeletes.status === 404, `status=${bDeletes.status}`);

  const stillThere = await api(A.jwt, 'POST', `/api/domains/${add.body.domain.id}/verify`);
  check("A's domain survived both attempts", stillThere.status === 200);

  // -- deletion guard ------------------------------------------------------
  console.log('\ndeletion');

  // Activate the domain directly so a link can be created on it, then prove the
  // guard. A printed code on this hostname must make deletion impossible.
  await admin(`/rest/v1/domains?id=eq.${add.body.domain.id}`, {
    method: 'PATCH',
    body: JSON.stringify({ is_active: true, verification_status: 'active' }),
  });

  const link = await api(A.jwt, 'POST', '/api/links', {
    destination_url: 'https://example.com/on-custom-domain',
    domain_id: add.body.domain.id,
  });
  check('a link can be created on a verified custom domain', link.status === 201,
    `status=${link.status} ${JSON.stringify(link.body).slice(0, 160)}`);
  check('  ...and its short URL uses that hostname',
    String(link.body?.short_url).includes(hostname), link.body?.short_url);

  const blocked = await api(A.jwt, 'DELETE', `/api/domains/${add.body.domain.id}`);
  check(
    'a domain with links on it cannot be deleted',
    blocked.status === 409 && blocked.body?.error === 'domain_in_use',
    `status=${blocked.status}`,
  );
  check(
    '  ...and the message says why, in terms of printed codes',
    String(blocked.body?.message).includes('printed QR'),
    blocked.body?.message,
  );

  await api(A.jwt, 'DELETE', `/api/links/${link.body.link.id}`);
  const nowDeletable = await api(A.jwt, 'DELETE', `/api/domains/${add.body.domain.id}`);
  check('once nothing references it, deletion succeeds', nowDeletable.status === 204,
    `status=${nowDeletable.status}`);
  createdDomains.splice(createdDomains.indexOf(add.body.domain.id), 1);

  // -- redirect isolation --------------------------------------------------
  console.log('\nredirect engine');
  const gone = await fetch(`${API}/anything`, {
    redirect: 'manual',
    headers: { Host: hostname },
  });
  check('a removed hostname does not serve', gone.status !== 302, `status=${gone.status}`);
}

try {
  await main();
} catch (err) {
  failures.push(`harness error: ${err.message}`);
  console.error('\nHARNESS ERROR:', err.message);
} finally {
  for (const id of createdDomains) {
    await admin(`/rest/v1/domains?id=eq.${id}`, { method: 'DELETE' }).catch(() => {});
  }
  for (const id of created) {
    await admin(`/auth/v1/admin/users/${id}`, { method: 'DELETE' }).catch(() => {});
  }
  console.log('\ntest accounts and domains cleaned up');
}

console.log(`\n${passed} passed, ${failures.length} failed`);
console.log(
  '\nNot covered: a real registrar CNAME resolving over HTTPS with a Cloudflare-issued\n' +
    'certificate. That needs a registered domain on a Cloudflare zone. See plan.md phases 7-8.',
);
if (failures.length) {
  console.log('\nFAILURES:');
  for (const f of failures) console.log(`  - ${f}`);
  process.exit(1);
}
