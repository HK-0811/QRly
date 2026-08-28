/**
 * Scheduled jobs (architecture.md §10).
 *
 * Every job records a row in cron_runs, success or failure. A cron that silently
 * stops firing is indistinguishable from one that never mattered, and the daily
 * keep-alive is the only thing standing between this project and the Supabase
 * 7-day auto-pause.
 */
import type { Env } from '../env';
import { insert, rpc, select, DbError } from './supabase';

type JobResult = { ok: boolean; detail: Record<string, unknown> };

async function record(env: Env, job: string, started: number, result: JobResult) {
  try {
    await insert(
      env,
      'cron_runs',
      {
        job,
        ok: result.ok,
        duration_ms: Date.now() - started,
        detail: result.detail,
      },
      { returning: false },
    );
  } catch (err) {
    // If we cannot even write the audit row, Postgres is the thing that is down.
    // Log and move on: failing the cron here would just hide the real cause.
    console.error(`cron_runs write failed for ${job}:`, err instanceof Error ? err.message : err);
  }
}

async function run(env: Env, job: string, fn: () => Promise<Record<string, unknown>>) {
  const started = Date.now();
  try {
    const detail = await fn();
    console.log(`cron ${job} ok in ${Date.now() - started}ms`, JSON.stringify(detail));
    await record(env, job, started, { ok: true, detail });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`cron ${job} FAILED after ${Date.now() - started}ms:`, message);
    await record(env, job, started, { ok: false, detail: { error: message } });
  }
}

/**
 * Keep-alive. The point is to generate genuine Postgres activity, so this issues a
 * real read against a real table rather than hitting a health endpoint that never
 * reaches the database.
 */
export async function keepAlive(env: Env): Promise<Record<string, unknown>> {
  const rows = await select<{ hostname: string }>(env, 'domains?select=hostname&limit=1');
  return { reached: 'postgres', domains_visible: rows.length };
}

/**
 * Rotate the visitor-hash salt. Idempotent in the database, so a double fire or a
 * late fire cannot produce two salts for one day — two salts would split a
 * visitor's identity mid-day and silently inflate the unique-visitor count.
 *
 * The salt is also mirrored into KV, because the redirect path reads it on every
 * scan and must not make a cross-region Postgres call to do so.
 */
export async function rotateSalt(env: Env): Promise<Record<string, unknown>> {
  const day = new Date().toISOString().slice(0, 10);
  const salt = await rpc<string>(env, 'ensure_daily_salt', { p_day: day });
  if (!salt) throw new Error('ensure_daily_salt returned no salt');

  await env.LINKS_KV.put(`salt:${day}`, salt, { expirationTtl: 60 * 60 * 48 });
  return { day, salt_length: salt.length, cached: true };
}

/** Delete scan events past each account's own retention window. */
export async function purgeRetention(env: Env): Promise<Record<string, unknown>> {
  const removed = await rpc<number>(env, 'purge_expired_scan_events', {});
  return { scan_events_deleted: removed };
}

/**
 * Weekly Safe Browsing re-check. Implemented in phase 9; the schedule is wired now
 * so the trigger exists and its absence in cron_runs is visible.
 */
export async function recheckSafeBrowsing(env: Env): Promise<Record<string, unknown>> {
  if (!env.SAFE_BROWSING_API_KEY) {
    return { skipped: 'SAFE_BROWSING_API_KEY not configured' };
  }
  return { skipped: 'not implemented until phase 9' };
}

const DAILY = '0 0 * * *';
const WEEKLY = '15 3 * * 1';

export async function handleScheduled(event: ScheduledController, env: Env): Promise<void> {
  switch (event.cron) {
    case DAILY:
      await run(env, 'keep_alive', () => keepAlive(env));
      await run(env, 'rotate_salt', () => rotateSalt(env));
      await run(env, 'purge_retention', () => purgeRetention(env));
      break;

    case WEEKLY:
      await run(env, 'recheck_safe_browsing', () => recheckSafeBrowsing(env));
      break;

    default:
      // An unmatched cron means wrangler.toml and this switch have drifted apart.
      console.warn(`no handler for cron expression "${event.cron}"`);
      await run(env, 'unknown_cron', async () => ({ cron: event.cron }));
  }
}

export { DbError };
