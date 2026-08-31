import { describe, it, expect } from 'vitest';
import { inspectHostname, interpret, resolveCname, type CnameResult } from '../src/lib/dns';
import { certificateIsActive, describeSslStatus, isConfigured } from '../src/lib/cloudflare';
import { env } from 'cloudflare:test';

describe('hostname shape', () => {
  it('accepts ordinary subdomains', () => {
    for (const h of ['qr.example.com', 'links.my-shop.co.uk', 'go.a.b.example.org']) {
      expect(inspectHostname(h), h).toMatchObject({ valid: true });
    }
  });

  it('rejects malformed hostnames', () => {
    for (const h of ['', 'no-dot', '-leading.example.com', 'trailing-.example.com', 'a..b.com', 'sp ace.com']) {
      expect(inspectHostname(h).valid, h).toBe(false);
    }
  });

  it('identifies a root domain, which can never take a CNAME', () => {
    // DNS forbids a CNAME at a zone apex. Catching it before anything is created
    // beats letting the customer add a record that cannot work.
    expect(inspectHostname('example.com').isApex).toBe(true);
    expect(inspectHostname('qr.example.com').isApex).toBe(false);
  });

  it('handles two-label public suffixes', () => {
    // example.co.uk is a root domain, not a subdomain of co.uk.
    expect(inspectHostname('example.co.uk').isApex).toBe(true);
    expect(inspectHostname('qr.example.co.uk').isApex).toBe(false);
    expect(inspectHostname('example.com.au').isApex).toBe(true);
    expect(inspectHostname('shop.example.co.in').isApex).toBe(false);
  });

  it('normalises case and a trailing dot', () => {
    expect(inspectHostname('QR.Example.COM.')).toMatchObject({ valid: true, isApex: false });
  });
});

// ---------------------------------------------------------------------------

const dns = (over: Partial<CnameResult> = {}): CnameResult => ({
  target: null,
  agreed: true,
  perResolver: [
    { resolver: 'cloudflare', target: null, reachable: true },
    { resolver: 'google', target: null, reachable: true },
  ],
  hasAddressRecord: false,
  nxdomain: false,
  ...over,
});

const TARGET = 'qrly.example.workers.dev';

describe('verification messages', () => {
  it('tells "no record yet" apart from "waiting for the certificate"', () => {
    // The distinction architecture.md §4.4 exists for. Cloudflare reports both as
    // pending, and they mean opposite things to somebody who just followed
    // instructions.
    const missing = interpret('qr.example.com', TARGET, dns(), false);
    expect(missing.state).toBe('pending');
    expect(missing.message).toContain('No CNAME record found');
    expect(missing.hint).toContain(TARGET);

    const issuing = interpret(
      'qr.example.com',
      TARGET,
      dns({ target: TARGET, agreed: true }),
      false,
    );
    expect(issuing.state).toBe('pending');
    expect(issuing.message).toContain('certificate is still being issued');
    expect(issuing.hint).toContain('Nothing more to do');
  });

  it('goes active only when the record resolves AND a certificate exists', () => {
    // Activating on DNS alone routes traffic to a hostname with no certificate,
    // which is a TLS error rather than a redirect.
    expect(interpret('qr.example.com', TARGET, dns({ target: TARGET }), true).state).toBe('active');
    expect(interpret('qr.example.com', TARGET, dns({ target: TARGET }), false).state).toBe('pending');
  });

  it('names the wrong target rather than saying "failed"', () => {
    const wrong = interpret('qr.example.com', TARGET, dns({ target: 'somewhere.else.test' }), false);
    expect(wrong.state).toBe('failed');
    expect(wrong.message).toContain('somewhere.else.test');
    expect(wrong.message).toContain(TARGET);
  });

  it('explains an apex domain instead of just refusing it', () => {
    const apex = interpret('example.com', TARGET, dns({ hasAddressRecord: true }), false);
    expect(apex.state).toBe('failed');
    expect(apex.message).toContain('root domain');
    expect(apex.hint).toContain('qr.example.com');
  });

  it('recognises a proxied Cloudflare record, the most common silent failure', () => {
    // An orange-cloud record hides the CNAME behind Cloudflare's addresses, so
    // verification sees an A record and nothing else.
    const proxied = interpret('qr.example.com', TARGET, dns({ hasAddressRecord: true }), false);
    expect(proxied.state).toBe('failed');
    expect(proxied.hint).toContain('DNS only');
    expect(proxied.hint).toContain('grey cloud');
  });

  it('treats partial propagation as pending, not failure', () => {
    const propagating = interpret(
      'qr.example.com',
      TARGET,
      dns({ target: TARGET, agreed: false }),
      true,
    );
    expect(propagating.state).toBe('pending');
    expect(propagating.message).toContain('not reached every DNS resolver');
  });

  it('does not blame the customer when our own resolvers are unreachable', () => {
    const noResolver = interpret(
      'qr.example.com',
      TARGET,
      dns({
        perResolver: [
          { resolver: 'cloudflare', target: null, reachable: false },
          { resolver: 'google', target: null, reachable: false },
        ],
      }),
      false,
    );
    expect(noResolver.state).toBe('pending');
    expect(noResolver.message).toContain('Nothing is wrong with your setup');
  });

  it('is case- and trailing-dot-insensitive about the target', () => {
    const messy = interpret('qr.example.com', `${TARGET.toUpperCase()}.`, dns({ target: TARGET }), true);
    expect(messy.state).toBe('active');
  });
});

