/**
 * Minimal PostgREST client for the Worker, using the service_role key.
 *
 * Deliberately not @supabase/supabase-js. The redirect hot path imports this
 * module, and the full SDK pulls in auth, realtime and storage clients that this
 * Worker never touches. A hundred lines of fetch keeps the cold-start bundle small
 * and makes every network call visible at the call site.
 *
 * service_role bypasses RLS entirely. Every function here is therefore trusted
 * code — the caller is responsible for scoping by user_id.
 */
import type { Env } from '../env';

export class DbError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
    readonly detail?: string,
  ) {
    super(message);
    this.name = 'DbError';
  }

  /** Unique-violation. Slug collisions surface as this and are retried, not pre-checked. */
  get isUniqueViolation() {
    return this.code === '23505';
  }

  /** on delete restrict fired — something still references the row. */
  get isRestrictViolation() {
    return this.code === '23001' || this.code === '23503';
  }
}

function headers(env: Env, extra?: Record<string, string>): Record<string, string> {
  return {
    apikey: env.SUPABASE_SERVICE_KEY,
    Authorization: `Bearer ${env.SUPABASE_SERVICE_KEY}`,
    'Content-Type': 'application/json',
    ...extra,
  };
}

async function request<T>(env: Env, path: string, init: RequestInit): Promise<T> {
  const res = await fetch(`${env.SUPABASE_URL}/rest/v1${path}`, init);

  if (!res.ok) {
    let code: string | undefined;
    let detail: string | undefined;
    let message = `${res.status} ${res.statusText}`;
    try {
      const body = (await res.json()) as { message?: string; code?: string; details?: string };
      code = body.code;
      detail = body.details;
      if (body.message) message = body.message;
    } catch {
      /* non-JSON error body; the status line is all we get */
    }
    throw new DbError(message, res.status, code, detail);
  }

  if (res.status === 204) return undefined as T;
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

/** GET. `query` is a PostgREST query string, e.g. `links?slug=eq.abc&select=*`. */
export function select<T>(env: Env, query: string): Promise<T[]> {
  return request<T[]>(env, `/${query}`, { method: 'GET', headers: headers(env) });
}

export async function selectOne<T>(env: Env, query: string): Promise<T | null> {
  const rows = await select<T>(env, query);
  return rows[0] ?? null;
}

export function insert<T>(
  env: Env,
  table: string,
  rows: unknown,
  opts: { returning?: boolean; onConflict?: string; ignoreDuplicates?: boolean } = {},
): Promise<T[]> {
  const prefer = [
    opts.returning === false ? 'return=minimal' : 'return=representation',
    ...(opts.onConflict ? [`resolution=${opts.ignoreDuplicates ? 'ignore' : 'merge'}-duplicates`] : []),
  ].join(',');

  const qs = opts.onConflict ? `?on_conflict=${encodeURIComponent(opts.onConflict)}` : '';
  return request<T[]>(env, `/${table}${qs}`, {
    method: 'POST',
    headers: headers(env, { Prefer: prefer }),
    body: JSON.stringify(rows),
  });
}

/** PATCH. `filter` is the PostgREST filter, e.g. `id=eq.<uuid>`. */
export function update<T>(env: Env, table: string, filter: string, patch: unknown): Promise<T[]> {
  return request<T[]>(env, `/${table}?${filter}`, {
    method: 'PATCH',
    headers: headers(env, { Prefer: 'return=representation' }),
    body: JSON.stringify(patch),
  });
}

export function remove<T>(env: Env, table: string, filter: string): Promise<T[]> {
  return request<T[]>(env, `/${table}?${filter}`, {
    method: 'DELETE',
    headers: headers(env, { Prefer: 'return=representation' }),
  });
}

/** Call a Postgres function. Aggregations live there because PostgREST cannot GROUP BY. */
export function rpc<T>(env: Env, fn: string, args: Record<string, unknown> = {}): Promise<T> {
  return request<T>(env, `/rpc/${fn}`, {
    method: 'POST',
    headers: headers(env),
    body: JSON.stringify(args),
  });
}
