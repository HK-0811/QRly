import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { Env } from './env';
import { health } from './routes/health';
import { links } from './routes/links';
import { domains } from './routes/domains';
import { redirect } from './routes/redirect';
import { handleScheduled } from './lib/cron';
import { isDashboardPath } from './lib/dashboard';
import { errorPage } from './lib/pages';
import { errorId, log } from './lib/log';

const app = new Hono<{ Bindings: Env }>();

app.use('/api/*', (c, next) =>
  cors({
    // Comma-separated, because the dashboard answers on two origins during a
    // hostname move: its workers.dev name and its custom domain. Exact matches
    // only — no wildcards and no reflecting the Origin header back. This list is
    // what stands between a hostile page and an authenticated write.
    origin: c.env.DASHBOARD_ORIGIN.split(',')
      .map((o) => o.trim())
      .filter(Boolean),
    allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400,
  })(c, next),
);

app.route('/api', health);
app.route('/api', links);
app.route('/api', domains);

// The dashboard shares this hostname with the redirect engine. This has to sit
// after /api (which is ours) and before the redirect catch-all (which would
// otherwise swallow /login as a short code). It is the only position that works.
//
// Forwarding only on the platform hostname is not a detail: a customer's custom
// domain must serve their redirects and nothing of ours.
app.use('*', async (c, next) => {
  if (!c.env.DASHBOARD) return next();
  const url = new URL(c.req.url);
  if (url.host.toLowerCase() !== c.env.PLATFORM_HOSTNAME.toLowerCase()) return next();
  if (!isDashboardPath(url.pathname)) return next();
  return c.env.DASHBOARD.fetch(c.req.raw);
});

// The redirect engine is registered LAST. Its catch-all /:slug would otherwise
// swallow every route declared after it.
app.route('/', redirect);

app.notFound((c) =>
  // /api/* callers get JSON; anything else is a person who scanned something, and
  // a JSON body would be gibberish to them.
  c.req.path.startsWith('/api/')
    ? c.json({ error: 'not_found', message: 'No such route' }, 404)
    : errorPage('not-found'),
);

app.onError((err, c) => {
  const id = errorId();
  log.error({
    event: 'unhandled_error',
    error_id: id,
    path: c.req.path,
    method: c.req.method,
    error: err instanceof Error ? err : String(err),
  });

  if (c.req.path.startsWith('/api/')) {
    return c.json(
      {
        error: 'internal_error',
        message: 'Something went wrong. Try again.',
        error_id: id,
      },
      500,
    );
  }

  // A scan that fails must never render a stack trace to whoever is holding the
  // phone in front of the poster.
  return errorPage(id);
});

export default {
  fetch: app.fetch,
  scheduled: (event, env, ctx) => ctx.waitUntil(handleScheduled(event, env)),
} satisfies ExportedHandler<Env>;
