/**
 * QR rendering, entirely client-side.
 *
 * No server round trip and no stored image: the code is derived from the short
 * URL, so storing a rendered PNG would be storing something we can always
 * recompute. That is what keeps this free — the object storage line item in every
 * competitor's pricing page does not exist here.
 *
 * The renderer draws the matrix itself rather than using a styling library,
 * because the styling decisions that matter are the ones that affect whether the
 * thing still scans: how much the finder patterns can be altered, how large a
 * logo can be for a given error-correction level, and how wide the quiet zone is.
 * Those are spelled out here rather than buried in a dependency.
 */
import qrcode from 'qrcode-generator';
import type { QrStyle } from '@/lib/types';

export type EccLevel = 'L' | 'M' | 'Q' | 'H';

export const DEFAULT_STYLE: QrStyle = {
  fgColor: '#101317',
  bgColor: '#ffffff',
  moduleShape: 'square',
  eyeShape: 'square',
  errorCorrection: 'M',
  logoDataUrl: null,
  logoSizeRatio: 0.2,
  margin: 4,
};

/**
 * Proportion of the symbol each level can lose and still decode. A logo covers
 * modules, so the logo budget is derived from this rather than guessed.
 */
export const ECC_RECOVERY: Record<EccLevel, number> = { L: 0.07, M: 0.15, Q: 0.25, H: 0.3 };

/**
 * Largest logo we will draw for a given level, as a fraction of the symbol's
 * width. Area scales with the square of this, so 0.25 width is ~6% of area —
 * comfortably inside even L's budget, while 0.3 at H is ~9%.
 *
 * These are well below the theoretical maximum on purpose. The recovery budget
 * also has to absorb print quality, camera angle, glare and a crumpled poster,
 * and a code that only scans under ideal conditions is a code that fails in the
 * one place it was printed for.
 */
export const MAX_LOGO_RATIO: Record<EccLevel, number> = { L: 0.14, M: 0.18, Q: 0.24, H: 0.3 };

/** The quiet zone the QR specification requires. Anything less risks a no-read. */
export const MIN_MARGIN_MODULES = 4;

/**
 * Radius of a dot module, in module units. Tangent to its neighbours at 0.5.
 *
 * Measured rather than chosen. At 0.45 the gap between neighbouring dots was
 * enough that decoders failed on anything rendered above roughly 256px, and every
 * value below 0.5 failed at some render size in tools/test-qr.mjs.
 */
export const DOT_RADIUS = 0.5;

export interface Matrix {
  size: number;
  get(row: number, col: number): boolean;
}

export function buildMatrix(value: string, ecc: EccLevel): Matrix {
  // typeNumber 0 lets the library pick the smallest version that fits.
  const qr = qrcode(0, ecc);
  qr.addData(value);
  qr.make();
  const size = qr.getModuleCount();
  return { size, get: (r, c) => qr.isDark(r, c) };
}

// ---------------------------------------------------------------------------
// Geometry
// ---------------------------------------------------------------------------

const FINDER_SIZE = 7;

/**
 * Centre coordinates of the alignment patterns, per QR version (ISO/IEC 18004
 * annex E). Version 1 has none; every later version places a 5x5 pattern at each
 * combination of these coordinates except the three that would sit on a finder.
 *
 * The table lives here because qrcode-generator does not export it, and the
 * renderer needs to know where the alignment patterns are: a decoder uses them to
 * correct for camera angle, and drawing them as separated dots is precisely what
 * stopped the dot style from scanning above about 256px.
 */
const ALIGNMENT_POSITIONS: number[][] = [
  [], [], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34],
  [6, 22, 38], [6, 24, 42], [6, 26, 46], [6, 28, 50], [6, 30, 54], [6, 32, 58], [6, 34, 62],
  [6, 26, 46, 66], [6, 26, 48, 70], [6, 26, 50, 74], [6, 30, 54, 78], [6, 30, 56, 82],
  [6, 30, 58, 86], [6, 34, 62, 90],
  [6, 28, 50, 72, 94], [6, 26, 50, 74, 98], [6, 30, 54, 78, 102], [6, 28, 54, 80, 106],
  [6, 32, 58, 84, 110], [6, 30, 58, 86, 114], [6, 34, 62, 90, 118],
  [6, 26, 50, 74, 98, 122], [6, 30, 54, 78, 102, 126], [6, 26, 52, 78, 104, 130],
  [6, 30, 56, 82, 108, 134], [6, 34, 60, 86, 112, 138], [6, 30, 58, 86, 114, 142],
  [6, 34, 62, 90, 118, 146],
  [6, 30, 54, 78, 102, 126, 150], [6, 24, 50, 76, 102, 128, 154], [6, 28, 54, 80, 106, 132, 158],
  [6, 32, 58, 84, 110, 136, 162], [6, 26, 54, 82, 110, 138, 166], [6, 30, 58, 86, 114, 142, 170],
];

