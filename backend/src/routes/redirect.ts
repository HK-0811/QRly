/**
 * The redirect hot path (architecture.md §4.1).
 *
 * Everything in this file is on the critical path of a physical QR scan, so the
 * ordering is deliberate: cheapest check first, and the 302 goes out before any
 * analytics work happens.
 *
 * Timing budget:
 *   KV hit -> 302        < 15 ms
 *   KV miss -> 302       < 250 ms
 *   analytics insert     after the response, unbudgeted
 */
import { Hono } from 'hono';
import type { CachedLink, Link, SafeBrowsingStatus } from '../types';
import type { Env } from '../env';
import { readLink, writeLink, writeMiss } from '../lib/kv';
import { select, DbError } from '../lib/supabase';
import { recordScan } from '../lib/analytics';
import { REDIRECT_LIMIT, rateLimit } from '../lib/rate-limit';
import {
  disabledPage,
  expiredPage,
  flaggedPage,
  notFoundPage,
  rootPage,
  unavailablePage,
} from '../lib/pages';

export const redirect = new Hono<{ Bindings: Env }>();

/** How long the set of servable hostnames is cached. */
const HOSTS_TTL_SECONDS = 300;
const HOSTS_KEY = 'hosts:active';

type LinkWithDomain = Link & { domains: { hostname: string; is_active: boolean } | null };

// ---------------------------------------------------------------------------
// Hostname allow-list
// ---------------------------------------------------------------------------

/**
 * Resolving the hostname against the database before anything else does two jobs.
 *
 * It rejects a spoofed Host header, which is the point architecture.md §11 makes.
 * And it bounds the negative cache: without this, a flood of requests carrying
 * random Host values would each write a distinct `link:{host}:{slug}` sentinel and
 * burn through the free tier's 1,000 KV writes per day in seconds.
 */
async function activeHostnames(env: Env): Promise<Set<string> | null> {
  const cached = await env.LINKS_KV.get(HOSTS_KEY, 'text');
  if (cached !== null) {
    try {
      return new Set(JSON.parse(cached) as string[]);
    } catch {
      /* fall through and refetch */
    }
  }

  try {
    const rows = await select<{ hostname: string }>(
      env,
      'domains?is_active=eq.true&select=hostname',
    );
    const hosts = rows.map((r) => r.hostname.toLowerCase());
    await env.LINKS_KV.put(HOSTS_KEY, JSON.stringify(hosts), {
      expirationTtl: HOSTS_TTL_SECONDS,
    });
    return new Set(hosts);
  } catch (err) {
    console.error('hostname lookup failed', err);
    return null; // Postgres unreachable — the caller decides what that means
  }
}

// ---------------------------------------------------------------------------
// Resolution
// ---------------------------------------------------------------------------

function toCached(row: LinkWithDomain): CachedLink {
  return {
    id: row.id,
    user_id: row.user_id,
    domain_id: row.domain_id,
    qr_id: null,
    destination_url: row.destination_url,
    is_active: row.is_active,
    expires_at: row.expires_at,
    safe_browsing_status: row.safe_browsing_status,
    domain_active: row.domains?.is_active ?? false,
  };
}

async function resolveFromDatabase(
  env: Env,
  hostname: string,
  slug: string,
): Promise<CachedLink | null> {
  // !inner turns the embedded domain into a join filter, so a link on a different
  // hostname with the same slug is not returned. Two accounts can hold the same
  // slug on two different domains and this is what keeps them apart.
  const query =
    `links?slug=eq.${encodeURIComponent(slug)}` +
    `&select=*,domains!inner(hostname,is_active)` +
    `&domains.hostname=eq.${encodeURIComponent(hostname)}` +
    `&limit=1`;

  const rows = await select<LinkWithDomain>(env, query);
  const row = rows[0];
  return row ? toCached(row) : null;
}

// ---------------------------------------------------------------------------
// Validation chain — architecture.md §4.1, cheapest first
// ---------------------------------------------------------------------------

export type Verdict =
  | { kind: 'redirect'; destination: string }
  | { kind: 'not_found' }
  | { kind: 'disabled' }
  | { kind: 'expired'; at: string }
  | { kind: 'flagged'; destination: string };

export function evaluate(link: CachedLink | null, now = Date.now()): Verdict {
  if (!link) return { kind: 'not_found' };

  // A domain can be deactivated after its links were cached.
  if (!link.domain_active) return { kind: 'not_found' };

  if (!link.is_active) return { kind: 'disabled' };

  if (link.expires_at !== null) {
    const expires = Date.parse(link.expires_at);
    if (!Number.isNaN(expires) && expires <= now) {
      return { kind: 'expired', at: link.expires_at };
    }
  }

  // Checked last because it is the only one that changes the page rather than
  // just refusing: a flagged link still resolves, to a warning.
  if ((link.safe_browsing_status as SafeBrowsingStatus) === 'flagged') {
    return { kind: 'flagged', destination: link.destination_url };
  }

  return { kind: 'redirect', destination: link.destination_url };
}

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

