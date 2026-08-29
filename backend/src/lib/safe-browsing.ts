/**
 * Google Safe Browsing lookups.
 *
 * A short-link service is infrastructure someone else can point at a phishing
 * page for free. This is the layer that stops it being useful for that.
 *
 * Two properties matter more than the API call itself:
 *
 *   1. **A flagged link keeps resolving**, to a warning page, never a 404. The
 *      printed QR code cannot be recalled, so the address has to keep saying
 *      something. See lib/pages.ts.
 *
 *   2. **A failed check never blocks link creation.** Safe Browsing is a
 *      third-party network call on a path that has to work when Google does not.
 *      An unreachable API leaves the link `unchecked`, and the weekly sweep
 *      resolves it.
 *
 * The API is free but requires a Google Cloud project. Without a key configured,
 * every function here reports `unchecked` rather than pretending to have looked.
 */
import type { Env } from '../env';
import type { SafeBrowsingStatus } from '../types';

const ENDPOINT = 'https://safebrowsing.googleapis.com/v4/threatMatches:find';

const THREAT_TYPES = [
  'MALWARE',
  'SOCIAL_ENGINEERING',
  'UNWANTED_SOFTWARE',
  'POTENTIALLY_HARMFUL_APPLICATION',
];

export interface SafeBrowsingResult {
  status: SafeBrowsingStatus;
  /** Which threat types matched, for the flagged case. */
  threats: string[];
  /** Why the answer is `unchecked`, when it is. */
  reason?: string;
}

const UNCHECKED = (reason: string): SafeBrowsingResult => ({
  status: 'unchecked',
  threats: [],
  reason,
});

/**
 * Check up to 500 URLs in one request. The API accepts a batch, and batching is
 * what makes the weekly re-check of every link affordable inside the free quota.
 */
export async function checkUrls(
  env: Env,
  urls: string[],
): Promise<Map<string, SafeBrowsingResult>> {
  const out = new Map<string, SafeBrowsingResult>();
  const unique = [...new Set(urls)].filter((u) => /^https?:/i.test(u));

  if (unique.length === 0) return out;

  if (!env.SAFE_BROWSING_API_KEY) {
    for (const u of unique) out.set(u, UNCHECKED('no API key configured'));
    return out;
  }

  // Default everything to clean, then mark the matches. The API only returns
  // threats, so absence of a match is the clean signal.
  for (const u of unique) out.set(u, { status: 'clean', threats: [] });

  try {
    const res = await fetch(`${ENDPOINT}?key=${encodeURIComponent(env.SAFE_BROWSING_API_KEY)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client: { clientId: 'qrly', clientVersion: '1.0.0' },
        threatInfo: {
          threatTypes: THREAT_TYPES,
          platformTypes: ['ANY_PLATFORM'],
          threatEntryTypes: ['URL'],
          threatEntries: unique.map((url) => ({ url })),
        },
      }),
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      const detail = `${res.status} ${res.statusText}`;
      for (const u of unique) out.set(u, UNCHECKED(`API returned ${detail}`));
      return out;
    }

    const body = (await res.json()) as {
      matches?: Array<{ threat?: { url?: string }; threatType?: string }>;
    };

    for (const match of body.matches ?? []) {
      const url = match.threat?.url;
      if (!url) continue;
      const existing = out.get(url) ?? { status: 'clean' as const, threats: [] };
      out.set(url, {
        status: 'flagged',
        threats: [...new Set([...existing.threats, match.threatType ?? 'UNKNOWN'])],
      });
    }

    return out;
  } catch (err) {
    // Timeout, DNS failure, or Google being down. Reporting `unchecked` is the
    // honest answer; failing the caller's request would make link creation depend
    // on a third party's uptime.
    const reason = err instanceof Error ? err.message : String(err);
    for (const u of unique) out.set(u, UNCHECKED(reason));
    return out;
  }
}

export async function checkUrl(env: Env, url: string): Promise<SafeBrowsingResult> {
  const results = await checkUrls(env, [url]);
  return results.get(url) ?? UNCHECKED('no result returned');
}
