/**
 * ASN / organisation → network type.
 *
 * `cf.asOrganization` gives the literal name of the network the scan came from —
 * "Reliance Jio Infocomm", "Comcast Cable", "Amazon.com". Paid link-shortener
 * tiers rarely surface this at all, and it is the single most interesting field
 * in the whole dataset: it separates someone scanning a poster on mobile data
 * from someone opening the link on office wifi from a datacentre making an
 * automated fetch.
 *
 * **This classification is a heuristic over a name string.** It is not a lookup
 * against an authoritative registry, because no free one exists that can be
 * queried per request. It is confident about datacentres and major carriers,
 * reasonable about consumer ISPs, and returns `unknown` rather than guessing.
 * The dashboard has to say so — see context.md on limitations being first-class.
 */
import type { NetworkType } from '../types';

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();

/**
 * Hosting and cloud providers. A scan from one of these is almost never a
 * person holding a phone, so it also feeds bot detection.
 */
const DATACENTER = [
  'amazon', 'aws', 'ec2', 'google llc', 'google cloud', 'gcp', 'microsoft', 'azure',
  'digitalocean', 'linode', 'akamai', 'vultr', 'choopa', 'ovh', 'hetzner', 'contabo',
  'leaseweb', 'scaleway', 'online sas', 'upcloud', 'oracle', 'alibaba', 'aliyun',
  'tencent', 'huawei cloud', 'ibm cloud', 'softlayer', 'rackspace', 'godaddy',
  'hostinger', 'namecheap', 'bluehost', 'hostgator', 'dreamhost', 'siteground',
  'cloudflare', 'fastly', 'stackpath', 'bunny', 'm247', 'datacamp', 'datapacket',
  'packethub', 'zenlayer', 'psychz', 'quadranet', 'colocrossing', 'hivelocity',
  'servers com', 'serverius', 'worldstream', 'i3d', 'nforce', 'flokinet',
  'hosting', 'hostedby', 'datacenter', 'data center', 'colocation', 'vps',
  'dedicated server', 'cloud services', 'cdn',
];

/**
 * Mobile carriers. Deliberately weighted toward the markets this project is most
 * likely to be demonstrated in, then the largest global operators.
 */
const MOBILE = [
  // India
  'reliance jio', 'jio', 'bharti airtel', 'airtel', 'vodafone idea', 'vi india',
  'bsnl mobile', 'cellular one',
  // North America
  't mobile', 'tmobile', 'metropcs', 'verizon wireless', 'cellco partnership',
  'at t mobility', 'att mobility', 'sprint', 'us cellular', 'cricket wireless',
  'rogers', 'bell mobility', 'telus mobility', 'freedom mobile',
  // Europe
  'vodafone', 'orange', 'telefonica moviles', 'movistar', 'o2', 'ee limited',
  'three', 'tele2', 'telenor', 'telia', 'swisscom mobile', 'wind tre', 'iliad',
  'free mobile', 'play', 'a1 telekom', 'proximus',
  // rest of world
  'china mobile', 'china unicom', 'china telecom', 'ntt docomo', 'kddi', 'softbank',
  'sk telecom', 'kt corp', 'lg uplus', 'singtel', 'telkomsel', 'xl axiata', 'indosat',
  'globe telecom', 'smart communications', 'true move', 'ais', 'dtac', 'viettel',
  'vinaphone', 'mobifone', 'mtn', 'safaricom', 'vodacom', 'etisalat', 'stc',
  'zain', 'ooredoo', 'turkcell', 'turk telekom', 'claro', 'tim celular', 'oi movel',
  'telcel', 'entel', 'optus', 'telstra',
  // generic
  'wireless', 'mobile network', 'cellular', 'gsm',
];

/** Consumer fixed-line providers. */
const BROADBAND = [
  'comcast', 'xfinity', 'charter', 'spectrum', 'cox communications', 'centurylink',
  'lumen', 'frontier communications', 'windstream', 'mediacom', 'wow internet',
  'altice', 'optimum', 'rcn', 'shaw', 'videotron', 'cogeco',
  'british telecom', 'bt group', 'virgin media', 'sky broadband', 'talktalk',
  'plusnet', 'deutsche telekom', 'vodafone kabel', 'unitymedia', '1 1 telecom',
  'telefonica de espana', 'orange espagne', 'telecom italia', 'fastweb',
  'kpn', 'ziggo', 'proximus', 'telenet', 'free sas', 'sfr', 'bouygues',
  'act fibernet', 'atria convergence', 'hathway', 'excitel', 'tikona', 'railtel',
  'bsnl', 'mtnl', 'you broadband', 'den networks',
  'nbn', 'chorus', 'spark new zealand',
  'fibre', 'fiber', 'broadband', 'cable', 'dsl', 'fttx', 'ftth', 'isp',
  'internet service', 'communications', 'telecom', 'telekom', 'net ltd',
];

/** Networks belonging to an organisation rather than sold to consumers. */
const CORPORATE = [
  'university', 'universit', 'college', 'school district', 'academy', 'institute of technology',
  'research', 'laborator', 'hospital', 'health system', 'medical cent',
  'government', 'ministry', 'department of', 'municipal', 'city of', 'county of',
  'state of', 'federal', 'defence', 'defense', 'army', 'navy',
  'bank', 'insurance', 'holdings', 'corporation', 'incorporated', 'gmbh', 'ag',
  'enterprise', 'consulting', 'solutions ltd', 'technologies inc', 'systems inc',
];

function matches(name: string, list: string[]): string | null {
  for (const needle of list) {
    if (name.includes(needle)) return needle;
  }
  return null;
}

export interface NetworkClassification {
  network_type: NetworkType;
  /** Which term in which list matched, so a wrong answer is debuggable. */
  matched: string | null;
  /** Datacentre origin is a strong bot signal, surfaced separately. */
  isDatacenter: boolean;
}

export function classifyNetwork(
  asOrganization: string | null,
  _asn: number | null = null,
): NetworkClassification {
  if (!asOrganization) {
    return { network_type: 'unknown', matched: null, isDatacenter: false };
  }

  const name = norm(asOrganization);

  // Order matters. Datacentre first: "Amazon Data Services" also contains
  // "services", and a hosting provider is never a consumer connection.
  const dc = matches(name, DATACENTER);
  if (dc) return { network_type: 'datacenter', matched: dc, isDatacenter: true };

  // Mobile before broadband: "Vodafone" alone is mobile, but "Vodafone Kabel
  // Deutschland" is fixed-line, which is why the broadband list carries the more
  // specific string and is checked for an exact-er match first.
  const bbSpecific = matches(name, BROADBAND.filter((t) => t.includes(' ')));
  const mob = matches(name, MOBILE);
  if (mob && !(bbSpecific && bbSpecific.length > mob.length)) {
    return { network_type: 'mobile', matched: mob, isDatacenter: false };
  }

  const bb = bbSpecific ?? matches(name, BROADBAND);
  if (bb) return { network_type: 'broadband', matched: bb, isDatacenter: false };

  const corp = matches(name, CORPORATE);
  if (corp) return { network_type: 'corporate', matched: corp, isDatacenter: false };

  // No signal. Saying "unknown" is the honest answer; defaulting to broadband
  // would inflate a number the dashboard presents as a finding.
  return { network_type: 'unknown', matched: null, isDatacenter: false };
}
