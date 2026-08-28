import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { Env } from './env';
import { health } from './routes/health';
import { links } from './routes/links';
import { redirect } from './routes/redirect';
import { handleScheduled } from './lib/cron';

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

app.notFound((c) => c.json({ error: 'not_found', message: 'No such route' }, 404));

app.onError((err, c) => {
  console.error('unhandled', err);
  return c.json({ error: 'internal_error', message: 'Something went wrong' }, 500);
});

export default {
  fetch: app.fetch,
  scheduled: (event, env, ctx) => ctx.waitUntil(handleScheduled(event, env)),
} satisfies ExportedHandler<Env>;
