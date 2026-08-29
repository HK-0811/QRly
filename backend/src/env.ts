/**
 * Worker bindings, vars and secrets.
 *
 * Separate from types.ts because this file references Cloudflare runtime types and
 * types.ts is imported by the browser bundle.
 */

export interface Env {
  // bindings
  LINKS_KV: KVNamespace;
  /**
   * The dashboard Worker. Optional because it is bound only in production: local
   * dev runs `next dev` on :3000 as its own server, and the test pool has no second
   * Worker to bind. Absent means "do not forward", which is the correct behaviour in
   * both of those places.
   */
  DASHBOARD?: Fetcher;

  // plain vars (wrangler.toml [vars])
  ENVIRONMENT: string;
  PLATFORM_HOSTNAME: string;
  DASHBOARD_ORIGIN: string;

  // secrets (.dev.vars locally / `wrangler secret put` in prod)
  SUPABASE_URL: string;
  SUPABASE_SERVICE_KEY: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_JWKS_URL: string;
  VISITOR_HASH_PEPPER: string;
  SAFE_BROWSING_API_KEY?: string;
  CLOUDFLARE_API_TOKEN?: string;
  CLOUDFLARE_ZONE_ID?: string;
}