// ---------------------------------------------------------------------------

describe('real DNS resolution', () => {
  // These hit the actual DoH resolvers. They are the only way to know the query
  // shape, the JSON parsing and the two-resolver comparison work against real
  // answers rather than against a fixture that agrees with the parser.

  it('resolves a real CNAME through both resolvers', async () => {
    // www.github.com is a long-standing CNAME to github.com.
    const result = await resolveCname('www.github.com');

    expect(result.perResolver).toHaveLength(2);
    expect(result.perResolver.some((r) => r.reachable)).toBe(true);
    expect(result.target).toBe('github.com');
    expect(result.agreed).toBe(true);
  });

  it('reports no CNAME for a name that has an address record instead', async () => {
    const result = await resolveCname('example.com');
    expect(result.target).toBeNull();
    expect(result.hasAddressRecord).toBe(true);
  });

  it('reports a name that does not exist', async () => {
    const result = await resolveCname('this-name-does-not-exist-qrly.invalid');
    expect(result.target).toBeNull();
    expect(result.hasAddressRecord).toBe(false);
  });

  it('end-to-end: a real lookup produces a usable message', async () => {
    const result = await resolveCname('example.com');
    const outcome = interpret('example.com', TARGET, result, false);
    expect(outcome.state).toBe('failed');
    expect(outcome.message).toContain('root domain');
  });
});

// ---------------------------------------------------------------------------

describe('cloudflare client', () => {
  // Built from explicit objects rather than from the ambient `env`. This used to
  // assert isConfigured(env) === false, which passed only for as long as nobody put
  // real credentials in backend/.dev.vars — it was testing the developer's machine,
  // not the function. Spelling out all four combinations also covers the half-
  // configured cases, which are the ones that actually reach production.
  it('reports itself unconfigured rather than failing obscurely', () => {
    const both = { ...env, CLOUDFLARE_API_TOKEN: 't', CLOUDFLARE_ZONE_ID: 'z' };
    expect(isConfigured({ ...both, CLOUDFLARE_API_TOKEN: '', CLOUDFLARE_ZONE_ID: '' })).toBe(false);
    expect(isConfigured({ ...both, CLOUDFLARE_ZONE_ID: '' })).toBe(false);
    expect(isConfigured({ ...both, CLOUDFLARE_API_TOKEN: '' })).toBe(false);
    expect(isConfigured(both)).toBe(true);
  });

  it('treats only "active" as a serving certificate', () => {
    expect(certificateIsActive({ ssl: { status: 'active' } } as never)).toBe(true);
    for (const status of ['pending_validation', 'pending_issuance', 'pending_deployment', 'initializing', 'deleted']) {
      expect(certificateIsActive({ ssl: { status } } as never), status).toBe(false);
    }
    expect(certificateIsActive(null)).toBe(false);
  });

  it('describes every SSL state in words', () => {
    for (const status of [
      'active',
      'pending_validation',
      'pending_issuance',
      'pending_deployment',
      'initializing',
      'deleted',
      undefined,
    ]) {
      const text = describeSslStatus(status);
      expect(text.length, String(status)).toBeGreaterThan(10);
      // A raw status string is not an explanation.
      if (status) expect(text).not.toBe(status);
    }
  });
});
