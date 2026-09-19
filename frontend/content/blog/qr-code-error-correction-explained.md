---
title: QR code error correction explained, and what L, M, Q and H actually buy you
description: The four QR code error correction levels recover 7, 15, 25 or 30 percent of damage. Here is what each one costs in code size and how it limits a logo.
date: 2026-09-19
category: basics
keywords: qr code error correction, qr code error correction level, qr code levels l m q h, reed solomon qr code, qr code with logo error correction, qr code damage tolerance, qr code ecc
---

A QR code can be scratched, smudged, partly covered by a logo or missing a corner of its data and still decode correctly. That is not luck. A fixed share of every code is redundancy, and the level of redundancy is a choice you make when the code is generated. Most generators bury the choice in an advanced panel. It is worth understanding, because it decides how big the code is, how much of it a logo can cover, and how it behaves on a wet menu.

## The four levels

The QR specification (ISO/IEC 18004) defines four error correction levels. Each one reserves a different proportion of the code for recovery data and can rebuild roughly that proportion of the codewords if they are damaged or unreadable.

| Level | Approximate recovery | Typical use |
|---|---|---|
| L (Low) | 7% | Clean digital display, nothing over the code |
| M (Medium) | 15% | The usual default for print |
| Q (Quartile) | 25% | Outdoor, packaging, small logo |
| H (High) | 30% | Large logo, harsh environment |

The percentages are of codewords, the 8-bit units the code is built from, not of pixels. A scratch that clips the edge of several modules can wreck several codewords at once, so a real-world "30 percent of the area" is not recoverable at H. Think of the figure as a ceiling under ideal conditions, and design well inside it.

The recovery scheme is Reed-Solomon coding, the same family used on CDs. The scanner reads what it can, works out which codewords are wrong, and reconstructs them from the parity data. A code either decodes fully or not at all; damage never produces a code that opens the wrong link.

## What error correction costs

Redundancy takes space. The data you encode is fixed, so raising the level means a bigger code, in one of two ways: a higher version (more modules on each side), or, if the version stays the same, fewer spare modules for the data.

Here is the byte capacity of the four smallest versions, which is where every short link lands:

| Version | Modules | L | M | Q | H |
|---|---|---|---|---|---|
| 1 | 21 x 21 | 17 | 14 | 11 | 7 |
| 2 | 25 x 25 | 32 | 26 | 20 | 14 |
| 3 | 29 x 29 | 53 | 42 | 32 | 24 |
| 4 | 33 x 33 | 78 | 62 | 46 | 34 |

Take a short link of 23 characters, such as `https://qrly.lol/summer`. At L or M it fits version 2, a 25-module code. At Q or H it needs version 3, 29 modules.

The practical consequence: **at a fixed printed size, a higher level means smaller modules.** A 29-module code printed at 2 cm has modules about 0.7 mm wide; a 25-module code at the same size has them about 0.8 mm wide. Smaller modules are harder for a camera to resolve, so error correction that is meant to make a code more robust can, at small sizes, make it less so. That is the trade-off behind "always use H".

Two things reduce the cost. Short links keep the payload small; a [long URL with tracking parameters](/blog/why-short-urls-make-better-qr-codes) forces a version 5 or 6 code before the level is even considered. And lowercase URLs use byte mode; there is a denser alphanumeric mode but it only handles uppercase letters, digits and a few symbols, so it rarely applies to a web address. The [versions and capacity guide](/blog/qr-code-versions-and-capacity) covers the full table.

## Which level to choose

Picking is mostly a matter of what will happen to the code after it leaves your screen.

**L** is for a code that lives on a screen, is displayed large, and has nothing drawn over it. On print it leaves too little margin for a scuffed surface.

**M** is the sensible default for most printed codes. It survives ordinary wear, tolerates a slightly soft print, and keeps the code small. If you are not embedding a logo and the code is going on paper, use M.

**Q** is for codes that will be handled: packaging, outdoor signage, table cards, anything laminated that will be wiped. It is also the lowest level that supports a logo of noticeable size.

