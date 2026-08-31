/**
 * Privileged link writes.
 *
 * Reads deliberately do NOT live here — the dashboard queries Supabase directly
 * with the user's JWT, because RLS already enforces ownership and a read proxy
 * would be code with no security value (architecture.md §1).
 *
 * Writes are here for one reason: this Worker owns the KV cache. If the dashboard
 * wrote links straight to Postgres, an edited destination would keep resolving to
 * the old URL until the TTL expired, with nothing to invalidate it.
 */
import { Hono } from 'hono';
import { createMiddleware } from 'hono/factory';
import type { CachedLink, CreateLinkBody, Domain, Link, UpdateLinkBody } from '../types';
import type { Env } from '../env';
import { requireAuth, type AuthVariables } from '../lib/auth';
import { selectOne, insert, update, remove, rpc, DbError } from '../lib/supabase';
import { validateDestination } from '../lib/url-safety';
import { generateSlug, validateCustomSlug } from '../lib/slug';
import { invalidateQuietly } from '../lib/kv';
import { checkUrl } from '../lib/safe-browsing';
import { API_WRITE_LIMIT, rateLimit, rateLimitHeaders } from '../lib/rate-limit';
import { log } from '../lib/log';

type Ctx = { Bindings: Env; Variables: AuthVariables };

export const links = new Hono<Ctx>();

// Scoped to the link routes rather than '*' so an unknown /api path still returns
// a 404 instead of a 401 that implies the route exists but the caller is
// unauthenticated.
links.use('/links', requireAuth);
links.use('/links/*', requireAuth);

// Keyed on the account, after authentication, so one compromised session cannot
// exhaust the budget for everybody behind the same NAT.
const limitWrites = createMiddleware<Ctx>(async (c, next) => {
  if (c.req.method === 'GET' || c.req.method === 'OPTIONS') return next();

  const result = rateLimit(`api:${c.get('user').id}`, API_WRITE_LIMIT);
  if (!result.allowed) {
    return c.json(
      {
        error: 'rate_limited',
        message: `Too many changes at once. Try again in ${result.retryAfter} seconds.`,
      },
      429,
      rateLimitHeaders(API_WRITE_LIMIT, result),
    );
  }
  await next();
});

links.use('/links', limitWrites);
links.use('/links/*', limitWrites);

const SLUG_RETRY_LIMIT = 5;

/** Claim tokens are v4 uuids. Rejecting the shape early keeps junk out of the RPC. */
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function toCached(link: Link, domainActive: boolean, qrId: string | null = null): CachedLink {
  return {
    id: link.id,
    user_id: link.user_id,
    domain_id: link.domain_id,
    qr_id: qrId,
    destination_url: link.destination_url,
    is_active: link.is_active,
    expires_at: link.expires_at,
    safe_browsing_status: link.safe_browsing_status,
    domain_active: domainActive,
  };
}

/**
 * Screen a destination and persist the verdict, updating the cache so a flagged
 * link starts serving the warning page without waiting for its TTL.
 *
 * Always called from waitUntil. Never on the request path.
 */
async function screenLink(
  env: Env,
  link: Link,
  hostname: string,
  domainActive: boolean,
): Promise<void> {
  const verdict = await checkUrl(env, link.destination_url);
  if (verdict.status === 'unchecked') return; // leave it for the weekly sweep

  const [updated] = await update<Link>(env, 'links', `id=eq.${link.id}`, {
    safe_browsing_status: verdict.status,
    safe_browsing_checked_at: new Date().toISOString(),
  });

  if (updated) {
    await invalidateQuietly(env, hostname, updated.slug, toCached(updated, domainActive));
  }

  if (verdict.status === 'flagged') {
    log.warn({ event: 'link_flagged', link_id: link.id, threats: verdict.threats });
  }
}

// ---------------------------------------------------------------------------
// Creation
//
// Shared by the authenticated route and the anonymous one. The only differences
// between them are the owner (an id, or null for an unclaimed code) and whether a
// custom domain may be named — so those are the only two parameters, and every
// validation, collision retry and cache seed below is provably the same code on
// both paths rather than two implementations that drift.
// ---------------------------------------------------------------------------

