#!/usr/bin/env node
// Ad-hoc query runner:  node tools/query.mjs "select 1"
import { connect } from './db.mjs';

const statement = process.argv.slice(2).join(' ');
if (!statement) {
  console.error('usage: node tools/query.mjs "<sql>"');
  process.exit(1);
}

const sql = connect();
try {
  const rows = await sql.unsafe(statement);
  console.log(JSON.stringify(rows, null, 2));
} catch (err) {
  console.error('ERROR:', err.message);
  process.exitCode = 1;
} finally {
  await sql.end({ timeout: 5 }).catch(() => {});
}
