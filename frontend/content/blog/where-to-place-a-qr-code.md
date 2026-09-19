---
title: Where to place a QR code on a poster, flyer or packaging so it gets scanned
description: QR code placement that gets scans: eye level, off the fold, out of the glare, next to a call to action that says what happens, and a separate link for each placement.
date: 2026-09-19
category: design
keywords: where to put a qr code, qr code placement, best place for qr code on poster, qr code on flyer, qr code on packaging, qr code call to action, qr code position
---

Most QR codes are placed last. The layout is finished, there is a gap in the bottom corner, and the code goes there. It is small because the gap was small, it has no caption because the caption did not fit, and it sits behind the glass of a noticeboard at knee height. It gets scanned by almost nobody, and the conclusion drawn is that QR codes do not work.

Placement is not decoration. A scan is a physical act: someone has to notice the code, decide it is worth the effort, get their phone out, point it, and hold still. Every placement decision either shortens that chain or breaks it.

## Eye level, and at the distance people actually stand

Phones are held between chest and eye height, at roughly arm's length. A code placed there is scanned with a natural gesture. A code at the bottom of a wall poster means crouching; a code at the top of a tall banner means holding the phone overhead and hoping.

Pair height with distance. A rule of thumb that holds up: a code scans comfortably from a distance of about ten times its width. If people will stand a metre from the poster, the code should be at least 100 mm wide. If it is in a shop window and the pavement is two metres away, 200 mm. The [size guide](/blog/qr-code-size-guide) has the full table.

For handheld items — flyers, menus, packaging, cards — distance is not the constraint, and a 20 to 25 mm code is comfortable. Below about 15 mm, codes become awkward to focus on and older phones struggle.

## Not on the fold, not on the curve, not on the edge

A code needs its grid intact. Anything that bends, cuts or hides part of it costs scans.

- **Folds.** A tri-fold leaflet folds twice; a code over either crease is creased for its whole life and often fails after the first fold. Put the code entirely within one panel, with the [quiet zone](/blog/qr-code-quiet-zone) also within it.
- **Curves.** Bottles, cans, tubes and cups curve the code away from the camera. Keep the code small relative to the circumference so the curvature across it is slight.
- **Edges and trims.** A code hard against the trim line loses its quiet zone to the guillotine. Keep it at least the quiet zone's width plus the printer's trim tolerance inside the edge.
- **Seams, spines and hands.** Nothing that crosses a physical join, and nothing where a thumb holds the menu or a price label goes on the pack.

## Out of the glare

Glass in front of a code is not itself a problem. Light reflecting off the glass is. A noticeboard opposite a window, a framed poster under a spotlight, a shop window in afternoon sun: all of them put a bright reflection somewhere on the surface, and if it lands on the code, the camera sees white.

Where you can, place the code where the reflection is not, which usually means lower on a window than the eye line of the sun, or off-axis from a spotlight. Where you cannot control the light, use matte laminate rather than gloss, print larger so a reflection covers a smaller fraction of the code, and use a higher error-correction level so the covered fraction can be reconstructed.

## Next to a call to action that says what happens

A bare code is a puzzle. A code with "Scan me" is a puzzle with a demand attached. A code with "Scan to see tonight's menu" is an offer, and offers get taken.

The caption should say, in a few words, what the reader gets and, ideally, how long it takes: "Scan for the full spec sheet", "Scan to book — 30 seconds", "Scan to leave a review". Put it directly adjacent to the code, in a size readable from the same distance as the code is scannable. Use the brand typeface; the caption is a stronger brand element than a logo inside the code, as the [branded QR code post](/blog/branded-qr-code) argues.

Do not promise something the destination does not deliver immediately. A "Scan for a discount" that lands on a newsletter form loses trust, and trust is what makes the next code get scanned.

Print the destination URL under the code if there is room, short and readable. It is the fallback for the person whose phone will not cooperate, and it doubles as proof that the link is yours.

## One code per surface

