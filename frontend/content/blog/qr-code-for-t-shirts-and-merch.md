---
title: QR code on a t-shirt or merch: print it so it scans, link it so it lasts
description: Fabric stretches, fades and folds. Here is how to size, colour and error-correct a QR code for clothing and merch, and why the link behind it must be editable.
date: 2026-09-19
category: use-cases
keywords: qr code on t shirt, qr code merch, qr code on clothing, qr code shirt design, qr code on hoodie, qr code on tote bag, printable qr code for merch, scannable qr code on fabric
---

A QR code on a t-shirt is the only kind of QR code that walks around, gets washed forty times, stretches over whoever is wearing it and is scanned by strangers at a gig. Every one of those things is a way for it to fail. Fabric is the hardest surface a code goes on, and the print rules that are optional on a poster are mandatory here.

The other half of the problem is time. A poster comes down in a month; a shirt lasts years. Whatever the code links to today will be wrong long before the shirt wears out, unless the link can change.

## Why fabric is the hardest surface

Paper is flat and still. A garment is neither.

**Distortion.** A shirt stretches across the chest and back, and the code stretches with it. A square becomes a trapezoid when the wearer moves. QR readers tolerate some skew, but a code printed on a stretched area of a tight-fitting garment can be unreadable in wear even though it scanned perfectly on the table.

**Texture.** Knit fabric is not a smooth surface. Fine modules break up along the weave, and the gaps between them fill with fibre. Small codes with many modules disappear into the texture.

**Fading and cracking.** Screen-printed and direct-to-garment inks fade with washing; plastisol cracks; sublimation on cotton blends softens. Contrast drops with every wash, and the code that scanned new fails at fifty washes.

**Folds and the wearer.** A code over a seam, near a hem or on a sleeve is never flat. A code on the lower front is behind the wearer's arms most of the time.

**Print method.** Screen printing, direct-to-garment (DTG) and direct-to-film (DTF) transfers all produce sharp edges at a sensible size, and heat-transfer vinyl does too. Embroidery cannot: stitched modules have soft edges and gaps, and embroidered codes scan unreliably even when large.

## The print rules for clothing

These are the settings that make a fabric code survive the list above.

**Go big.** A code on a chest or upper back should be at least 8 to 10 cm square, and larger is better. The reason is not scanning distance (someone reading a shirt is close) but module size: at 10 cm, a 25-module code has 4 mm modules, which survive texture and fading. At 4 cm they are 1.6 mm, and they will not. The [print size article](/blog/qr-code-print-size-and-resolution) covers the arithmetic.

**Keep the module count low.** A short URL makes a small-version code with big modules. A dynamic short link like `qrly.lol/xxxxxx` is a version 2 or 3 code; a long tracking URL is version 7 or 8 with modules half the size. This is the single biggest lever on fabric, and it is the reason [short URLs make better QR codes](/blog/why-short-urls-make-better-qr-codes).

**Error correction H.** Level H lets the code survive up to about 30% damage: a crack in the ink, a fold, a faded corner. It costs modules, so it is worth it only in combination with the short URL above. The [error correction explainer](/blog/qr-code-error-correction-explained) shows the trade-off; on clothing, H is the default.

**Contrast, and the right way round.** Dark modules on a light background. A black code on a white or pale shirt is ideal. On a dark shirt, print the code inside a white box rather than printing white modules on the dark fabric; [inverted codes](/blog/inverted-qr-code-white-on-black) fail on a meaningful share of phones, and fading makes it worse. If the design insists on colour, the [colour rules](/blog/custom-qr-code-colours) apply: dark, saturated module colour on a light ground, checked with the scannability read-out.

**Square modules, plain finders.** Rounded modules and dot patterns lose definition on knit. Keep the modules square and the finders standard. Skip the centre logo unless the code is very large and the level is H; QRly's studio caps logo size to what the level can survive, but fabric eats into that margin.

**Quiet zone, generously.** Four modules is the minimum; on fabric give it more, and keep it clear of the rest of the design.

**Placement.** Upper back between the shoulder blades, or upper chest, on the flattest area of the garment. Not on sleeves, hems, seams or across the stomach.

**Test on the garment, worn.** Print one, put it on someone, and scan it while they stand and while they move, with an iPhone and an Android. Then wash it a few times and scan again. The [testing checklist](/blog/test-a-qr-code-before-printing) is the general version; for merch, the wash test is the one people skip.

