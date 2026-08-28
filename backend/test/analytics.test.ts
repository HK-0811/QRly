import { describe, it, expect } from 'vitest';
import { classifyNetwork } from '../src/lib/asn';
import { detectBot, looksLikeDirectScan } from '../src/lib/bot';
import { extractGeo, extractNetwork, localTime } from '../src/lib/geo';
import { parseAcquisition, parseLanguages, parseUserAgent } from '../src/lib/ua';
import { visitorHash, utcDay } from '../src/lib/hash';
import { buildScanEvent, privacySignal } from '../src/lib/analytics';
import type { CachedLink } from '../src/types';
import { env } from 'cloudflare:test';

// ---------------------------------------------------------------------------

describe('network classification', () => {
  it('recognises hosting providers, which are never a phone camera', () => {
    for (const org of ['Amazon.com, Inc.', 'DigitalOcean, LLC', 'Hetzner Online GmbH', 'OVH SAS']) {
      const r = classifyNetwork(org);
      expect(r.network_type, org).toBe('datacenter');
      expect(r.isDatacenter).toBe(true);
    }
  });

  it('recognises mobile carriers — the field paid tiers rarely expose', () => {
    for (const org of [
      'Reliance Jio Infocomm Limited',
      'Bharti Airtel Limited',
      'T-Mobile USA, Inc.',
      'Cellco Partnership DBA Verizon Wireless',
      'Vodafone Group',
    ]) {
      expect(classifyNetwork(org).network_type, org).toBe('mobile');
    }
  });

  it('recognises consumer fixed-line providers', () => {
    for (const org of ['Comcast Cable Communications, LLC', 'ACT Fibernet', 'Virgin Media Limited']) {
      expect(classifyNetwork(org).network_type, org).toBe('broadband');
    }
  });

  it('separates a carrier from that carrier\'s fixed-line arm', () => {
    // "Vodafone" alone is mobile; "Vodafone Kabel Deutschland" is cable.
    expect(classifyNetwork('Vodafone Group').network_type).toBe('mobile');
    expect(classifyNetwork('Vodafone Kabel Deutschland GmbH').network_type).toBe('broadband');
  });

  it('recognises institutional networks', () => {
    for (const org of ['University of Cambridge', 'Ministry of Education', 'HDFC Bank Limited']) {
      expect(classifyNetwork(org).network_type, org).toBe('corporate');
    }
  });

  it('returns unknown rather than guessing', () => {
    // Defaulting an unmatched name to "broadband" would inflate a number the
    // dashboard presents as a finding.
    expect(classifyNetwork('Xyzzy Networks Pty').network_type).toBe('unknown');
    expect(classifyNetwork(null).network_type).toBe('unknown');
  });

  it('reports which term matched, so a wrong answer can be argued with', () => {
    expect(classifyNetwork('Reliance Jio Infocomm Limited').matched).toBe('reliance jio');
  });
});

// ---------------------------------------------------------------------------

