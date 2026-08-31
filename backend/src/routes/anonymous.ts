/**
 * The unauthenticated creation surface.
 *
 * Mounted at /api/anon rather than under /links, deliberately. The link routes
 * attach `requireAuth` with a `/links/*` matcher, so an anonymous handler placed
 * there would be reachable only by registering it before that middleware — making
 * whether this endpoint requires a session a property of line ordering in another
 * file. A separate prefix makes the unauthenticated surface something you can see
 * in the path, and something the CORS and rate-limit rules can target on its own.
 *
 * This is the only endpoint in the product that writes to the database without a
 * verified caller, so the limits here are the only thing between a script and the
 * free tier's row budget.
 */
import { Hono } from 'hono';
import type { CreateLinkBody, Link, QrCode } from '../types';
import type { Env } from '../env';
import { createLink } from './links';
import { selectOne, insert, update } from '../lib/supabase';
import { ANON_CREATE_LIMIT, rateLimit, rateLimitHeaders } from '../lib/rate-limit';
import { log } from '../lib/log';

export const anonymous = new Hono<{ Bindings: Env }>();

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// ---------------------------------------------------------------------------
// POST /api/anon/links
// ---------------------------------------------------------------------------

anonymous.post('/anon/links', async (c) => {
  // Keyed on the client address, because there is no account to key on. This is
  // a per-isolate limiter (see lib/rate-limit.ts), so it is a speed bump against
  // a single script rather than a guarantee — the real ceiling is the 30-day
  // sweep in migration 0009, which means abuse costs storage temporarily rather
  // than permanently.
  const client = c.req.header('CF-Connecting-IP') ?? 'unknown';
  const limited = rateLimit(`anon:${client}`, ANON_CREATE_LIMIT);
  if (!limited.allowed) {
    return c.json(
      {
        error: 'rate_limited',
        message: `That is a lot of codes at once. Try again in ${limited.retryAfter} seconds.`,
      },
      429,
      rateLimitHeaders(ANON_CREATE_LIMIT, limited),
    );
  }

  let body: CreateLinkBody;
  try {
    body = await c.req.json<CreateLinkBody>();
  } catch {
    return c.json({ error: 'invalid_body', message: 'Expected a JSON body.' }, 400);
  }

  // Generated here rather than in Postgres so it can be returned to the browser
  // in the same response that creates the link. The caller never gets a second
  // chance to learn it: it is the only credential that can claim the code.
  const claimToken = crypto.randomUUID();

  const result = await createLink(c.env, c.executionCtx, {
    userId: null,
    body,
    claimToken,
  });

  if (result.status === 201) {
    log.info({ event: 'anon_link_created', slug: (result.body.link as { slug?: string })?.slug });
  }

  return c.json(result.body, result.status);
});

// ---------------------------------------------------------------------------
// PUT /api/anon/qr
//
// Save the design chosen for an unclaimed code.
//
// The claim token is the credential. Anyone holding it can already re-point and
// eventually own the link, so letting it set the style grants nothing new — and
// without this, a design made before signing up would silently vanish at the
// moment the code is claimed, which is the one moment the person is watching.
// ---------------------------------------------------------------------------

anonymous.put('/anon/qr', async (c) => {
  const client = c.req.header('CF-Connecting-IP') ?? 'unknown';
  const limited = rateLimit(`anon:${client}`, ANON_CREATE_LIMIT);
  if (!limited.allowed) {
    return c.json(
      { error: 'rate_limited', message: `Try again in ${limited.retryAfter} seconds.` },
      429,
      rateLimitHeaders(ANON_CREATE_LIMIT, limited),
    );
  }

  let body: { claim_token?: unknown; style?: unknown };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'invalid_body', message: 'Expected a JSON body.' }, 400);
  }

  const token = typeof body.claim_token === 'string' ? body.claim_token.trim() : '';
  if (!UUID_RE.test(token)) {
    return c.json({ error: 'invalid_token', message: 'That is not a valid claim token.' }, 400);
  }
  if (!body.style || typeof body.style !== 'object' || Array.isArray(body.style)) {
    return c.json({ error: 'invalid_style', message: 'Expected a style object.' }, 400);
  }

  // Matching on user_id too, not just the token: a claimed link has its token
  // nulled, so this can only ever address a code that is still unowned.
  const link = await selectOne<Link>(
    c.env,
    `links?claim_token=eq.${encodeURIComponent(token)}&user_id=is.null&select=id,domain_id`,
  );
  if (!link) {
    return c.json(
      { error: 'not_found', message: 'That code has already been claimed, or it expired.' },
      404,
    );
  }

  const existing = await selectOne<QrCode>(
    c.env,
    `qr_codes?link_id=eq.${encodeURIComponent(link.id)}&select=id&limit=1`,
  );

  if (existing) {
    await update<QrCode>(c.env, 'qr_codes', `id=eq.${encodeURIComponent(existing.id)}`, {
      style: body.style,
    });
  } else {
    // locked_domain_id is set once, here, and is immutable by trigger from now
    // on. This is the moment the printed hostname becomes permanent.
    await insert<QrCode>(c.env, 'qr_codes', {
      user_id: null,
      link_id: link.id,
      locked_domain_id: link.domain_id,
      style: body.style,
    });
  }

  return c.body(null, 204);
});
