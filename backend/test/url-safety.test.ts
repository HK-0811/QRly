import { describe, it, expect } from 'vitest';
import { validateDestination, MAX_URL_LENGTH } from '../src/lib/url-safety';

const rejects = (input: string, reason?: string) => {
  const r = validateDestination(input);
  expect(r.ok, `expected ${JSON.stringify(input)} to be rejected`).toBe(false);
  if (reason) expect(r.reason).toBe(reason);
  // Every rejection must carry something showable to a person.
  expect(typeof r.message).toBe('string');
  expect(r.message!.length).toBeGreaterThan(0);
};

const accepts = (input: string) => {
  const r = validateDestination(input);
  expect(r.ok, `expected ${JSON.stringify(input)} to be accepted, got ${r.reason}`).toBe(true);
  return r.url!;
};

describe('url-safety — schemes', () => {
  it('accepts ordinary web URLs', () => {
    expect(accepts('https://example.com')).toBe('https://example.com/');
    expect(accepts('http://example.com/path?a=1#frag')).toBe('http://example.com/path?a=1#frag');
  });

  it('adds https:// to a bare hostname rather than making the user type it', () => {
    expect(accepts('example.com/products')).toBe('https://example.com/products');
  });

  it('accepts the non-web schemes a QR code legitimately carries', () => {
    expect(accepts('mailto:hello@example.com')).toBe('mailto:hello@example.com');
    expect(accepts('tel:+911234567890')).toBe('tel:+911234567890');
    expect(accepts('sms:+911234567890')).toBe('sms:+911234567890');
  });

  it('blocks script-bearing schemes — the open-redirect-to-XSS path', () => {
    rejects('javascript:alert(1)', 'scheme_not_allowed');
    rejects('JaVaScRiPt:alert(1)', 'scheme_not_allowed');
    rejects('data:text/html,<script>alert(1)</script>', 'scheme_not_allowed');
    rejects('vbscript:msgbox(1)', 'scheme_not_allowed');
    rejects('file:///etc/passwd', 'scheme_not_allowed');
    rejects('ftp://example.com', 'scheme_not_allowed');
  });
});

describe('url-safety — private and internal addresses', () => {
  it('blocks loopback and private ranges in dotted-quad form', () => {
    for (const host of [
      'http://127.0.0.1/',
      'http://127.1.2.3/',
      'http://10.0.0.1/',
      'http://172.16.0.1/',
      'http://172.31.255.255/',
      'http://192.168.1.1/admin',
      'http://169.254.169.254/latest/meta-data/',
      'http://0.0.0.0/',
      'http://100.64.0.1/',
      'http://255.255.255.255/',
    ]) {
      rejects(host, 'private_ip');
    }
  });

  it('does not block public addresses that merely look adjacent', () => {
    accepts('http://172.32.0.1/');
    accepts('http://11.0.0.1/');
    accepts('http://8.8.8.8/');
    accepts('http://192.167.1.1/');
  });

  it('blocks the decimal, octal and hex spellings of 127.0.0.1', () => {
    // http://2130706433/ resolves to 127.0.0.1 in every browser. Blocking only
    // the dotted form leaves the bypass wide open.
    rejects('http://2130706433/', 'private_ip');
    rejects('http://0x7f000001/', 'private_ip');
    rejects('http://017700000001/', 'private_ip');
  });

  it('blocks loopback and unique-local IPv6, including the IPv4-mapped form', () => {
    rejects('http://[::1]/', 'private_ip');
    rejects('http://[fe80::1]/', 'private_ip');
    rejects('http://[fc00::1]/', 'private_ip');
    rejects('http://[fd12:3456::1]/', 'private_ip');
    rejects('http://[::ffff:127.0.0.1]/', 'private_ip');
  });

  it('blocks internal hostnames and metadata endpoints', () => {
    rejects('http://localhost:3000/', 'private_host');
    rejects('http://metadata.google.internal/', 'private_host');
    rejects('http://printer.local/', 'private_host');
    rejects('http://wiki.internal/', 'private_host');
    rejects('http://xyz.onion/', 'private_host');
  });
});

describe('url-safety — phishing and injection shapes', () => {
  it('blocks embedded credentials, the classic lookalike trick', () => {
    // Renders as "paypal.com" to a hurried reader; goes to attacker.example.
    rejects('https://paypal.com@attacker.example/login', 'embedded_credentials');
    rejects('https://user:pass@example.com/', 'embedded_credentials');
  });

  it('blocks control characters that could split the Location header', () => {
    rejects('https://example.com/\r\nSet-Cookie: a=b', 'control_characters');
    rejects('https://example.com/\u0000', 'control_characters');
  });

  it('rejects empty, blank and non-string input', () => {
    rejects('', 'empty');
    rejects('   ', 'empty');
    expect(validateDestination(null).ok).toBe(false);
    expect(validateDestination(undefined).ok).toBe(false);
    expect(validateDestination(42 as unknown as string).ok).toBe(false);
  });

  it('rejects a hostname with no dot as a probable intranet name or typo', () => {
    rejects('https://intranet/', 'not_public');
  });

  it('enforces the length ceiling', () => {
    rejects(`https://example.com/${'a'.repeat(MAX_URL_LENGTH)}`, 'too_long');
  });

  it('rejects unparseable input', () => {
    rejects('https://', 'unparseable');
    rejects('ht!tp://example.com', 'not_public');
  });
});