describe('bot detection', () => {
  const ua = (userAgent: string | null, extra = {}) => detectBot({ userAgent, ...extra });

  it('names link preview fetchers individually', () => {
    // "This link was shared into WhatsApp 40 times" is a real finding, so these
    // must stay distinguishable rather than collapsing into "bot".
    expect(ua('WhatsApp/2.23.20.0 A')).toEqual({
      is_bot: true,
      bot_reason: 'Link preview: WhatsApp',
    });
    expect(ua('facebookexternalhit/1.1').bot_reason).toBe('Link preview: Facebook');
    expect(ua('Slackbot-LinkExpanding 1.0').bot_reason).toBe('Link preview: Slack');
    expect(ua('TelegramBot (like TwitterBot)').bot_reason).toBe('Link preview: Telegram');
  });

  it('catches crawlers and automation', () => {
    expect(ua('Googlebot/2.1').bot_reason).toBe('Crawler: Googlebot');
    expect(ua('curl/8.4.0').bot_reason).toBe('Automated: Command-line client');
    expect(ua('python-requests/2.31.0').bot_reason).toBe('Automated: Python client');
    expect(ua('Mozilla/5.0 (X11) HeadlessChrome/120').bot_reason).toBe('Automated: Headless browser');
  });

  it('treats a missing user agent as automated', () => {
    expect(ua(null).is_bot).toBe(true);
    expect(ua('').bot_reason).toBe('No user agent');
  });

  it('does not flag real phones and browsers', () => {
    for (const agent of [
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1',
      'Mozilla/5.0 (Linux; Android 14; SM-S911B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    ]) {
      expect(ua(agent), agent.slice(0, 40)).toEqual({ is_bot: false, bot_reason: null });
    }
  });

  it('excludes prefetches — hovering a link is not scanning it', () => {
    const agent = 'Mozilla/5.0 (Macintosh) Chrome/120.0.0.0 Safari/537.36';
    expect(ua(agent, { secPurpose: 'prefetch;prerender' }).bot_reason).toBe('Prefetch');
    expect(ua(agent, { purpose: 'prefetch' }).bot_reason).toBe('Prefetch');
  });

  it('excludes non-navigation requests', () => {
    const agent = 'Mozilla/5.0 (Macintosh) Chrome/120.0.0.0 Safari/537.36';
    expect(ua(agent, { secFetchDest: 'image' }).bot_reason).toBe('Non-navigation request (image)');
    expect(ua(agent, { secFetchDest: 'document' }).is_bot).toBe(false);
  });

  it('uses datacentre origin last, so a better reason wins when there is one', () => {
    const agent = 'Mozilla/5.0 (Macintosh) Chrome/120.0.0.0 Safari/537.36';
    expect(ua(agent, { isDatacenter: true }).bot_reason).toBe('Datacentre network');
    expect(ua('WhatsApp/2.23', { isDatacenter: true }).bot_reason).toBe('Link preview: WhatsApp');
  });

  it('treats a missing referrer as a probable camera scan', () => {
    expect(looksLikeDirectScan(null)).toBe(true);
    expect(looksLikeDirectScan('https://twitter.com/')).toBe(false);
  });
});

// ---------------------------------------------------------------------------

describe('user agent parsing', () => {
  it('extracts the real device model on Android', () => {
    const d = parseUserAgent(
      'Mozilla/5.0 (Linux; Android 14; SM-S911B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
    );
    expect(d.device_type).toBe('mobile');
    expect(d.device_model).toBe('SM-S911B');
    expect(d.os_name).toBe('Android');
    expect(d.browser_name).toBe('Chrome');
  });

  it('gets no model from iOS, which is a property of the data and not a bug', () => {
    // Apple stopped reporting the model years ago. The dashboard has to show this
    // asymmetry rather than hiding the gap.
    const d = parseUserAgent(
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1',
    );
    expect(d.device_type).toBe('mobile');
    expect(d.device_vendor).toBe('Apple');
    expect(d.device_model).toBe('iPhone');
    expect(d.os_name).toBe('iOS');
  });

  it('identifies desktop from the OS when the parser gives no device type', () => {
    const d = parseUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    );
    expect(d.device_type).toBe('desktop');
    expect(d.os_name).toBe('Windows');
  });

  it('marks a known bot as a bot device type', () => {
    expect(parseUserAgent('Googlebot/2.1', true).device_type).toBe('bot');
  });
});

describe('language parsing', () => {
  it('orders by quality, not by position', () => {
    const r = parseLanguages('fr;q=0.5,en-GB,de;q=0.8');
    expect(r.language).toBe('en-GB');
    expect(r.languages).toEqual(['en-GB', 'de', 'fr']);
  });

  it('handles a missing header', () => {
    expect(parseLanguages(null)).toEqual({ language: null, languages: null });
  });
});

describe('acquisition parsing', () => {
  it('extracts UTM parameters and the referrer host', () => {
    const url = new URL('https://qr.test/abc?utm_source=poster&utm_campaign=spring&other=x');
    const r = parseAcquisition(url, 'https://news.example.com/story');
    expect(r.utm_source).toBe('poster');
    expect(r.utm_campaign).toBe('spring');
    expect(r.utm_medium).toBeNull();
    expect(r.referrer_host).toBe('news.example.com');
  });

  it('survives a malformed referrer', () => {
    const r = parseAcquisition(new URL('https://qr.test/abc'), 'not a url');
    expect(r.referrer).toBe('not a url');
    expect(r.referrer_host).toBeNull();
  });
});

// ---------------------------------------------------------------------------