export interface CreateResult {
  status: 201 | 400 | 404 | 409 | 500 | 503;
  body: Record<string, unknown>;
}

export async function createLink(
  env: Env,
  // Only waitUntil is used, and Hono's ExecutionContext is not structurally the
  // same type as the Workers global. Asking for the one method both provide keeps
  // this callable from a route handler and from a test with a two-line stub.
  ctx: { waitUntil(promise: Promise<unknown>): void },
  opts: { userId: string | null; body: CreateLinkBody; claimToken?: string },
): Promise<CreateResult> {
  const { userId, body, claimToken } = opts;

  const destination = validateDestination(body.destination_url);
  if (!destination.ok) {
    return { status: 400, body: { error: destination.reason, message: destination.message } };
  }

  // Resolve the target domain.
  let domain: Domain | null = null;
  if (body.domain_id) {
    // An anonymous caller has no account, so it can own no custom domain. The
    // database trigger would refuse the insert anyway; refusing here turns a
    // 500 into a sentence that says what went wrong.
    if (userId === null) {
      return {
        status: 400,
        body: {
          error: 'domain_requires_account',
          message: 'Custom domains belong to an account. Create the code, then claim it.',
        },
      };
    }
    const found = await selectOne<Domain>(
      env,
      `domains?id=eq.${encodeURIComponent(body.domain_id)}&select=*`,
    );
    if (!found || (found.is_custom && found.user_id !== userId)) {
      return { status: 404, body: { error: 'domain_not_found', message: 'That domain does not exist.' } };
    }
    if (!found.is_active) {
      return {
        status: 400,
        body: {
          error: 'domain_inactive',
          message: 'That domain is not verified yet. Finish DNS setup before creating links on it.',
        },
      };
    }
    domain = found;
  } else {
    domain = await selectOne<Domain>(
      env,
      `domains?hostname=eq.${encodeURIComponent(env.PLATFORM_HOSTNAME)}&is_active=eq.true&select=*`,
    );
    if (!domain) {
      return {
        status: 500,
        body: {
          error: 'no_platform_domain',
          message: `No active domain row exists for ${env.PLATFORM_HOSTNAME}.`,
        },
      };
    }
  }

  let expiresAt: string | null = null;
  if (body.expires_at) {
    const when = new Date(body.expires_at);
    if (Number.isNaN(when.getTime())) {
      return { status: 400, body: { error: 'invalid_expiry', message: 'That expiry date is not valid.' } };
    }
    if (when.getTime() <= Date.now()) {
      return {
        status: 400,
        body: { error: 'invalid_expiry', message: 'The expiry date has to be in the future.' },
      };
    }
    expiresAt = when.toISOString();
  }

  const custom = body.slug !== undefined && body.slug !== null && body.slug !== '';
  if (custom) {
    const check = validateCustomSlug(body.slug);
    if (!check.ok) return { status: 400, body: { error: check.reason, message: check.message } };
  }

  const title = typeof body.title === 'string' && body.title.trim() ? body.title.trim().slice(0, 200) : null;

  // Collision handling is a retry on the unique constraint, never a pre-check.
  // SELECT-then-INSERT races: two requests can both see the slug free.
  const attempts = custom ? 1 : SLUG_RETRY_LIMIT;
  for (let attempt = 0; attempt < attempts; attempt++) {
    const slug = custom ? (body.slug as string).trim() : generateSlug();

    try {
      const [created] = await insert<Link>(env, 'links', {
        user_id: userId,
        domain_id: domain.id,
        slug,
        destination_url: destination.url,
        title,
        is_active: body.is_active ?? true,
        expires_at: expiresAt,
        // The check constraint in migration 0009 makes these two states the only
        // legal ones, so there is nothing to get wrong here.
        ...(userId === null ? { claim_token: claimToken } : {}),
      });

      if (!created) throw new Error('insert returned no row');

      // Seed the cache so the very first scan is a hit, not a cold Postgres read.
      await invalidateQuietly(env, domain.hostname, created.slug, toCached(created, domain.is_active));

      // Safe Browsing runs after the response is committed. It is a third-party
      // network call, and link creation must not depend on Google being up. A
      // link created a second before the verdict arrives is served as unchecked,
      // which is what it is.
      ctx.waitUntil(
        screenLink(env, created, domain.hostname, domain.is_active).catch((err) =>
          log.warn({ event: 'safe_browsing_screen_failed', link_id: created.id, error: err }),
        ),
      );

      return {
        status: 201,
        body: {
          link: created,
          hostname: domain.hostname,
          short_url: `https://${domain.hostname}/${created.slug}`,
          ...(claimToken ? { claim_token: claimToken } : {}),
        },
      };
    } catch (err) {
      if (err instanceof DbError && err.isUniqueViolation) {
        if (custom) {
          return {
            status: 409,
            body: {
              error: 'slug_taken',
              message: `"${slug}" is already in use on ${domain.hostname}.`,
            },
          };
        }
        continue; // generated slug collided — try another
      }
      throw err;
    }
  }

  // Five cryptographic 7-character collisions in a row means the namespace is
  // genuinely saturated, not that we were unlucky.
  return {
    status: 503,
    body: { error: 'slug_exhausted', message: 'Could not allocate a short code. Try again.' },
  };
}

