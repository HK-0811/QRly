#!/usr/bin/env node
/**
 * Development seeder. Generates synthetic scan events so the dashboard can be
 * built and reviewed against data with realistic shape — a weekday/lunchtime
 * rhythm, a long tail of cities, a mix of carriers and devices, some bots.
 *
 * Synthetic, and labelled as such. Never run this against anything but a
 * development project; every row it writes is fabricated.
 *
 *   node tools/seed-scans.mjs <account-email> [count]
 */
import crypto from 'node:crypto';
import { env } from './db.mjs';

const email = process.argv[2] ?? 'demo@qrly.test';
const COUNT = Number(process.argv[3] ?? 4000);

const H = {
  apikey: env.SUPABASE_SERVICE_KEY,
  Authorization: `Bearer ${env.SUPABASE_SERVICE_KEY}`,
  'Content-Type': 'application/json',
};

const rest = (path, init = {}) =>
  fetch(`${env.SUPABASE_URL}/rest/v1${path}`, { ...init, headers: { ...H, ...(init.headers || {}) } });

// ---------------------------------------------------------------------------
// Distributions. Weighted so the dashboard shows a long tail rather than an even
// split — an even split hides every layout problem a real dataset would expose.
// ---------------------------------------------------------------------------

const pick = (weighted) => {
  const total = weighted.reduce((s, [, w]) => s + w, 0);
  let r = Math.random() * total;
  for (const [value, w] of weighted) {
    r -= w;
    if (r <= 0) return value;
  }
  return weighted[0][0];
};

const PLACES = [
  [{ country: 'IN', region: 'Maharashtra', region_code: 'MH', city: 'Pune', postal_code: '411001', continent: 'AS', latitude: 18.5204, longitude: 73.8567, timezone: 'Asia/Kolkata' }, 26],
  [{ country: 'IN', region: 'Maharashtra', region_code: 'MH', city: 'Mumbai', postal_code: '400001', continent: 'AS', latitude: 19.076, longitude: 72.8777, timezone: 'Asia/Kolkata' }, 18],
  [{ country: 'IN', region: 'Karnataka', region_code: 'KA', city: 'Bengaluru', postal_code: '560001', continent: 'AS', latitude: 12.9716, longitude: 77.5946, timezone: 'Asia/Kolkata' }, 12],
  [{ country: 'IN', region: 'Delhi', region_code: 'DL', city: 'New Delhi', postal_code: '110001', continent: 'AS', latitude: 28.6139, longitude: 77.209, timezone: 'Asia/Kolkata' }, 8],
  [{ country: 'US', region: 'New York', region_code: 'NY', city: 'New York', postal_code: '10001', continent: 'NA', latitude: 40.7128, longitude: -74.006, timezone: 'America/New_York' }, 9],
  [{ country: 'US', region: 'California', region_code: 'CA', city: 'San Francisco', postal_code: '94103', continent: 'NA', latitude: 37.7749, longitude: -122.4194, timezone: 'America/Los_Angeles' }, 6],
  [{ country: 'GB', region: 'England', region_code: 'ENG', city: 'London', postal_code: 'EC1A', continent: 'EU', latitude: 51.5074, longitude: -0.1278, timezone: 'Europe/London', is_eu: false }, 7],
  [{ country: 'DE', region: 'Berlin', region_code: 'BE', city: 'Berlin', postal_code: '10115', continent: 'EU', latitude: 52.52, longitude: 13.405, timezone: 'Europe/Berlin', is_eu: true }, 5],
  [{ country: 'AE', region: 'Dubai', region_code: 'DU', city: 'Dubai', postal_code: '00000', continent: 'AS', latitude: 25.2048, longitude: 55.2708, timezone: 'Asia/Dubai' }, 4],
  [{ country: 'SG', region: 'Singapore', region_code: 'SG', city: 'Singapore', postal_code: '018956', continent: 'AS', latitude: 1.3521, longitude: 103.8198, timezone: 'Asia/Singapore' }, 3],
  [{ country: 'AU', region: 'New South Wales', region_code: 'NSW', city: 'Sydney', postal_code: '2000', continent: 'OC', latitude: -33.8688, longitude: 151.2093, timezone: 'Australia/Sydney' }, 2],
];

