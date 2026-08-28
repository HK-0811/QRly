/**
 * Client for the Worker's privileged API.
 *
 * Only writes come through here. Reads go browser -> Supabase directly, because
 * RLS already enforces ownership and a read proxy would be code with no security
 * value (architecture.md §1).
 *
 * Every call attaches the current Supabase access token; the Worker verifies it
 * against the project JWKS and then acts with service_role.
 */
import { createClient } from '@/lib/supabase/client';
import type { CreateLinkBody, Link, UpdateLinkBody } from '@/lib/types';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8787';

export class ApiError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly status: number,
    readonly body?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'ApiError';
  }

  /** Deleting a link that has printed QR codes needs an explicit confirmation. */
  get requiresConfirmation() {
    return this.body?.requires_confirmation === true;
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new ApiError('unauthorized', 'Your session has expired. Sign in again.', 401);
  }

  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
        ...(init.headers ?? {}),
      },
    });
  } catch {
    // A network failure here is almost always the local Worker not running, and
    // "Failed to fetch" tells nobody that.
    throw new ApiError('network_error', 'Could not reach the API. Is the Worker running?', 0);
  }

  if (res.status === 204) return undefined as T;

  const text = await res.text();
  let body: Record<string, unknown> = {};
  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    body = {};
  }

  if (!res.ok) {
    throw new ApiError(
      typeof body.error === 'string' ? body.error : 'request_failed',
      typeof body.message === 'string' ? body.message : `Request failed (${res.status}).`,
      res.status,
      body,
    );
  }

  return body as T;
}

export interface CreatedLink {
  link: Link;
  hostname: string;
  short_url: string;
}

export interface UpdatedLink {
  link: Link;
  cache_propagation_seconds: number;
}

export const api = {
  createLink: (body: CreateLinkBody) =>
    request<CreatedLink>('/api/links', { method: 'POST', body: JSON.stringify(body) }),

  updateLink: (id: string, body: UpdateLinkBody) =>
    request<UpdatedLink>(`/api/links/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),

  deleteLink: (id: string, opts: { force?: boolean } = {}) =>
    request<void>(`/api/links/${id}${opts.force ? '?force=true' : ''}`, { method: 'DELETE' }),
};
