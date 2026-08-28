/**
 * Canonical shared type source for qrify.
 * The frontend imports from this file by relative path (see architecture.md §13).
 * Keep it dependency-free so it can be imported from a browser bundle.
 */

// ---------------------------------------------------------------------------
// Worker environment
// ---------------------------------------------------------------------------

export interface Env {
  // bindings
  LINKS_KV: KVNamespace;

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

// ---------------------------------------------------------------------------
// Enumerations — mirrored by CHECK constraints in the migrations
// ---------------------------------------------------------------------------

export const VERIFICATION_STATUSES = ['pending', 'verifying', 'active', 'failed'] as const;
export type VerificationStatus = (typeof VERIFICATION_STATUSES)[number];

export const SAFE_BROWSING_STATUSES = ['unchecked', 'clean', 'flagged'] as const;
export type SafeBrowsingStatus = (typeof SAFE_BROWSING_STATUSES)[number];

export const NETWORK_TYPES = ['mobile', 'broadband', 'corporate', 'datacenter', 'unknown'] as const;
export type NetworkType = (typeof NETWORK_TYPES)[number];

export const DEVICE_TYPES = ['mobile', 'tablet', 'desktop', 'bot', 'unknown'] as const;
export type DeviceType = (typeof DEVICE_TYPES)[number];

/** Reserved for a possible future non-redirect event. One value today. See context.md §8. */
export const EVENT_TYPES = ['redirect'] as const;
export type EventType = (typeof EVENT_TYPES)[number];

// ---------------------------------------------------------------------------
// Database rows
// ---------------------------------------------------------------------------

export interface Profile {
  id: string;
  email: string;
  display_name: string | null;
  retention_days: number;
  created_at: string;
}

export interface Domain {
  id: string;
  user_id: string | null;
  hostname: string;
  is_custom: boolean;
  is_active: boolean;
  verification_status: VerificationStatus;
  cf_custom_hostname_id: string | null;
  cname_target: string | null;
  ssl_status: string | null;
  dns_verified_at: string | null;
  created_at: string;
}

export interface Link {
  id: string;
  user_id: string;
  domain_id: string;
  slug: string;
  destination_url: string;
  title: string | null;
  is_active: boolean;
  expires_at: string | null;
  safe_browsing_status: SafeBrowsingStatus;
  safe_browsing_checked_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface QrStyle {
  fgColor: string;
  bgColor: string;
  moduleShape: 'square' | 'dots' | 'rounded';
  eyeShape: 'square' | 'circle' | 'rounded';
  errorCorrection: 'L' | 'M' | 'Q' | 'H';
  logoDataUrl: string | null;
  logoSizeRatio: number;
  margin: number;
}

export interface QrCode {
  id: string;
  user_id: string;
  link_id: string;
  locked_domain_id: string;
  label: string | null;
  style: QrStyle;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Cache
// ---------------------------------------------------------------------------

/**
 * The value stored at `link:{hostname}:{slug}`.
 * Domain validity is denormalised in so a valid redirect never needs a second lookup.
 * `null` in KV is the negative-cache sentinel for an unknown slug.
 */
export interface CachedLink {
  id: string;
  user_id: string;
  domain_id: string;
  qr_id: string | null;
  destination_url: string;
  is_active: boolean;
  expires_at: string | null;
  safe_browsing_status: SafeBrowsingStatus;
  domain_active: boolean;
}

// ---------------------------------------------------------------------------
// API contracts
// ---------------------------------------------------------------------------

export interface CreateLinkBody {
  destination_url: string;
  slug?: string;
  title?: string;
  domain_id?: string;
  expires_at?: string | null;
  is_active?: boolean;
}

export interface UpdateLinkBody {
  destination_url?: string;
  title?: string | null;
  expires_at?: string | null;
  is_active?: boolean;
}

export interface ApiError {
  error: string;
  message: string;
  details?: unknown;
}
