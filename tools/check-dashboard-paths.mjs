#!/usr/bin/env node
/**
 * The dashboard and the redirect engine share one hostname, so three lists have to
 * agree and nothing in the build makes them:
 *
 *   1. the pages that actually exist in frontend/src/app
 *   2. DASHBOARD_SEGMENTS in backend/src/lib/dashboard.ts — what gets forwarded
 *   3. RESERVED_SLUGS in backend/src/lib/slug.ts — what nobody can claim
 *
 * Add a page to the dashboard and forget list 2, and qrly.lol/pricing stops being
 * your pricing page: it becomes a lookup for the short code "pricing", which 404s.
 * Forget list 3 and it is worse — somebody claims "pricing", prints it on a poster,
 * and their code resolves to your marketing page for as long as that poster exists.
 *
 * This reads the real route files rather than a list someone maintained by hand,
 * which is the only version of this check that cannot rot.
 *
 *   node tools/check-dashboard-paths.mjs
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const APP_DIR = 'frontend/src/app';
const PUBLIC_DIR = 'frontend/public';

let failures = 0;
const ok = (name) => console.log(`  PASS  ${name}`);
const bad = (name, detail) => {
  failures++;
  console.log(`  FAIL  ${name}${detail ? ` — ${detail}` : ''}`);
};

/**
 * Pull the quoted entries out of a `new Set([...])` literal in a TypeScript file.
 *
 * Comments are stripped before the quotes are matched. Both sets this reads are
 * heavily commented, and an apostrophe in prose — "the scanner's 404 page" —
 * otherwise opens a string that runs to the next one, turning a paragraph into a
 * segment named after half of itself. It reported that as a stale entry, which is
 * a long way from the cause.
 */
function setLiteral(file, name) {
  const src = readFileSync(file, 'utf8');
  const start = src.indexOf(name);
  if (start === -1) throw new Error(`${name} not found in ${file}`);
  const open = src.indexOf('[', start);
  const close = src.indexOf(']', open);
  const body = src
    .slice(open, close)
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '');
  return new Set([...body.matchAll(/'([^']*)'/g)].map((m) => m[1]));
}

/**
 * Walk frontend/src/app and return the first URL segment of every routable page.
 *
 * Next.js App Router conventions that matter here: `(group)` directories are
 * organisational and contribute nothing to the URL, and `[param]` is dynamic — never
 * a first segment in this app, but stripped anyway so the check does not lie if one
 * ever appears.
 */
function frontendSegments(dir, prefix = []) {
  const found = new Set();
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      const routeGroup = entry.startsWith('(') && entry.endsWith(')');
      for (const s of frontendSegments(full, routeGroup ? prefix : [...prefix, entry])) {
        found.add(s);
      }
    } else if (entry === 'page.tsx' || entry === 'route.ts') {
      // prefix[0] is the first URL segment; no prefix means this is the root page.
      found.add(prefix[0] ?? '');
    }
  }
  return found;
}

/**
 * Root-level files Next serves out of app/ rather than public/.
 *
 * This check read only public/, which is why a correct favicon shipped invisible:
 * Next emits app/icon.svg and app/favicon.ico as / paths, the browser asks the
 * redirect engine for them, and nothing here knew they existed. They are neither
 * pages nor public assets, so they fell in the gap between the two lists this
 * file was written to reconcile.
 */
function appRootAssets(dir) {
  const METADATA =
    /^(favicon\.ico|icon\.(svg|png|ico)|apple-icon\.(png|jpg|jpeg)|opengraph-image\.\w+|twitter-image\.\w+|manifest\.(json|webmanifest)|robots\.txt|sitemap\.xml)$/;
  return new Set(readdirSync(dir).filter((e) => METADATA.test(e)));
}

console.log('reading the real route files\n');

const declared = setLiteral('backend/src/lib/dashboard.ts', 'DASHBOARD_SEGMENTS');
const reserved = setLiteral('backend/src/lib/slug.ts', 'RESERVED_SLUGS');
const pages = frontendSegments(APP_DIR);
const assets = new Set(readdirSync(PUBLIC_DIR));
const rootAssets = appRootAssets(APP_DIR);

console.log(`  frontend pages     ${[...pages].map((p) => p || '/').join(', ')}`);
console.log(`  public assets      ${[...assets].join(', ') || '(none)'}`);
console.log(`  app root files     ${[...rootAssets].join(', ') || '(none)'}`);
console.log(`  declared segments  ${declared.size}\n`);

console.log('every dashboard page is forwarded');
for (const seg of [...pages].sort()) {
  const label = seg || '/ (the landing page)';
  if (declared.has(seg)) ok(label);
  else bad(label, `add '${seg}' to DASHBOARD_SEGMENTS or qrly.lol/${seg} 404s as a short code`);
}

console.log('\nevery public asset directory is forwarded');
for (const asset of [...assets].sort()) {
  if (declared.has(asset)) ok(asset);
  else bad(asset, `add '${asset}' to DASHBOARD_SEGMENTS or the browser cannot fetch it`);
}

console.log('\nevery root-level file Next serves from app/ is forwarded');
for (const asset of [...rootAssets].sort()) {
  if (declared.has(asset)) ok(asset);
  else bad(asset, `add '${asset}' to DASHBOARD_SEGMENTS or the browser gets a short-code lookup`);
}

console.log('\nevery forwarded segment is also a reserved slug');
for (const seg of [...declared].sort()) {
  if (seg === '') continue; // the root is not a slug anybody could claim
  if (reserved.has(seg)) ok(seg);
  else bad(seg, `add '${seg}' to RESERVED_SLUGS or a printed code can be shadowed by it`);
}

console.log('\nnothing forwarded that does not exist');
const known = new Set([...pages, ...assets, ...rootAssets, '_next', '']);
for (const seg of [...declared].sort()) {
  if (known.has(seg)) ok(seg);
  else bad(seg, 'declared but no such page, asset or build output — stale entry');
}

console.log(failures === 0 ? '\nall checks passed' : `\n${failures} check(s) failed`);
process.exit(failures === 0 ? 0 : 1);
