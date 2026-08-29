import { env } from 'cloudflare:test';
import { describe, it, expect, beforeEach } from 'vitest';
import {
  readLink,
  writeLink,
  writeMiss,
  invalidate,
  linkKey,
  shouldCacheMiss,
  resetSeenMisses,
  LINK_TTL_SECONDS,
  NEGATIVE_TTL_SECONDS,
} from '../src/lib/kv';
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
    expect(await readLink(env, 'qrly.test', 'nope')).toEqual({ hit: false });

    await writeMiss(env, 'qrly.test', 'nope');
    expect(await readLink(env, 'qrly.test', 'nope')).toEqual({ hit: true, link: null });
  });

  it('round-trips a cached link', async () => {
    await writeLink(env, 'qrly.test', 'abc', sample);
    const result = await readLink(env, 'qrly.test', 'abc');
    expect(result).toEqual({ hit: true, link: sample });
  });

  it('normalises hostname case but never slug case', async () => {
    // /Abc and /abc are two different links. Lower-casing the slug in the key
    // would silently merge them and serve one person another person's destination.
    await writeLink(env, 'QRly.Test', 'Abc', sample);
    expect((await readLink(env, 'qrly.test', 'Abc')).hit).toBe(true);
    expect((await readLink(env, 'qrly.test', 'abc')).hit).toBe(false);
  });

  it('invalidation writes the new value rather than deleting it', async () => {
    await writeLink(env, 'qrly.test', 'abc', sample);
    const next = { ...sample, destination_url: 'https://example.com/two' };
    await invalidate(env, 'qrly.test', 'abc', next);

    // Deleting would make every edge take a simultaneous miss and stampede
    // Postgres. The key must still hold a value.
    const raw = await env.LINKS_KV.get(linkKey('qrly.test', 'abc'));
    expect(raw).not.toBeNull();
    expect(JSON.parse(raw!).destination_url).toBe('https://example.com/two');
  });

  it('invalidating to null leaves the negative sentinel, not an empty key', async () => {
    await writeLink(env, 'qrly.test', 'abc', sample);
    await invalidate(env, 'qrly.test', 'abc', null);
    expect(await readLink(env, 'qrly.test', 'abc')).toEqual({ hit: true, link: null });
  });

  it('treats a corrupt entry as a miss so the request still succeeds via Postgres', async () => {
    await env.LINKS_KV.put(linkKey('qrly.test', 'abc'), '{not json');
    expect(await readLink(env, 'qrly.test', 'abc')).toEqual({ hit: false });
  });

  it('keeps links on different hostnames separate', async () => {
    await writeLink(env, 'a.test', 'abc', sample);
    expect((await readLink(env, 'b.test', 'abc')).hit).toBe(false);
  });
});

describe('negative-cache admission', () => {
  beforeEach(resetSeenMisses);

  it('does not spend a KV write on the first sighting of an unknown slug', () => {
    // A bot walking random slugs is the reason. One write per probe would spend
    // the entire 1,000/day free-tier write budget on slugs nobody requests twice.
    expect(shouldCacheMiss('qrly.test', 'random-1')).toBe(false);
  });

  it('caches on the second sighting, because people retry a mistyped code', () => {
    shouldCacheMiss('qrly.test', 'typo');
    expect(shouldCacheMiss('qrly.test', 'typo')).toBe(true);
  });

  it('tracks hostname and slug together', () => {
    shouldCacheMiss('a.test', 'abc');
    expect(shouldCacheMiss('b.test', 'abc')).toBe(false);
  });

  it('costs nothing for a namespace walk', () => {
    const wouldWrite = Array.from({ length: 5_000 }, (_, i) =>
      shouldCacheMiss('qrly.test', `walk-${i}`),
    ).filter(Boolean).length;
    expect(wouldWrite).toBe(0);
  });

  it('bounds its own memory', () => {
    for (let i = 0; i < 25_000; i++) shouldCacheMiss('qrly.test', `flood-${i}`);
    // Still functioning after the eviction.
    expect(shouldCacheMiss('qrly.test', 'after')).toBe(false);
    expect(shouldCacheMiss('qrly.test', 'after')).toBe(true);
  });
});

describe('cache TTLs', () => {
  it('keeps link entries long enough that a hot link does not exhaust the write budget', () => {
    // A cache fill is a KV write and the free tier allows 1,000 a day. At a
    // 60-second TTL one continuously-scanned link refills 1,440 times daily and
    // spends the entire budget by itself. Freshness comes from the write-through
    // on edit, not from this number.
    const refillsPerDay = (24 * 60 * 60) / LINK_TTL_SECONDS;
    expect(refillsPerDay).toBeLessThanOrEqual(24);
  });

  it('respects the 60-second floor Workers KV enforces', () => {
    expect(NEGATIVE_TTL_SECONDS).toBeGreaterThanOrEqual(60);
    expect(LINK_TTL_SECONDS).toBeGreaterThanOrEqual(60);
  });
});
