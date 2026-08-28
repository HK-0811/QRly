import { env, createExecutionContext, waitOnExecutionContext } from 'cloudflare:test';
import { describe, it, expect } from 'vitest';
import worker from '../src/index';

async function call(path: string, init?: RequestInit) {
  const req = new Request(`https://qrify.test${path}`, init);
  const ctx = createExecutionContext();
  const res = await worker.fetch(req, env, ctx);
  await waitOnExecutionContext(ctx);
  return res;
}

describe('phase 0 — scaffold', () => {
  it('GET /api/health returns ok', async () => {
    const res = await call('/api/health');
    expect(res.status).toBe(200);
    const body = (await res.json()) as Record<string, unknown>;
    expect(body.ok).toBe(true);
    expect(body.service).toBe('qrify');
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
