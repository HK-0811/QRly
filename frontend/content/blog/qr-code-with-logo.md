---
title: QR code with logo — how to add one for free without breaking the scan
description: A logo in a QR code works by spending error correction. How much you can spend at each level, where the logo must never sit, and how to check it scans from print.
date: 2026-09-19
category: design
keywords: qr code with logo, qr code with logo free, add logo to qr code, qr code logo generator, logo qr code, custom qr code with logo, branded qr code, qr code error correction
---

A QR code with a logo in the middle is a code with a hole in it. The logo covers modules, those modules are gone, and the phone reads the code anyway. That is not a trick of the logo tool. It is error correction doing the job it was designed for, and once you understand what it is paying for, the rules for logos stop being folklore and become arithmetic.

## Why a logo works at all

Every QR code carries redundant data. The encoder splits the payload into codewords and adds Reed-Solomon parity codewords alongside them; the decoder uses the parity to reconstruct codewords it could not read. How much it can reconstruct depends on the error-correction level chosen when the code was made:

| Level | Codewords recoverable |
|---|---|
| L | about 7% |
| M | about 15% |
| Q | about 25% |
| H | about 30% |

The intended use is damage: a scuffed sticker, a fold through a flyer, glare across one corner. A logo is deliberate damage, placed in advance. Everything the logo covers is spent from the same budget that would otherwise absorb the scuff, so a code with a logo has less tolerance left for the real world than the same code without one. The full mechanism is in [how QR error correction works](/blog/qr-code-error-correction-explained).

Two things make the budget smaller than the percentages suggest.

First, the percentages are of codewords, not of area. A codeword is eight modules, and a logo in the centre destroys whole codewords in a block rather than scattering damage evenly, so it burns through a block's parity faster than a scattered scuff would.

Second, some of the budget must stay in reserve. A code that decodes on a screen with exactly zero spare capacity fails on the first print with a slight ink spread or a camera at a bad angle. A design tool that lets you push the logo to the theoretical limit is letting you ship a code that will fail somewhere you cannot see.

## How big the logo can be

QRly caps the logo width as a fraction of the symbol width, by error-correction level:

| Level | Max logo width (QRly) | Share of the symbol area |
|---|---|---|
| L | 14% | about 2% |
| M | 18% | about 3% |
| Q | 24% | about 6% |
| H | 30% | about 9% |

Width squared gives area, which is why a 30% logo at H only covers around 9% of the modules and leaves the rest of the 30% budget for the print. These caps are deliberately conservative. The studio tells you when a logo exceeds them, and the scannability read-out drops as you approach them, so you are never guessing.

In practice this means: if you want a logo, use **level H**. Choosing H makes the code itself a little denser (more modules for the same content), but a dynamic short link like `qrly.lol/abc12` is short enough that the version stays small anyway. That is one of the underrated reasons [short URLs make better QR codes](/blog/why-short-urls-make-better-qr-codes).

## Where the logo must not go

The centre of the code is the only safe place. Three regions must stay untouched:

- **The three finder patterns** in the corners. These are the concentric squares the camera locates first. Cover any part of one and the phone will not even find the code, let alone decode it. Error correction cannot help here because the decoder never gets far enough to use it.
- **The timing patterns**, the alternating rows of dark and light modules running between the finders along the top and left. The decoder uses them to work out the module grid.
- **The format information** around the finders, which tells the decoder which error-correction level and mask pattern were used. Lose it and the decoder does not know how to read the rest.

Alignment patterns (the smaller squares inside larger codes) matter less but are also best left alone. A centred logo that stays inside the width cap misses all of these automatically, which is why every serious tool puts the logo there and not in a corner.

## Preparing the logo file

Use the simplest version of the mark you have. A wordmark with thin letters at 30% of a 3 cm code is illegible; the symbol or monogram is what belongs in a QR code.

- **PNG or SVG**, under 200 KB. SVG scales cleanly if you later export the whole code as SVG for print.
- **Give it a backing plate.** A solid area of the background colour behind and slightly larger than the logo, so no module touches the logo's edge. Modules that half-overlap a logo become half-modules, and half-modules are what confuse a decoder. QRly clears a plate behind the logo for you; if you are compositing by hand in a design tool, draw one.
- **Keep the logo visually distinct from the modules.** A black logo on a black-module code is fine for the decoder but reads as noise to a human. A coloured logo, or a logo with a white plate, reads as intentional.
- **Do not make the logo transparent over the modules.** A logo that shows modules through it produces exactly the half-module problem above.

## Adding the logo in QRly

1. [Make a code](/create) by pasting the destination URL. The code encodes a short link, so the destination can change later without touching the print.
2. Open the QR studio and set error correction to **H**.
3. Upload the logo. The studio caps its width at 30% of the symbol for H (lower for the other levels) and warns if the file pushes past that.
4. Watch the scannability read-out. If it has dropped, reduce the logo before you touch anything else.
5. Export **SVG** for print, or **PNG** at 1024 or 2048 px for anything that will not take SVG. The choice is covered in [SVG versus PNG for QR codes](/blog/qr-code-file-formats-svg-png).

There is no watermark on either format and no account is needed to download. Signing up afterwards lets you keep the code and edit its destination from the dashboard.

## Test from print, not from the screen

A logo code that scans from your monitor tells you almost nothing. The monitor is backlit, perfectly flat and perfectly sharp. Paper is none of those things, and the logo has already eaten part of the margin that would have covered the difference.

Print the code at the size it will really be used, on the stock it will really be on, and scan it with an iPhone and an Android from the distance a reader will actually stand. Try it under the room's lighting and at a slight angle. If it hesitates, shrink the logo or remove it; do not try to rescue it by making the whole code bigger, because the same fraction of it is still missing. The full routine is in [how to test a QR code before printing](/blog/test-a-qr-code-before-printing).

Colour is the other variable that interacts with logos. A dark brand colour for the modules and the logo in its true colours is the usual combination; the limits are in [custom QR code colours](/blog/custom-qr-code-colours), and the wider set of constraints in [QR code design rules that still scan](/blog/qr-code-design-rules-that-still-scan).

## Frequently asked

**Can I add a logo to a QR code for free?**
Yes. QRly's studio embeds a PNG or SVG logo, caps its size to what the chosen error-correction level can survive, and exports SVG or PNG without a watermark. No account is needed to make and download the code.

**How big can the logo be?**
It depends on the error-correction level. At level H, which recovers about 30% of codewords, QRly allows a logo up to 30% of the symbol's width, which covers roughly 9% of the modules. At L the cap is 14% of the width. Larger than that and there is no margin left for print damage.

**Does a logo make the QR code harder to scan?**
Slightly, always, because it spends error correction that would otherwise cover scuffs, glare and cheap printing. Within the caps above and with the finder patterns untouched, the difference is not something a reader will notice. Beyond them, it is.

**Can the logo go in a corner instead of the centre?**
Not safely. The corners hold the finder patterns, and covering any part of one stops the phone from locating the code at all. The centre is the only region a logo can sit in without touching structural modules.

**Why does my logo code scan on screen but not on the flyer?**
The screen is a best case. Print adds ink spread, texture and uneven light, and a logo has already used the tolerance that would have absorbed those. Reduce the logo size, confirm the quiet zone survived the layout, and test again from the actual print.
