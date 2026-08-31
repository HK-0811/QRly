/**
 * Rate limiting.
 *
 * **Read this before trusting it.** These counters live in the memory of one
 * Worker isolate. Cloudflare runs many isolates across many locations, so the
 * effective limit is per-isolate, not global: a distributed flood from many
 * networks is not stopped here, and a burst that happens to land on cold isolates
 * gets more headroom than the numbers below suggest.
 *
 * That is a deliberate consequence of the free-tier constraint, not an oversight.
 * A correct global limiter needs Durable Objects, which require Workers Paid, and
 * this project's whole premise is that it runs at zero cost (context.md §3). The
 * honest description of what this provides is: it stops one client hammering one
 * link from a single location, and it costs nothing.
 *
 * The real defence for a public deployment is Cloudflare's own rate-limiting
 * rule, which the free plan includes one of, configured on the zone. That needs a
 * domain, so it lands with phase 7. Until then this is what exists, and it is
 * better than nothing by exactly the amount described above.
 */

interface Window {
  count: number;
  /** When the current window started, in epoch ms. */
  start: number;
}

/**
 * Bounded so a flood of distinct keys cannot grow the map without limit — which
 * would turn a rate limiter into a memory exhaustion vector.
 */
const MAX_KEYS = 10_000;

const windows = new Map<string, Window>();

export interface RateLimitResult {
  allowed: boolean;
  /** Requests remaining in the current window. */
  remaining: number;
  /** Seconds until the window resets. */
  retryAfter: number;
}

export interface Limit {
  /** Requests permitted per window. */
  max: number;
  /** Window length in seconds. */
  windowSeconds: number;
}

/** Writes: a signed-in user creating or editing links. */
export const API_WRITE_LIMIT: Limit = { max: 60, windowSeconds: 60 };

/** Redirects: one client scanning one link over and over. */
export const REDIRECT_LIMIT: Limit = { max: 120, windowSeconds: 60 };

/**
 * Anonymous creation: the only unauthenticated write in the product.
 *
 * Much tighter than the signed-in limit, and for a different reason. An
 * authenticated caller who abuses the API can be identified and their rows are
 * already attributable; an anonymous one cannot, and every row they create sits
 * in the database for thirty days. Ten is well above what a person making a code
 * for a poster will ever need in a minute, and far below what makes a scripted
 * flood worth writing.
 */
export const ANON_CREATE_LIMIT: Limit = { max: 10, windowSeconds: 60 };

export function rateLimit(key: string, limit: Limit, now = Date.now()): RateLimitResult {
  const windowMs = limit.windowSeconds * 1000;

  if (windows.size > MAX_KEYS) {
    // Cheapest possible eviction: drop everything and start again. A fixed window
    // is already approximate, and an LRU here would cost more than it protects.
    windows.clear();
  }

  const existing = windows.get(key);

  if (!existing || now - existing.start >= windowMs) {
    windows.set(key, { count: 1, start: now });
    return { allowed: true, remaining: limit.max - 1, retryAfter: 0 };
  }

  existing.count++;

  if (existing.count > limit.max) {
    return {
      allowed: false,
      remaining: 0,
      retryAfter: Math.max(1, Math.ceil((existing.start + windowMs - now) / 1000)),
    };
  }

  return { allowed: true, remaining: limit.max - existing.count, retryAfter: 0 };
}

/** Test hook. Not exported through index.ts. */
export function resetRateLimits(): void {
  windows.clear();
}

export function rateLimitHeaders(limit: Limit, result: RateLimitResult): Record<string, string> {
  const headers: Record<string, string> = {
    'RateLimit-Limit': String(limit.max),
    'RateLimit-Remaining': String(result.remaining),
  };
  if (!result.allowed) headers['Retry-After'] = String(result.retryAfter);
  return headers;
}
