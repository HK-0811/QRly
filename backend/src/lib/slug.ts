/**
 * Slug generation and validation.
 *
 * A slug is permanent. Once a QR code carrying it is printed, the slug cannot
 * change without breaking every physical copy — the database enforces that with an
 * immutability trigger. So the choices here are load-bearing in a way they would
 * not be for an ordinary URL path.
 */

/**
 * Base58-ish: no 0/O, no 1/l/I. Someone reads a short code off a poster and types
 * it into a phone. Ambiguous glyphs turn that into a support problem, and there is
 * no upside to including them.
 */
const ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

export const DEFAULT_SLUG_LENGTH = 7;
export const MIN_SLUG_LENGTH = 3;
export const MAX_SLUG_LENGTH = 64;

/**
 * Reserved because the redirect engine and the dashboard share a hostname family,
 * and because some of these would be actively misleading printed on a poster.
 */
export const RESERVED_SLUGS = new Set([
  // reachable Worker paths
  'api', 'health', '__scheduled', 'favicon.ico', 'robots.txt', 'sitemap.xml',
  '.well-known', 'cdn-cgi',
  // dashboard surface, in case the hostnames are ever merged
  'app', 'dashboard', 'login', 'logout', 'signup', 'signin', 'register',
  'account', 'settings', 'profile', 'billing', 'admin', 'auth', 'reset',
  'verify', 'confirm', 'links', 'link', 'qr', 'qrcode', 'domains', 'domain',
  'analytics', 'stats', 'reports',
  // marketing and legal surface
  'about', 'pricing', 'privacy', 'terms', 'legal', 'contact', 'support',
  'help', 'docs', 'blog', 'status', 'security', 'cost', 'compare',
  // things that would read as official on a printed code
  'www', 'mail', 'ftp', 'ns', 'ns1', 'ns2', 'mx', 'smtp', 'test', 'staging',
  'dev', 'demo', 'null', 'undefined', 'true', 'false',
]);

const SLUG_PATTERN = /^[A-Za-z0-9_-]+$/;

export interface SlugValidation {
  ok: boolean;
  slug?: string;
  reason?: string;
  message?: string;
}

/**
 * Cryptographic randomness, not Math.random. Predictable slugs would let anyone
 * enumerate every link on the platform, and the analytics attached to them.
 */
export function generateSlug(length = DEFAULT_SLUG_LENGTH): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);

  let out = '';
  for (let i = 0; i < length; i++) {
    // Modulo bias across a 58-char alphabet on a 256-value byte is about 1.6% on
    // the first 24 symbols. Irrelevant for collision resistance at this length and
    // not worth a rejection-sampling loop.
    out += ALPHABET[bytes[i]! % ALPHABET.length];
  }
  return out;
}

export function validateCustomSlug(raw: unknown): SlugValidation {
  if (typeof raw !== 'string') {
    return { ok: false, reason: 'not_a_string', message: 'That is not a valid short code.' };
  }

  const slug = raw.trim();

  if (slug.length < MIN_SLUG_LENGTH) {
    return {
      ok: false,
      reason: 'too_short',
      message: `Short codes need at least ${MIN_SLUG_LENGTH} characters.`,
    };
  }
  if (slug.length > MAX_SLUG_LENGTH) {
    return {
      ok: false,
      reason: 'too_long',
      message: `Short codes are limited to ${MAX_SLUG_LENGTH} characters.`,
    };
  }
  if (!SLUG_PATTERN.test(slug)) {
    return {
      ok: false,
      reason: 'invalid_characters',
      message: 'Short codes can use letters, numbers, hyphens and underscores only.',
    };
  }
  if (RESERVED_SLUGS.has(slug.toLowerCase())) {
    return { ok: false, reason: 'reserved', message: `"${slug}" is reserved. Pick another.` };
  }
  // A slug that is only punctuation resolves but looks broken in print.
  if (/^[-_]+$/.test(slug)) {
    return {
      ok: false,
      reason: 'invalid_characters',
      message: 'Short codes need at least one letter or number.',
    };
  }

  return { ok: true, slug };
}

/** Slugs are case-sensitive in storage and in lookup — the unique index is on the
 *  exact value. This exists only for reserved-word comparison. */
export function isReserved(slug: string): boolean {
  return RESERVED_SLUGS.has(slug.toLowerCase());
}
