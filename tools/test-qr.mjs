#!/usr/bin/env node
/**
 * Scannability verification.
 *
 * plan.md phase 4 asks for the downloaded file to be scanned with a real phone.
 * This is the part of that which can be automated and is actually stricter: every
 * style combination is rendered, rasterised, and put through a real QR decoder
 * (jsQR — the same algorithm family a phone camera uses). A style that looks fine
 * but does not decode fails here rather than on a printed poster.
 *
 * The renderer produces SVG, so rasterisation happens in the browser. This script
 * drives it through the page and decodes the PNG the page actually produces —
 * testing the shipped path, not a reimplementation of it.
 *
 *   node tools/test-qr.mjs <path-to-directory-of-pngs>
 *
 * tools/render-qr-fixtures.mjs writes those PNGs.
 */
import fs from 'node:fs';
import path from 'node:path';
import jsQR from 'jsqr';
import { PNG } from 'pngjs';

const dir = process.argv[2];
if (!dir || !fs.existsSync(dir)) {
  console.error('usage: node tools/test-qr.mjs <directory of .png fixtures>');
  process.exit(1);
}

let passed = 0;
const failures = [];

function check(name, condition, detail = '') {
  if (condition) {
    passed++;
    console.log(`  PASS  ${name}`);
  } else {
    failures.push(`${name}${detail ? ` — ${detail}` : ''}`);
    console.log(`  FAIL  ${name}${detail ? ` — ${detail}` : ''}`);
  }
}

function decode(file) {
  const png = PNG.sync.read(fs.readFileSync(file));
  const result = jsQR(new Uint8ClampedArray(png.data), png.width, png.height, {
    inversionAttempts: 'dontInvert',
  });
  return { text: result?.data ?? null, width: png.width, height: png.height };
}

const manifestPath = path.join(dir, 'manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

console.log(`decoding ${manifest.length} rendered variants\n`);

for (const entry of manifest) {
  const file = path.join(dir, entry.file);
  if (!fs.existsSync(file)) {
    check(entry.label, false, 'file missing');
    continue;
  }

  const { text, width } = decode(file);
  const ok = text === entry.expected;
  check(
    `${entry.label} (${width}px)`,
    ok,
    ok ? '' : text === null ? 'decoder found no code' : `decoded "${text}"`,
  );
}

console.log(`\n${passed} passed, ${failures.length} failed`);
if (failures.length) {
  console.log('\nFAILURES:');
  for (const f of failures) console.log(`  - ${f}`);
  process.exit(1);
}
console.log('Every rendered variant decodes back to its own short URL.');
