/**
 * Scan event enrichment and insertion (architecture.md §9).
 *
 * Everything in this module runs inside `ctx.waitUntil()`, after the 302 has
 * already been sent. A scan is never blocked by telemetry, and a failure here is
 * swallowed: the person got where they were going, which is the only thing that
 * actually mattered.
 */
import type { CachedLink } from '../types';
import type { Env } from '../env';
import { insert } from './supabase';
import { extractGeo, extractNetwork, localTime, type CfGeo } from './geo';
import { classifyNetwork } from './asn';
import { detectBot } from './bot';
import { parseAcquisition, parseLanguages, parseUserAgent } from './ua';
import { clientIp, getDailySalt, visitorHash } from './hash';
import { log } from './log';

/**
 * Global Privacy Control, and the older Do Not Track.
 *
 * Honouring this is not a checkbox. A `Sec-GPC: 1` request gets recorded, but
 * with nothing that could link it to any other request: no visitor hash, so no
 * unique-visitor attribution and no first-versus-returning; no precise geography;
 * and no raw user-agent string. What remains is a count with a country and a
 * device class, which is aggregate by construction.
 *
 * The visible consequence is that unique-visitor totals under-count by however
 * many people send the signal, and the dashboard has to say so rather than
 * quietly closing the gap.
 */
export function privacySignal(request: Request): boolean {
  return request.headers.get('Sec-GPC') === '1' || request.headers.get('DNT') === '1';
}

export interface ScanContext {
  request: Request;
  env: Env;
  link: CachedLink;
  hostname: string;
  now?: Date;
}

/** Builds the row without touching the network, so it is directly testable. */
export async function buildScanEvent(ctx: ScanContext): Promise<Record<string, unknown>> {
  const { request, env, link } = ctx;
  const now = ctx.now ?? new Date();
  const url = new URL(request.url);
  const cf = (request as Request & { cf?: CfGeo }).cf;

  const gpc = privacySignal(request);

  const geo = extractGeo(cf);
  const network = extractNetwork(cf);
  const classification = classifyNetwork(network.as_org, network.asn);

  const userAgent = request.headers.get('User-Agent');
  const bot = detectBot({
    userAgent,
    secFetchDest: request.headers.get('Sec-Fetch-Dest'),
    secFetchMode: request.headers.get('Sec-Fetch-Mode'),
    purpose: request.headers.get('Purpose'),
    secPurpose: request.headers.get('Sec-Purpose'),
    isDatacenter: classification.isDatacenter,
  });

  const device = parseUserAgent(userAgent, bot.is_bot);
  const languages = parseLanguages(request.headers.get('Accept-Language'));
  const acquisition = parseAcquisition(url, request.headers.get('Referer'));
  const { local_hour, local_dow } = localTime(geo.timezone, now);

  // The raw IP lives only in this scope, only as hash input, and is never
  // written to the row or to a log.
  let hash: string | null = null;
  if (!gpc) {
    const ip = clientIp(request);
    if (ip) {
      const salt = await getDailySalt(env);
      if (salt) {
        hash = await visitorHash(salt, env.VISITOR_HASH_PEPPER, ip, userAgent ?? '', link.id);
      }
    }
  }

  return {
    link_id: link.id,
    user_id: link.user_id,
    domain_id: link.domain_id,
    qr_id: link.qr_id,
    event_type: 'redirect',
    created_at: now.toISOString(),

    ...geo,
    // Precise geography is the part of this row that most resembles a location,
    // so it is what a privacy signal removes.
    ...(gpc ? { postal_code: null, latitude: null, longitude: null } : {}),

    ...network,
    network_type: classification.network_type,

    ...device,
    ...(gpc ? { ua_raw: null } : {}),

    ...languages,
    ...acquisition,

    local_hour,
    local_dow,

    visitor_hash: hash,
    // Left null on purpose. A BEFORE INSERT trigger resolves it inside the same
    // statement, which avoids a read-before-write round trip from the Worker and
    // is race-free in a way a read-then-insert is not.
    is_first_scan: null,
    is_bot: bot.is_bot,
    bot_reason: bot.bot_reason,
    gpc,
  };
}

/**
 * Enrich and store one scan. Called only from `ctx.waitUntil()`.
 *
 * Never throws. If Supabase is down the event is lost, which is the documented
 * trade in architecture.md §12: redirects survive the failure of everything
 * except Cloudflare, and analytics are the thing given up to make that true.
 */
export async function recordScan(ctx: ScanContext): Promise<void> {
  try {
    const row = await buildScanEvent(ctx);
    await insert(ctx.env, 'scan_events', row, { returning: false });
  } catch (err) {
    // Swallowed on purpose. The 302 has already been sent; a scan is never
    // blocked by telemetry, and losing the event is the documented trade in
    // architecture.md §12.
    log.warn({
      event: 'scan_event_insert_failed',
      link_id: ctx.link.id,
      error: err instanceof Error ? err : String(err),
    });
  }
}
