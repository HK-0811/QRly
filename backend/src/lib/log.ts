/**
 * Structured logging.
 *
 * Cloudflare's log view is a stream of console output with no query language on
 * the free plan, so the only thing that makes it searchable is emitting one JSON
 * object per line with stable field names. `console.log("failed", err)` is
 * unfindable three days later.
 *
 * Nothing here may ever receive an IP address, a raw user agent, a JWT, or a
 * destination URL belonging to someone else. Logs outlive the request and are the
 * easiest place to accidentally undo every promise on the privacy page.
 */

export type Level = 'debug' | 'info' | 'warn' | 'error';

export interface LogFields {
  /** What happened, in stable snake_case so it can be grepped. */
  event: string;
  [key: string]: unknown;
}

/** Field names that must never carry a value, whatever a caller passes. */
const FORBIDDEN = new Set([
  'ip',
  'client_ip',
  'cf_connecting_ip',
  'user_agent',
  'ua',
  'ua_raw',
  'token',
  'jwt',
  'authorization',
  'password',
  'salt',
  'pepper',
  'service_key',
  'api_key',
]);

function scrub(fields: LogFields): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(fields)) {
    if (FORBIDDEN.has(k.toLowerCase())) {
      out[k] = '[redacted]';
      continue;
    }
    out[k] = v instanceof Error ? { name: v.name, message: v.message } : v;
  }
  return out;
}

function emit(level: Level, fields: LogFields) {
  const line = JSON.stringify({ level, ts: new Date().toISOString(), ...scrub(fields) });
  if (level === 'error') console.error(line);
  else if (level === 'warn') console.warn(line);
  else console.log(line);
}

export const log = {
  debug: (fields: LogFields) => emit('debug', fields),
  info: (fields: LogFields) => emit('info', fields),
  warn: (fields: LogFields) => emit('warn', fields),
  error: (fields: LogFields) => emit('error', fields),
};

/**
 * A short, opaque id attached to a failed response and to the log line that
 * explains it. It lets someone report "I got error a3f9c2" and have that be
 * findable, without the page having to show a stack trace.
 */
export function errorId(): string {
  const bytes = new Uint8Array(4);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}