describe('geo extraction', () => {
  const cf = {
    country: 'IN',
    region: 'Maharashtra',
    regionCode: 'MH',
    city: 'Pune',
    postalCode: '411001',
    continent: 'AS',
    latitude: '18.5204',
    longitude: '73.8567',
    timezone: 'Asia/Kolkata',
    isEUCountry: undefined,
    asn: 55836,
    asOrganization: 'Reliance Jio Infocomm Limited',
    colo: 'BOM',
    httpProtocol: 'HTTP/3',
    tlsVersion: 'TLSv1.3',
    clientTcpRtt: 42,
  };

  it('maps the cf object onto the row', () => {
    const g = extractGeo(cf);
    expect(g.country).toBe('IN');
    expect(g.city).toBe('Pune');
    expect(g.latitude).toBeCloseTo(18.5204);
    expect(g.timezone).toBe('Asia/Kolkata');
    expect(g.is_eu).toBeNull();
  });

  it('returns nulls rather than inventing a location when cf is absent', () => {
    // wrangler dev supplies little cf data. Fabricating one would seed the
    // dashboard with a fictional city.
    const g = extractGeo(undefined);
    expect(Object.values(g).every((v) => v === null)).toBe(true);
  });

  it('extracts the network fields', () => {
    const n = extractNetwork(cf);
    expect(n.asn).toBe(55836);
    expect(n.as_org).toBe('Reliance Jio Infocomm Limited');
    expect(n.colo).toBe('BOM');
    expect(n.tcp_rtt_ms).toBe(42);
    expect(n.http_protocol).toBe('HTTP/3');
  });

  it('discards implausible round-trip times as measurement artefacts', () => {
    expect(extractNetwork({ ...cf, clientTcpRtt: 0 }).tcp_rtt_ms).toBeNull();
    expect(extractNetwork({ ...cf, clientTcpRtt: 99_999 }).tcp_rtt_ms).toBeNull();
  });
});

describe('local time derivation', () => {
  // 2026-06-01T12:00:00Z
  const noonUtc = new Date('2026-06-01T12:00:00Z');

  it('reports the hour where the scanner is, not where the account owner is', () => {
    // The mistake most analytics products make. A campaign in Mumbai read from an
    // office in London should not appear to peak at 3am.
    expect(localTime('Asia/Kolkata', noonUtc).local_hour).toBe(17);
    expect(localTime('America/New_York', noonUtc).local_hour).toBe(8);
    expect(localTime('UTC', noonUtc).local_hour).toBe(12);
  });

  it('derives the weekday in the same zone', () => {
    // 2026-06-01 is a Monday.
    expect(localTime('UTC', noonUtc).local_dow).toBe(1);
  });

  it('crosses the date line correctly', () => {
    const lateUtc = new Date('2026-06-01T22:00:00Z');
    const t = localTime('Asia/Kolkata', lateUtc);
    expect(t.local_hour).toBe(3);
    expect(t.local_dow).toBe(2); // already Tuesday in India
  });

  it('survives a missing or invalid timezone', () => {
    expect(localTime(null)).toEqual({ local_hour: null, local_dow: null });
    expect(localTime('Not/AZone')).toEqual({ local_hour: null, local_dow: null });
  });

  it('renders midnight as 0 rather than 24', () => {
    expect(localTime('UTC', new Date('2026-06-01T00:00:00Z')).local_hour).toBe(0);
  });
});

// ---------------------------------------------------------------------------

describe('visitor hash', () => {
  const args = ['salt-of-the-day', 'pepper', '203.0.113.7', 'Mozilla/5.0', 'link-1'] as const;

  it('is deterministic for the same day, ip, agent and link', async () => {
    expect(await visitorHash(...args)).toBe(await visitorHash(...args));
  });

  it('changes when the salt rotates, so identity cannot span days', async () => {
    // This is what makes "unique visitors" honestly mean "unique per day".
    const today = await visitorHash(...args);
    const tomorrow = await visitorHash('a-different-salt', 'pepper', '203.0.113.7', 'Mozilla/5.0', 'link-1');
    expect(tomorrow).not.toBe(today);
  });

  it('separates different visitors and different links', async () => {
    const base = await visitorHash(...args);
    expect(await visitorHash('salt-of-the-day', 'pepper', '203.0.113.8', 'Mozilla/5.0', 'link-1')).not.toBe(base);
    expect(await visitorHash('salt-of-the-day', 'pepper', '203.0.113.7', 'Mozilla/5.0', 'link-2')).not.toBe(base);
  });

  it('contains nothing recoverable — 128 bits of hex and no IP', async () => {
    const h = await visitorHash(...args);
    expect(h).toMatch(/^[0-9a-f]{32}$/);
    expect(h).not.toContain('203');
  });

  it('utcDay is a plain ISO date', () => {
    expect(utcDay(new Date('2026-06-01T22:30:00Z'))).toBe('2026-06-01');
  });
});

// ---------------------------------------------------------------------------