## Make the link dynamic so the shirt lasts years

Everything above is about the code scanning. This is about what happens when it does.

A **static** code encodes the URL directly. The band shirt links to the 2026 album for the rest of the shirt's life. The conference shirt links to a registration page that closed the week after. The staff shirt links to a promotion that ended. There is no way to change it; the URL is the ink.

A **dynamic** code encodes a short link that redirects to the destination, and the destination can be changed after printing. On QRly you paste the destination, get a short link and a code, and years later, [change where it goes](/blog/how-to-change-a-qr-code-link-after-printing) from the dashboard; every shirt ever printed follows within a minute. It is free, needs no account to make, and there is [no paid plan](/cost), no expiry and no scan cap, which matters for something that will still be scanned in five years.

Patterns that work for merch:

- **Bands and artists:** one `merch` code on every shirt, always pointing at the current release or the smart link page. The [Spotify and music article](/blog/qr-code-for-spotify-and-music) covers the smart-link setup.
- **Events:** the same shirt design every year, one code, pointed at this year's site. Old shirts still work.
- **Businesses and staff uniforms:** a code that points at the current offer, the booking page, or a "you saw us at…" page, updated per season.
- **Creators:** a page listing everything (Instagram, YouTube, shop) so the shirt promotes whichever channel matters this month. The [Instagram article](/blog/qr-code-for-instagram) has the profile-link specifics.

For merch that is meant to outlive any service, the strongest option is a dynamic code on your own domain: `qr.yourbrand.com` via one CNAME record, so the printed code carries your hostname and would follow you if you ever changed platforms. The [custom domain article](/blog/custom-domain-qr-code) explains it.

## What to link

A shirt is scanned by a stranger who has seen the wearer and is curious. The page should answer "what is this" in one screen: who you are, one thing to do, no sign-up wall. Ideas that work: a "you scanned my shirt" page with a discount code, a playlist, a short video, a link to buy the same shirt. One clear action beats a menu of six.

## Other merch: what survives and what does not

| Item | Verdict | Notes |
|---|---|---|
| T-shirt, hoodie (chest or back) | Good | Follow the rules above; hoodies are thicker and flatter, which helps |
| Tote bag | Good | Flat, canvas holds ink well, scanned while carried |
| Stickers | Best | Flat, glossy, cheap; the ideal QR surface |
| Mug | Poor to fair | Curved: keep the code small enough to sit on a nearly flat arc, under 3 cm, which then needs a very short URL |
| Cap or beanie | Avoid | Curved and small; embroidered almost always |
| Lanyard, wristband | Avoid | Too narrow for a usable module size |
| Enamel pin, keyring | Avoid | Too small |
| Water bottle | Poor | Curved and often reflective |

Curvature is the general problem: anything cylindrical works only if the code is small relative to the diameter, which fights the "go big" rule.

## What you learn from merch scans

A dynamic code counts scans at the redirect, so a shirt reports back. QRly records country, city, hour, weekday and device type for each scan, without any cookie or script on the scanner's phone. On merch the location is wherever the wearer went: a tour shirt code lights up city by city along the route. It is city-level from the IP address and can be wrong on mobile networks, so treat it as a pattern, not a map of individuals; the [analytics article](/blog/qr-code-analytics-what-you-can-actually-know) sets expectations properly.

## Frequently asked

**How big should a QR code be on a t-shirt?**
At least 8 to 10 cm square on the chest or upper back, with a short URL so the modules stay large. Smaller codes disappear into the fabric texture and fail after washing.

**Can you embroider a QR code?**
Not reliably. Stitched modules have soft edges and gaps, and embroidered codes fail even when large. Use screen printing, DTG, DTF transfer or heat-transfer vinyl instead.

**What error correction level should a QR code on clothing use?**
H, combined with a short URL. It lets the code survive cracks, folds and fading, which fabric will certainly deliver.

**Can I change what the QR code on my merch links to?**
Only with a dynamic code. On QRly, edit the destination from the dashboard and every shirt ever printed follows within a minute. A static code is fixed for the life of the garment.

**Will a white QR code on a black shirt scan?**
Sometimes, and less often as it fades. Print the code black inside a white box on the dark shirt instead; it scans on every phone and survives washing better.
