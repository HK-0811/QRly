/**
 * Custom domain registration and verification.
 *
 * The client-facing flow is deliberately one step: add a CNAME, come back, click
 * Verify. Everything that makes that sufficient — registering the hostname so a
 * certificate is issued, polling for it, and telling the two kinds of "pending"
 * apart — happens here.
 */
import { Hono } from 'hono';
import { createMiddleware } from 'hono/factory';
import type { Domain } from '../types';
import type { Env } from '../env';
import { requireAuth, type AuthVariables } from '../lib/auth';
import { selectOne, select, insert, update, remove, DbError } from '../lib/supabase';
import { inspectHostname, interpret, resolveCname } from '../lib/dns';
import {
  certificateIsActive,
  describeSslStatus,
  deleteCustomHostname,
  ensureCustomHostname,
  getCustomHostname,
  isConfigured,
} from '../lib/cloudflare';
import { API_WRITE_LIMIT, rateLimit, rateLimitHeaders } from '../lib/rate-limit';
import { log } from '../lib/log';

type Ctx = { Bindings: Env; Variables: AuthVariables };

export const domains = new Hono<Ctx>();

domains.use('/domains', requireAuth);
domains.use('/domains/*', requireAuth);

const limitWrites = createMiddleware<Ctx>(async (c, next) => {
  if (c.req.method === 'GET' || c.req.method === 'OPTIONS') return next();
  const result = rateLimit(`api:${c.get('user').id}`, API_WRITE_LIMIT);
  if (!result.allowed) {
    return c.json(
      { error: 'rate_limited', message: `Too many requests. Try again in ${result.retryAfter} seconds.` },
      429,
      rateLimitHeaders(API_WRITE_LIMIT, result),
    );
  }
  await next();
});

domains.use('/domains', limitWrites);
domains.use('/domains/*', limitWrites);

/**
 * What the customer's CNAME must point at: the hostname this Worker already
 * serves. Cloudflare for SaaS routes any registered custom hostname to the same
 * Worker, so one target works for every client.
 */
function cnameTarget(env: Env): string {
  return env.PLATFORM_HOSTNAME;
}

// ---------------------------------------------------------------------------
// POST /api/domains
// ---------------------------------------------------------------------------

domains.post('/domains', async (c) => {
  const user = c.get('user');

  let body: { hostname?: string };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'invalid_body', message: 'Expected a JSON body.' }, 400);
  }

  const hostname = String(body.hostname ?? '').trim().toLowerCase().replace(/\.$/, '');
  const shape = inspectHostname(hostname);

  if (!shape.valid) {
    return c.json({ error: 'invalid_hostname', message: shape.reason }, 400);
  }

  if (shape.isApex) {
    // Refused before anything is created. DNS forbids a CNAME at a zone apex, so
    // this domain can never verify — telling them now beats a failed Verify later.
    return c.json(
      {
        error: 'apex_not_supported',
        message: `${hostname} is a root domain, and DNS does not allow a CNAME at the root.`,
        hint: `Use a subdomain such as qr.${hostname}.`,
      },
      400,
    );
  }

  // Hostnames are globally unique: two accounts cannot both claim one, because
  // whoever holds it decides where every printed code on it resolves.
  const existing = await selectOne<Domain>(
    c.env,
    `domains?hostname=eq.${encodeURIComponent(hostname)}&select=id,user_id`,
  );
  if (existing) {
    return c.json(
      {
        error: 'hostname_taken',
        message:
          existing.user_id === user.id
            ? 'You have already added that hostname.'
            : 'That hostname is already registered on this platform.',
      },
      409,
    );
  }

  // Register with Cloudflare first so the certificate starts issuing while the
  // customer is still reading the CNAME instructions. A failure here is not
  // fatal: the row is created as pending and Verify retries the registration.
  const cf = isConfigured(c.env)
    ? await ensureCustomHostname(c.env, hostname)
    : { hostname: null, error: 'Cloudflare API credentials are not configured.' };

  try {
    const [created] = await insert<Domain>(c.env, 'domains', {
      user_id: user.id,
      hostname,
      is_custom: true,
      is_active: false,
      verification_status: 'pending',
      cf_custom_hostname_id: cf.hostname?.id ?? null,
      cname_target: cnameTarget(c.env),
      ssl_status: cf.hostname?.ssl?.status ?? null,
    });

    log.info({ event: 'domain_added', domain_id: created?.id, registered_with_cloudflare: Boolean(cf.hostname) });

    return c.json(
      {
        domain: created,
        instructions: {
          record_type: 'CNAME',
          name: hostname,
          value: cnameTarget(c.env),
          note:
            'If your DNS is hosted on Cloudflare, set this record to "DNS only" (grey cloud). ' +
            'A proxied record hides the CNAME and verification cannot see it.',
        },
        cloudflare_error: cf.error,
      },
      201,
    );
  } catch (err) {
    if (err instanceof DbError && err.isUniqueViolation) {
      return c.json({ error: 'hostname_taken', message: 'That hostname is already registered.' }, 409);
    }
    throw err;
  }
});