const link: CachedLink = {
  id: '11111111-1111-1111-1111-111111111111',
  user_id: '22222222-2222-2222-2222-222222222222',
  domain_id: '33333333-3333-3333-3333-333333333333',
  qr_id: null,
  destination_url: 'https://example.com/menu',
  is_active: true,
  expires_at: null,
  safe_browsing_status: 'clean',
  domain_active: true,
};

function scanRequest(headers: Record<string, string> = {}, cf?: Record<string, unknown>) {
  const req = new Request('https://qrify.test/abc123?utm_source=poster', {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Linux; Android 14; SM-S911B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
      'Accept-Language': 'en-IN,en;q=0.9',
      'CF-Connecting-IP': '203.0.113.7',
      'Sec-Fetch-Dest': 'document',
      ...headers,
    },
  });
  if (cf) Object.defineProperty(req, 'cf', { value: cf, configurable: true });
  return req;
}

const CF = {
  country: 'IN',
  city: 'Pune',
  region: 'Maharashtra',
  regionCode: 'MH',
  postalCode: '411001',
  continent: 'AS',
  latitude: '18.5204',
  longitude: '73.8567',
  timezone: 'Asia/Kolkata',
  asn: 55836,
  asOrganization: 'Reliance Jio Infocomm Limited',
  colo: 'BOM',
  httpProtocol: 'HTTP/3',
  tlsVersion: 'TLSv1.3',
  clientTcpRtt: 42,
};

describe('scan event assembly', () => {
  it('produces a full row from a realistic mobile scan', async () => {
    const row = await buildScanEvent({
      request: scanRequest({}, CF),
      env,
      link,
      hostname: 'qrify.test',
      now: new Date('2026-06-01T12:00:00Z'),
    });

    expect(row.link_id).toBe(link.id);
    expect(row.user_id).toBe(link.user_id);
    expect(row.country).toBe('IN');
    expect(row.city).toBe('Pune');
    expect(row.as_org).toBe('Reliance Jio Infocomm Limited');
    expect(row.network_type).toBe('mobile');
    expect(row.device_type).toBe('mobile');
    expect(row.device_model).toBe('SM-S911B');
    expect(row.language).toBe('en-IN');
    expect(row.utm_source).toBe('poster');
    expect(row.local_hour).toBe(17); // 12:00 UTC is 17:30 in Kolkata
    expect(row.is_bot).toBe(false);
    expect(row.gpc).toBe(false);
  });

  it('never carries the raw IP into the row', async () => {
    const row = await buildScanEvent({
      request: scanRequest({}, CF),
      env,
      link,
      hostname: 'qrify.test',
    });
    expect(JSON.stringify(row)).not.toContain('203.0.113.7');
  });

  it('leaves is_first_scan null for the database trigger to resolve', async () => {
    // Deciding it in the Worker would be a read-before-write, and it races: two
    // edges could both see "not seen" and both claim to be first.
    const row = await buildScanEvent({ request: scanRequest({}, CF), env, link, hostname: 'qrify.test' });
    expect(row.is_first_scan).toBeNull();
  });

  it('flags a WhatsApp preview fetch rather than dropping it', async () => {
    const row = await buildScanEvent({
      request: scanRequest({ 'User-Agent': 'WhatsApp/2.23.20.0 A' }, CF),
      env,
      link,
      hostname: 'qrify.test',
    });
    expect(row.is_bot).toBe(true);
    expect(row.bot_reason).toBe('Link preview: WhatsApp');
    // Still recorded: "this link was shared" is a finding worth keeping.
    expect(row.link_id).toBe(link.id);
  });

  describe('privacy signals', () => {
    it('detects Sec-GPC and DNT', () => {
      expect(privacySignal(scanRequest({ 'Sec-GPC': '1' }))).toBe(true);
      expect(privacySignal(scanRequest({ DNT: '1' }))).toBe(true);
      expect(privacySignal(scanRequest())).toBe(false);
    });

    it('drops everything that could link the request to another one', async () => {
      const row = await buildScanEvent({
        request: scanRequest({ 'Sec-GPC': '1' }, CF),
        env,
        link,
        hostname: 'qrify.test',
      });

      expect(row.gpc).toBe(true);
      expect(row.visitor_hash).toBeNull();
      expect(row.postal_code).toBeNull();
      expect(row.latitude).toBeNull();
      expect(row.longitude).toBeNull();
      expect(row.ua_raw).toBeNull();

      // What remains is aggregate by construction, so the scan still counts.
      expect(row.country).toBe('IN');
      expect(row.city).toBe('Pune');
      expect(row.device_type).toBe('mobile');
      expect(row.network_type).toBe('mobile');
    });
  });
});
