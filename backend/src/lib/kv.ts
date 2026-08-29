/**
 * Slug resolution cache (architecture.md §4.3, §6).
 *
 * Two behaviours here are deliberate and easy to "fix" into something worse:
 *
 *   1. Invalidation is a write-through, not a delete. Deleting means every edge
 *      that had the old value takes a miss simultaneously and stampedes Postgres.
 *      Writing the new value means a stale edge serves the OLD destination for up
 *      to the propagation window — harmless, and the dashboard says so.
 *
 *   2. Unknown slugs are cached as a null sentinel. Without it, a bot walking
 *      random slugs makes one Postgres round trip per probe, which is a free
 *      denial-of-service against the 500 MB free tier's connection budget.
 *
 * KV is never a source of truth. Losing the entire namespace costs latency and
 * nothing else.
 */
import type { CachedLink } from '../types';
import { log } from './log';
import type { Env } from '../env';

/**
 * One hour, not the 60 seconds architecture.md §6 originally specified.
 *
 * The 60-second figure conflated two different things. Freshness after an edit
 * comes from the **write-through** in routes/links.ts, which pushes the new value
 * the moment the link changes — the TTL has nothing to do with it. The "~60s"
 * the dashboard quotes is Workers KV's *global propagation* delay, which is a
 * property of KV and is unaffected by this number. The TTL is only a backstop for
 * a row changed outside the Worker.
 *
 * The reason it had to change: a cache fill is a KV **write**, and the free tier
 * allows 1,000 writes a day against 100,000 reads. At a 60-second TTL, a single
 * continuously-scanned link refills 1,440 times a day and exhausts the entire
 * write budget on its own. tools/check-ceilings.mjs measures exactly this. At an
 * hour it is 24 refills a day per hot link, which is roughly forty times the
 * headroom for the cost of a longer stale window on out-of-band edits.
 */
export const LINK_TTL_SECONDS = 60 * 60;

/**
 * architecture.md §6 specifies 30s for the negative cache. Workers KV refuses any
 * expirationTtl below 60 ("Expiration TTL must be at least 60"), so 60 is the
 * floor, not a choice. The cost is that a slug probed a moment before it is
 * created stays negatively cached — except that link creation performs a
 * write-through, which overwrites the sentinel immediately.
 */
export const NEGATIVE_TTL_SECONDS = 60 * 5;

export const SALT_TTL_SECONDS = 60 * 60 * 48;

/** The sentinel written for a slug that resolved to nothing. */
const MISS = 'null';

/**
 * Unknown slugs seen once, in this isolate.
 *
 * A bot walking random slugs produces one KV write per probe if every miss is
 * cached, and 1,000 probes is the entire daily write budget. Almost none of those
 * slugs are ever requested twice, so caching the first miss buys nothing and costs
 * the quota. Caching only on the second sighting means a scan of a genuinely
 * mistyped code still gets cached — people retry — while a namespace walk costs
 * zero writes.
 *
 * Bounded, for the same reason the rate limiter is: an unbounded set keyed on
 * attacker input is a memory-exhaustion vector.
 */
const seenMisses = new Set<string>();
const MAX_SEEN_MISSES = 20_000;

/**
 * True when this slug has been missed before and is worth spending a write on.
 * Exported for the ceiling check and for tests.
 */
export function shouldCacheMiss(hostname: string, slug: string): boolean {
  const key = linkKey(hostname, slug);
  if (seenMisses.has(key)) return true;
  if (seenMisses.size >= MAX_SEEN_MISSES) seenMisses.clear();
  seenMisses.add(key);
  return false;
}

/** Test hook. */
export function resetSeenMisses(): void {
  seenMisses.clear();
}

export function linkKey(hostname: string, slug: string): string {
  // Hostname is case-insensitive, slug is not. Normalising the slug here would
  // silently merge /Abc and /abc, which are two different links.
  return `link:${hostname.toLowerCase()}:${slug}`;
}

export function saltKey(day: string): string {
  return `salt:${day}`;
}

export type CacheLookup =
  | { hit: true; link: CachedLink }
  | { hit: true; link: null } // negative cache: we know this slug does not exist
  | { hit: false };

export async function readLink(env: Env, hostname: string, slug: string): Promise<CacheLookup> {
  let raw: string | null;

  try {
    raw = await env.LINKS_KV.get(linkKey(hostname, slug), 'text');
  } catch (err) {
    // KV being unavailable is a miss, not an error. architecture.md §12 promises
    // that losing KV costs latency and nothing else, and that promise is only
    // true if a read failure falls through to Postgres instead of propagating.
    log.warn({
      event: 'kv_read_failed',
      hostname,
      slug,
      error: err instanceof Error ? err : String(err),
    });
    return { hit: false };
  }

  if (raw === null) return { hit: false };
  if (raw === MISS) return { hit: true, link: null };

  try {
    return { hit: true, link: JSON.parse(raw) as CachedLink };
  } catch {
    // A corrupt entry is treated as a miss for the same reason. The cache is
    // disposable; falling through to Postgres is always correct.
    return { hit: false };
  }
}

export async function writeLink(
  env: Env,
  hostname: string,
  slug: string,
  link: CachedLink,
): Promise<void> {
  await env.LINKS_KV.put(linkKey(hostname, slug), JSON.stringify(link), {
    expirationTtl: LINK_TTL_SECONDS,
  });
}

export async function writeMiss(env: Env, hostname: string, slug: string): Promise<void> {
  await env.LINKS_KV.put(linkKey(hostname, slug), MISS, {
    expirationTtl: NEGATIVE_TTL_SECONDS,
  });
}

/**
 * Invalidate by writing the new value. Deleting is only correct when the link is
 * genuinely gone, and even then we write the negative sentinel instead so the
 * next probe does not reach Postgres.
 */
export async function invalidate(
  env: Env,
  hostname: string,
  slug: string,
  next: CachedLink | null,
): Promise<void> {
  if (next === null) {
    await writeMiss(env, hostname, slug);
  } else {
    await writeLink(env, hostname, slug, next);
  }
}

/**
 * Cache writes must never fail a user-facing operation. If KV is unavailable, the
 * redirect path falls through to Postgres and everything still works — slower, and
 * correct. Swallowing here keeps that true.
 */
export async function invalidateQuietly(
  env: Env,
  hostname: string,
  slug: string,
  next: CachedLink | null,
): Promise<void> {
  try {
    await invalidate(env, hostname, slug, next);
  } catch (err) {
    log.warn({
      event: 'kv_invalidation_failed',
      hostname,
      slug,
      error: err instanceof Error ? err : String(err),
    });
  }
}

export async function readSalt(env: Env, day: string): Promise<string | null> {
  try {
    return await env.LINKS_KV.get(saltKey(day), 'text');
  } catch (err) {
    // Falls through to the database, which is the source of truth for the salt.
    log.warn({ event: 'kv_salt_read_failed', day, error: err instanceof Error ? err : String(err) });
    return null;
  }
}

export async function writeSalt(env: Env, day: string, salt: string): Promise<void> {
  await env.LINKS_KV.put(saltKey(day), salt, { expirationTtl: SALT_TTL_SECONDS });
}
