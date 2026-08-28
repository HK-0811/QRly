/**
 * Geography and network fields from `request.cf` (context.md §6).
 *
 * Everything here arrives free with the request — Cloudflare has already done the
 * IP lookup at the edge. No third-party geo API, no per-lookup cost, no extra
 * latency. That is most of why the analytics in this project can be free.
 *
 * The honesty caveat that has to travel with this data: latitude and longitude
 * are the centroid of the city the IP database assigns, not a position. VPNs,
 * proxies, carrier-grade NAT on mobile networks and corporate egress routinely
 * resolve to the wrong city entirely.
 */

/** The subset of IncomingRequestCfProperties this project reads. */
export interface CfGeo {
  country?: string;
  region?: string;
  regionCode?: string;
  city?: string;
  postalCode?: string;
  continent?: string;
  latitude?: string;
  longitude?: string;
  timezone?: string;
  isEUCountry?: string;
  asn?: number;
  asOrganization?: string;
  colo?: string;
  httpProtocol?: string;
  tlsVersion?: string;
  clientTcpRtt?: number;
}

export interface GeoFields {
  country: string | null;
  region: string | null;
  region_code: string | null;
  city: string | null;
  postal_code: string | null;
  continent: string | null;
  latitude: number | null;
  longitude: number | null;
  timezone: string | null;
  is_eu: boolean | null;
}

export interface NetworkFields {
  asn: number | null;
  as_org: string | null;
  colo: string | null;
  tcp_rtt_ms: number | null;
  http_protocol: string | null;
  tls_version: string | null;
}

function str(v: unknown): string | null {
  return typeof v === 'string' && v.trim() !== '' ? v.trim() : null;
}

function num(v: unknown): number | null {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string') {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

export function extractGeo(cf: CfGeo | undefined): GeoFields {
  if (!cf) {
    // wrangler dev supplies little or no cf data. Returning nulls rather than
    // fabricating a location keeps local rows honestly empty instead of
    // silently seeding the dashboard with a fictional city.
    return {
      country: null,
      region: null,
      region_code: null,
      city: null,
      postal_code: null,
      continent: null,
      latitude: null,
      longitude: null,
      timezone: null,
      is_eu: null,
    };
  }

  return {
    country: str(cf.country),
    region: str(cf.region),
    region_code: str(cf.regionCode),
    city: str(cf.city),
    postal_code: str(cf.postalCode),
    continent: str(cf.continent),
    latitude: num(cf.latitude),
    longitude: num(cf.longitude),
    timezone: str(cf.timezone),
    // Cloudflare sends "1" or omits the field entirely.
    is_eu: cf.isEUCountry === undefined ? null : cf.isEUCountry === '1',
  };
}

export function extractNetwork(cf: CfGeo | undefined): NetworkFields {
  if (!cf) {
    return {
      asn: null,
      as_org: null,
      colo: null,
      tcp_rtt_ms: null,
      http_protocol: null,
      tls_version: null,
    };
  }

  const rtt = num(cf.clientTcpRtt);

  return {
    asn: num(cf.asn),
    as_org: str(cf.asOrganization),
    colo: str(cf.colo),
    // Round-trip time is occasionally reported as 0 or absurdly large on the
    // first packet of a connection. Both are measurement artefacts, not network
    // conditions, and storing them would poison the connection-quality chart.
    tcp_rtt_ms: rtt !== null && rtt > 0 && rtt < 10_000 ? Math.round(rtt) : null,
    http_protocol: str(cf.httpProtocol),
    tls_version: str(cf.tlsVersion),
  };
}

/**
 * Hour and weekday **in the scanner's own timezone**, from `cf.timezone`.
 *
 * This is the field most analytics products get wrong: they show the account
 * owner's timezone, so a campaign in Mumbai read from an office in London appears
 * to peak at 3am. Knowing that scans cluster around lunchtime *where the poster
 * is* is the useful fact.
 */
export function localTime(
  timezone: string | null,
  now: Date = new Date(),
): { local_hour: number | null; local_dow: number | null } {
  if (!timezone) return { local_hour: null, local_dow: null };

  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      hour12: false,
      weekday: 'short',
    }).formatToParts(now);

    const hourPart = parts.find((p) => p.type === 'hour')?.value;
    const weekdayPart = parts.find((p) => p.type === 'weekday')?.value;

    // hourCycle h23 still renders midnight as "24" in some ICU builds.
    const hour = hourPart === undefined ? null : Number(hourPart) % 24;
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dow = weekdayPart ? days.indexOf(weekdayPart) : -1;

    return {
      local_hour: hour !== null && Number.isFinite(hour) ? hour : null,
      local_dow: dow >= 0 ? dow : null,
    };
  } catch {
    // An unknown IANA zone throws. Not worth failing an analytics write over.
    return { local_hour: null, local_dow: null };
  }
}
