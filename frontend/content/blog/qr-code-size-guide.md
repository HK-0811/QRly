---
title: How big should a QR code be? A size guide for print, signs and screens
description: Minimum QR code size, the scanning-distance rule of thumb, module size, and how to size a code for business cards, posters, signage and screens.
date: 2026-09-19
category: basics
keywords: qr code size, minimum qr code size, how big should a qr code be, qr code scanning distance, qr code module size, qr code size for print, qr code size for poster
---

The most common QR code sizing mistake is not making the code too small. It is making it the size that fits the layout, and then hoping. Size follows from two things you can actually measure: how far away the phone will be, and how many modules the code has. Everything else is a rule of thumb, and this guide says which ones are worth using.

## The distance rule of thumb

The one rule most people need: **the code should be about a tenth of the distance it will be scanned from.** A code read from one metre away wants to be around 10 cm across. From 30 cm, 3 cm. From ten metres, a metre.

Treat the rule as a starting point, not a specification. It comes from the way phone cameras resolve detail and it assumes a clean, low-version code with a proper quiet zone. It is generous for a small code with a short link and tight for a large code stuffed with a long URL. It also assumes the scanner is stationary; a code on the side of a bus is a different problem, and the honest answer for that one is "make it as large as the panel allows and do not expect much".

Some print guides use one to eight for outdoor and low-light work. There is nothing wrong with erring larger; the rule is a floor, not a target.

## Minimum QR code size

For close-range scanning, the smallest size that reliably works on a broad range of phones is about **2 cm by 2 cm** for the code itself, plus the quiet zone. Below that, some older or cheaper cameras cannot focus closely enough and the modules blur together.

That figure hides the real constraint, which is module size. A "module" is one of the small squares. A version 2 code is 25 modules across; a version 6 code is 41. At 2 cm, the version 2 code's modules are 0.8 mm wide and the version 6 code's are under 0.5 mm. The first scans; the second may not. So the minimum size is not a single number. It depends on how much is in the code.

Which is the argument for short links. A code that encodes `https://qrly.lol/abc123` is version 2 or 3 at ordinary error correction. A code that encodes a 90-character URL with tracking parameters is version 6 or higher, and at any given printed size its modules are half the width. The [reason short URLs make better codes](/blog/why-short-urls-make-better-qr-codes) is entirely this.

## Module size, and how to work it out

If you want to check a design rather than guess, do the arithmetic:

1. Count the modules along one edge of the code, including the corner squares. If you know the version instead, modules = 17 + 4 x version. Version 2 is 25, version 3 is 29, version 4 is 33.
2. Add 8 for the [quiet zone](/blog/qr-code-quiet-zone), four modules on each side.
3. Divide the total printed width (including the quiet zone) by that number.

A version 3 code printed at 3 cm including its margin: 29 + 8 = 37 modules, so each module is about 0.8 mm. That is comfortable.

As a working rule, keep modules at **0.5 mm or larger** on a good print process (offset, laser, a decent inkjet at 300 dpi), and **1 mm or larger** on anything soft: newsprint, fabric, engraving, vinyl cut, sandblasted glass, or any surface where ink spreads. At 300 dpi, 0.5 mm is about six printer dots per module, which is enough for a clean square. Below that, dot gain rounds the corners of every module and the code's contrast falls.

## A sizing table

Distances here are where a person actually holds their phone, which is not always where the designer imagines. People scan a poster from arm's length if they can reach it and from across a corridor if they cannot.

| Where the code goes | Typical scan distance | Code size (excluding quiet zone) |
|---|---|---|
| Business card, name badge | 15 to 25 cm | 2 to 2.5 cm |
| Flyer, leaflet, menu, receipt | 20 to 40 cm | 2.5 to 4 cm |
| Table tent, counter sign, product label | 30 to 60 cm | 3 to 6 cm |
| A4 poster, notice board | 50 cm to 1 m | 5 to 10 cm |
| A2 or A1 poster, shop window | 1 to 3 m | 10 to 30 cm |
| Banner, estate agent board, vehicle when parked | 3 to 6 m | 30 to 60 cm |
| Billboard, building wrap | 10 m and more | 1 m and more, and it is still a gamble |