// ---------------------------------------------------------------------------
// POST /api/links
// ---------------------------------------------------------------------------

links.post('/links', async (c) => {
  let body: CreateLinkBody;
  try {
    body = await c.req.json<CreateLinkBody>();
  } catch {
    return c.json({ error: 'invalid_body', message: 'Expected a JSON body.' }, 400);
  }

  const result = await createLink(c.env, c.executionCtx, {
    userId: c.get('user').id,
    body,
  });
  return c.json(result.body, result.status);
});

// ---------------------------------------------------------------------------
// POST /api/links/claim
//
// Attaches an anonymously created code, plus its saved design and every scan it
// has already collected, to the account making the request.
// ---------------------------------------------------------------------------

links.post('/links/claim', async (c) => {
  const user = c.get('user');

  let body: { claim_token?: unknown };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'invalid_body', message: 'Expected a JSON body.' }, 400);
  }

  const token = typeof body.claim_token === 'string' ? body.claim_token.trim() : '';
  if (!UUID_RE.test(token)) {
    return c.json({ error: 'invalid_token', message: 'That is not a valid claim token.' }, 400);
  }

  // The whole operation is one function call so the link and its history move
  // together, and so two tabs racing the same token cannot both succeed.
  const claimed = await rpc<Link | null>(c.env, 'claim_link', {
    p_token: token,
    p_user: user.id,
  });

  // A SQL function returning a composite type does NOT come back as JSON null
  // when it returns NULL — PostgREST serialises it as an object with every
  // column set to null. That object is truthy, so a plain falsy check would
  // report a failed claim as a success and hand back a link full of nulls.
  // The id is the thing to test.
  if (!claimed?.id) {
    // Already claimed, expired after thirty days, or never existed. These are
    // deliberately one message: distinguishing them would let anyone probe which
    // tokens have ever been real.
    return c.json(
      {
        error: 'claim_failed',
        message: 'That code has already been claimed, or it expired. Unclaimed codes are kept for 30 days.',
      },
      404,
    );
  }

  log.info({ event: 'link_claimed', link_id: claimed.id, user_id: user.id });
  return c.json({ link: claimed }, 200);
});

// ---------------------------------------------------------------------------
// PATCH /api/links/:id
// ---------------------------------------------------------------------------

