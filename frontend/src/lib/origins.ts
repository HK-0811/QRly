/**
 * Where the redirect engine lives, decided once.
 *
 * `NEXT_PUBLIC_*` variables are inlined by Next at build time. What ships in the
 * bundle is whatever the environment held when `next build` ran, and nothing at
 * runtime can change it afterwards — which makes the fallback on these lines the
 * most consequential expression in the file.
 *
 * It used to be localhost, in five separate places. A production build with the
 * variable unset therefore shipped a dashboard that pointed every API call and
 * every printed short URL at 127.0.0.1. Silently: the build succeeds, the deploy
 * succeeds, and the app looks perfectly healthy to anyone testing it on a machine
 * that happens to be running a dev server. Everyone else gets a dead link.
 *
 * So the fallback is production. Local work overrides it through
 * frontend/.env.local — a file you have to be holding to be affected by — and a
 * missing CI variable now degrades to "correct" rather than to "localhost".
 *
 * `||` rather than `??` on purpose: an empty string is as broken as an unset
 * variable, and CI environments produce empty strings readily.
 */

const PRODUCTION_ORIGIN = 'https://qrly.lol';
const DEVELOPMENT_ORIGIN = 'http://localhost:8787';

const FALLBACK = process.env.NODE_ENV === 'production' ? PRODUCTION_ORIGIN : DEVELOPMENT_ORIGIN;

/** Base for the Worker's privileged API. Same origin as the dashboard in production. */
export const API_ORIGIN = process.env.NEXT_PUBLIC_API_URL || FALLBACK;

/** Origin that serves short codes. Used when a link has no domain row of its own. */
export const REDIRECT_ORIGIN = process.env.NEXT_PUBLIC_REDIRECT_ORIGIN || FALLBACK;

/** Hostname to show before the `domains` table has answered. */
export const PLATFORM_HOSTNAME = REDIRECT_ORIGIN.replace(/^https?:\/\//, '');

/**
 * A hostname is served over http only when it is a local one.
 *
 * Custom domains always get a certificate through Cloudflare for SaaS, so https
 * is right for everything that is not this machine.
 */
export function schemeFor(hostname: string): 'http' | 'https' {
  return hostname.startsWith('localhost') || hostname.startsWith('127.') ? 'http' : 'https';
}

/**
 * The printed URL uses the link's own hostname, not this deployment's.
 *
 * A link created on a custom domain keeps that domain in what it shows, because
 * that is what is on the poster.
 */
export function shortUrlFor(link: { slug: string; domains?: { hostname: string } | null }): string {
  const hostname = link.domains?.hostname;
  if (!hostname) return `${REDIRECT_ORIGIN}/${link.slug}`;
  return `${schemeFor(hostname)}://${hostname}/${link.slug}`;
}
