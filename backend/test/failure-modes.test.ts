import { env, createExecutionContext, waitOnExecutionContext } from 'cloudflare:test';
import { describe, it, expect, beforeEach } from 'vitest';
import worker from '../src/index';
import { writeLink, writeMiss, linkKey } from '../src/lib/kv';
import { resetRateLimits } from '../src/lib/rate-limit';
import type { CachedLink } from '../src/types';

/**
 * architecture.md §12 — the failure-mode table, verified rather than asserted.
 *
 * The consistent principle being tested: **a redirect must survive the failure of
 * everything except Cloudflare.** That property is the single most valuable thing
 * about this design — a printed QR code cannot be recalled, so the redirect has
 * to keep working when the database does not.
 *
 * Supabase is simulated as down by pointing SUPABASE_URL at a host that does not
 * resolve. That exercises the real error path: a failed `fetch` inside
 * lib/supabase.ts, not a mocked rejection at some convenient seam.
 */

const DEAD_SUPABASE = 'https://qrify-supabase-is-down.invalid';

const link: CachedLink = {
  id: '11111111-1111-1111-1111-111111111111',
  user_id: '22222222-2222-2222-2222-222222222222',
  domain_id: '33333333-3333-3333-3333-333333333333',
  qr_id: null,
  destination_url: 'https://example.com/printed-poster',
  is_active: true,
  expires_at: null,
  safe_browsing_status: 'clean',
  domain_active: true,
};

async function scan(slug: string, overrides: Partial<typeof env> = {}, host = 'qrify.test') {
  const request = new Request(`https://${host}/${slug}`, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Linux; Android 14; SM-S911B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Mobile Safari/537.36',
      'CF-Connecting-IP': `203.0.113.${Math.floor(Math.random() * 200) + 1}`,
    },
  });
  const ctx = createExecutionContext();
  const res = await worker.fetch(request, { ...env, ...overrides }, ctx);
  // Waits for the analytics write registered in waitUntil, so a failure there
  // surfaces here rather than being swallowed by the test runner.
  await waitOnExecutionContext(ctx);
  return res;
}

async function clearKv() {
  const { keys } = await env.LINKS_KV.list();
  await Promise.all(keys.map((k) => env.LINKS_KV.delete(k.name)));
}

describe('failure mode: Supabase down, cache warm', () => {
  beforeEach(async () => {
    await clearKv();
    resetRateLimits();
  });

  it('still redirects — no printed code breaks', async () => {
    // This is the property architecture.md calls the best thing about the design.
    await writeLink(env, 'qrify.test', 'poster', link);

    const res = await scan('poster', { SUPABASE_URL: DEAD_SUPABASE });

    expect(res.status).toBe(302);
    expect(res.headers.get('Location')).toBe('https://example.com/printed-poster');
    expect(res.headers.get('X-Qrify-Source')).toBe('kv');
  });

  it('drops the analytics write silently rather than failing the scan', async () => {
    await writeLink(env, 'qrify.test', 'poster', link);

    // The insert runs in waitUntil against a dead host. waitOnExecutionContext
    // above would surface an unhandled rejection; a clean 302 means recordScan
    // swallowed it as documented.
    const res = await scan('poster', { SUPABASE_URL: DEAD_SUPABASE });
    expect(res.status).toBe(302);
  });

  it('keeps serving a disabled link its own page, not a redirect', async () => {
    await writeLink(env, 'qrify.test', 'off', { ...link, is_active: false });
    const res = await scan('off', { SUPABASE_URL: DEAD_SUPABASE });
    expect(res.status).toBe(404);
    expect(await res.text()).toContain('turned off');
  });

  it('keeps serving a flagged link its warning page', async () => {
    // The warning has to survive a database outage too: the alternative is
    // redirecting to a known-malicious page because Postgres was unreachable.
    await writeLink(env, 'qrify.test', 'bad', { ...link, safe_browsing_status: 'flagged' });
    const res = await scan('bad', { SUPABASE_URL: DEAD_SUPABASE });
    expect(res.status).toBe(200);
    expect(await res.text()).toContain('flagged as unsafe');
  });

  it('answers a known-unknown slug from the negative cache', async () => {
    await writeMiss(env, 'qrify.test', 'ghost');
    const res = await scan('ghost', { SUPABASE_URL: DEAD_SUPABASE });
    expect(res.status).toBe(404);
    expect(res.headers.get('X-Qrify-Source')).toBe('kv-negative');
  });
});