links.patch('/links/:id', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');

  let body: UpdateLinkBody;
  try {
    body = await c.req.json<UpdateLinkBody>();
  } catch {
    return c.json({ error: 'invalid_body', message: 'Expected a JSON body.' }, 400);
  }

  // service_role bypasses RLS, so ownership is filtered explicitly on every
  // statement below. Forgetting the user_id filter here is the whole tenant
  // boundary, gone.
  const existing = await selectOne<Link>(
    c.env,
    `links?id=eq.${encodeURIComponent(id)}&user_id=eq.${user.id}&select=*`,
  );
  if (!existing) {
    return c.json({ error: 'not_found', message: 'That link does not exist.' }, 404);
  }

  const patch: Record<string, unknown> = {};

  if (body.destination_url !== undefined) {
    const destination = validateDestination(body.destination_url);
    if (!destination.ok) {
      return c.json({ error: destination.reason, message: destination.message }, 400);
    }
    patch.destination_url = destination.url;
    if (destination.url !== existing.destination_url) {
      // The destination changed, so the previous Safe Browsing verdict is about a
      // URL this link no longer points to.
      patch.safe_browsing_status = 'unchecked';
      patch.safe_browsing_checked_at = null;
    }
  }

  if (body.title !== undefined) {
    patch.title =
      typeof body.title === 'string' && body.title.trim() ? body.title.trim().slice(0, 200) : null;
  }

  if (body.is_active !== undefined) {
    patch.is_active = Boolean(body.is_active);
  }

  if (body.expires_at !== undefined) {
    if (body.expires_at === null) {
      patch.expires_at = null;
    } else {
      const when = new Date(body.expires_at);
      if (Number.isNaN(when.getTime())) {
        return c.json({ error: 'invalid_expiry', message: 'That expiry date is not valid.' }, 400);
      }
      patch.expires_at = when.toISOString();
    }
  }

  if (Object.keys(patch).length === 0) {
    return c.json({ error: 'nothing_to_update', message: 'No changes were supplied.' }, 400);
  }

  const [updated] = await update<Link>(
    c.env,
    'links',
    `id=eq.${encodeURIComponent(id)}&user_id=eq.${user.id}`,
    patch,
  );
  if (!updated) {
    return c.json({ error: 'not_found', message: 'That link does not exist.' }, 404);
  }

  const domain = await selectOne<Domain>(
    c.env,
    `domains?id=eq.${updated.domain_id}&select=hostname,is_active`,
  );
  if (domain) {
    await invalidateQuietly(
      c.env,
      domain.hostname,
      updated.slug,
      toCached(updated, domain.is_active),
    );

    // The destination changed, so the previous verdict was about a different URL.
    if (patch.destination_url !== undefined) {
      c.executionCtx.waitUntil(
        screenLink(c.env, updated, domain.hostname, domain.is_active).catch((err) =>
          log.warn({ event: 'safe_browsing_rescreen_failed', link_id: updated.id, error: err }),
        ),
      );
    }
  }

  return c.json({
    link: updated,
    // Surfaced so the dashboard can state the propagation window honestly rather
    // than implying the change is instant everywhere.
    cache_propagation_seconds: 60,
  });
});

// ---------------------------------------------------------------------------
// DELETE /api/links/:id
// ---------------------------------------------------------------------------

links.delete('/links/:id', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');

  const existing = await selectOne<Link>(
    c.env,
    `links?id=eq.${encodeURIComponent(id)}&user_id=eq.${user.id}&select=*`,
  );
  if (!existing) {
    return c.json({ error: 'not_found', message: 'That link does not exist.' }, 404);
  }

  // Deleting a link that has QR codes breaks every printed copy, permanently and
  // silently. Disabling the link instead serves a branded page, which is almost
  // always what the person actually wants. Deletion stays possible, but only
  // deliberately.
  if (c.req.query('force') !== 'true') {
    const qr = await selectOne<{ id: string }>(
      c.env,
      `qr_codes?link_id=eq.${encodeURIComponent(id)}&user_id=eq.${user.id}&select=id&limit=1`,
    );
    if (qr) {
      return c.json(
        {
          error: 'has_printed_codes',
          message:
            'This link has QR codes generated from it. Deleting it breaks every printed copy. ' +
            'Turn the link off instead, or confirm deletion.',
          requires_confirmation: true,
        },
        409,
      );
    }
  }

  const domain = await selectOne<Domain>(
    c.env,
    `domains?id=eq.${existing.domain_id}&select=hostname,is_active`,
  );

  await remove<Link>(c.env, 'links', `id=eq.${encodeURIComponent(id)}&user_id=eq.${user.id}`);

  if (domain) {
    // Negative sentinel rather than a delete, so probes for the dead slug stop at
    // the edge instead of reaching Postgres.
    await invalidateQuietly(c.env, domain.hostname, existing.slug, null);
  }

  return c.body(null, 204);
});