/** Centres of every alignment pattern in a symbol of this module count. */
export function alignmentCentres(size: number): Array<[number, number]> {
  const coords = ALIGNMENT_POSITIONS[(size - 17) / 4] ?? [];
  if (coords.length === 0) return [];
  const first = coords[0]!;
  const last = coords[coords.length - 1]!;
  const out: Array<[number, number]> = [];

  for (const r of coords) {
    for (const c of coords) {
      // Skip the three positions that would overlap a finder pattern.
      if ((r === first && c === first) || (r === first && c === last) || (r === last && c === first)) {
        continue;
      }
      out.push([r, c]);
    }
  }
  return out;
}

function inAlignment(row: number, col: number, centres: Array<[number, number]>): boolean {
  for (const [r, c] of centres) {
    if (row >= r - 2 && row <= r + 2 && col >= c - 2 && col <= c + 2) return true;
  }
  return false;
}

/**
 * The timing patterns: the alternating single-module lines in row 6 and column 6
 * that tell a decoder where the module grid falls.
 */
function inTiming(row: number, col: number): boolean {
  return row === 6 || col === 6;
}

/** True for the three finder patterns, which are drawn as whole shapes. */
function inFinder(row: number, col: number, size: number): boolean {
  const topLeft = row < FINDER_SIZE && col < FINDER_SIZE;
  const topRight = row < FINDER_SIZE && col >= size - FINDER_SIZE;
  const bottomLeft = row >= size - FINDER_SIZE && col < FINDER_SIZE;
  return topLeft || topRight || bottomLeft;
}

/** Modules a centred logo will cover, so they can be cleared behind it. */
function logoBox(size: number, ratio: number) {
  const span = Math.max(1, Math.round(size * ratio));
  const start = Math.floor((size - span) / 2);
  return { start, end: start + span - 1, span };
}

// ---------------------------------------------------------------------------
// SVG
// ---------------------------------------------------------------------------

function escapeAttr(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
}

function roundedModulePath(
  x: number,
  y: number,
  n: (dr: number, dc: number) => boolean,
): string {
  // A corner is rounded only when both of its adjacent neighbours are empty, so
  // runs of modules fuse into a single rounded shape instead of a string of
  // separate pills.
  const r = 0.42;
  const tl = !n(-1, 0) && !n(0, -1) ? r : 0;
  const tr = !n(-1, 0) && !n(0, 1) ? r : 0;
  const br = !n(1, 0) && !n(0, 1) ? r : 0;
  const bl = !n(1, 0) && !n(0, -1) ? r : 0;

  return (
    `M${x + tl},${y}` +
    `H${x + 1 - tr}` +
    (tr ? `A${r},${r} 0 0 1 ${x + 1},${y + tr}` : '') +
    `V${y + 1 - br}` +
    (br ? `A${r},${r} 0 0 1 ${x + 1 - br},${y + 1}` : '') +
    `H${x + bl}` +
    (bl ? `A${r},${r} 0 0 1 ${x},${y + 1 - bl}` : '') +
    `V${y + tl}` +
    (tl ? `A${r},${r} 0 0 1 ${x + tl},${y}` : '')
  );
}

function finderSvg(
  originRow: number,
  originCol: number,
  shape: QrStyle['eyeShape'],
  fg: string,
  bg: string,
): string {
  const x = originCol;
  const y = originRow;

  // The finder pattern is a 7×7 ring, a 5×5 gap, and a 3×3 centre. Drawn as
  // whole shapes rather than module-by-module: a decoder locates these by their
  // 1:1:3:1:1 ratio, and rendering them as loose dots is the single most common
  // way a "styled" QR code stops scanning.
  const ringWidth = 1;

  if (shape === 'circle') {
    return (
      `<circle cx="${x + 3.5}" cy="${y + 3.5}" r="${3.5 - ringWidth / 2}" fill="none" ` +
      `stroke="${escapeAttr(fg)}" stroke-width="${ringWidth}"/>` +
      `<circle cx="${x + 3.5}" cy="${y + 3.5}" r="1.5" fill="${escapeAttr(fg)}"/>`
    );
  }

  const outerR = shape === 'rounded' ? 1.8 : 0;
  const innerR = shape === 'rounded' ? 0.7 : 0;

  return (
    `<rect x="${x}" y="${y}" width="7" height="7" rx="${outerR}" fill="${escapeAttr(fg)}"/>` +
    `<rect x="${x + 1}" y="${y + 1}" width="5" height="5" rx="${outerR * 0.6}" fill="${escapeAttr(bg)}"/>` +
    `<rect x="${x + 2}" y="${y + 2}" width="3" height="3" rx="${innerR}" fill="${escapeAttr(fg)}"/>`
  );
}

