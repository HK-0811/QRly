/**
 * Privacy-safe visitor identity.
 *
 * The raw IP exists only inside this function's scope and is never written
 * anywhere — not to the database, not to a log line. What gets stored is
 *
 *     truncate( sha256( daily_salt + pepper + ip + user_agent + link_id ) )
 *
 * and the salt rotates every 24 hours. That makes the hash irreversible in
 * practice and, more importantly, self-expiring: yesterday's hashes cannot be
 * matched against today's even with the same IP, so there is no way to follow a
 * person across days — including for us.
 *
 * The honest consequence, which the dashboard has to state: "unique visitors"
 * therefore means "unique per day". Anyone claiming a longer-lived unique count
 * from IP data is either storing something reversible or overstating what they
 * have.
 */
import type { Env } from '../env';
import { readSalt, writeSalt } from './kv';
import { rpc } from './supabase';
import { log } from './log';

/**
 * 128 bits of a sha256, hex-encoded. Enough that collisions are irrelevant at any
 * volume this project will ever see, and short enough that the column is cheap
 * against a 500 MB ceiling.
 */
const HASH_CHARS = 32;

export function utcDay(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10);
}

/**
 * The salt for a given day, read through KV.
 *
 * This is on the analytics path, which runs after the response has been sent, so
 * a Postgres round trip on a cache miss costs the scanner nothing. It still goes
 * through KV because at any real volume it would otherwise be one query per scan.
 */
export async function getDailySalt(env: Env, day = utcDay()): Promise<string | null> {
  const cached = await readSalt(env, day);
  if (cached) return cached;

  try {
    // Idempotent in the database: concurrent scans on a fresh day cannot create
    // two salts, which would split one visitor's identity in half.
    const salt = await rpc<string>(env, 'ensure_daily_salt', { p_day: day });
    if (!salt) return null;
    await writeSalt(env, day, salt).catch(() => {});
    return salt;
  } catch (err) {
    log.warn({ event: 'daily_salt_unavailable', day, error: err instanceof Error ? err : String(err) });
    return null;
  }
}

export async function visitorHash(
  salt: string,
  pepper: string,
  ip: string,
  userAgent: string,
  linkId: string,
): Promise<string> {
  // The pepper is a Worker secret and the salt is in the database. Compromising
  // either one alone does not make the hashes reversible.
  const material = `${salt}|${pepper}|${ip}|${userAgent}|${linkId}`;
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(material));

  let hex = '';
  for (const byte of new Uint8Array(digest)) hex += byte.toString(16).padStart(2, '0');
  return hex.slice(0, HASH_CHARS);
}

/**
 * The client IP, as Cloudflare reports it. Never stored — it is an input to the
 * hash and nothing else.
 */
export function clientIp(request: Request): string | null {
  return (
    request.headers.get('CF-Connecting-IP') ??
    request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim() ??
    null
  );
}
