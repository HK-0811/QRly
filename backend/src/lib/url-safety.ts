/**
 * Destination URL validation (architecture.md §11).
 *
 * A short-link service is an open redirect by definition. The only thing separating
 * "useful product" from "phishing infrastructure someone else operates for free" is
 * what this file refuses.
 *
 * Two distinct threats, deliberately handled separately:
 *
 *   1. Redirecting the *scanner's browser* somewhere dangerous — `javascript:`,
 *      `data:`, `vbscript:`. Blocked by the scheme allow-list.
 *   2. Using our Worker as an SSRF probe. Less severe here than in a typical
 *      fetching proxy, because we emit a 302 rather than fetching the destination
 *      ourselves — the scanner's own browser makes the request, from its own
 *      network. But a link to `http://192.168.1.1/admin?reboot=1` printed on a
 *      poster is still a real attack against whoever scans it on that LAN.
 *
 * Safe Browsing is a separate, network-dependent layer and lives in phase 9.
 */

export const ALLOWED_SCHEMES = ['http:', 'https:', 'mailto:', 'tel:', 'sms:'] as const;

/** Schemes that carry a host we must inspect. The rest have no network target. */
const NETWORK_SCHEMES = new Set(['http:', 'https:']);

export const MAX_URL_LENGTH = 2048;

export interface UrlValidationResult {
  ok: boolean;
  /** Normalised URL, safe to store. Only present when ok. */
  url?: string;
  /** Machine-readable reason, for tests and structured errors. */
  reason?: string;
  /** Message written for the person pasting the URL, not for a log. */
  message?: string;
}

function fail(reason: string, message: string): UrlValidationResult {
  return { ok: false, reason, message };
}

// ---------------------------------------------------------------------------
// IP literal detection
// ---------------------------------------------------------------------------

/**
 * Hostnames that are never a legitimate public destination. Note this cannot
 * catch a public DNS name that resolves to a private address — doing that would
 * require resolving at create time and re-resolving at every scan, and the
 * attacker controls the TTL. The 302 model limits the damage: we never fetch the
 * destination ourselves.
 */
const BLOCKED_HOSTNAMES = new Set([
  'localhost',
  'localhost.localdomain',
  'ip6-localhost',
  'ip6-loopback',
  // AWS/GCP/Azure instance metadata, reachable from a browser on a compromised host
  'metadata.google.internal',
  'metadata',
  'instance-data',
]);

const BLOCKED_TLDS = ['.local', '.internal', '.localdomain', '.home.arpa', '.onion'];

function parseIPv4(host: string): number[] | null {
  const parts = host.split('.');
  if (parts.length !== 4) return null;
  const octets: number[] = [];
  for (const part of parts) {
    if (!/^\d{1,3}$/.test(part)) return null;
    const n = Number(part);
    if (n > 255) return null;
    octets.push(n);
  }
  return octets;
}

function isPrivateIPv4(octets: number[]): boolean {
  const [a = 0, b = 0] = octets;
  if (a === 0) return true; // 0.0.0.0/8 "this network"
  if (a === 10) return true; // private
  if (a === 127) return true; // loopback
  if (a === 169 && b === 254) return true; // link-local, includes 169.254.169.254 metadata
  if (a === 172 && b >= 16 && b <= 31) return true; // private
  if (a === 192 && b === 168) return true; // private
  if (a === 192 && b === 0) return true; // 192.0.0.0/24 IETF protocol assignments
  if (a === 100 && b >= 64 && b <= 127) return true; // carrier-grade NAT
  if (a === 198 && (b === 18 || b === 19)) return true; // benchmarking
  if (a >= 224) return true; // multicast and reserved, includes 255.255.255.255
  return false;
}

function isPrivateIPv6(host: string): boolean {
  const h = host.toLowerCase().replace(/^\[|\]$/g, '');
  if (h === '::1' || h === '::') return true;
  if (h.startsWith('fe80')) return true; // link-local
  if (/^f[cd]/.test(h)) return true; // unique local fc00::/7
  if (h.startsWith('::ffff:')) {
    // IPv4-mapped. Re-check the embedded address rather than waving it through.
    const v4 = parseIPv4(h.slice(7));
    return v4 ? isPrivateIPv4(v4) : true;
  }
  return false;
}

