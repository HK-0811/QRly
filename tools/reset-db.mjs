#!/usr/bin/env node
/**
 * Destructive. Drops every object the migrations create, then leaves the database
 * empty so `npm run migrate` can prove it applies cleanly from scratch.
 *
 * Scoped to our own objects rather than `drop schema public cascade`, because
 * dropping the schema on Supabase also destroys the schema-level grants and the
 * ALTER DEFAULT PRIVILEGES entries that make anon/authenticated able to reach
 * tables at all. Recreating those by hand is a good way to end up with a database
 * that looks fine and silently fails RLS.
 *
 *   node tools/reset-db.mjs --yes
 */
import { connect } from './db.mjs';

if (!process.argv.includes('--yes')) {
  console.error('This DROPS ALL QRly TABLES AND DATA. Re-run with --yes to confirm.');
  process.exit(1);
}

const TABLES = [
  'scan_events',
  'qr_codes',
  'links',
  'domains',
  'profiles',
  'daily_salts',
  'cron_runs',
  'schema_migrations',
];

const FUNCTIONS = [
  'set_updated_at()',
  'handle_new_user()',
  'handle_user_email_change()',
  'guard_locked_domain()',
  'guard_link_identity()',
  'guard_link_domain_access()',
  'guard_qr_ownership()',
  'ensure_daily_salt(date)',
  'purge_expired_scan_events()',
];

const sql = connect();
try {
  await sql.unsafe('drop trigger if exists on_auth_user_created on auth.users');
  await sql.unsafe('drop trigger if exists on_auth_user_email_changed on auth.users');
  console.log('dropped auth.users triggers');

  for (const t of TABLES) {
    await sql.unsafe(`drop table if exists public.${t} cascade`);
  }
  console.log(`dropped ${TABLES.length} tables`);

  for (const f of FUNCTIONS) {
    await sql.unsafe(`drop function if exists public.${f} cascade`);
  }
  console.log(`dropped ${FUNCTIONS.length} functions`);

  const left = await sql`
    select table_name from information_schema.tables
    where table_schema = 'public' order by 1
  `;
  console.log('remaining public tables:', left.map((r) => r.table_name).join(', ') || '(none)');
} catch (err) {
  console.error('RESET FAILED:', err.message);
  process.exitCode = 1;
} finally {
  await sql.end({ timeout: 5 }).catch(() => {});
}
