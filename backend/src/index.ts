import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { Env } from './env';
import { health } from './routes/health';
import { links } from './routes/links';
import { redirect } from './routes/redirect';
import { handleScheduled } from './lib/cron';
import { errorPage } from './lib/pages';
import { errorId, log } from './lib/log';

const app = new Hono<{ Bindings: Env }>();

app.use('/api/*', (c, next) =>
  cors({
    origin: c.env.DASHBOARD_ORIGIN,
    allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400,
  })(c, next),
);

app.route('/api', health);
app.route('/api', links);

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
