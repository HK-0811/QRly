---
title: QR code design rules — eight ways to make a stylish code that still scans
description: Custom QR code design fails for a short list of reasons. The eight rules that keep a styled code readable, why each exists, and which ones a generator can enforce.
date: 2026-09-19
category: design
keywords: qr code design, custom qr code design, stylish qr code, qr code design rules, designer qr code, creative qr code, qr code design guidelines, branded qr code design
---

A QR code is a remarkably forgiving format. It survives colour, rounded modules, a logo in the middle and a certain amount of abuse in print. It stops being forgiving at very specific points, and a designer who knows where those points are can go a long way before hitting one. The eight rules below are those points, in the order they most often go wrong.

## 1. Leave the quiet zone alone

The specification asks for a blank border of four modules on every side, in the background colour. A module is one of the small squares that make up the code, so the border scales with the code: a 3 cm code with 25 modules across needs a border of about 5 mm.

The quiet zone is how the decoder finds the edges of the code. Crop it, or run a frame, caption or photo into it, and the outer ring of each finder pattern merges with whatever is next to it. This is the most common design failure by a wide margin, because layout tools make it so easy to nudge things closer. Frames and "scan me" labels go outside the zone, never inside. The detail is in [the QR code quiet zone](/blog/qr-code-quiet-zone).

## 2. Keep the contrast, and keep it the right way round

Decoders convert the image to greyscale and threshold it. Colour is fine; low brightness difference is not. Dark modules on a light background, with the foreground clearly darker in greyscale, is the whole rule.

Inverted codes (light on dark) fail on a share of phones that you will never hear from. Gradients that run from a dark tone to a light one put half the code on the wrong side of the threshold. Mid-tone backgrounds cost you contrast before the foreground has done anything. The table of colours that pass and fail is in [custom QR code colours](/blog/custom-qr-code-colours); if the layout is dark, the fix is a light plate behind the code, not a light code.

## 3. Do not touch the finder patterns

The three large concentric squares in the corners are what the camera looks for first. Their proportions along any line through the centre are 1:1:3:1:1 (dark, light, dark, light, dark), and the decoder scans for exactly that ratio. Nothing else in the code gets read until all three are found.

You can round their corners. You can make them ring-shaped, or use a round dot in the middle, because the ratio through the centre holds. You cannot cover one with a logo, replace one with an icon, colour one lighter than the others or skew one. Error correction does not apply here: a code with a broken finder pattern is not a damaged code, it is not a code.

## 4. A logo is paid for with error correction

Error correction lets the decoder rebuild codewords it could not read: about 7% at level L, 15% at M, 25% at Q and 30% at H. A logo in the centre spends that budget deliberately, and whatever it spends is no longer available for scuffs, glare and cheap printing.

The safe approach is level H and a logo no wider than 30% of the symbol, which covers about 9% of the area and leaves the rest of the budget for the real world. QRly's studio enforces those caps by level (14% of the width at L, 18% at M, 24% at Q, 30% at H) and warns when a logo passes them. The mechanics are in [how to add a logo to a QR code](/blog/qr-code-with-logo).

## 5. Module shapes have limits

Rounded modules are safe. Circular dots are safe at full size, where each dot touches its neighbours; any smaller and the gaps between dots start to look like light modules at larger print sizes. The decoder samples the centre of each grid cell, so what matters is that the centre of every dark cell is unambiguously dark and the pattern of runs the decoder relies on (timing patterns, finder ratios) is intact.

What does not work: modules shrunk to well under their cell, modules drawn as hollow outlines, modules replaced by icons or letters, and any treatment that makes adjacent dark modules read as separated when the decoder expects them to be a run. The trade-offs by shape are in [rounded and dot QR codes](/blog/rounded-and-dot-qr-codes).

## 6. Respect the minimum size

A QR code has to be large enough that each module is comfortably resolved by the camera at the distance it will be scanned from. A commonly used rule of thumb is that the code's width should be about a tenth of the scanning distance: 2 cm for something held in the hand, 10 cm or more for a poster read from a metre away. That is guidance, not a specification, but it errs in the right direction.

Fewer modules means bigger modules at the same print size. A code containing a long URL might be 37 or 41 modules across; one containing a short link like `qrly.lol/abc12` is 25 or 29. That is the practical reason to encode a short link rather than a full URL. Sizes by use, and the pixel arithmetic for print, are in [QR code print size and resolution](/blog/qr-code-print-size-and-resolution).

## 7. No distortion

A QR code is a square grid, and the decoder reconstructs that grid from the finder patterns and the timing patterns. Stretching it to fit a space, skewing it in perspective for a mock-up, wrapping it round a bottle or printing it on a heavily textured or stretchy surface all move modules away from where the grid says they should be.

Small perspective from a camera angle is corrected for; deliberate distortion in the artwork is not. Keep the code square. If it must go on a curve, keep it small relative to the curve so that the portion of the surface it occupies is nearly flat. Export SVG rather than PNG so that scaling in the layout is exact and does not introduce resampling blur.

## 8. Test on both phones, from print

iPhone and Android cameras use different decoders and disagree at the margins. One will read a marginal code that the other refuses, and the refusal is silent: the camera simply does not offer the link. Print the final artwork at final size on the stock it will actually use, then scan it with both, under the room's lighting, from the distance a reader will stand, at a slight angle.

Do this once with the design pushed as far as you intend to push it. If either phone hesitates, back off the last thing you changed. The full routine is in [how to test a QR code before printing](/blog/test-a-qr-code-before-printing).

## What a generator can enforce, and what it cannot

Some of these rules can be built into the tool and some cannot. QRly's studio holds a minimum quiet zone of four modules, caps the logo by error-correction level, offers module shapes (square, round, dots) and finder shapes (square, round, ring) that stay within rule 5, and reports a scannability score that drops as contrast weakens or the logo grows. That covers rules 1 to 5 as far as the exported file goes.

It cannot see what happens next. The layout tool that crops the margin, the printer that swaps the colour, the laminate that adds glare and the designer who stretches the code to fill a box are all downstream of the file. Rules 6, 7 and 8 belong to whoever handles the print.

One structural choice makes all of this cheaper: a dynamic code. Because a QRly code encodes a short link that redirects to the destination, the destination can be changed from the dashboard after the print exists. A design that has been tested and printed never needs regenerating because the URL moved. [Make one](/create) without an account, and sign up afterwards if you want to keep editing it.

> A styled code is a plain code with some of its tolerance spent on looks. Spend it on one or two things, not all eight.

## Frequently asked

**Can a QR code be stylish and still scan?**
Yes, within limits. Colour, rounded or dot modules, shaped finder patterns and a centre logo are all safe individually. Trouble starts when several are combined, when the quiet zone is cropped or when the contrast is weak. Test the final print on two phones.

**Which design rule is broken most often?**
The quiet zone. Layout tools make it easy to place a frame, caption or image against the edge of the code, and the code then fails on phones that need the margin to find the edges. Keep four blank modules on every side.

**Can I change the shape of the finder patterns?**
You can round them or use a ring or dot style as long as the dark-light-dark-light-dark ratio of 1:1:3:1:1 through their centre is preserved. You cannot replace them with a logo or icon, or cover part of one.

**How much of a QR code can be covered by a logo?**
At error-correction level H, a logo up to about 30% of the code's width, which is roughly 9% of its area. Lower levels allow less. Anything beyond that leaves no tolerance for print damage and lighting.

**Does the design change if the code is dynamic?**
Only for the better. A dynamic code encodes a short link, so it has fewer modules and larger ones at the same print size, and the destination can be edited without touching the printed design.
