import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import postgres from 'postgres';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** Minimal .env reader — avoids a dotenv dependency and never logs values. */
export function loadEnv(file = path.join(ROOT, '.env')) {
  const out = {};
  if (!fs.existsSync(file)) return out;
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    out[trimmed.slice(0, eq)] = trimmed.slice(eq + 1);
  }
  return out;
}

export const env = { ...loadEnv(), ...process.env };

export function connect(options = {}) {
  if (!env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set. See supabase.md (session pooler string).');
  }
  return postgres(env.DATABASE_URL, {
    // Supabase's pooler presents a cert chain Node does not ship a root for.
    // The connection is still TLS-encrypted; only chain verification is relaxed.
    ssl: { rejectUnauthorized: false },
    connect_timeout: 30,
    idle_timeout: 5,
    max: 1,
    // The session pooler does not support the extended protocol's prepared statements.
    prepare: false,
    onnotice: () => {},
    ...options,
  });
}
