import { env, createExecutionContext, waitOnExecutionContext } from 'cloudflare:test';
import { describe, it, expect, beforeEach } from 'vitest';
import worker from '../src/index';
import { resetRateLimits, ANON_CREATE_LIMIT } from '../src/lib/rate-limit';
import { isDashboardPath } from '../src/lib/dashboard';
import { isReserved } from '../src/lib/slug';

/**
 * The unauthenticated creation surface.
 *
 * This is the only endpoint in the product that writes without a verified caller,
 * so what is being tested is mostly about the boundary: which paths need a
 * session, which do not, and what stops a script from minting rows forever.
 *
 * Supabase is pointed at a host that does not resolve, exactly as in
 * failure-modes.test.ts. That is deliberate rather than a limitation — a request
 * that reaches the database has already proved the thing under test, which is
 * that it got past the auth middleware at all. A 401 and a 500 are easy to tell
 * apart, and only one of them means the boundary moved.
 */

const DEAD_SUPABASE = 'https://qrly-supabase-is-down.invalid';
const PLATFORM = 'https://qrly.test';

let ip = 1;

async function post(
  path: string,
  body: unknown,
  init: { auth?: string; method?: string; sameIp?: boolean } = {},
) {
  const request = new Request(`${PLATFORM}${path}`, {
    method: init.method ?? 'POST',
    headers: {
      'Content-Type': 'application/json',
      // A fresh address per call unless a test is deliberately hammering one,
      // so the per-isolate limiter does not leak between cases.
      'CF-Connecting-IP': init.sameIp ? '203.0.113.9' : `198.51.100.${(ip++ % 250) + 1}`,
      ...(init.auth ? { Authorization: init.auth } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const ctx = createExecutionContext();
  const res = await worker.fetch(request, { ...env, SUPABASE_URL: DEAD_SUPABASE }, ctx);
  await waitOnExecutionContext(ctx);
  return res;
}

beforeEach(() => resetRateLimits());

describe('anonymous creation needs no account', () => {
  it('does not demand a session, or the whole signed-out flow is unreachable', async () => {
    const res = await post('/api/anon/links', { destination_url: 'https://example.com/menu' });
    expect(res.status).not.toBe(401);
  });

  it('still validates the destination, so being unauthenticated is not being unchecked', async () => {
    const res = await post('/api/anon/links', { destination_url: 'javascript:alert(1)' });
    expect(res.status).toBe(400);
  });

  it('rejects a body that is not JSON with a sentence, not a stack trace', async () => {
    const request = new Request(`${PLATFORM}/api/anon/links`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'CF-Connecting-IP': '198.51.100.200' },
      body: 'not json',
    });
    const ctx = createExecutionContext();
    const res = await worker.fetch(request, { ...env, SUPABASE_URL: DEAD_SUPABASE }, ctx);
    await waitOnExecutionContext(ctx);

    expect(res.status).toBe(400);
    expect((await res.json<{ message: string }>()).message).toContain('JSON');
  });

  it('refuses a custom domain, because an anonymous caller can own none', async () => {
    const res = await post('/api/anon/links', {
      destination_url: 'https://example.com/menu',
      domain_id: '33333333-3333-3333-3333-333333333333',
    });

    expect(res.status).toBe(400);
    const body = await res.json<{ error: string; message: string }>();
    expect(body.error).toBe('domain_requires_account');
    // The message has to say what to do instead, not just what was refused.
    expect(body.message).toContain('claim it');
  });
});

describe('the unauthenticated surface is bounded', () => {
  it('rate limits one address far tighter than a signed-in account', async () => {
    // Signed-in accounts get 60 writes a minute. An anonymous caller cannot be
    // identified and every row it makes sits in the database for thirty days.
    expect(ANON_CREATE_LIMIT.max).toBeLessThan(60);

    let limited = false;
    for (let i = 0; i < ANON_CREATE_LIMIT.max + 2; i++) {
      const res = await post(
        '/api/anon/links',
        { destination_url: 'https://example.com/menu' },
        { sameIp: true },
      );
      if (res.status === 429) {
        limited = true;
        expect(res.headers.get('Retry-After')).toBeTruthy();
        break;
      }
    }
    expect(limited).toBe(true);
  });

  it('rejects a malformed claim token before it ever reaches the database', async () => {
    const res = await post('/api/anon/qr', { claim_token: 'not-a-uuid', style: {} }, { method: 'PUT' });
    expect(res.status).toBe(400);
    expect((await res.json<{ error: string }>()).error).toBe('invalid_token');
  });

  it('rejects a style that is not an object, so junk cannot be stored as one', async () => {
    const res = await post(
      '/api/anon/qr',
      { claim_token: '11111111-2222-4333-8444-555555555555', style: 'square' },
      { method: 'PUT' },
    );
    expect(res.status).toBe(400);
    expect((await res.json<{ error: string }>()).error).toBe('invalid_style');
  });
});

describe('everything else still requires a session', () => {
  it('refuses an unauthenticated claim — the token alone must not grant an owner', async () => {
    const res = await post('/api/links/claim', {
      claim_token: '11111111-2222-4333-8444-555555555555',
    });
    expect(res.status).toBe(401);
  });

  it('refuses unauthenticated link creation, so /anon is the only way in', async () => {
    const res = await post('/api/links', { destination_url: 'https://example.com' });
    expect(res.status).toBe(401);
  });

  it('refuses an unauthenticated domain write', async () => {
    const res = await post('/api/domains', { hostname: 'qr.example.com' });
    expect(res.status).toBe(401);
  });
});

describe('the signed-out flow has somewhere to live on the shared hostname', () => {
  it('routes /create to the dashboard, not to the redirect engine', () => {
    expect(isDashboardPath('/create')).toBe(true);
    expect(isDashboardPath('/create/design')).toBe(true);
  });

  it('reserves "create", or a printed code could be shadowed by the create page', () => {
    // The two lists have to agree. tools/check-dashboard-paths.mjs enforces this
    // against the real Next.js routes; this asserts the specific pair that the
    // anonymous flow added.
    expect(isReserved('create')).toBe(true);
  });
});