export interface RenderOptions {
  value: string;
  style: QrStyle;
}

export function renderSvg({ value, style }: RenderOptions): string {
  const ecc = style.errorCorrection;
  const matrix = buildMatrix(value, ecc);
  const margin = Math.max(MIN_MARGIN_MODULES, style.margin);
  const total = matrix.size + margin * 2;

  const hasLogo = Boolean(style.logoDataUrl);
  const ratio = hasLogo ? Math.min(style.logoSizeRatio, MAX_LOGO_RATIO[ecc]) : 0;
  const box = hasLogo ? logoBox(matrix.size, ratio) : null;

  const covered = (r: number, c: number) =>
    box !== null && r >= box.start && r <= box.end && c >= box.start && c <= box.end;

  const centres = alignmentCentres(matrix.size);

  /**
   * Structural modules are drawn solid regardless of the chosen module shape. A
   * decoder locates the symbol and corrects perspective using the finder,
   * alignment and timing patterns; rendering those as separated dots is what
   * makes a styled QR code stop scanning. The data modules carry the style, the
   * scaffolding does not.
   */
  const structural = (r: number, c: number) =>
    inFinder(r, c, matrix.size) || inAlignment(r, c, centres) || inTiming(r, c);

  const dark = (r: number, c: number) =>
    r >= 0 &&
    c >= 0 &&
    r < matrix.size &&
    c < matrix.size &&
    !inFinder(r, c, matrix.size) &&
    !covered(r, c) &&
    matrix.get(r, c);

  /** Data modules only: everything the style is allowed to reshape. */
  const styleable = (r: number, c: number) => dark(r, c) && !structural(r, c);

  const parts: string[] = [];

  if (style.moduleShape !== 'square') {
    const solid: string[] = [];
    for (let r = 0; r < matrix.size; r++) {
      for (let c = 0; c < matrix.size; c++) {
        if (!dark(r, c) || !structural(r, c)) continue;
        solid.push(`M${margin + c},${margin + r}h1v1h-1z`);
      }
    }
    if (solid.length) parts.push(`<path d="${solid.join('')}"/>`);
  }

  if (style.moduleShape === 'dots') {
    for (let r = 0; r < matrix.size; r++) {
      for (let c = 0; c < matrix.size; c++) {
        if (!styleable(r, c)) continue;
        parts.push(`<circle cx="${margin + c + 0.5}" cy="${margin + r + 0.5}" r="${DOT_RADIUS}"/>`);
      }
    }
  } else if (style.moduleShape === 'rounded') {
    const d: string[] = [];
    for (let r = 0; r < matrix.size; r++) {
      for (let c = 0; c < matrix.size; c++) {
        if (!styleable(r, c)) continue;
        d.push(roundedModulePath(margin + c, margin + r, (dr, dc) => dark(r + dr, c + dc)));
      }
    }
    if (d.length) parts.push(`<path d="${d.join('')}"/>`);
  } else {
    const d: string[] = [];
    for (let r = 0; r < matrix.size; r++) {
      let run = 0;
      for (let c = 0; c <= matrix.size; c++) {
        if (c < matrix.size && dark(r, c)) {
          run++;
        } else if (run > 0) {
          // Horizontal runs merged into one rect. Fewer nodes means a smaller
          // SVG and a faster rasterisation for the PNG export.
          d.push(`M${margin + c - run},${margin + r}h${run}v1h-${run}z`);
          run = 0;
        }
      }
    }
    if (d.length) parts.push(`<path d="${d.join('')}"/>`);
  }

  const finders =
    finderSvg(margin, margin, style.eyeShape, style.fgColor, style.bgColor) +
    finderSvg(margin, margin + matrix.size - 7, style.eyeShape, style.fgColor, style.bgColor) +
    finderSvg(margin + matrix.size - 7, margin, style.eyeShape, style.fgColor, style.bgColor);

  let logo = '';
  if (hasLogo && box) {
    const pad = 0.5;
    const x = margin + box.start - pad;
    const y = margin + box.start - pad;
    const w = box.span + pad * 2;
    // A background plate under the logo: without it a dark logo on dark modules
    // is unreadable, and a decoder has an easier time with a clean block than
    // with a logo alpha-blended over data.
    logo =
      `<rect x="${x}" y="${y}" width="${w}" height="${w}" rx="${w * 0.12}" fill="${escapeAttr(
        style.bgColor,
      )}"/>` +
      `<image x="${margin + box.start}" y="${margin + box.start}" width="${box.span}" ` +
      `height="${box.span}" preserveAspectRatio="xMidYMid meet" ` +
      `href="${escapeAttr(style.logoDataUrl!)}"/>`;
  }

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${total} ${total}" ` +
    `width="${total * 8}" height="${total * 8}" shape-rendering="crispEdges">` +
    `<rect width="${total}" height="${total}" fill="${escapeAttr(style.bgColor)}"/>` +
    `<g fill="${escapeAttr(style.fgColor)}">${parts.join('')}</g>` +
    finders +
    logo +
    `</svg>`
  );
}

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------