For anything in the last two rows, the surface matters as much as the size. Glossy vinyl in sunlight produces glare that no size fixes. [Where to place a QR code](/blog/where-to-place-a-qr-code) covers the lighting and height side of this.

## Screens are different

On a screen the unit is pixels, not millimetres, and the thing that goes wrong is scaling rather than resolution.

A QR code rendered at 512 pixels and displayed at 256 CSS pixels on a phone is fine; the browser downsamples cleanly. The same code displayed at 300 pixels, a non-integer ratio, gets slightly uneven modules. It nearly always still scans, because the tolerance for that kind of error is high, but if you are placing a code in a layout you control, display the image at its native size or an exact fraction of it.

QRly exports PNG at 512, 1024 and 2048 pixels, and SVG. For a web page or an email, 512 is plenty. For a slide deck, use 1024 or the SVG so the code stays sharp when projected. The [file formats guide](/blog/qr-code-file-formats-svg-png) explains when each one applies.

A projected code follows the distance rule like any other. If the back row is eight metres from the screen, the code on the slide needs to be around 80 cm on the projected image, which on a two-metre-wide projection is a large chunk of the slide.

Television and digital signage add one more problem: the display is often not showing the pixels you sent. A 1080p panel showing a 4K signal, or a menu board with a cheap scaler, softens every edge. Make the code larger than you think and test on the actual screen.

## Things that change the answer

**Error correction level.** Raising from M to H can push the code up a version, adding four modules to each side. If you have chosen H for a logo, the printed size has to grow to keep the modules the same width. The [error correction guide](/blog/qr-code-error-correction-explained) has the capacity table.

**Logos and styling.** A logo removes modules the scanner would otherwise use, and rounded or dot-shaped modules have less dark area per module than squares. Neither changes the size arithmetic, but both eat into the margin, so a styled code should be sized towards the larger end of each range.

**The print process.** A code that is exactly right on an office laser printer can fail on the same layout from a commercial press, because the ink behaves differently. The short version is: get a proof and scan the proof.

**Colour and contrast.** Lower contrast is equivalent to a smaller code, from the camera's point of view. A dark grey code on a cream background needs to be larger than a black one on white.

## Before you commit to a size

Print it at the intended size on the intended stock, put it where it will live, and scan it from the far end of the realistic distance range with an iPhone and an Android. Then scan it in worse light than you expect. If both phones pick it up within a second or two, the size is right. If one hesitates, go up a size or shorten the link, which brings the version down.

The [pre-print testing guide](/blog/test-a-qr-code-before-printing) has the full checklist. It takes five minutes.

## Frequently asked

**What is the minimum size for a QR code?**
About 2 cm by 2 cm for a low-version code scanned at close range, plus a four-module quiet zone. The real limit is module size; keep modules at half a millimetre or more on a good print process, a millimetre on a soft one.

**How big should a QR code be on a poster?**
Divide the expected scanning distance by ten. An A2 poster read from a metre or two wants a code of 10 to 20 cm. If people can walk up to it, 10 cm is enough; if there is a barrier, go larger.

**Does the amount of data change the size a QR code needs to be?**
Yes. More data means more modules, and at the same printed size each module is smaller and harder to resolve. A short link keeps the code at version 2 or 3, which is why QRly encodes a short link rather than the destination URL.

**How big should a QR code be on a business card?**
Around 2 to 2.5 cm, with the quiet zone kept clear. A card is scanned from 15 to 25 cm, and a short-link code at that size has comfortably large modules.

**Can a QR code be too big?**
Practically, no. A very large code has to be fully in the frame, so someone standing too close to a billboard cannot scan it, but that is a distance problem rather than a size problem. Larger is always safer than smaller.
