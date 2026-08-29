import { env, createExecutionContext, waitOnExecutionContext } from 'cloudflare:test';
import { describe, it, expect } from 'vitest';
import worker from '../src/index';
import { isDashboardPath, DASHBOARD_SEGMENTS } from '../src/lib/dashboard';
import { RESERVED_SLUGS } from '../src/lib/slug';

/** Stands in for the dashboard Worker and reports what it was asked for. */
const DASHBOARD = {
  fetch: async (req: Request) => new Response(`dashboard:${new URL(req.url).pathname}`),
} as unknown as Fetcher;

async function get(url: string, overrides: Partial<typeof env> = {}) {
  const ctx = createExecutionContext();
  const res = await worker.fetch(new Request(url), { ...env, ...overrides }, ctx);
  await waitOnExecutionContext(ctx);
  return res;
}

/** env.PLATFORM_HOSTNAME in the test pool. */
const PLATFORM = 'https://qrly.test';

describe('the dashboard and the redirect engine share one hostname', () => {
  it('serves the dashboard at / — a person typing the domain gets the product', async () => {
    const res = await get(`${PLATFORM}/`, { DASHBOARD });
    expect(await res.text()).toBe('dashboard:/');
  });

  it('forwards a dashboard page rather than treating it as a short code', async () => {
    const res = await get(`${PLATFORM}/links`, { DASHBOARD });
    expect(await res.text()).toBe('dashboard:/links');
  });

  it('forwards a nested dashboard path with its full path intact', async () => {
    const res = await get(`${PLATFORM}/links/abc-123`, { DASHBOARD });
    expect(await res.text()).toBe('dashboard:/links/abc-123');
  });

  it('forwards Next.js build output, or the page loads with no JavaScript', async () => {
    const res = await get(`${PLATFORM}/_next/static/chunk.js`, { DASHBOARD });
    expect(await res.text()).toBe('dashboard:/_next/static/chunk.js');
  });

  it('does NOT forward a short code — the hot path still owns the catch-all', async () => {
    const res = await get(`${PLATFORM}/aB3xK9p`, { DASHBOARD });
    expect(await res.text()).not.toContain('dashboard:');
  });

  it('does NOT forward /api — losing that prefix would take the API offline', async () => {
    const res = await get(`${PLATFORM}/api/health`, { DASHBOARD });
    const body = (await res.json()) as Record<string, unknown>;
    expect(body.ok).toBe(true);
  });

  it('does NOT serve our dashboard on a customer custom hostname', async () => {
    // Their brand, their domain. Our signup page has no business appearing on it.
    const res = await get('https://qr.someclient.example/login', { DASHBOARD });
    expect(await res.text()).not.toContain('dashboard:');
  });

  it('does nothing at all when the binding is absent, as in local dev and tests', async () => {
    const res = await get(`${PLATFORM}/links`);
    expect(await res.text()).not.toContain('dashboard:');
  });
});

describe('path classification', () => {
  it('treats the bare root as the dashboard', () => {
    expect(isDashboardPath('/')).toBe(true);
  });

  it('matches on the first segment only, because a slug can never contain a slash', () => {
    expect(isDashboardPath('/analytics/anything/deeper')).toBe(true);
    expect(isDashboardPath('/notapage')).toBe(false);
  });

  it('refuses to hand over /api, with or without a trailing path', () => {
    expect(isDashboardPath('/api')).toBe(false);
    expect(isDashboardPath('/api/links')).toBe(false);
  });

  it('does not match a slug that merely starts with a dashboard word', () => {
    // "linksy" is a legal slug. Prefix matching would steal it.
    expect(isDashboardPath('/linksy')).toBe(false);
  });
});

describe('the two lists cannot drift apart', () => {
  it('every dashboard segment is a reserved slug, or its page becomes unreachable', () => {
    // Without this, someone claims the slug "settings", prints it, and from then on
    // their code resolves to our settings page instead of their destination.
    const unreserved = [...DASHBOARD_SEGMENTS].filter(
      (seg) => seg !== '' && !RESERVED_SLUGS.has(seg),
    );
    expect(unreserved).toEqual([]);
  });
});
