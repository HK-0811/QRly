import { describe, it, expect, beforeEach } from 'vitest';
import { env } from 'cloudflare:test';
import {
  API_WRITE_LIMIT,
  REDIRECT_LIMIT,
  rateLimit,
  rateLimitHeaders,
  resetRateLimits,
} from '../src/lib/rate-limit';
import { checkUrl, checkUrls } from '../src/lib/safe-browsing';

describe('rate limiting', () => {
  beforeEach(resetRateLimits);

  const LIMIT = { max: 3, windowSeconds: 60 };

  it('allows requests up to the limit', () => {
    for (let i = 0; i < LIMIT.max; i++) {
      expect(rateLimit('k', LIMIT).allowed, `request ${i + 1}`).toBe(true);
    }
  });

  it('refuses the request after the limit', () => {
    for (let i = 0; i < LIMIT.max; i++) rateLimit('k', LIMIT);
    const over = rateLimit('k', LIMIT);
    expect(over.allowed).toBe(false);
    expect(over.remaining).toBe(0);
    expect(over.retryAfter).toBeGreaterThan(0);
  });

  it('counts down the remaining allowance', () => {
    expect(rateLimit('k', LIMIT).remaining).toBe(2);
    expect(rateLimit('k', LIMIT).remaining).toBe(1);
    expect(rateLimit('k', LIMIT).remaining).toBe(0);
  });

  it('keeps different keys independent', () => {
    // Two people behind one office NAT scanning two different posters must not
    // throttle each other, which is why the key carries the slug.
    for (let i = 0; i < LIMIT.max; i++) rateLimit('a', LIMIT);
    expect(rateLimit('a', LIMIT).allowed).toBe(false);
    expect(rateLimit('b', LIMIT).allowed).toBe(true);
  });

  it('starts a fresh window once the old one has passed', () => {
    const t0 = 1_000_000;
    for (let i = 0; i < LIMIT.max; i++) rateLimit('k', LIMIT, t0);
    expect(rateLimit('k', LIMIT, t0).allowed).toBe(false);
    expect(rateLimit('k', LIMIT, t0 + 60_000).allowed).toBe(true);
  });

  it('bounds its own memory, so a flood of unique keys is not a leak', () => {
    // Without the cap, hitting distinct slugs would turn the rate limiter into
    // the memory-exhaustion vector it exists to prevent.
    for (let i = 0; i < 12_000; i++) rateLimit(`key-${i}`, LIMIT);
    // Still functioning after the eviction.
    expect(rateLimit('after', LIMIT).allowed).toBe(true);
  });

  it('emits headers a client can act on', () => {
    const result = rateLimit('k', LIMIT);
    const headers = rateLimitHeaders(LIMIT, result);
    expect(headers['RateLimit-Limit']).toBe('3');
    expect(headers['Retry-After']).toBeUndefined();

    for (let i = 0; i < LIMIT.max; i++) rateLimit('k', LIMIT);
    const blocked = rateLimit('k', LIMIT);
    expect(rateLimitHeaders(LIMIT, blocked)['Retry-After']).toBeDefined();
  });

  it('uses limits that do not obstruct real use', () => {
    // A person scanning a poster twice, or editing five links in a row, must
    // never see a 429. These numbers are ceilings for abuse, not quotas.
    expect(REDIRECT_LIMIT.max).toBeGreaterThanOrEqual(60);
    expect(API_WRITE_LIMIT.max).toBeGreaterThanOrEqual(30);
  });
});

describe('safe browsing', () => {
  it('reports unchecked rather than clean when no key is configured', async () => {
    // Reporting "clean" without having asked would be the worst possible
    // failure: it looks like a verdict and is not one.
    const result = await checkUrl(env, 'https://example.com/');
    expect(result.status).toBe('unchecked');
    expect(result.reason).toContain('no API key');
  });

  it('skips non-http schemes rather than sending them to the API', async () => {
    const results = await checkUrls(env, ['mailto:a@b.com', 'tel:+1234567890']);
    expect(results.size).toBe(0);
  });

  it('deduplicates before calling out', async () => {
    const results = await checkUrls(env, [
      'https://example.com/',
      'https://example.com/',
      'https://other.example/',
    ]);
    expect(results.size).toBe(2);
  });

  it('returns an empty map for an empty input', async () => {
    expect((await checkUrls(env, [])).size).toBe(0);
  });
});