const NETWORKS = [
  [{ asn: 55836, as_org: 'Reliance Jio Infocomm Limited', network_type: 'mobile', colo: 'BOM' }, 24],
  [{ asn: 24560, as_org: 'Bharti Airtel Limited', network_type: 'mobile', colo: 'BOM' }, 16],
  [{ asn: 45609, as_org: 'Bharti Airtel Limited (Mobile)', network_type: 'mobile', colo: 'MAA' }, 8],
  [{ asn: 24309, as_org: 'ACT Fibernet', network_type: 'broadband', colo: 'BLR' }, 10],
  [{ asn: 17488, as_org: 'Hathway IP Over Cable Internet', network_type: 'broadband', colo: 'BOM' }, 6],
  [{ asn: 7922, as_org: 'Comcast Cable Communications, LLC', network_type: 'broadband', colo: 'EWR' }, 8],
  [{ asn: 21928, as_org: 'T-Mobile USA, Inc.', network_type: 'mobile', colo: 'EWR' }, 6],
  [{ asn: 5089, as_org: 'Virgin Media Limited', network_type: 'broadband', colo: 'LHR' }, 5],
  [{ asn: 3320, as_org: 'Deutsche Telekom AG', network_type: 'broadband', colo: 'FRA' }, 4],
  [{ asn: 786, as_org: 'University of Cambridge', network_type: 'corporate', colo: 'LHR' }, 3],
  [{ asn: 16509, as_org: 'Amazon.com, Inc.', network_type: 'datacenter', colo: 'IAD' }, 4],
  [{ asn: 14061, as_org: 'DigitalOcean, LLC', network_type: 'datacenter', colo: 'AMS' }, 2],
];

const DEVICES = [
  [{ device_type: 'mobile', device_vendor: 'Samsung', device_model: 'SM-S911B', os_name: 'Android', os_version: '14', browser_name: 'Chrome', browser_version: '120.0.0.0' }, 16],
  [{ device_type: 'mobile', device_vendor: 'Xiaomi', device_model: '23049PCD8I', os_name: 'Android', os_version: '13', browser_name: 'Chrome', browser_version: '119.0.0.0' }, 10],
  [{ device_type: 'mobile', device_vendor: 'OnePlus', device_model: 'CPH2447', os_name: 'Android', os_version: '14', browser_name: 'Chrome', browser_version: '120.0.0.0' }, 6],
  // iOS reports only "iPhone" — no model. The dashboard has to show that gap
  // rather than hiding it, so the seed reflects it.
  [{ device_type: 'mobile', device_vendor: 'Apple', device_model: 'iPhone', os_name: 'iOS', os_version: '17.1', browser_name: 'Mobile Safari', browser_version: '17.1' }, 30],
  [{ device_type: 'tablet', device_vendor: 'Apple', device_model: 'iPad', os_name: 'iOS', os_version: '17.0', browser_name: 'Mobile Safari', browser_version: '17.0' }, 4],
  [{ device_type: 'desktop', device_vendor: null, device_model: null, os_name: 'Windows', os_version: '10', browser_name: 'Chrome', browser_version: '120.0.0.0' }, 14],
  [{ device_type: 'desktop', device_vendor: 'Apple', device_model: null, os_name: 'macOS', os_version: '14.1', browser_name: 'Safari', browser_version: '17.1' }, 8],
  [{ device_type: 'desktop', device_vendor: null, device_model: null, os_name: 'Linux', os_version: null, browser_name: 'Firefox', browser_version: '121.0' }, 3],
];

const BOTS = [
  [{ is_bot: true, bot_reason: 'Link preview: WhatsApp', device_type: 'bot' }, 34],
  [{ is_bot: true, bot_reason: 'Crawler: Googlebot', device_type: 'bot' }, 12],
  [{ is_bot: true, bot_reason: 'Link preview: Slack', device_type: 'bot' }, 10],
  [{ is_bot: true, bot_reason: 'Link preview: Telegram', device_type: 'bot' }, 8],
  [{ is_bot: true, bot_reason: 'Automated: Command-line client', device_type: 'bot' }, 5],
  [{ is_bot: true, bot_reason: 'Datacentre network', device_type: 'bot' }, 6],
];