/**
 * Decimal, octal and hex forms of an IPv4 address all resolve normally in a
 * browser: http://2130706433/ is 127.0.0.1. Blocking only dotted-quad would leave
 * the obvious bypass open.
 */
function normaliseNumericHost(host: string): number[] | null {
  if (/^0x[0-9a-f]+$/i.test(host) || /^\d+$/.test(host) || /^0[0-7]+$/.test(host)) {
    let value: number;
    if (/^0x/i.test(host)) value = parseInt(host.slice(2), 16);
    else if (/^0[0-7]+$/.test(host)) value = parseInt(host.slice(1), 8);
    else value = Number(host);

    if (!Number.isFinite(value) || value < 0 || value > 0xffffffff) return null;
    return [(value >>> 24) & 255, (value >>> 16) & 255, (value >>> 8) & 255, value & 255];
  }
  return null;
}

// ---------------------------------------------------------------------------

export function validateDestination(raw: unknown): UrlValidationResult {
  if (typeof raw !== 'string') {
    return fail('not_a_string', 'A destination URL is required.');
  }

  const trimmed = raw.trim();
  if (trimmed.length === 0) {
    return fail('empty', 'A destination URL is required.');
  }
  if (trimmed.length > MAX_URL_LENGTH) {
    return fail('too_long', `Destination URLs are limited to ${MAX_URL_LENGTH} characters.`);
  }
  // A raw control character in a URL is either an encoding bug or a header-
  // splitting attempt against the Location response header.
  if (/[\u0000-\u001f\u007f]/.test(trimmed)) {
    return fail('control_characters', 'That URL contains characters that are not allowed.');
  }

  // Accept a bare "example.com" the way every link tool does, rather than making
  // someone type the scheme. Anything that already declares a scheme is left alone
  // so we never silently upgrade an intentional mailto: or tel:.
  const candidate = /^[a-z][a-z0-9+.-]*:/i.test(trimmed) ? trimmed : `https://${trimmed}`;

  let url: URL;
  try {
    url = new URL(candidate);
  } catch {
    return fail('unparseable', "That doesn't look like a valid URL.");
  }

  if (!(ALLOWED_SCHEMES as readonly string[]).includes(url.protocol)) {
    return fail(
      'scheme_not_allowed',
      `${url.protocol.replace(':', '')} links are not allowed. Use http, https, mailto, tel or sms.`,
    );
  }

  if (!NETWORK_SCHEMES.has(url.protocol)) {
    // mailto:, tel:, sms: — no host to inspect. Normalising these through URL()
    // can mangle them, so return the original text.
    return { ok: true, url: trimmed };
  }

  // Embedded credentials in a short link are a phishing pattern
  // (https://paypal.com@attacker.example) and have no legitimate use here.
  if (url.username || url.password) {
    return fail('embedded_credentials', 'URLs containing a username or password are not allowed.');
  }

  const host = url.hostname.toLowerCase();
  if (!host) {
    return fail('no_host', 'That URL is missing a hostname.');
  }

  if (BLOCKED_HOSTNAMES.has(host)) {
    return fail('private_host', 'That address is on a private network and cannot be a destination.');
  }
  if (BLOCKED_TLDS.some((tld) => host.endsWith(tld))) {
    return fail('private_host', 'That address is on a private network and cannot be a destination.');
  }

  const v4 = parseIPv4(host) ?? normaliseNumericHost(host);
  if (v4 && isPrivateIPv4(v4)) {
    return fail('private_ip', 'That address is on a private network and cannot be a destination.');
  }
  if (host.includes(':') && isPrivateIPv6(host)) {
    return fail('private_ip', 'That address is on a private network and cannot be a destination.');
  }

  // A public hostname with no dot is either an intranet name or a typo.
  if (!v4 && !host.includes(':') && !host.includes('.')) {
    return fail('not_public', 'Enter a full domain name, for example example.com.');
  }

  const normalised = url.toString();
  if (normalised.length > MAX_URL_LENGTH) {
    return fail('too_long', `Destination URLs are limited to ${MAX_URL_LENGTH} characters.`);
  }

  return { ok: true, url: normalised };
}
