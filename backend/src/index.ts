import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { Env } from './types';
import { health } from './routes/health';

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

// The catch-all redirect route is registered LAST, in phase 3.
// Everything registered after this point would be unreachable.
app.notFound((c) => c.json({ error: 'not_found', message: 'No such route' }, 404));

app.onError((err, c) => {
  console.error('unhandled', err);
  return c.json({ error: 'internal_error', message: 'Something went wrong' }, 500);
});

export default {
  fetch: app.fetch,
} satisfies ExportedHandler<Env>;