redirect.get('/robots.txt', (c) =>
  // Short links should never be indexed. A crawler following them also inflates
  // the scan counts that are the entire point of the analytics.
  c.text('User-agent: *\nDisallow: /\n', 200, { 'Cache-Control': 'public, max-age=86400' }),
);

redirect.get('/favicon.ico', () => new Response(null, { status: 204 }));

redirect.get('/', (c) => rootPage(c.env.DASHBOARD_ORIGIN));

redirect.get('/:slug', async (c) => {
  const started = Date.now();
  const slug = c.req.param('slug');
  const hostname = new URL(c.req.url).host.toLowerCase();

  // Keyed on the client address and the slug together: two people behind one
  // office NAT scanning two different posters should not throttle each other.
  // The limiter is per-isolate — see lib/rate-limit.ts for what that does and
  // does not buy.
  const client = c.req.header('CF-Connecting-IP') ?? 'unknown';
  const limited = rateLimit(`scan:${client}:${hostname}:${slug}`, REDIRECT_LIMIT);
  if (!limited.allowed) {
    return withTiming(
      new Response('Too many requests', {
        status: 429,
        headers: { 'Retry-After': String(limited.retryAfter), 'Cache-Control': 'no-store' },
      }),
      started,
      'rate-limited',
    );
  }

  let source: 'kv' | 'db' | 'kv-negative' = 'kv';
  let link: CachedLink | null = null;

  const cached = await readLink(c.env, hostname, slug);

  if (cached.hit) {
    link = cached.link;
    source = link === null ? 'kv-negative' : 'kv';
  } else {
    const hosts = await activeHostnames(c.env);

    if (hosts === null) {
      // Postgres is down and this slug was not cached. A 503 is the honest
      // answer; a 404 would tell a crawler the printed code is dead.
      return withTiming(unavailablePage(), started, 'db-down');
    }

    if (!hosts.has(hostname)) {
      // Spoofed or unregistered Host. Nothing is written to KV here, which is
      // what keeps a Host-header flood from exhausting the write quota.
      return withTiming(notFoundPage(hostname, slug), started, 'unknown-host');
    }

    try {
      link = await resolveFromDatabase(c.env, hostname, slug);
      source = 'db';
    } catch (err) {
      if (err instanceof DbError) {
        console.error('link lookup failed', err.status, err.message);
      } else {
        console.error('link lookup failed', err);
      }
      return withTiming(unavailablePage(), started, 'db-error');
    }

    // Populate the cache for the next scan, including the negative case.
    c.executionCtx.waitUntil(
      link
        ? writeLink(c.env, hostname, slug, link).catch((e) => console.error('kv write', e))
        : writeMiss(c.env, hostname, slug).catch((e) => console.error('kv write', e)),
    );
  }

  const verdict = evaluate(link);

  // Telemetry is registered before the response is returned but runs after it is
  // sent. A scan is never blocked by an analytics write, and a failed write is
  // swallowed inside recordScan — the person already got where they were going.
  //
  // Only outcomes that resolved to a real link are recorded. A 404 has no link to
  // attribute to, and counting an unknown-slug probe as a scan would let anyone
  // inflate someone else's numbers by walking the namespace.
  if (link !== null && verdict.kind !== 'not_found') {
    c.executionCtx.waitUntil(
      recordScan({ request: c.req.raw, env: c.env, link, hostname }),
    );
  }

  switch (verdict.kind) {
    case 'redirect':
      // 302, not 301. A permanent redirect would be cached by the scanner's
      // browser forever, and editing the destination is the entire product.
      return withTiming(
        new Response(null, {
          status: 302,
          headers: {
            Location: verdict.destination,
            'Cache-Control': 'no-store, no-cache, must-revalidate',
            'X-Robots-Tag': 'noindex, nofollow',
            // Do not leak the short URL to the destination's analytics.
            'Referrer-Policy': 'no-referrer',
          },
        }),
        started,
        source,
      );

    case 'disabled':
      return withTiming(disabledPage(hostname, slug), started, source);

    case 'expired':
      return withTiming(expiredPage(hostname, slug, verdict.at), started, source);

    case 'flagged':
      return withTiming(flaggedPage(hostname, slug, verdict.destination), started, source);

    case 'not_found':
      return withTiming(notFoundPage(hostname, slug), started, source);
  }
});

/**
 * Server-Timing rather than a log line, so latency is measurable from outside the
 * Worker with curl. plan.md phase 3 asks for a measured warm-cache p50 and this is
 * what tools/measure-latency.mjs reads.
 */
function withTiming(res: Response, started: number, source: string): Response {
  const headers = new Headers(res.headers);
  headers.set('Server-Timing', `resolve;dur=${Date.now() - started}`);
  headers.set('X-Qrify-Source', source);
  return new Response(res.body, { status: res.status, headers });
}