// ---------------------------------------------------------------------------
// POST /api/domains/:id/verify
// ---------------------------------------------------------------------------

domains.post('/domains/:id/verify', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');

  const domain = await selectOne<Domain>(
    c.env,
    `domains?id=eq.${encodeURIComponent(id)}&user_id=eq.${user.id}&select=*`,
  );
  if (!domain) {
    return c.json({ error: 'not_found', message: 'That domain does not exist.' }, 404);
  }

  const expected = domain.cname_target ?? cnameTarget(c.env);

  // Registration may have failed when the domain was added, or credentials may
  // have arrived since. Either way, make sure the hostname is registered before
  // asking about its certificate.
  let cfId = domain.cf_custom_hostname_id;
  if (!cfId && isConfigured(c.env)) {
    const registered = await ensureCustomHostname(c.env, domain.hostname);
    cfId = registered.hostname?.id ?? null;
  }

  // DNS and certificate status in parallel — the two answers are independent and
  // the person is waiting.
  const [dns, cert] = await Promise.all([
    resolveCname(domain.hostname),
    cfId && isConfigured(c.env)
      ? getCustomHostname(c.env, cfId).catch((err) => {
          log.warn({ event: 'custom_hostname_fetch_failed', domain_id: domain.id, error: String(err) });
          return null;
        })
      : Promise.resolve(null),
  ]);

  const certificateActive = certificateIsActive(cert);
  const outcome = interpret(domain.hostname, expected, dns, certificateActive);

  const patch: Record<string, unknown> = {
    verification_status: outcome.state === 'active' ? 'active' : outcome.state === 'failed' ? 'failed' : 'verifying',
    // A domain only serves once BOTH the record resolves and a certificate
    // exists. Activating on DNS alone would route traffic to a hostname with no
    // certificate, which is a TLS error rather than a redirect.
    is_active: outcome.state === 'active',
    ssl_status: cert?.ssl?.status ?? domain.ssl_status,
    ...(cfId && cfId !== domain.cf_custom_hostname_id ? { cf_custom_hostname_id: cfId } : {}),
    ...(outcome.state === 'active' ? { dns_verified_at: new Date().toISOString() } : {}),
  };

  const [updated] = await update<Domain>(
    c.env,
    'domains',
    `id=eq.${encodeURIComponent(id)}&user_id=eq.${user.id}`,
    patch,
  );

  // The hostname allow-list the redirect path reads is cached for 5 minutes.
  // Clearing it means a newly-active domain serves immediately.
  if (outcome.state === 'active') {
    await c.env.LINKS_KV.delete('hosts:active').catch(() => {});
  }

  return c.json({
    domain: updated ?? domain,
    outcome,
    dns: {
      found: dns.target,
      expected,
      agreed_across_resolvers: dns.agreed,
      resolvers: dns.perResolver,
    },
    certificate: {
      status: cert?.ssl?.status ?? null,
      description: describeSslStatus(cert?.ssl?.status),
      configured: isConfigured(c.env),
    },
  });
});

// ---------------------------------------------------------------------------
// DELETE /api/domains/:id
// ---------------------------------------------------------------------------

domains.delete('/domains/:id', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');

  const domain = await selectOne<Domain>(
    c.env,
    `domains?id=eq.${encodeURIComponent(id)}&user_id=eq.${user.id}&select=*`,
  );
  if (!domain) {
    return c.json({ error: 'not_found', message: 'That domain does not exist.' }, 404);
  }

  // Refused while anything references it. A printed QR code encodes this hostname
  // permanently — removing it breaks every physical copy, with no way to recall
  // them. The database enforces this too, via `on delete restrict`; this exists
  // to produce a message rather than a constraint violation.
  const links = await select<{ id: string }>(
    c.env,
    `links?domain_id=eq.${encodeURIComponent(id)}&select=id&limit=1`,
  );
  if (links.length > 0) {
    return c.json(
      {
        error: 'domain_in_use',
        message:
          'Links still point at this domain. Every printed QR code on it would stop working. ' +
          'Delete those links first if you are certain.',
      },
      409,
    );
  }

  if (domain.cf_custom_hostname_id && isConfigured(c.env)) {
    await deleteCustomHostname(c.env, domain.cf_custom_hostname_id).catch((err) =>
      log.warn({ event: 'custom_hostname_delete_failed', domain_id: domain.id, error: String(err) }),
    );
  }

  try {
    await remove(c.env, 'domains', `id=eq.${encodeURIComponent(id)}&user_id=eq.${user.id}`);
  } catch (err) {
    if (err instanceof DbError && err.isRestrictViolation) {
      return c.json(
        { error: 'domain_in_use', message: 'Something still references this domain.' },
        409,
      );
    }
    throw err;
  }

  await c.env.LINKS_KV.delete('hosts:active').catch(() => {});
  return c.body(null, 204);
});