describe('failure mode: Supabase down, cache cold', () => {
  beforeEach(async () => {
    await clearKv();
    resetRateLimits();
  });

  it('returns 503 with Retry-After, never 404', async () => {
    // A 404 would tell a crawler the printed code is dead, and tell the person
    // holding the phone that their poster is wrong. Neither is true.
    const res = await scan('never-seen', { SUPABASE_URL: DEAD_SUPABASE });

    expect(res.status).toBe(503);
    expect(res.headers.get('Retry-After')).toBe('30');
    expect(res.headers.get('X-Qrify-Source')).toBe('db-down');
  });

  it('says the problem is ours, not the code the person scanned', async () => {
    const body = await (await scan('never-seen', { SUPABASE_URL: DEAD_SUPABASE })).text();
    expect(body).toContain('problem on our side');
    expect(body).not.toContain('404');
  });

  it('does not poison the cache with a failed lookup', async () => {
    await scan('never-seen', { SUPABASE_URL: DEAD_SUPABASE });
    // If the outage wrote a negative sentinel, the slug would keep 404ing for a
    // minute after Postgres came back.
    expect(await env.LINKS_KV.get(linkKey('qrify.test', 'never-seen'))).toBeNull();
  });
});

describe('failure mode: unhandled error', () => {
  beforeEach(resetRateLimits);

  it('renders a branded page with a reference id, not a stack trace', async () => {
    // Every path that can plausibly fail now degrades on its own, which is the
    // point of the tests above. To exercise the top-level boundary itself we have
    // to break something that has no handler: a binding that throws on access.
    const request = new Request('https://qrify.test/');
    const ctx = createExecutionContext();
    const broken = new Proxy(
      { ...env },
      {
        get(target, prop, receiver) {
          if (prop === 'DASHBOARD_ORIGIN') throw new Error('binding exploded');
          return Reflect.get(target, prop, receiver);
        },
      },
    ) as typeof env;
    const res = await worker.fetch(request, broken, ctx);

    expect(res.status).toBe(500);
    const body = await res.text();
    expect(body).toContain('Something went wrong on our side');
    expect(body).toMatch(/[0-9a-f]{8}/); // the reference id
    expect(body).not.toContain('binding exploded');
    expect(body).not.toContain('TypeError');
  });

  it('returns JSON, not HTML, for /api callers', async () => {
    const request = new Request('https://qrify.test/api/links', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer not-a-token' },
      body: '{}',
    });
    const ctx = createExecutionContext();
    const res = await worker.fetch(request, env, ctx);
    await waitOnExecutionContext(ctx);

    // An invalid token is a handled 401 rather than a crash, but the point stands:
    // an API caller never receives an HTML page.
    expect(res.headers.get('Content-Type')).toContain('application/json');
  });
});

describe('failure mode: KV unavailable', () => {
  beforeEach(resetRateLimits);

  it('degrades to Postgres rather than failing, because KV is not a source of truth', async () => {
    // Simulated by a KV whose reads always fail. The redirect path must fall
    // through to Postgres rather than treating a cache error as an outage.
    const flaky = {
      get: async () => {
        throw new Error('KV unavailable');
      },
      put: async () => {
        throw new Error('KV unavailable');
      },
      list: async () => ({ keys: [], list_complete: true, cacheStatus: null }),
      delete: async () => {},
      getWithMetadata: async () => ({ value: null, metadata: null, cacheStatus: null }),
    } as unknown as KVNamespace;

    const request = new Request('https://qrify.test/whatever');
    const ctx = createExecutionContext();
    const res = await worker.fetch(request, { ...env, LINKS_KV: flaky }, ctx);

    // A KV read failure must not propagate. With Postgres also unreachable in the
    // test environment the honest answer is a handled 503 — the important part is
    // that it is a 503 from the documented fall-through, not a 500 from a throw.
    // This assertion previously failed with 500, which is how the missing
    // try/catch around the KV read in lib/kv.ts was found.
    expect(res.status).toBe(503);
    expect(await res.text()).toContain('problem on our side');
  });
});