const ACQUISITION = [
  [{ referrer: null, referrer_host: null, utm_source: null, utm_medium: null, utm_campaign: null }, 52],
  [{ referrer: null, referrer_host: null, utm_source: 'poster', utm_medium: 'qr', utm_campaign: 'spring-menu' }, 18],
  [{ referrer: null, referrer_host: null, utm_source: 'table-tent', utm_medium: 'qr', utm_campaign: 'spring-menu' }, 9],
  [{ referrer: null, referrer_host: null, utm_source: 'flyer', utm_medium: 'print', utm_campaign: 'launch-week' }, 7],
  [{ referrer: 'https://www.instagram.com/', referrer_host: 'www.instagram.com', utm_source: 'instagram', utm_medium: 'social', utm_campaign: 'launch-week' }, 8],
  [{ referrer: 'https://t.co/', referrer_host: 't.co', utm_source: 'twitter', utm_medium: 'social', utm_campaign: null }, 4],
  [{ referrer: 'https://mail.google.com/', referrer_host: 'mail.google.com', utm_source: 'newsletter', utm_medium: 'email', utm_campaign: 'launch-week' }, 6],
];

const LANGUAGES = [
  [{ language: 'en-IN', languages: ['en-IN', 'en', 'hi'] }, 40],
  [{ language: 'en-US', languages: ['en-US', 'en'] }, 24],
  [{ language: 'en-GB', languages: ['en-GB', 'en'] }, 12],
  [{ language: 'mr-IN', languages: ['mr-IN', 'hi', 'en'] }, 8],
  [{ language: 'de-DE', languages: ['de-DE', 'de', 'en'] }, 7],
  [{ language: 'hi-IN', languages: ['hi-IN', 'en'] }, 9],
];

/**
 * Scans cluster at lunchtime and early evening, on weekdays, **in the scanner's
 * own local time**.
 *
 * The hour has to be chosen locally and then converted to UTC, not the other way
 * round. Picking a UTC hour and letting each timezone land where it falls spreads
 * the peak across the whole day once several countries are in the mix, and
 * produces a flat heatmap — which would make the one chart this project claims to
 * get right look like it has nothing to say.
 */
const HOUR_WEIGHTS = [
  [0, 1], [1, 1], [2, 1], [3, 1], [4, 1], [5, 2], [6, 5], [7, 10],
  [8, 18], [9, 22], [10, 24], [11, 32], [12, 48], [13, 44], [14, 26], [15, 22],
  [16, 26], [17, 36], [18, 44], [19, 40], [20, 30], [21, 20], [22, 11], [23, 4],
];

/** Weekdays busier than weekends: Sun … Sat. */
const DOW_WEIGHTS = [0.6, 1.0, 1.05, 1.05, 1.1, 1.25, 0.75];

/** A timezone's UTC offset in milliseconds at a given instant, DST included. */
function offsetMs(timeZone, date) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone,
      hour12: false,
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    })
      .formatToParts(date)
      .map((p) => [p.type, p.value]),
  );
  const asIfUtc = Date.UTC(
    Number(parts.year), Number(parts.month) - 1, Number(parts.day),
    Number(parts.hour) % 24, Number(parts.minute), Number(parts.second),
  );
  return asIfUtc - date.getTime();
}

function localMoment(daysBack, timeZone) {
  const approx = new Date(Date.now() - daysBack * 86_400_000);

  // Reject-sample the weekday so weekends are genuinely quieter rather than
  // simply shifted.
  let hour = pick(HOUR_WEIGHTS);
  const local = new Intl.DateTimeFormat('en-US', {
    timeZone, year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short',
  }).formatToParts(approx);
  const part = (t) => local.find((p) => p.type === t)?.value ?? '';
  const dow = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(part('weekday'));
  if (dow >= 0 && Math.random() > DOW_WEIGHTS[dow] / 1.25) {
    // Quiet day: pull the hour toward the off-peak tail instead of dropping the
    // scan, so the daily totals stay smooth.
    hour = pick(HOUR_WEIGHTS.slice(0, 12));
  }

  // Take the chosen wall-clock time in the scanner's zone and find the UTC
  // instant that corresponds to it.
  const wall = Date.UTC(
    Number(part('year')), Number(part('month')) - 1, Number(part('day')),
    hour, Math.floor(Math.random() * 60), Math.floor(Math.random() * 60),
  );
  return new Date(wall - offsetMs(timeZone, new Date(wall)));
}

