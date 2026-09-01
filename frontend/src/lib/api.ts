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
import { API_ORIGIN } from '@/lib/origins';
import type { CreateLinkBody, Domain, Link, QrStyle, UpdateLinkBody } from '@/lib/types';

const BASE = API_ORIGIN;

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

  return send<T>(path, init, { Authorization: `Bearer ${session.access_token}` });
}

/**
 * The same transport without a session, for the one endpoint that has none.
 *
 * Kept as a separate entry point rather than making the token optional in
 * `request`, so that forgetting to authenticate is a different function call and
 * not a missing argument.
 */
function requestAnonymous<T>(path: string, init: RequestInit = {}): Promise<T> {
  return send<T>(path, init, {});
}

async function send<T>(
  path: string,
  init: RequestInit,
  auth: Record<string, string>,
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...auth,
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

export interface CreatedDomain {
  domain: Domain;
  instructions: { record_type: string; name: string; value: string; note: string };
  cloudflare_error: string | null;
}

export interface DomainVerification {
  domain: Domain;
  outcome: { state: 'active' | 'pending' | 'failed'; message: string; hint?: string };
  dns: {
    found: string | null;
    expected: string;
    agreed_across_resolvers: boolean;
    resolvers: Array<{ resolver: string; target: string | null; reachable: boolean }>;
  };
  certificate: {
    status: string | null;
    description: string;
    configured: boolean;
    /** Whether the hostname is registered for a certificate at all. */
    registered: boolean;
    /** Why registration failed, when it did. */
    registration_error: string | null;
  };
}

export const api = {
  createLink: (body: CreateLinkBody) =>
    request<CreatedLink>('/api/links', { method: 'POST', body: JSON.stringify(body) }),

  /**
   * Create a code with no account. The response carries a claim token, which is
   * the only thing that can ever attach the code to an account — if it is lost,
   * the code keeps redirecting and becomes uneditable.
   */
  createAnonymousLink: (body: CreateLinkBody) =>
    requestAnonymous<CreatedLink & { claim_token: string }>('/api/anon/links', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  claimLink: (claimToken: string) =>
    request<{ link: Link }>('/api/links/claim', {
      method: 'POST',
      body: JSON.stringify({ claim_token: claimToken }),
    }),

  /** Persist the design for a code that has no owner yet. Survives the claim. */
  saveAnonymousQr: (claimToken: string, style: QrStyle) =>
    requestAnonymous<void>('/api/anon/qr', {
      method: 'PUT',
      body: JSON.stringify({ claim_token: claimToken, style }),
    }),

  updateLink: (id: string, body: UpdateLinkBody) =>
    request<UpdatedLink>(`/api/links/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),

  deleteLink: (id: string, opts: { force?: boolean } = {}) =>
    request<void>(`/api/links/${id}${opts.force ? '?force=true' : ''}`, { method: 'DELETE' }),

  createDomain: (hostname: string) =>
    request<CreatedDomain>('/api/domains', { method: 'POST', body: JSON.stringify({ hostname }) }),

  verifyDomain: (id: string) =>
    request<DomainVerification>(`/api/domains/${id}/verify`, { method: 'POST' }),

  deleteDomain: (id: string) => request<void>(`/api/domains/${id}`, { method: 'DELETE' }),
};
