/**
 * User-agent parsing.
 *
 * The asymmetry that has to be surfaced in the UI rather than hidden: Android
 * browsers usually put the real device model in the user agent
 * ("SM-S911B", "Pixel 8 Pro"), and iOS reports only "iPhone" or "iPad" — Apple
 * removed the model years ago. So a device-model chart will look like Android
 * users have phones and iOS users do not. That is a property of the data, not a
 * bug, and context.md commits to saying so.
 */
// ua-parser-js 1.x is MIT and exports the parser as its default. Version 2 moved
// to a named export and to an AGPL/commercial licence, so this is pinned to 1.x
// deliberately rather than by neglect.
import UAParser from 'ua-parser-js';
import type { DeviceType } from '../types';

export interface DeviceFields {
  device_type: DeviceType;
  device_vendor: string | null;
  device_model: string | null;
  os_name: string | null;
  os_version: string | null;
  browser_name: string | null;
  browser_version: string | null;
  ua_raw: string | null;
}

const nullable = (v: string | undefined): string | null =>
  typeof v === 'string' && v.trim() !== '' ? v.trim().slice(0, 120) : null;

export function parseUserAgent(userAgent: string | null, isBot = false): DeviceFields {
  if (!userAgent || userAgent.trim() === '') {
    return {
      device_type: isBot ? 'bot' : 'unknown',
      device_vendor: null,
      device_model: null,
      os_name: null,
      os_version: null,
      browser_name: null,
      browser_version: null,
      ua_raw: null,
    };
  }

  const parsed = new UAParser(userAgent).getResult();

  return {
    device_type: deviceType(parsed.device.type, parsed.os.name, isBot),
    device_vendor: nullable(parsed.device.vendor),
    device_model: nullable(parsed.device.model),
    os_name: nullable(parsed.os.name),
    os_version: nullable(parsed.os.version),
    browser_name: nullable(parsed.browser.name),
    browser_version: nullable(parsed.browser.version),
    // Kept because a UA string is the only way to work out later why a device
    // was misclassified. Dropped for GPC requests — see analytics.ts.
    ua_raw: userAgent.slice(0, 512),
  };
}

function deviceType(
  parsedType: string | undefined,
  osName: string | undefined,
  isBot: boolean,
): DeviceType {
  if (isBot) return 'bot';

  switch (parsedType) {
    case 'mobile':
      return 'mobile';
    case 'tablet':
      return 'tablet';
    case 'console':
    case 'smarttv':
    case 'wearable':
    case 'embedded':
      // Real but rare. Folding them into "unknown" rather than inventing
      // categories nobody will look at.
      return 'unknown';
    default:
      break;
  }

  // ua-parser only sets device.type when it is confident. A desktop browser
  // leaves it undefined, so a desktop OS is the signal.
  if (osName && /windows|mac ?os|linux|ubuntu|fedora|debian|chrome ?os|freebsd/i.test(osName)) {
    return 'desktop';
  }
  if (osName && /android|ios|harmony|kaios/i.test(osName)) {
    return 'mobile';
  }

  return 'unknown';
}

/**
 * Ordered language preferences from Accept-Language. The first entry is the one
 * worth charting; the full list is kept because it distinguishes a genuinely
 * multilingual audience from a browser default.
 */
export function parseLanguages(header: string | null): {
  language: string | null;
  languages: string[] | null;
} {
  if (!header) return { language: null, languages: null };

  const tags = header
    .split(',')
    .map((part) => {
      const [tag, ...params] = part.trim().split(';');
      const q = params.find((p) => p.trim().startsWith('q='));
      const quality = q ? Number(q.split('=')[1]) : 1;
      return { tag: (tag ?? '').trim(), quality: Number.isFinite(quality) ? quality : 0 };
    })
    .filter((t) => t.tag !== '' && t.tag !== '*')
    .sort((a, b) => b.quality - a.quality)
    .map((t) => t.tag.slice(0, 20));

  if (tags.length === 0) return { language: null, languages: null };
  return { language: tags[0]!, languages: tags.slice(0, 10) };
}

/**
 * UTM parameters and referrer.
 *
 * A camera scan carries no referrer, a forwarded link usually does — so the
 * absence of one is itself the "was this actually scanned off a poster" signal.
 */
export function parseAcquisition(url: URL, referrer: string | null) {
  const q = url.searchParams;
  const utm = (key: string) => {
    const v = q.get(key);
    return v && v.trim() !== '' ? v.trim().slice(0, 200) : null;
  };

  let referrerHost: string | null = null;
  if (referrer) {
    try {
      referrerHost = new URL(referrer).hostname || null;
    } catch {
      referrerHost = null;
    }
  }

  return {
    referrer: referrer ? referrer.slice(0, 512) : null,
    referrer_host: referrerHost,
    utm_source: utm('utm_source'),
    utm_medium: utm('utm_medium'),
    utm_campaign: utm('utm_campaign'),
    utm_term: utm('utm_term'),
    utm_content: utm('utm_content'),
  };
}
