/**
 * Bot and link-preview detection.
 *
 * The distinction that matters for a QR project: when someone shares a short link
 * in WhatsApp, Slack or iMessage, the messaging platform fetches it to build a
 * preview card. That fetch is a real event worth recording — it means the link
 * was shared — but counting it as a scan would inflate every headline number.
 *
 * So nothing is dropped. Everything is recorded with `is_bot` and a `bot_reason`,
 * and the dashboard excludes bots from headline metrics by default with a toggle
 * to include them (context.md §7).
 */

export interface BotVerdict {
  is_bot: boolean;
  /** Why, in a form specific enough to argue with. */
  bot_reason: string | null;
}

/**
 * Link preview fetchers. These are named individually rather than swept up by a
 * generic /bot/ match, because "this link was shared into WhatsApp 40 times" is a
 * genuinely useful finding and deserves to be distinguishable in the data.
 */
const PREVIEW_FETCHERS: Array<[RegExp, string]> = [
  [/WhatsApp/i, 'WhatsApp'],
  [/facebookexternalhit|facebookcatalog|meta-externalagent/i, 'Facebook'],
  // Telegram before Twitter: Telegram's real user agent is
  // "TelegramBot (like TwitterBot)", so the more specific pattern has to win or
  // every Telegram share is attributed to Twitter.
  [/TelegramBot/i, 'Telegram'],
  [/Twitterbot/i, 'Twitter/X'],
  [/LinkedInBot/i, 'LinkedIn'],
  [/Discordbot/i, 'Discord'],
  [/Slackbot|Slack-ImgProxy/i, 'Slack'],
  [/SkypeUriPreview/i, 'Skype'],
  [/redditbot/i, 'Reddit'],
  [/Pinterest/i, 'Pinterest'],
  [/vkShare/i, 'VK'],
  [/Mastodon|Pleroma|Akkoma/i, 'Mastodon'],
  [/Bluesky|bskylink/i, 'Bluesky'],
  [/Embedly|Iframely|quora link preview|Yahoo Link Preview/i, 'Link preview service'],
  [/Google-InspectionTool|GoogleOther/i, 'Google preview'],
  [/Apple-?Bot|Applebot/i, 'Apple'],
  [/Snapchat/i, 'Snapchat'],
  [/TikTok|Bytespider/i, 'TikTok'],
];

/** Search engines and general crawlers. */
const CRAWLERS: Array<[RegExp, string]> = [
  [/Googlebot/i, 'Googlebot'],
  [/bingbot|BingPreview|msnbot/i, 'Bingbot'],
  [/DuckDuckBot|DuckDuckGo/i, 'DuckDuckBot'],
  [/YandexBot/i, 'YandexBot'],
  [/Baiduspider/i, 'Baiduspider'],
  [/AhrefsBot|SemrushBot|MJ12bot|DotBot|PetalBot|DataForSeoBot/i, 'SEO crawler'],
  [/GPTBot|ChatGPT-User|CCBot|anthropic-ai|ClaudeBot|PerplexityBot|Amazonbot/i, 'AI crawler'],
  [/UptimeRobot|Pingdom|StatusCake|Site24x7|NewRelicPinger/i, 'Uptime monitor'],
];

/** Automated clients: scripts, scrapers, headless browsers. */
const AUTOMATION: Array<[RegExp, string]> = [
  [/HeadlessChrome|PhantomJS|Puppeteer|Playwright|Selenium|Electron/i, 'Headless browser'],
  [/curl|Wget|libwww|lwp-|HTTPie/i, 'Command-line client'],
  [/python-requests|python-urllib|aiohttp|httpx|scrapy/i, 'Python client'],
  [/Go-http-client/i, 'Go client'],
  [/Java\/|okhttp|Apache-HttpClient|Jakarta/i, 'Java client'],
  [/node-fetch|axios|got \(|undici/i, 'Node client'],
  [/PostmanRuntime|insomnia/i, 'API client'],
  [/^$|^-$/, 'Empty user agent'],
  // Deliberately last so a named crawler above wins and produces a better reason.
  [/bot\b|crawler|spider|scraper|crawling|slurp|feedfetcher|validator/i, 'Generic bot'],
];

export interface BotSignals {
  userAgent: string | null;
  /** Fetch metadata headers, when the client sends them. */
  secFetchMode?: string | null;
  secFetchDest?: string | null;
  purpose?: string | null;
  secPurpose?: string | null;
  /** From lib/asn.ts — a scan originating in a datacentre is not a phone camera. */
  isDatacenter?: boolean;
}

export function detectBot(signals: BotSignals): BotVerdict {
  const ua = signals.userAgent?.trim() ?? '';

  if (ua === '') {
    // Every real browser and every phone camera app sends a User-Agent. Its
    // absence is a stronger signal than most patterns.
    return { is_bot: true, bot_reason: 'No user agent' };
  }

  for (const [pattern, name] of PREVIEW_FETCHERS) {
    if (pattern.test(ua)) return { is_bot: true, bot_reason: `Link preview: ${name}` };
  }
  for (const [pattern, name] of CRAWLERS) {
    if (pattern.test(ua)) return { is_bot: true, bot_reason: `Crawler: ${name}` };
  }
  for (const [pattern, name] of AUTOMATION) {
    if (pattern.test(ua)) return { is_bot: true, bot_reason: `Automated: ${name}` };
  }

  // A prefetch is the browser speculatively loading a link the person has not
  // clicked. Counting it as a scan would mean hovering over a link registers as
  // visiting it.
  const purpose = (signals.secPurpose ?? signals.purpose ?? '').toLowerCase();
  if (purpose.includes('prefetch') || purpose.includes('preview')) {
    return { is_bot: true, bot_reason: 'Prefetch' };
  }

  // A top-level navigation is `Sec-Fetch-Dest: document`. Anything else reaching
  // a short link — an iframe, an <img> src, a background fetch — is not a scan.
  const dest = (signals.secFetchDest ?? '').toLowerCase();
  if (dest && dest !== 'document' && dest !== 'empty') {
    return { is_bot: true, bot_reason: `Non-navigation request (${dest})` };
  }

  if (signals.isDatacenter) {
    // Last, because it is the weakest: a corporate VPN or a privacy relay can
    // legitimately egress from a hosting ASN. Being last means a more specific
    // reason wins when one applies.
    return { is_bot: true, bot_reason: 'Datacentre network' };
  }

  return { is_bot: false, bot_reason: null };
}

/**
 * Whether the request looks like a camera scan rather than a link someone
 * tapped. A QR scanner opens the URL with no referrer; a forwarded link almost
 * always carries one. context.md §6 calls this out as a signal in its own right.
 */
export function looksLikeDirectScan(referrer: string | null): boolean {
  return referrer === null || referrer === '';
}
