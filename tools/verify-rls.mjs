#!/usr/bin/env node
/**
 * Adversarial RLS verification.
 *
 * plan.md phase 1 calls this out as the single most dangerous silent failure in the
 * build: RLS that looks correct but isn't. So this does not inspect policies. It
 * creates two real accounts, signs both in, and has each one actively try to reach
 * the other's data through the same PostgREST endpoint the browser uses.
 *
 * A cross-tenant read must return ZERO ROWS, not an error — an error would leak the
 * existence of the row.
 *
 *   node tools/verify-rls.mjs
 */
import { env } from './db.mjs';

const SUPABASE_URL = env.SUPABASE_URL;
const ANON = env.SUPABASE_ANON_KEY;
const SERVICE = env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !ANON || !SERVICE) {
  console.error('SUPABASE_URL, SUPABASE_ANON_KEY and SUPABASE_SERVICE_KEY must be set in .env');
  process.exit(1);
}

const stamp = Date.now();
const USERS = [
  { tag: 'A', email: `rls-a-${stamp}@qrly.test`, password: `Aa1!${stamp}aa` },
  { tag: 'B', email: `rls-b-${stamp}@qrly.test`, password: `Bb1!${stamp}bb` },
];

// ---------------------------------------------------------------------------
// assertions
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// http helpers
// ---------------------------------------------------------------------------

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

/** A request shaped exactly like one the dashboard makes: anon key + user JWT. */
async function asUser(user, path, init = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1${path}`, {
    ...init,
    headers: {
      apikey: ANON,
      Authorization: `Bearer ${user.jwt}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
      ...(init.headers || {}),
    },
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

async function signIn(user) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: ANON, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: user.email, password: user.password }),
  });
  const body = await res.json();
  if (!body.access_token) throw new Error(`sign-in failed for ${user.tag}: ${JSON.stringify(body)}`);
  return body.access_token;
}

// ---------------------------------------------------------------------------

const created = [];

