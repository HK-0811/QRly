---
title: QR code on a flyer or poster: size, placement and a free way to make one
description: How big a QR code needs to be on a flyer versus a poster, where to place it, why each placement should get its own code, and how to export a print-ready SVG for free.
date: 2026-09-19
category: use-cases
keywords: qr code on flyer, qr code poster, qr code for flyers free, qr code for poster, flyer qr code size, poster qr code generator, print qr code flyer, qr code for leaflet
---

A flyer is read in the hand at thirty centimetres. A poster is read on a wall from a metre or two, often through a window, often in bad light. The same code at the same size cannot serve both, and most of the codes that fail on posters failed for exactly that reason: they were sized for the flyer and pasted onto the poster.

## Size follows viewing distance

A phone camera needs each module — each little square — to cover a few pixels at the distance the photo is taken. The working rule is that the code's printed width should be about one tenth of the scanning distance. That rule does the arithmetic for you:

| Format | Typical scanning distance | Minimum code width | Comfortable |
|---|---|---|---|
| A6 or DL flyer, in the hand | 20 to 30 cm | 2 cm | 2.5 to 3 cm |
| A5 or A4 leaflet | 30 to 40 cm | 3 cm | 3.5 to 4 cm |
| A3 poster on a wall or notice board | 50 cm to 1 m | 5 cm | 8 to 10 cm |
| A2 or A1 poster, shop window, bus shelter | 1 to 2 m | 10 cm | 15 to 20 cm |
| Billboard, banner across a street | 5 m and up | 50 cm and up | Reconsider the plan |

Two things shift the numbers. First, the amount of data in the code. A short link like `qrly.lol/spring` makes a code with about 25 modules across; a long URL with tracking parameters can need 40 or more, and each module is then smaller at the same printed size. Using a short link is the single easiest way to make a poster code more readable. Second, error correction: higher levels add modules too. Level M is the right default for print; go higher only if you add a logo or the poster will be outdoors and weathered.

The [size guide](/blog/qr-code-size-guide) has the general table with module counts. For a poster, err large. Nobody has ever complained that a code was too easy to scan.

## Where on the page

The code should be where the eye lands after the headline and the offer, which on a portrait layout is the lower third, and it should not be in a corner where it gets cropped by a frame, a staple or a drawing pin.

Some placement rules that come from watching people scan:

- **On a poster, put it at chest to eye height.** A poster is often pinned high; a code at the top of an A1 sheet on a wall is scanned at an angle from below, and skew shrinks the effective size. If the poster's position is fixed, put the code low on the sheet.
- **Not behind glass if avoidable.** Shop window posters are scanned through reflections. A matte finish and a larger code compensate. If the window faces the sun, the code may be unscannable for part of the day regardless.
- **Away from the fold.** On a folded leaflet the code sits on one panel, entirely, with clear space around it.
- **With a reason.** "Scan for the full programme" or "Scan for 10% off" next to the code. A bare code is a puzzle; a labelled code is an offer. The text should say what happens, not "scan me".
- **With the URL written underneath**, in short form. `qrly.lol/spring` is what someone types when their camera is not working, and it is what a person with a print of the poster does at a desk. A custom ending makes this practical; a random one does not.

## One code per placement

This is the part most people skip, and it is the part that turns a flyer into a measurable channel.

If the same code is on the flyer, the A3 poster in the café and the A1 in the station, you will get one number at the end: total scans. You will not know whether the station poster was worth the site fee. If each placement has its own code, you get three numbers and a decision.

With a dynamic code that costs nothing extra. Make three short links at [/create](/create), all pointing at the same page, with endings you can tell apart: `qrly.lol/spring-flyer`, `qrly.lol/spring-cafe`, `qrly.lol/spring-station`. The dashboard then shows scans, unique visitors per day, hour and weekday, approximate city, and device for each. The [A/B testing post](/blog/qr-code-a-b-testing) goes further into comparing placements and designs and turning the numbers into next season's print budget.

If the destination is your own website and you run analytics there, add UTM parameters to the destination URL so the scans show up as a campaign there too. That is done on the destination, not in the code, so the code stays small.

Location is city-level from the IP address and mobile carriers mislocate, so use it to distinguish cities, not streets. Unique visitors are counted per day, so a commuter who scans on Monday and Thursday is two uniques.

## Print details that decide whether it scans

Most QR failures on print are one of five things, and all five are visible on a proof.

1. **Quiet zone.** A clear margin of at least four modules on every side, in the background colour. Designers crop it to make the code sit tight against a frame, and the code stops scanning on half of phones. QRly's studio will not export with less than four; the [quiet zone post](/blog/qr-code-quiet-zone) explains why the limit exists.
2. **Contrast.** Dark modules on a light background. Brand colours are fine if they are dark enough; a mid-tone orange on white is not.
3. **Not over a photo or a gradient.** The decoder needs a flat background. If the design has a full-bleed image, put the code in a white box with the quiet zone inside it.
4. **Vector file.** Send the printer an SVG. A PNG at 1024 px looks fine on screen and is soft at 15 cm on a poster; a PNG at 2048 px is acceptable for A4 and marginal above it. Every QRly code exports as SVG or as PNG at 512, 1024 or 2048 px, and the [format post](/blog/qr-code-file-formats-svg-png) says which to use where.
5. **Not stretched.** A code resized non-uniformly in a layout tool becomes rectangular modules and stops scanning. Lock the aspect ratio.

Then scan the proof. Paper, at final size, in the light it will hang in, with an iPhone and an Android. The [testing post](/blog/test-a-qr-code-before-printing) is a five-minute checklist. Do it before the run, not after.

## Free, with the thing to check

Searching *qr code for flyers free* brings up a lot of generators, and most of them are free in the sense of a trial. The failure mode is specific: the code encodes the vendor's short link, the free period ends, and the poster in the café now opens a page saying the link is deactivated.

Two ways to avoid it. A static code that encodes your URL directly depends on nobody, at the cost of not being editable or countable. Or a dynamic code from a generator whose free tier is not a trial. QRly is the second kind: no account is needed to make the code, there is no watermark on the SVG or PNG, the code does not expire, there is no scan cap, and the destination is editable from the dashboard after the posters are up, with changes live at every edge in under a minute. The whole thing runs on free infrastructure, and [the cost page](/cost) shows what that means next to the incumbents' published models. The [free generator post](/blog/free-qr-code-generator) covers how to tell the two kinds of free apart in ten seconds, by reading what the code contains.

Editable matters more for posters than people expect: the event gets postponed, the offer gets extended, the landing page moves, and the poster is already on the wall.

## Frequently asked

**How big should a QR code be on a flyer?**
At least 2 cm square on a hand-held flyer, 2.5 to 3 cm comfortably. On an A4 leaflet, 3 to 4 cm. Use a short link so the code has fewer modules and each one prints larger.

**How big should a QR code be on a poster?**
About a tenth of the distance it is scanned from: 8 to 10 cm on an A3 poster read from a metre, 15 to 20 cm on an A1 poster or a shop window. Place it at chest to eye height if you can.

**Can I use the same QR code on all my flyers and posters?**
You can, but you will not learn which placement worked. Make one short link per placement, all pointing at the same page, and compare the scans in the dashboard.

**What file format should I give the printer?**
SVG. It scales without loss to any size. Use PNG at 2048 px only if the printer cannot take SVG, and only for A4 or smaller.

**Is a free flyer QR code really free after printing?**
A static code is; it contains your URL. A dynamic code is free after printing only if the redirect stays free, which on QRly it does: no trial, no expiry, no scan cap. Check what the code contains before printing with any generator.
