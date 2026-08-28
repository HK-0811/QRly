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
import type { Env } from '../env';

export const LINK_TTL_SECONDS = 60;

/**
 * architecture.md §6 specifies 30s for the negative cache. Workers KV refuses any
 * expirationTtl below 60 ("Expiration TTL must be at least 60"), so 60 is the
 * floor, not a choice. The cost is that a slug probed a moment before it is
 * created stays negatively cached — except that link creation performs a
 * write-through, which overwrites the sentinel immediately. So in practice the
 * longer window costs nothing.
 */
export const NEGATIVE_TTL_SECONDS = 60;

export const SALT_TTL_SECONDS = 60 * 60 * 48;

/** The sentinel written for a slug that resolved to nothing. */
const MISS = 'null';

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
  const raw = await env.LINKS_KV.get(linkKey(hostname, slug), 'text');
  if (raw === null) return { hit: false };
  if (raw === MISS) return { hit: true, link: null };

  try {
    return { hit: true, link: JSON.parse(raw) as CachedLink };
  } catch {
    // A corrupt entry is treated as a miss rather than an error. The cache is
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
    console.error('KV invalidation failed', linkKey(hostname, slug), err);
  }
}

export async function readSalt(env: Env, day: string): Promise<string | null> {
  return env.LINKS_KV.get(saltKey(day), 'text');
}

export async function writeSalt(env: Env, day: string, salt: string): Promise<void> {
  await env.LINKS_KV.put(saltKey(day), salt, { expirationTtl: SALT_TTL_SECONDS });
}