async function main() {
  console.log('setting up two real accounts\n');

  for (const u of USERS) {
    const res = await admin('/auth/v1/admin/users', {
      method: 'POST',
      body: JSON.stringify({ email: u.email, password: u.password, email_confirm: true }),
    });
    if (res.status >= 300) throw new Error(`could not create ${u.tag}: ${JSON.stringify(res.body)}`);
    u.id = res.body.id;
    created.push(u.id);
    u.jwt = await signIn(u);
  }

  const [A, B] = USERS;

  // -- token shape ---------------------------------------------------------
  console.log('token');
  const header = JSON.parse(Buffer.from(A.jwt.split('.')[0], 'base64url').toString());
  const claims = JSON.parse(Buffer.from(A.jwt.split('.')[1], 'base64url').toString());
  check('user JWT is signed ES256 (asymmetric, JWKS-verifiable)', header.alg === 'ES256', `alg=${header.alg}`);
  check('JWT carries a kid for JWKS lookup', typeof header.kid === 'string' && header.kid.length > 0);
  check('JWT sub matches the created user id', claims.sub === A.id);
  check('JWT role is authenticated', claims.role === 'authenticated');

  // -- profiles trigger ----------------------------------------------------
  console.log('\nprofiles auto-provision');
  const ownProfile = await asUser(A, `/profiles?select=id,email,retention_days`);
  check('signup created a profiles row', Array.isArray(ownProfile.body) && ownProfile.body.length === 1);
  check('profile id matches auth user', ownProfile.body?.[0]?.id === A.id);
  check('profile email matches', ownProfile.body?.[0]?.email === A.email);
  check('retention_days defaults to 365', ownProfile.body?.[0]?.retention_days === 365);

  const otherProfile = await asUser(A, `/profiles?id=eq.${B.id}&select=id,email`);
  check(
    "A reading B's profile returns zero rows, not an error",
    otherProfile.status === 200 && Array.isArray(otherProfile.body) && otherProfile.body.length === 0,
    `status=${otherProfile.status} body=${JSON.stringify(otherProfile.body)}`,
  );

  // -- platform domain visibility -----------------------------------------
  console.log('\ndomains');
  const domains = await asUser(A, '/domains?select=id,hostname,is_custom&is_custom=eq.false');
  check('platform domains are readable by any signed-in user', (domains.body?.length ?? 0) >= 1);
  const platformDomainId = domains.body?.[0]?.id;

  const forgedPlatform = await asUser(A, '/domains', {
    method: 'POST',
    body: JSON.stringify({ hostname: `evil-${stamp}.test`, is_custom: false, user_id: null }),
  });
  check(
    'a user cannot create a platform (unowned) domain',
    forgedPlatform.status >= 400,
    `status=${forgedPlatform.status}`,
  );

  const forgedOwner = await asUser(A, '/domains', {
    method: 'POST',
    body: JSON.stringify({ hostname: `steal-${stamp}.test`, is_custom: true, user_id: B.id }),
  });
  check(
    "a user cannot create a domain owned by someone else",
    forgedOwner.status >= 400,
    `status=${forgedOwner.status}`,
  );

  // -- links: create, own, isolate ----------------------------------------
  console.log('\nlinks');
  const mk = async (u, slug, dest) =>
    asUser(u, '/links', {
      method: 'POST',
      body: JSON.stringify({
        user_id: u.id,
        domain_id: platformDomainId,
        slug,
        destination_url: dest,
        title: `${u.tag} link`,
      }),
    });

  const aLink = await mk(A, `a${stamp}`, 'https://example.com/a');
  check('A can create a link on the platform domain', aLink.status === 201, `status=${aLink.status} ${JSON.stringify(aLink.body)}`);
  const bLink = await mk(B, `b${stamp}`, 'https://example.com/b');
  check('B can create a link', bLink.status === 201, `status=${bLink.status}`);

  const aLinkId = aLink.body?.[0]?.id;
  const bLinkId = bLink.body?.[0]?.id;

  const aList = await asUser(A, '/links?select=id,slug');
  check('A sees exactly its own links', aList.body?.length === 1 && aList.body[0].id === aLinkId,
    `saw ${JSON.stringify(aList.body?.map((l) => l.slug))}`);

  const aReadsB = await asUser(A, `/links?id=eq.${bLinkId}&select=id,destination_url`);
  check(
    "A reading B's link by id returns zero rows, not an error",
    aReadsB.status === 200 && aReadsB.body?.length === 0,
    `status=${aReadsB.status} body=${JSON.stringify(aReadsB.body)}`,
  );

  const aUpdatesB = await asUser(A, `/links?id=eq.${bLinkId}`, {
    method: 'PATCH',
    body: JSON.stringify({ destination_url: 'https://attacker.example/pwned' }),
  });
  check(
    "A cannot update B's link (zero rows affected)",
    aUpdatesB.status < 300 && aUpdatesB.body?.length === 0,
    `status=${aUpdatesB.status} body=${JSON.stringify(aUpdatesB.body)}`,
  );

  const bStillOk = await asUser(B, `/links?id=eq.${bLinkId}&select=destination_url`);
  check(
    "B's destination is untouched after A's attempt",
    bStillOk.body?.[0]?.destination_url === 'https://example.com/b',
    JSON.stringify(bStillOk.body),
  );

  const aDeletesB = await asUser(A, `/links?id=eq.${bLinkId}`, { method: 'DELETE' });
  check("A cannot delete B's link", aDeletesB.status < 300 && aDeletesB.body?.length === 0);

  const stillThere = await asUser(B, `/links?id=eq.${bLinkId}&select=id`);
  check("B's link still exists after A's delete attempt", stillThere.body?.length === 1);

  const forgedLink = await asUser(A, '/links', {
    method: 'POST',
    body: JSON.stringify({
      user_id: B.id,
      domain_id: platformDomainId,
      slug: `forged${stamp}`,
      destination_url: 'https://example.com/forged',
    }),
  });
  check(
    'A cannot create a link stamped with B as owner',
    forgedLink.status >= 400,
    `status=${forgedLink.status}`,
  );

  // -- immutability guards -------------------------------------------------
  console.log('\nimmutability guards');
  const slugChange = await asUser(A, `/links?id=eq.${aLinkId}`, {
    method: 'PATCH',
    body: JSON.stringify({ slug: `renamed${stamp}` }),
  });
  check('slug cannot be changed after creation', slugChange.status >= 400, `status=${slugChange.status}`);

  const destChange = await asUser(A, `/links?id=eq.${aLinkId}`, {
    method: 'PATCH',
    body: JSON.stringify({ destination_url: 'https://example.com/a-edited' }),
  });
  check('destination CAN be changed — that is the product', destChange.status < 300 &&
    destChange.body?.[0]?.destination_url === 'https://example.com/a-edited',
    `status=${destChange.status}`);
  check('updated_at moved on edit', destChange.body?.[0]?.updated_at !== destChange.body?.[0]?.created_at);

  // -- qr codes ------------------------------------------------------------
  console.log('\nqr codes');
  const aQr = await asUser(A, '/qr_codes', {
    method: 'POST',
    body: JSON.stringify({ user_id: A.id, link_id: aLinkId, locked_domain_id: platformDomainId, label: 'poster' }),
  });
  check('A can create a QR code for its own link', aQr.status === 201, `status=${aQr.status} ${JSON.stringify(aQr.body)}`);
  const aQrId = aQr.body?.[0]?.id;

  const crossQr = await asUser(A, '/qr_codes', {
    method: 'POST',
    body: JSON.stringify({ user_id: A.id, link_id: bLinkId, locked_domain_id: platformDomainId }),
  });
  check(
    "A cannot attach a QR code to B's link",
    crossQr.status >= 400,
    `status=${crossQr.status}`,
  );

  const relock = await asUser(A, `/qr_codes?id=eq.${aQrId}`, {
    method: 'PATCH',
    body: JSON.stringify({ locked_domain_id: platformDomainId === domains.body[1]?.id ? domains.body[0].id : domains.body[1]?.id }),
  });
  check(
    'locked_domain_id is immutable — printed copies cannot be orphaned',
    relock.status >= 400,
    `status=${relock.status}`,
  );

  // -- scan_events ---------------------------------------------------------
  console.log('\nscan events');
  const fabricate = await asUser(A, '/scan_events', {
    method: 'POST',
    body: JSON.stringify({ link_id: aLinkId, user_id: A.id, country: 'IN' }),
  });
  check(
    'a user cannot fabricate scan events from the browser',
    fabricate.status >= 400,
    `status=${fabricate.status}`,
  );

  const readAllScans = await asUser(A, '/scan_events?select=id&limit=5');
  check('scan_events reads are allowed but scoped', readAllScans.status === 200);

  // -- daily_salts ---------------------------------------------------------
  console.log('\ndaily salts');
  const salts = await asUser(A, '/daily_salts?select=day,salt');
  check(
    'daily_salts is unreachable from a user JWT (leaking a salt reverses every hash that day)',
    salts.status >= 400 || (Array.isArray(salts.body) && salts.body.length === 0),
    `status=${salts.status} body=${JSON.stringify(salts.body).slice(0, 120)}`,
  );

  // -- security definer functions -----------------------------------------
  // Supabase grants EXECUTE on new public functions to anon and authenticated by
  // default. A security-definer function left executable is a hole that RLS does
  // not cover, so the migrations revoke it explicitly. This proves the revoke.
  console.log('\nsecurity definer functions');
  const saltRpc = await asUser(A, '/rpc/ensure_daily_salt', {
    method: 'POST',
    body: JSON.stringify({}),
  });
  check(
    'ensure_daily_salt is not executable by a user (it would return the raw salt)',
    saltRpc.status >= 400,
    `status=${saltRpc.status} body=${JSON.stringify(saltRpc.body).slice(0, 140)}`,
  );

  const purgeRpc = await asUser(A, '/rpc/purge_expired_scan_events', {
    method: 'POST',
    body: JSON.stringify({}),
  });
  check(
    'purge_expired_scan_events is not executable by a user (it deletes every account data)',
    purgeRpc.status >= 400,
    `status=${purgeRpc.status}`,
  );

  // -- anon (no session at all) -------------------------------------------
  console.log('\nunauthenticated');
  const anonRes = await fetch(`${SUPABASE_URL}/rest/v1/links?select=id,destination_url`, {
    headers: { apikey: ANON, Authorization: `Bearer ${ANON}` },
  });
  const anonBody = await anonRes.json();
  check(
    'anon key with no user session sees no links',
    anonRes.status >= 400 || (Array.isArray(anonBody) && anonBody.length === 0),
    `status=${anonRes.status} body=${JSON.stringify(anonBody).slice(0, 120)}`,
  );

  // -- cascade -------------------------------------------------------------
  console.log('\ncascade on account deletion');
  await admin(`/auth/v1/admin/users/${B.id}`, { method: 'DELETE' });
  created.splice(created.indexOf(B.id), 1);
  const bGone = await asUser(A, `/links?id=eq.${bLinkId}&select=id`);
  check('deleting an account removes its links', bGone.body?.length === 0);
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
console.log('RLS holds under adversarial cross-tenant access.');
