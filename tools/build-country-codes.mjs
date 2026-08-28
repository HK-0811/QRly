#!/usr/bin/env node
/**
 * Builds the numeric-id -> ISO alpha-2 map the choropleth needs.
 *
 * The world-atlas topology keys countries by ISO 3166-1 *numeric* id, and
 * Cloudflare reports *alpha-2*. Most of the mapping falls out of matching the
 * topology's country name against Intl.DisplayNames; the exceptions below are the
 * ones where Natural Earth's naming differs from CLDR's. Generated once and
 * committed, so the dashboard needs no network access and no API key.
 *
 *   node tools/build-country-codes.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const TOPO = path.join(ROOT, 'frontend', 'public', 'geo', 'countries-110m.json');
const OUT = path.join(ROOT, 'frontend', 'public', 'geo', 'country-codes.json');

/** Natural Earth spellings that CLDR does not use. */
const EXCEPTIONS = {
  'W. Sahara': 'EH',
  'United States of America': 'US',
  'Dem. Rep. Congo': 'CD',
  'Dominican Rep.': 'DO',
  'Falkland Is.': 'FK',
  'Fr. S. Antarctic Lands': 'TF',
  "Côte d'Ivoire": 'CI',
  'Central African Rep.': 'CF',
  Congo: 'CG',
  'Eq. Guinea': 'GQ',
  Palestine: 'PS',
  Myanmar: 'MM',
  Turkey: 'TR',
  'Solomon Is.': 'SB',
  'Bosnia and Herz.': 'BA',
  Macedonia: 'MK',
  'Trinidad and Tobago': 'TT',
  'S. Sudan': 'SS',
  // Deliberately absent: "N. Cyprus" and "Somaliland" are drawn by Natural Earth
  // but have no ISO 3166-1 code, so no IP database will ever report them.
};

const topo = JSON.parse(fs.readFileSync(TOPO, 'utf8'));
const dn = new Intl.DisplayNames(['en'], { type: 'region' });

/**
 * Withdrawn and reserved alpha-2 codes that CLDR still resolves to a current
 * country's name. Without this list, "DD" (East Germany) claims "Germany" and
 * "UK" claims "United Kingdom" — and since both sort before their canonical code,
 * whichever wins is an accident of iteration order. The first run of this script
 * mapped the United Kingdom to "UK", so no scan from GB ever coloured the map.
 */
const WITHDRAWN = new Set([
  'AN', 'BU', 'CS', 'CT', 'DD', 'DY', 'FQ', 'FX', 'HV', 'JT', 'MI', 'NH', 'NQ',
  'NT', 'PC', 'PU', 'PZ', 'RH', 'SU', 'TP', 'UK', 'VD', 'WK', 'YD', 'YU', 'ZR',
  // Reserved, not countries
  'EU', 'EZ', 'UN', 'AC', 'CP', 'DG', 'EA', 'IC', 'TA', 'QO', 'XA', 'XB', 'ZZ',
]);

const byName = new Map();
for (let a = 65; a <= 90; a++) {
  for (let b = 65; b <= 90; b++) {
    const code = String.fromCharCode(a) + String.fromCharCode(b);
    if (WITHDRAWN.has(code)) continue;
    const name = dn.of(code);
    if (!name || name === code) continue;
    const key = name.toLowerCase();
    if (!byName.has(key)) byName.set(key, code);
  }
}

const map = {};
const unmatched = [];

for (const g of topo.objects.countries.geometries) {
  const name = String(g.properties?.name ?? '');
  const code = EXCEPTIONS[name] ?? byName.get(name.toLowerCase());
  if (code && g.id) map[String(g.id)] = code;
  else if (!EXCEPTIONS[name] && !(name in EXCEPTIONS)) unmatched.push(`${name} (id ${g.id})`);
}

fs.writeFileSync(OUT, JSON.stringify(map));

// Spot-check the codes most likely to be wrong: alias collisions, abbreviated
// Natural Earth spellings, and the ones this project's own data uses.
// Keys are the topology's own ids, which are zero-padded three-character strings.
const EXPECT = {
  '826': 'GB', '840': 'US', '356': 'IN', '276': 'DE', '784': 'AE', '036': 'AU',
  '250': 'FR', '392': 'JP', '156': 'CN', '076': 'BR', '710': 'ZA', '643': 'RU',
  '484': 'MX', '124': 'CA', '380': 'IT', '724': 'ES', '566': 'NG', '818': 'EG',
};
const wrong = Object.entries(EXPECT).filter(([id, code]) => map[id] !== code);
if (wrong.length) {
  console.error('MAPPING IS WRONG for:', wrong.map(([id, want]) => `${id} expected ${want}, got ${map[id]}`).join('; '));
  process.exit(1);
}

console.log(`mapped ${Object.keys(map).length} of ${topo.objects.countries.geometries.length} country shapes`);
console.log(`spot-checked ${Object.keys(EXPECT).length} codes, all correct`);
if (unmatched.length) console.log('unmapped (expected for non-ISO territories):', unmatched.join(', '));
