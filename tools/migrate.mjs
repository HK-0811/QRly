#!/usr/bin/env node
/**
 * Forward-only migration runner.
 *
 * Each file in supabase/migrations/ is applied once, inside a transaction, and
 * recorded in schema_migrations with a checksum. Editing an already-applied file
 * is refused — that is the failure mode that silently desynchronises environments.
 *
 *   node tools/migrate.mjs            apply pending migrations
 *   node tools/migrate.mjs --status   show what is applied and what is pending
 *   node tools/migrate.mjs --dry-run  list what would run, change nothing
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { connect, ROOT } from './db.mjs';

const DIR = path.join(ROOT, 'supabase', 'migrations');
const args = new Set(process.argv.slice(2));
const statusOnly = args.has('--status');
const dryRun = args.has('--dry-run');

const files = fs
  .readdirSync(DIR)
  .filter((f) => f.endsWith('.sql'))
  .sort();

const sha = (s) => crypto.createHash('sha256').update(s).digest('hex').slice(0, 16);

const sql = connect();
let failed = false;

try {
  await sql`
    create table if not exists schema_migrations (
      version     text primary key,
      checksum    text not null,
      applied_at  timestamptz not null default now()
    )
  `;

  const applied = new Map(
    (await sql`select version, checksum from schema_migrations`).map((r) => [r.version, r.checksum]),
  );

  const pending = [];
  for (const file of files) {
    const body = fs.readFileSync(path.join(DIR, file), 'utf8');
    const checksum = sha(body);
    const previous = applied.get(file);

    if (previous === undefined) {
      pending.push({ file, body, checksum });
    } else if (previous !== checksum) {
      console.error(`DRIFT  ${file} — applied checksum ${previous}, file is now ${checksum}`);
      console.error('       An applied migration was edited. Write a new migration instead.');
      failed = true;
    } else {
      if (statusOnly) console.log(`applied  ${file}`);
    }
  }

  if (failed) process.exit(1);

  if (statusOnly || dryRun) {
    if (pending.length === 0) console.log('nothing pending — schema is up to date');
    for (const p of pending) console.log(`pending  ${p.file}`);
    process.exit(0);
  }

  if (pending.length === 0) {
    console.log('nothing pending — schema is up to date');
  }

  for (const { file, body, checksum } of pending) {
    const started = Date.now();
    process.stdout.write(`applying ${file} ... `);
    await sql.begin(async (tx) => {
      await tx.unsafe(body);
      await tx`insert into schema_migrations (version, checksum) values (${file}, ${checksum})`;
    });
    console.log(`ok (${Date.now() - started}ms)`);
  }
} catch (err) {
  console.log('');
  console.error('MIGRATION FAILED:', err.message);
  if (err.position) console.error('  at character position', err.position);
  if (err.detail) console.error('  detail:', err.detail);
  if (err.hint) console.error('  hint:', err.hint);
  process.exitCode = 1;
} finally {
  await sql.end({ timeout: 5 }).catch(() => {});
}