async function main() {
  const profile = await (await rest(`/profiles?email=eq.${encodeURIComponent(email)}&select=id`)).json();
  if (!profile[0]) throw new Error(`no account for ${email}`);
  const userId = profile[0].id;

  const links = await (
    await rest(`/links?user_id=eq.${userId}&select=id,slug,domain_id&order=created_at`)
  ).json();
  if (links.length === 0) throw new Error(`${email} has no links to attribute scans to`);

  // A handful of visitors scan repeatedly, most scan once. That shape is what
  // makes the first-versus-returning number mean anything.
  const visitors = Array.from({ length: Math.ceil(COUNT / 3) }, () =>
    crypto.randomBytes(16).toString('hex'),
  );

  const rows = [];
  for (let i = 0; i < COUNT; i++) {
    // A steady baseline across the whole window, plus a gentler concentration in
    // the recent half, so the series reads as a campaign gaining traction rather
    // than as a single spike. A plain exponent on a uniform draw produces a cliff
    // at whichever end it favours.
    const daysBack =
      Math.random() < 0.45
        ? Math.floor(Math.random() * 89)
        : Math.floor(Math.random() ** 1.25 * 44);
    const place = pick(PLACES);
    const when = localMoment(daysBack, place.timezone);

    const link = links[Math.floor(Math.random() ** 1.6 * links.length)] ?? links[0];
    const network = pick(NETWORKS);
    const isBot = Math.random() < 0.13 || network.network_type === 'datacenter';
    const device = isBot ? pick(BOTS) : pick(DEVICES);
    const acquisition = pick(ACQUISITION);
    const lang = pick(LANGUAGES);
    const gpc = !isBot && Math.random() < 0.04;

    const localHour = Number(
      new Intl.DateTimeFormat('en-US', { timeZone: place.timezone, hour: 'numeric', hour12: false })
        .format(when),
    ) % 24;
    const localDow = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(
      new Intl.DateTimeFormat('en-US', { timeZone: place.timezone, weekday: 'short' }).format(when),
    );

    rows.push({
      link_id: link.id,
      user_id: userId,
      domain_id: link.domain_id,
      event_type: 'redirect',
      created_at: when.toISOString(),

      country: place.country,
      region: place.region,
      region_code: place.region_code,
      city: place.city,
      postal_code: gpc ? null : place.postal_code,
      continent: place.continent,
      latitude: gpc ? null : place.latitude,
      longitude: gpc ? null : place.longitude,
      timezone: place.timezone,
      is_eu: place.is_eu ?? false,

      asn: network.asn,
      as_org: network.as_org,
      colo: network.colo,
      network_type: network.network_type,
      tcp_rtt_ms:
        network.network_type === 'mobile'
          ? 40 + Math.floor(Math.random() * 90)
          : 8 + Math.floor(Math.random() * 40),
      http_protocol: Math.random() < 0.6 ? 'HTTP/3' : 'HTTP/2',
      tls_version: 'TLSv1.3',

      device_type: device.device_type,
      device_vendor: device.device_vendor ?? null,
      device_model: device.device_model ?? null,
      os_name: device.os_name ?? null,
      os_version: device.os_version ?? null,
      browser_name: device.browser_name ?? null,
      browser_version: device.browser_version ?? null,
      ua_raw: null,

      language: lang.language,
      languages: lang.languages,

      ...acquisition,
      utm_term: null,
      utm_content: null,

      local_hour: Number.isFinite(localHour) ? localHour : null,
      local_dow: localDow >= 0 ? localDow : null,

      // Bots and privacy-signalling scans carry no visitor hash, exactly as the
      // real pipeline produces them.
      visitor_hash: isBot || gpc ? null : visitors[Math.floor(Math.random() * visitors.length)],
      is_first_scan: null,
      is_bot: Boolean(device.is_bot),
      bot_reason: device.bot_reason ?? null,
      gpc,
    });
  }

  rows.sort((a, b) => a.created_at.localeCompare(b.created_at));

  let written = 0;
  for (let i = 0; i < rows.length; i += 500) {
    const chunk = rows.slice(i, i + 500);
    const res = await rest('/scan_events', {
      method: 'POST',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify(chunk),
    });
    if (!res.ok) throw new Error(`insert failed: ${res.status} ${(await res.text()).slice(0, 300)}`);
    written += chunk.length;
    process.stdout.write(`\r  ${written}/${rows.length}`);
  }

  console.log(`\nseeded ${written} synthetic scan events across ${links.length} links for ${email}`);
}

main().catch((err) => {
  console.error('SEED FAILED:', err.message);
  process.exit(1);
});
