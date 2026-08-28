#!/usr/bin/env node
/**
 * Renders every meaningful QR style combination to PNG so tools/test-qr.mjs can
 * put each one through a real decoder.
 *
 * It imports frontend/src/lib/qr.ts directly — the shipped renderer, not a copy —
 * using Node's type stripping, and rasterises the SVG with resvg. So what gets
 * decoded is the same SVG a user downloads.
 *
 *   node --experimental-strip-types tools/render-qr-fixtures.mjs [outdir]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { Resvg } from '@resvg/resvg-js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = process.argv[2] ?? path.join(ROOT, '.qr-fixtures');

const { renderSvg, DEFAULT_STYLE, MAX_LOGO_RATIO } = await import(
  pathToFileURL(path.join(ROOT, 'frontend', 'src', 'lib', 'qr.ts')).href
);

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

/** A small red square, so a logo actually covers modules rather than being invisible. */
const LOGO =
  'data:image/svg+xml;charset=utf-8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10">' +
      '<rect width="10" height="10" rx="2" fill="#d63b3b"/>' +
      '<circle cx="5" cy="5" r="2.2" fill="#fff"/></svg>',
  );

const SHORT = 'https://qr.example.com/Ab3xK9z';
// A custom slug plus UTM parameters, i.e. the longest realistic payload. Long
// content forces a higher QR version, and a denser grid is where dot and rounded
// module shapes start to fail.
const LONG = 'https://qr.example.com/spring-menu-2026-campaign?utm_source=poster&utm_medium=qr';

const variants = [];

function add(label, style, value = SHORT, pixels = 512) {
  variants.push({ label, style: { ...DEFAULT_STYLE, ...style }, value, pixels });
}

// baseline
add('default', {});

// module shapes at every error-correction level
for (const moduleShape of ['square', 'rounded', 'dots']) {
  for (const errorCorrection of ['L', 'M', 'Q', 'H']) {
    add(`${moduleShape} modules · ECC ${errorCorrection}`, { moduleShape, errorCorrection });
  }
}

// finder shapes — the highest-risk styling choice, since decoders locate a
// symbol by the finder pattern's 1:1:3:1:1 ratio
for (const eyeShape of ['square', 'rounded', 'circle']) {
  add(`${eyeShape} finders`, { eyeShape });
  add(`${eyeShape} finders + dots`, { eyeShape, moduleShape: 'dots' });
}

// colour
add('inverted-ish: navy on cream', { fgColor: '#10203f', bgColor: '#f7f2e4' });
add('brand green on white', { fgColor: '#0b7550', bgColor: '#ffffff' });

// quiet zone at the specification minimum
add('minimum quiet zone', { margin: 4 });
add('generous quiet zone', { margin: 8 });

// logos at the cap for each level — the case plan.md calls out explicitly
for (const errorCorrection of ['L', 'M', 'Q', 'H']) {
  add(`logo at cap · ECC ${errorCorrection}`, {
    errorCorrection,
    logoDataUrl: LOGO,
    logoSizeRatio: MAX_LOGO_ratio_for(errorCorrection),
  });
}
function MAX_LOGO_ratio_for(level) {
  return MAX_LOGO_RATIO[level];
}

// a logo requested far larger than the cap: the renderer must clamp it rather
// than producing an unscannable code
add('logo requested at 60% · ECC H', {
  errorCorrection: 'H',
  logoDataUrl: LOGO,
  logoSizeRatio: 0.6,
});

// logo plus the riskiest module and finder styling
add('logo + dots + ring finders · ECC H', {
  errorCorrection: 'H',
  moduleShape: 'dots',
  eyeShape: 'circle',
  logoDataUrl: LOGO,
  logoSizeRatio: MAX_LOGO_RATIO.H,
});

// long payload, dense grid
add('long URL · square', {}, LONG);
add('long URL · dots · ECC H', { moduleShape: 'dots', errorCorrection: 'H' }, LONG);
add('long URL · rounded + logo · ECC H', {
  moduleShape: 'rounded',
  errorCorrection: 'H',
  logoDataUrl: LOGO,
  logoSizeRatio: MAX_LOGO_RATIO.H,
}, LONG);

// small print sizes — a code on a business card, not a poster
add('small render · 256px', {}, SHORT, 256);
add('small render · dots · 256px', { moduleShape: 'dots' }, SHORT, 256);
add('large render · 2048px', {}, SHORT, 2048);

// Render-size sweep for the riskiest styling. The original dot-module failure was
// size-dependent: it decoded at 256px and failed at 512px, so a single render size
// would have shipped it.
for (const pixels of [180, 256, 384, 512, 768, 1024, 2048]) {
  add(`sweep · dots + ring finders + logo · ECC H`, {
    errorCorrection: 'H',
    moduleShape: 'dots',
    eyeShape: 'circle',
    logoDataUrl: LOGO,
    logoSizeRatio: MAX_LOGO_RATIO.H,
  }, LONG, pixels);
  add(`sweep · rounded + rounded finders`, { moduleShape: 'rounded', eyeShape: 'rounded' }, LONG, pixels);
}

const manifest = [];

for (const [i, v] of variants.entries()) {
  const svg = renderSvg({ value: v.value, style: v.style });
  const png = new Resvg(svg, {
    fitTo: { mode: 'width', value: v.pixels },
    // White behind any transparency, matching what a printer would do.
    background: '#ffffff',
  })
    .render()
    .asPng();

  const file = `${String(i).padStart(2, '0')}-${v.label.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.png`;
  fs.writeFileSync(path.join(OUT, file), png);
  manifest.push({ file, label: v.label, expected: v.value, pixels: v.pixels });
}

fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log(`rendered ${manifest.length} variants to ${OUT}`);
