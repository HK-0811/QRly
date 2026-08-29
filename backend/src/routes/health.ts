import { Hono } from 'hono';
import type { Env } from '../env';

export const health = new Hono<{ Bindings: Env }>();

/**
 * Cron keep-alive target and general liveness probe.
 * Deliberately does not touch Postgres — the Supabase keep-alive is a separate
 * scheduled job (see lib/cron.ts) so that a Supabase outage does not make this
 * endpoint report the Worker as unhealthy.
 */
health.get('/health', (c) =>
  c.json({
    ok: true,
    service: 'qrly',
    environment: c.env.ENVIRONMENT,
    time: new Date().toISOString(),
  }),
);