/**
 * Rasterise the SVG at an explicit pixel size. Going through an <img> with a
 * data: URI keeps one renderer rather than maintaining a separate canvas drawing
 * path that could drift from the SVG.
 */
export async function svgToPngBlob(svg: string, pixels: number): Promise<Blob> {
  const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

  const img = new Image();
  img.decoding = 'sync';
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('Could not rasterise the QR code.'));
    img.src = url;
  });

  const canvas = document.createElement('canvas');
  canvas.width = pixels;
  canvas.height = pixels;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas is unavailable in this browser.');

  // Nearest-neighbour: a QR code is a grid of hard edges, and smoothing them
  // softens the module boundaries a decoder relies on.
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(img, 0, 0, pixels, pixels);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('PNG export failed.'))), 'image/png');
  });
}

export function download(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Revoking immediately can cancel the download in some browsers.
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

// ---------------------------------------------------------------------------
// Advice shown in the UI
// ---------------------------------------------------------------------------

export interface Advice {
  level: 'ok' | 'warn';
  text: string;
}

/**
 * Everything here is a real scannability constraint, not decoration. A styled QR
 * code that does not scan is worse than an ugly one that does, and the person
 * choosing the style has no way to know where the limits are.
 */
export function styleAdvice(style: QrStyle, value: string): Advice[] {
  const out: Advice[] = [];
  const ecc = style.errorCorrection;

  if (style.logoDataUrl) {
    if (ecc === 'L' || ecc === 'M') {
      out.push({
        level: 'warn',
        text: `A logo covers data modules. At level ${ecc} there is only ${Math.round(
          ECC_RECOVERY[ecc] * 100,
        )}% recovery to absorb that plus print wear — use Q or H when you add a logo.`,
      });
    }
    if (style.logoSizeRatio > MAX_LOGO_RATIO[ecc]) {
      out.push({
        level: 'warn',
        text: `The logo is capped at ${Math.round(
          MAX_LOGO_RATIO[ecc] * 100,
        )}% of the width at level ${ecc}. It is being drawn smaller than the slider shows.`,
      });
    }
  }

  const contrast = contrastRatio(style.fgColor, style.bgColor);
  if (contrast < 3) {
    out.push({
      level: 'warn',
      text: `Contrast between the two colours is ${contrast.toFixed(
        1,
      )}:1. Below about 3:1 most phone cameras fail in ordinary indoor light.`,
    });
  }

  if (isLighter(style.fgColor, style.bgColor)) {
    out.push({
      level: 'warn',
      text: 'The modules are lighter than the background. Some scanners assume dark-on-light and will not read an inverted code.',
    });
  }

  if (style.margin < MIN_MARGIN_MODULES) {
    out.push({
      level: 'warn',
      text: 'The quiet zone is below the 4-module minimum the QR specification requires.',
    });
  }

  const matrix = buildMatrix(value, ecc);
  out.push({
    level: 'ok',
    text: `${matrix.size}×${matrix.size} modules at level ${ecc} (${Math.round(
      ECC_RECOVERY[ecc] * 100,
    )}% of the symbol can be damaged and still decode).`,
  });

  return out;
}

function srgbToLinear(v: number) {
  const c = v / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string): number {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return 0;
  const n = parseInt(m[1]!, 16);
  const r = srgbToLinear((n >> 16) & 255);
  const g = srgbToLinear((n >> 8) & 255);
  const b = srgbToLinear(n & 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

function isLighter(fg: string, bg: string): boolean {
  return luminance(fg) > luminance(bg);
}
