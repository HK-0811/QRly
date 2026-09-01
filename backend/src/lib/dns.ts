/**
 * DNS-over-HTTPS lookups (architecture.md §4.4).
 *
 * The Worker checks DNS itself rather than only asking Cloudflare whether the
 * custom hostname validated. That distinction is the whole point: Cloudflare's
 * API says "pending" for both "the customer has not added the record yet" and
 * "the record is there, the certificate is still issuing", and those need very
 * different messages to a confused person who has just followed instructions.
 *
 * Two resolvers are queried and their answers compared. Trusting a single
 * resolver for a record that was created minutes ago means reporting whatever one
 * cache happens to hold; disagreement is itself the useful signal, because it
 * means propagation is still in progress.
 */

export interface DnsAnswer {
  name: string;
  type: number;
  data: string;
  TTL?: number;
}

interface DohResponse {
  Status: number;
  Answer?: DnsAnswer[];
}

export const RR = { A: 1, CNAME: 5, AAAA: 28 } as const;

const RESOLVERS = [
  { name: 'cloudflare', url: 'https://cloudflare-dns.com/dns-query' },
  { name: 'google', url: 'https://dns.google/resolve' },
] as const;

async function query(
  resolver: (typeof RESOLVERS)[number],
  hostname: string,
  type: number,
): Promise<DohResponse | null> {
  const url = `${resolver.url}?name=${encodeURIComponent(hostname)}&type=${type}`;
  try {
    const res = await fetch(url, {
      headers: { Accept: 'application/dns-json' },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    return (await res.json()) as DohResponse;
  } catch {
    // A resolver being unreachable is not a verification failure — the caller
    // decides based on what the other resolver said.
    return null;
  }
}

/** Trailing dot and case are not meaningful in DNS; normalise both away. */
function normalise(name: string): string {
  return name.trim().toLowerCase().replace(/\.$/, '');
}

export interface CnameResult {
  /** What the record points at, if a CNAME exists. */
  target: string | null;
  /** True when both resolvers returned the same target. */
  agreed: boolean;
  /** Per-resolver answers, so a disagreement can be explained rather than hidden. */
  perResolver: Array<{ resolver: string; target: string | null; reachable: boolean }>;
  /** A record exists at this name but is an address, not a CNAME. */
  hasAddressRecord: boolean;
  /** No record of any kind at this name. */
  nxdomain: boolean;
}

export async function resolveCname(hostname: string): Promise<CnameResult> {
  const name = normalise(hostname);

  const results = await Promise.all(
    RESOLVERS.map(async (r) => {
      const res = await query(r, name, RR.CNAME);
      if (res === null) return { resolver: r.name, target: null, reachable: false, status: -1 };

      const cname = res.Answer?.find((a) => a.type === RR.CNAME);
      return {
        resolver: r.name,
        target: cname ? normalise(cname.data) : null,
        reachable: true,
        status: res.Status,
      };
    }),
  );

  const reachable = results.filter((r) => r.reachable);
  const targets = [...new Set(reachable.map((r) => r.target).filter((t): t is string => t !== null))];

  // Only meaningful when a CNAME is absent: a name that resolves to an address
  // instead is either an apex with flattening, or a proxied record.
  let hasAddressRecord = false;
  if (targets.length === 0 && reachable.length > 0) {
    const a = await query(RESOLVERS[0], name, RR.A);
    hasAddressRecord = Boolean(a?.Answer?.some((ans) => ans.type === RR.A));
  }

  return {
    target: targets[0] ?? null,
    agreed: targets.length <= 1 && reachable.length > 1 && reachable.every((r) => r.target === (targets[0] ?? null)),
    perResolver: results.map(({ resolver, target, reachable }) => ({ resolver, target, reachable })),
    hasAddressRecord,
    // NXDOMAIN is 3. Reported only when every reachable resolver agrees on it.
    nxdomain: reachable.length > 0 && reachable.every((r) => r.status === 3),
  };
}

// ---------------------------------------------------------------------------
// Hostname shape
// ---------------------------------------------------------------------------

/**
 * Two-label public suffixes, so `example.co.uk` is recognised as an apex rather
 * than a subdomain of `co.uk`.
 *
 * This is a shortlist, not the Public Suffix List. Shipping the full PSL would be
 * ~230 KB in a Worker that needs this for one warning message. The consequence of
 * missing an entry is that an apex on an unusual suffix is not warned about in
 * advance — the DNS check still fails afterwards with a clear reason, so the
 * failure mode is a worse message, not a wrong answer.
 */
const TWO_LABEL_SUFFIXES = new Set([
  'co.uk', 'org.uk', 'me.uk', 'ac.uk', 'gov.uk', 'net.uk', 'sch.uk',
  'co.in', 'net.in', 'org.in', 'firm.in', 'gen.in', 'ind.in', 'ac.in', 'edu.in', 'gov.in',
  'com.au', 'net.au', 'org.au', 'edu.au', 'gov.au', 'id.au',
  'co.nz', 'net.nz', 'org.nz', 'govt.nz', 'ac.nz',
  'co.za', 'org.za', 'net.za', 'web.za',
  'com.br', 'net.br', 'org.br', 'gov.br',
  'com.mx', 'com.ar', 'com.co', 'com.sg', 'com.my', 'com.hk', 'com.tw',
  'co.jp', 'ne.jp', 'or.jp', 'ac.jp', 'go.jp',
  'co.kr', 'or.kr', 'go.kr',
  'com.tr', 'com.ua', 'com.pl', 'com.cn', 'net.cn', 'org.cn', 'gov.cn',
]);

export interface HostnameShape {
  valid: boolean;
  /** True when the hostname is a registrable domain with no subdomain. */
  isApex: boolean;
  reason?: string;
}

export function inspectHostname(raw: string): HostnameShape {
  const host = normalise(raw);

  if (host.length === 0 || host.length > 253) {
    return { valid: false, isApex: false, reason: 'A hostname is required.' };
  }
  if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/.test(host)) {
    return { valid: false, isApex: false, reason: 'That is not a valid hostname.' };
  }
  if (host.split('.').some((label) => label.length > 63)) {
    return { valid: false, isApex: false, reason: 'One part of that hostname is too long.' };
  }

  const labels = host.split('.');
  const lastTwo = labels.slice(-2).join('.');
  const suffixLabels = TWO_LABEL_SUFFIXES.has(lastTwo) ? 3 : 2;

  return { valid: true, isApex: labels.length <= suffixLabels };
}

// ---------------------------------------------------------------------------
// Verification
// ---------------------------------------------------------------------------

export type VerificationOutcome =
  // `hint` is declared on every member, undefined on the one that never carries
  // one. An active domain has nothing left to advise about, but a caller reading
  // `outcome.hint` should not have to narrow the union to find that out.
  | { state: 'active'; message: string; hint?: undefined }
  | { state: 'pending'; message: string; hint?: string }
  | { state: 'failed'; message: string; hint?: string };

/**
 * What is known about the certificate, as opposed to whether it is serving.
 *
 * This used to be a single `certificateActive: boolean`, and that shape could not
 * represent the failure that actually happened in production: the hostname was
 * never registered, so no certificate was ever requested, so `active` was false —
 * indistinguishable from a certificate that is issuing normally. The message said
 * "still being issued" for an hour, and would have said it for a year. A boolean
 * had nowhere to put "nothing is issuing, and nothing will".
 */
export interface CertificateState {
  /** Certificate provisioning is configured on this deployment at all. */
  configured: boolean;
  /** The hostname is registered with the provider, so a certificate exists to wait for. */
  registered: boolean;
  /** The provider answered when asked about it. False means we do not know. */
  statusKnown: boolean;
  /** A certificate exists and is serving. */
  active: boolean;
  /** Why registration failed, when it did. */
  error?: string | null;
}

/**
 * Turn a DNS answer into something worth showing a person.
 *
 * Every branch here exists because it produces a materially different next
 * action. "Add the record" and "the record is right, wait for the certificate"
 * are both `pending` to Cloudflare and mean opposite things to the customer.
 */
export function interpret(
  hostname: string,
  expectedTarget: string,
  dns: CnameResult,
  cert: CertificateState,
): VerificationOutcome {
  const shape = inspectHostname(hostname);
  const expected = normalise(expectedTarget);

  if (!shape.valid) {
    return { state: 'failed', message: shape.reason ?? 'That hostname is not valid.' };
  }

  if (dns.perResolver.every((r) => !r.reachable)) {
    return {
      state: 'pending',
      message: 'We could not reach a DNS resolver just now. Nothing is wrong with your setup.',
      hint: 'Try verifying again in a moment.',
    };
  }

  if (dns.target === null) {
    if (dns.hasAddressRecord && shape.isApex) {
      return {
        state: 'failed',
        message: `${hostname} is a root domain, and DNS does not allow a CNAME at the root.`,
        hint: 'Use a subdomain such as qr.' + hostname + ', or an ALIAS/ANAME record if your provider supports one.',
      };
    }
    if (dns.hasAddressRecord) {
      return {
        state: 'failed',
        message: `${hostname} points at an IP address rather than a CNAME.`,
        hint:
          'If your DNS is on Cloudflare, the record is probably proxied — set it to ' +
          '"DNS only" (grey cloud) so the CNAME is visible publicly.',
      };
    }
    return {
      state: 'pending',
      message: `No CNAME record found for ${hostname} yet.`,
      hint: `Add a CNAME record pointing ${hostname} to ${expected}, then verify again. DNS changes can take a few minutes.`,
    };
  }

  if (dns.target !== expected) {
    return {
      state: 'failed',
      message: `${hostname} points at ${dns.target}, not ${expected}.`,
      hint: 'Update the CNAME record to the exact target shown above.',
    };
  }

  if (!dns.agreed) {
    return {
      state: 'pending',
      message: 'The record is correct but has not reached every DNS resolver yet.',
      hint: 'This usually settles within a few minutes. Nothing more to do.',
    };
  }

  // Everything below here is about the certificate. The record is correct and has
  // propagated, so nothing the customer does to their DNS can change the answer.

  if (!cert.configured) {
    return {
      state: 'pending',
      message: 'The DNS record is correct. Certificate provisioning is not configured on this deployment.',
      hint: 'Nothing to do from your side — this one needs fixing on ours.',
    };
  }

  if (!cert.registered) {
    // `failed`, not `pending`: no certificate was ever requested, so waiting
    // cannot help. This is the state that used to read "still being issued".
    return {
      state: 'failed',
      message: `The DNS record is correct, but ${hostname} could not be registered for a certificate.`,
      hint: cert.error
        ? `The certificate provider said: ${cert.error}`
        : 'Verify again to retry the registration. If it keeps failing, this needs fixing on our side.',
    };
  }

  if (!cert.statusKnown) {
    // Registered, but the provider did not answer. Distinct from "issuing"
    // for the same reason an unreachable resolver is distinct from a missing
    // record: one is our problem and one is a wait.
    return {
      state: 'pending',
      message: 'The DNS record is correct. We could not read the certificate status just now.',
      hint: 'Try verifying again in a moment.',
    };
  }

  if (!cert.active) {
    // The distinguishable case architecture.md §4.4 exists for.
    return {
      state: 'pending',
      message: 'The DNS record is correct. The SSL certificate is still being issued.',
      hint: 'This is automatic and usually takes a few minutes. Nothing more to do.',
    };
  }

  return { state: 'active', message: `${hostname} is live and serving over HTTPS.` };
}
