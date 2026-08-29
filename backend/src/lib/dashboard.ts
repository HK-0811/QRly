/**
 * The dashboard and the redirect engine share one hostname.
 *
 * `qrly.lol/aB3xK9p` is a scan. `qrly.lol/links` is the dashboard. One Worker has to
 * own the hostname, and it has to be this one: slugs are arbitrary and unbounded, so
 * the catch-all belongs to the redirect engine and everything else must be
 * enumerated. That enumeration is this file.
 *
 * Matched requests are forwarded to the dashboard Worker over a service binding —
 * same thread, same Cloudflare server, no network hop, no second request charge. The
 * redirect hot path pays one Set lookup on a string it has already parsed.
 *
 * Three rules that are not obvious from the code:
 *
 *  - **Only on the platform hostname.** A customer's custom domain serves their
 *    redirects and nothing else. Serving our signup page on qr.theirbrand.com would
 *    be our product wearing their brand.
 *
 *  - **Every segment here must also be in RESERVED_SLUGS.** Otherwise someone claims
 *    the slug "links", and the link they printed resolves to our dashboard forever.
 *    `tools/check-dashboard-paths.mjs` reads the Next.js route files and fails if
 *    this list, the frontend, and RESERVED_SLUGS drift apart.
 *
 *  - **The Worker's own API paths are ours, not the dashboard's.** Checked first and
 *    explicitly, because "api" is a plausible thing for a future Next.js route to
 *    want, and losing that prefix would take the whole API offline.
 */

/**
 * First path segment → the dashboard. '' is the landing page at `/`.
 *
 * Pages come from frontend/src/app. `_next` is the Next.js build output and `geo` is
 * the Natural Earth topology in frontend/public — neither is a page, but both are
 * requested by the browser against this same hostname, so both belong here.
 */
export const DASHBOARD_SEGMENTS = new Set([
  '', // the landing page
  'login',
  'signup',
  'forgot-password',
  'reset-password',
  'auth', // /auth/callback — the Supabase session handoff
  'links',
  'analytics',
  'domains',
  'settings',
  'cost',
  'privacy',
  '_next', // Next.js build output
  'geo', // frontend/public/geo — map topology
]);

/**
 * Does this path belong to the dashboard rather than to a short code?
 *
 * Matches on the first segment only. A slug can never contain a `/` — the pattern in
 * lib/slug.ts forbids it — so a request with a deeper path is either the dashboard's
 * or nobody's, and one segment is enough to tell.
 */
export function isDashboardPath(pathname: string): boolean {
  // The Worker's own API. Checked before anything else so a Next.js route named
  // "api" could never take it away.
  if (pathname === '/api' || pathname.startsWith('/api/')) return false;

  return DASHBOARD_SEGMENTS.has(pathname.split('/')[1] ?? '');
}
