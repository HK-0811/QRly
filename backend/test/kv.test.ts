import { env } from 'cloudflare:test';
import { describe, it, expect, beforeEach } from 'vitest';
import { readLink, writeLink, writeMiss, invalidate, linkKey } from '../src/lib/kv';
import type { CachedLink } from '../src/types';

const sample: CachedLink = {
  id: '11111111-1111-1111-1111-111111111111',
  user_id: '22222222-2222-2222-2222-222222222222',
  domain_id: '33333333-3333-3333-3333-333333333333',
  qr_id: null,
  destination_url: 'https://example.com/one',
  is_active: true,
  expires_at: null,
  safe_browsing_status: 'clean',
  domain_active: true,
};

async function clear() {
  const { keys } = await env.LINKS_KV.list();
  await Promise.all(keys.map((k) => env.LINKS_KV.delete(k.name)));
}

describe('kv cache', () => {
  beforeEach(clear);

  it('distinguishes a miss from a known-nonexistent slug', async () => {
    // These are different states and the redirect path must treat them differently:
    // a miss means "ask Postgres", a negative hit means "we already asked, it is a 404".
    expect(await readLink(env, 'qrify.test', 'nope')).toEqual({ hit: false });

    await writeMiss(env, 'qrify.test', 'nope');
    expect(await readLink(env, 'qrify.test', 'nope')).toEqual({ hit: true, link: null });
  });

  it('round-trips a cached link', async () => {
    await writeLink(env, 'qrify.test', 'abc', sample);
    const result = await readLink(env, 'qrify.test', 'abc');
    expect(result).toEqual({ hit: true, link: sample });
  });

  it('normalises hostname case but never slug case', async () => {
    // /Abc and /abc are two different links. Lower-casing the slug in the key
    // would silently merge them and serve one person another person's destination.
    await writeLink(env, 'QRify.Test', 'Abc', sample);
    expect((await readLink(env, 'qrify.test', 'Abc')).hit).toBe(true);
    expect((await readLink(env, 'qrify.test', 'abc')).hit).toBe(false);
  });

  it('invalidation writes the new value rather than deleting it', async () => {
    await writeLink(env, 'qrify.test', 'abc', sample);
    const next = { ...sample, destination_url: 'https://example.com/two' };
    await invalidate(env, 'qrify.test', 'abc', next);

    // Deleting would make every edge take a simultaneous miss and stampede
    // Postgres. The key must still hold a value.
    const raw = await env.LINKS_KV.get(linkKey('qrify.test', 'abc'));
    expect(raw).not.toBeNull();
    expect(JSON.parse(raw!).destination_url).toBe('https://example.com/two');
  });

  it('invalidating to null leaves the negative sentinel, not an empty key', async () => {
    await writeLink(env, 'qrify.test', 'abc', sample);
    await invalidate(env, 'qrify.test', 'abc', null);
    expect(await readLink(env, 'qrify.test', 'abc')).toEqual({ hit: true, link: null });
  });

  it('treats a corrupt entry as a miss so the request still succeeds via Postgres', async () => {
    await env.LINKS_KV.put(linkKey('qrify.test', 'abc'), '{not json');
    expect(await readLink(env, 'qrify.test', 'abc')).toEqual({ hit: false });
  });

  it('keeps links on different hostnames separate', async () => {
    await writeLink(env, 'a.test', 'abc', sample);
    expect((await readLink(env, 'b.test', 'abc')).hit).toBe(false);
  });
});
