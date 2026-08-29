import { env, createExecutionContext, waitOnExecutionContext } from 'cloudflare:test';
import { describe, it, expect } from 'vitest';
import worker from '../src/index';

async function call(path: string, init?: RequestInit, overrides: Partial<typeof env> = {}) {
  const req = new Request(`https://qrly.test${path}`, init);
  const ctx = createExecutionContext();
  const res = await worker.fetch(req, { ...env, ...overrides }, ctx);
  await waitOnExecutionContext(ctx);
  return res;
}

/** Two origins, as production runs during a hostname move. */
const TWO_ORIGINS = 'https://app.qrly.lol,https://qrly-dashboard.example.workers.dev';

function allowedOriginFor(origin: string, configured = TWO_ORIGINS) {
  return call('/api/health', { headers: { Origin: origin } }, {
    DASHBOARD_ORIGIN: configured,
  } as Partial<typeof env>).then((res) => res.headers.get('access-control-allow-origin'));
}

describe('phase 0 — scaffold', () => {
  it('GET /api/health returns ok', async () => {
    const res = await call('/api/health');
    expect(res.status).toBe(200);
    const body = (await res.json()) as Record<string, unknown>;
    expect(body.ok).toBe(true);
    expect(body.service).toBe('qrly');
    expect(body.environment).toBe('test');
  });

  it('unknown routes return a JSON 404, never an HTML stack trace', async () => {
    const res = await call('/api/does-not-exist');
    expect(res.status).toBe(404);
    expect(await res.json()).toMatchObject({ error: 'not_found' });
  });

  it('the KV binding is present', () => {
    expect(env.LINKS_KV).toBeDefined();
  });
});

describe('CORS allow-list', () => {
  it('allows the custom domain when DASHBOARD_ORIGIN lists several', async () => {
    expect(await allowedOriginFor('https://app.qrly.lol')).toBe('https://app.qrly.lol');
  });

  it('allows the workers.dev origin from the same list — both must work mid-move', async () => {
    expect(await allowedOriginFor('https://qrly-dashboard.example.workers.dev')).toBe(
      'https://qrly-dashboard.example.workers.dev',
    );
  });

  it('does NOT allow an origin absent from the list', async () => {
    expect(await allowedOriginFor('https://evil.example')).not.toBe('https://evil.example');
  });

  it('does NOT allow a lookalike that merely contains an allowed origin', async () => {
    // Substring matching would pass this. The list is exact matches only.
    expect(await allowedOriginFor('https://app.qrly.lol.evil.example')).not.toBe(
      'https://app.qrly.lol.evil.example',
    );
  });

  it('still works when DASHBOARD_ORIGIN holds a single origin and no comma', async () => {
    expect(await allowedOriginFor('http://localhost:3000', 'http://localhost:3000')).toBe(
      'http://localhost:3000',
    );
  });

  it('tolerates whitespace around the commas', async () => {
    expect(
      await allowedOriginFor('https://app.qrly.lol', ' https://app.qrly.lol , https://x.example '),
    ).toBe('https://app.qrly.lol');
  });
});