A poster with three codes — one for the website, one for Instagram, one for the app — is a poster with a decision on it. Most people resolve a decision on a poster by walking on. One code to a page that offers the three options gets more total scans than three codes, and the page can be reordered later without reprinting, provided the code is a dynamic one whose destination you can edit.

The exception is a surface with genuinely separate audiences: a product label with one code for the consumer and one for the retailer's stock system. Even then, separate the codes physically and caption each plainly.

## A separate link for each placement

This is the placement decision that pays for itself. If the same code goes on the window, the menu, the receipt and the flyer, the analytics show a total and nothing else. If each placement has its own short link — all pointing at the same page — the analytics show which placement is producing scans, at what time of day, and from what kind of device.

On QRly that means [making a separate code](/create) per placement, each with its own slug: `qrly.lol/menu-window`, `qrly.lol/menu-table`, `qrly.lol/menu-flyer`, or the equivalents on a custom domain. The dashboard then shows each one's scans, unique visitors per day, country and city, time-of-day heatmap and device breakdown. A real camera scan arrives with no referrer, so a flyer's scans are distinguishable from clicks on the same link shared online. [Measuring print campaign ROI](/blog/measure-print-campaign-roi-with-qr-codes) goes through how to read those numbers.

Name the slug after the placement rather than the campaign, and keep it presentable: the reader sees it in the camera banner.

## Placement by surface

| Surface | Where | Size (approx.) | Notes |
|---|---|---|---|
| A4 or A3 poster on a wall | Lower-middle, at 1.2 to 1.6 m from the floor once hung | 40 to 80 mm | Caption beside it; not in the bottom corner |
| Large-format poster or banner | Eye level for the standing viewer, not the top | 150 mm or more, scaled to viewing distance | A second code at the other end of a wide banner |
| Flyer or leaflet | Within one panel, away from folds, near the offer text | 20 to 30 mm | Print the URL under it |
| Menu | Front cover or first page, top third | 20 to 30 mm | Not where a thumb holds it; not under a laminated corner |
| Packaging | A flat face, not a seam or a curve, away from the price label | 15 to 25 mm | Error-correction Q or H; test on the actual pack |
| Business card | Back, centred or aligned to the text block | 15 to 20 mm | Leave the quiet zone |
| Shop window | Just below a passer-by's eye line, out of the sun's reflection | 100 mm or more | Matte vinyl; larger than feels necessary |
| Vehicle | Rear, on a flat panel, readable when parked | 150 mm or more | Nobody scans a moving car; design for the car park |

These are starting points. The [flyers and posters post](/blog/qr-code-for-flyers-and-posters) has more on the two most common cases.

## Before it goes up

Whatever the placement, print it and [scan it in place](/blog/test-a-qr-code-before-printing): at the height, at the distance, in the light, with an old phone and a new one. Once the surface is live, check the dashboard after the first day. Zero scans from a placement with foot traffic is a placement problem, and it is cheaper to move a poster now than to find out at the end of the campaign.

> A QR code is placed for the person holding the phone, not for the gap in the layout. Eye level, on a flat face, out of the glare, next to a sentence that says what they get.

## Frequently asked

**Where is the best place to put a QR code on a poster?**
Lower-middle of the poster so that it sits between chest and eye height once hung, with a caption beside it saying what the scan does, and sized to about a tenth of the distance a viewer will stand from it.

**Should a QR code go on the front or the back of a flyer?**
Wherever the offer text is, so the caption and the code are together. The back is fine if the front sends people there. Keep it within one panel, clear of any fold.

**How many QR codes should be on one poster?**
One, unless there are genuinely separate audiences. Send everyone to one page and let the page offer the choices; it gets more scans than three codes competing for attention, and the page can be changed without reprinting.

**Can I track which placement a QR code scan came from?**
Yes, if each placement has its own dynamic code. On QRly each code is a separate short link with its own analytics, so the window, the menu and the flyer can all point at the same page while reporting separately.

**Does a QR code behind glass work?**
The glass is fine; reflections on it are the problem. Place the code out of the line of any reflection, use matte materials, print larger, and use a higher error-correction level so a partial reflection can be corrected.
