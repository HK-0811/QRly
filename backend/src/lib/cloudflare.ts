/**
 * Cloudflare for SaaS custom hostname API (architecture.md §4.4, context.md §10).
 *
 * The correction this file exists because of: **a CNAME alone does not make a
 * custom domain work.** It produces a TLS certificate error, because no
 * certificate exists for `qr.client.com`. Something has to register the hostname
 * so a certificate gets issued, and that is this API. From the customer's side it
 * really is just "add a CNAME and come back" — this is the part that makes that
 * true, and it is one API call.
 *
 * Free plan: 100 custom hostnames, then $0.10/month each. No wildcards, and no
 * custom certificate authority.
 *
 * ⚠ **This client is shape-tested, not exercised.** It has never run against the
 * real API, because that needs a Cloudflare account with a zone, which this
 * project does not yet have. The request and response shapes follow the published
 * API; the error handling is real; the confidence is not the same as for code
 * that has round-tripped.
 */
import type { Env } from '../env';
import { log } from './log';

const API = 'https://api.cloudflare.com/client/v4';

export interface CustomHostname {
  id: string;
  hostname: string;
  status: string;
  ssl: {
    status: string;
    method?: string;
    type?: string;
    validation_errors?: Array<{ message: string }>;
  };
  verification_errors?: string[];
}

export class CloudflareError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly errors: Array<{ code: number; message: string }> = [],
  ) {
    super(message);
    this.name = 'CloudflareError';
  }

  /** The hostname is already registered, which is not a failure on re-verify. */
  get isDuplicate() {
    return this.errors.some((e) => e.code === 1406 || /already exists/i.test(e.message));
  }
}

interface CfEnvelope<T> {
  success: boolean;
  result: T;
  errors: Array<{ code: number; message: string }>;
}

export function isConfigured(env: Env): boolean {
  return Boolean(env.CLOUDFLARE_API_TOKEN && env.CLOUDFLARE_ZONE_ID);
}

async function call<T>(env: Env, path: string, init: RequestInit = {}): Promise<T> {
  if (!isConfigured(env)) {
    throw new CloudflareError('Cloudflare API credentials are not configured.', 0);
  }

  const res = await fetch(`${API}/zones/${env.CLOUDFLARE_ZONE_ID}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${env.CLOUDFLARE_API_TOKEN}`,
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
    signal: AbortSignal.timeout(10_000),
  });

  let body: CfEnvelope<T>;
  try {
    body = (await res.json()) as CfEnvelope<T>;
  } catch {
    throw new CloudflareError(`Cloudflare returned ${res.status} with no JSON body.`, res.status);
  }

  if (!res.ok || !body.success) {
    const message = body.errors?.[0]?.message ?? `Cloudflare returned ${res.status}.`;
    throw new CloudflareError(message, res.status, body.errors ?? []);
  }

  return body.result;
}

/**
 * Register a hostname so Cloudflare issues a certificate for it.
 *
 * `http` validation is used rather than `txt`: it validates over port 80 through
 * the CNAME the customer has already added, so there is no second record for them
 * to create. That is what keeps the instruction to "add one CNAME".
 */
export function createCustomHostname(env: Env, hostname: string): Promise<CustomHostname> {
  return call<CustomHostname>(env, '/custom_hostnames', {
    method: 'POST',
    body: JSON.stringify({
      hostname,
      ssl: {
        method: 'http',
        type: 'dv',
        settings: { min_tls_version: '1.2' },
        // Renews automatically and forever once issued.
        bundle_method: 'ubiquitous',
      },
    }),
  });
}

export function getCustomHostname(env: Env, id: string): Promise<CustomHostname> {
  return call<CustomHostname>(env, `/custom_hostnames/${encodeURIComponent(id)}`);
}

export function deleteCustomHostname(env: Env, id: string): Promise<unknown> {
  return call(env, `/custom_hostnames/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

/**
 * Register the hostname, tolerating the case where it already exists.
 *
 * Re-verifying a domain must not fail because it was registered the first time.
 */
export async function ensureCustomHostname(
  env: Env,
  hostname: string,
): Promise<{ hostname: CustomHostname | null; error: string | null }> {
  try {
    return { hostname: await createCustomHostname(env, hostname), error: null };
  } catch (err) {
    if (err instanceof CloudflareError && err.isDuplicate) {
      log.info({ event: 'custom_hostname_already_registered', hostname });
      return { hostname: null, error: null };
    }
    const message = err instanceof Error ? err.message : String(err);
    log.warn({ event: 'custom_hostname_create_failed', hostname, error: message });
    return { hostname: null, error: message };
  }
}

/** Cloudflare reports several SSL states; only one of them means "serving". */
export function certificateIsActive(hostname: CustomHostname | null): boolean {
  return hostname?.ssl?.status === 'active';
}

/**
 * Cloudflare's own SSL status, translated into something worth reading. Kept
 * separate from lib/dns.ts `interpret` because this describes the certificate,
 * and that describes the DNS record.
 */
export function describeSslStatus(status: string | undefined): string {
  switch (status) {
    case 'active':
      return 'Certificate issued and serving.';
    case 'pending_validation':
      return 'Waiting for Cloudflare to validate the hostname over the CNAME.';
    case 'pending_issuance':
    case 'pending_deployment':
      return 'Validated. The certificate is being issued and deployed.';
    case 'deleted':
      return 'The certificate was removed.';
    case 'initializing':
      return 'Just registered. Validation has not started yet.';
    default:
      return status ? `Certificate status: ${status}.` : 'No certificate has been requested yet.';
  }
}