**H** is for a logo large enough to be recognisable, or for surfaces that will be abused. It carries the biggest size penalty, so pair it with a short link and give the printed code room.

QRly's studio exposes all four as one control. If you are unsure, print a test at M and Q, scuff both, and scan them with an older phone.

## How error correction limits a logo

A logo in the centre of a QR code is not a special feature of the format. It is deliberate damage. The generator draws over some modules, the scanner cannot read them, and error correction fills them in. That means the logo can never be larger than the level can recover, minus a safety margin for the damage the real world adds afterwards.

The safety margin matters. If a logo already consumes the full 30 percent that H allows, a fingerprint on the code pushes it over the edge and it stops scanning. The logo must leave room for the wear the level was chosen for in the first place.

QRly enforces this rather than trusting the user to. The maximum logo **width**, as a share of the code's width, is capped by the level in use:

| Level | Max logo width | Approximate area covered |
|---|---|---|
| L | 14% | about 2% |
| M | 18% | about 3% |
| Q | 24% | about 6% |
| H | 30% | about 9% |

Width, not area, because that is how a logo is sized in the studio and how people think about it. Squaring the width gives the area, and the areas sit well below the recovery figures on purpose. A centred logo does not damage codewords cleanly; it clips whole rows of modules, and the modules around a logo's edge are often half-covered by anti-aliasing, so the effective damage is larger than the logo's footprint. The caps leave room for that and for a thumbprint.

If you raise the logo size and then lower the level, the studio shrinks the logo to the new cap. The scannability read-out beside the preview says so. It is the same logic as the [design rules that still scan](/blog/qr-code-design-rules-that-still-scan): there is no setting that makes a code unscannable without the tool telling you.

Two more points about logos, since they are the main reason people go looking for error correction. Put the logo in the centre; the three large finder squares in the corners and the timing lines between them are not protected by error correction, and covering them stops the code being found at all. And give the logo a small solid background, so the modules under it are cleanly gone rather than half-visible; a scanner that sees half a module guesses, and its guess is what error correction then has to fix. The [logo guide](/blog/qr-code-with-logo) goes through the design side.

## What error correction does not fix

It is worth being clear about the limits, because error correction gets credited for things it cannot do.

- **A missing quiet zone.** The blank border tells the scanner where the code ends. Cropping it is not damage to the data; it is damage to the scanner's ability to locate the code. No level recovers from it. The [quiet zone](/blog/qr-code-quiet-zone) needs to be four modules on every side.
- **Damaged finder patterns.** The corner squares are located by their shape before any decoding starts. A logo or a fold across one of them defeats the code regardless of level.
- **Low contrast.** If the camera cannot distinguish dark from light, every module is uncertain, not 7 or 30 percent of them.
- **Modules too small to resolve.** Blur affects the whole code uniformly. Error correction rebuilds specific wrong codewords; it cannot rebuild a code that is uniformly fuzzy.
- **A dead link.** The code decodes perfectly and lands on a page that no longer exists. On a [dynamic code](/blog/what-is-a-dynamic-qr-code) that is a one-line edit; on a static one it is a reprint.

Error correction is insurance against localised damage to a code that is otherwise well made. Use M for plain print, Q or H when there is a logo or a hard life ahead, keep the link short so the size penalty stays small, and test on paper.

## Frequently asked

**What is the best error correction level for a QR code?**
M for a plain printed code. Q or H if there is a logo or the code will be handled outdoors. L only for large codes on a screen. There is no universally best level, because a higher level makes the code bigger or its modules smaller.

**Does higher error correction make a QR code bigger?**
Yes, for the same content. Either the version goes up, adding four modules to each side, or the code is already at the limit of a version and the next level pushes it over. Short links keep the increase small.

**How much of a QR code can be covered by a logo?**
Less than the level's recovery figure, with a margin. QRly caps the logo width at 14, 18, 24 or 30 percent of the code for L, M, Q and H, which covers roughly 2 to 9 percent of the area, leaving room for wear.

**Can error correction fix a QR code with no quiet zone?**
No. The quiet zone is how the scanner finds the code. Error correction only operates after the code has been located and read, so a missing border fails before it gets a chance to help.
