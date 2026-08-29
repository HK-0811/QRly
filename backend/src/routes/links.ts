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
import { selectOne, insert, update, remove, DbError } from '../lib/supabase';
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
// POST /api/links
// ---------------------------------------------------------------------------

links.post('/links', async (c) => {
  const user = c.get('user');

  let body: CreateLinkBody;
  try {
    body = await c.req.json<CreateLinkBody>();
  } catch {
    return c.json({ error: 'invalid_body', message: 'Expected a JSON body.' }, 400);
  }

  const destination = validateDestination(body.destination_url);
  if (!destination.ok) {
    return c.json({ error: destination.reason, message: destination.message }, 400);
  }

  // Resolve the target domain.
  let domain: Domain | null = null;
  if (body.domain_id) {
    const found = await selectOne<Domain>(
      c.env,
      `domains?id=eq.${encodeURIComponent(body.domain_id)}&select=*`,
    );
    if (!found || (found.is_custom && found.user_id !== user.id)) {
      return c.json({ error: 'domain_not_found', message: 'That domain does not exist.' }, 404);
    }
    if (!found.is_active) {
      return c.json(
        {
          error: 'domain_inactive',
          message: 'That domain is not verified yet. Finish DNS setup before creating links on it.',
        },
        400,
      );
    }
    domain = found;
  } else {
    domain = await selectOne<Domain>(
      c.env,
      `domains?hostname=eq.${encodeURIComponent(c.env.PLATFORM_HOSTNAME)}&is_active=eq.true&select=*`,
    );
    if (!domain) {
      return c.json(
        {
          error: 'no_platform_domain',
          message: `No active domain row exists for ${c.env.PLATFORM_HOSTNAME}.`,
        },
        500,
      );
    }
  }

  let expiresAt: string | null = null;
  if (body.expires_at) {
    const when = new Date(body.expires_at);
    if (Number.isNaN(when.getTime())) {
      return c.json({ error: 'invalid_expiry', message: 'That expiry date is not valid.' }, 400);
    }
    if (when.getTime() <= Date.now()) {
      return c.json(
        { error: 'invalid_expiry', message: 'The expiry date has to be in the future.' },
        400,
      );
    }
    expiresAt = when.toISOString();
  }

  const custom = body.slug !== undefined && body.slug !== null && body.slug !== '';
  if (custom) {
    const check = validateCustomSlug(body.slug);
    if (!check.ok) return c.json({ error: check.reason, message: check.message }, 400);
  }

  const title = typeof body.title === 'string' && body.title.trim() ? body.title.trim().slice(0, 200) : null;

  // Collision handling is a retry on the unique constraint, never a pre-check.
  // SELECT-then-INSERT races: two requests can both see the slug free.
  const attempts = custom ? 1 : SLUG_RETRY_LIMIT;
  for (let attempt = 0; attempt < attempts; attempt++) {
    const slug = custom ? (body.slug as string).trim() : generateSlug();

    try {
      const [created] = await insert<Link>(c.env, 'links', {
        user_id: user.id,
        domain_id: domain.id,
        slug,
        destination_url: destination.url,
        title,
        is_active: body.is_active ?? true,
        expires_at: expiresAt,
      });

      if (!created) throw new Error('insert returned no row');

      // Seed the cache so the very first scan is a hit, not a cold Postgres read.
      await invalidateQuietly(
        c.env,
        domain.hostname,
        created.slug,
        toCached(created, domain.is_active),
      );

      // Safe Browsing runs after the response is committed. It is a third-party
      // network call, and link creation must not depend on Google being up. A
      // link created a second before the verdict arrives is served as unchecked,
      // which is what it is.
      c.executionCtx.waitUntil(
        screenLink(c.env, created, domain.hostname, domain.is_active).catch((err) =>
          log.warn({ event: 'safe_browsing_screen_failed', link_id: created.id, error: err }),
        ),
      );

      return c.json({ link: created, hostname: domain.hostname, short_url: `https://${domain.hostname}/${created.slug}` }, 201);
    } catch (err) {
      if (err instanceof DbError && err.isUniqueViolation) {
        if (custom) {
          return c.json(
            { error: 'slug_taken', message: `"${slug}" is already in use on ${domain.hostname}.` },
            409,
          );
        }
        continue; // generated slug collided — try another
      }
      throw err;
    }
  }

  // Five cryptographic 7-character collisions in a row means the namespace is
  // genuinely saturated, not that we were unlucky.
  return c.json(
    { error: 'slug_exhausted', message: 'Could not allocate a short code. Try again.' },
    503,
  );
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
