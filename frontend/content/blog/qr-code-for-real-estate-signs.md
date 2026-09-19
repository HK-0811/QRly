---
title: Real estate QR code: one yard sign, every listing, and scan data by hour
description: How to put a QR code on a property yard sign that opens the listing or virtual tour, gets reused from one property to the next, and shows when and where people scan.
date: 2026-09-19
category: use-cases
keywords: real estate qr code, qr code for property listing, qr code yard sign, qr code for real estate sign, qr code for open house, realtor qr code, qr code for house for sale, virtual tour qr code
---

A yard sign is the most expensive print an estate agent owns per square centimetre, and it goes back in the van when the property sells. A QR code on it should do two things: open the listing for the person standing in front of the house, and survive being moved to the next house without a reprint. Most codes on signs manage the first and not the second.

## What the sign should open

One code, one destination. Pick the page that answers the question the person on the pavement actually has, which is *what does it look like inside and how much is it*.

- **The listing page** on your own site or the portal. Photos, price, floor plan, your phone number. This is the default and it is usually right.
- **The virtual tour**, if you have one. It is more impressive and it is what a passer-by cannot get from the window. It also loads slower on mobile data; test it on the street, not in the office.
- **A property page you control**, which links to both. This is the best option when you have the time, because it survives the listing moving between portals and it can carry a contact form that lands in your inbox rather than the portal's.

Do not point the sign at your agency's home page and expect people to search for the property. They will not.

## Reuse the sign

The reason to use a dynamic code here is not the analytics, although those are useful. It is that the sign outlives the listing.

A dynamic code encodes a short link — on QRly, `qrly.lol/<slug>` — and the short link redirects to whatever destination you have set. When the property sells, you edit the destination to the next property, or to a "just sold, here is what else we have" page, and the same physical sign goes on the next lawn. The change takes effect at every edge within a minute.

The practical setup for an agency:

1. Make one code per physical sign, not per property. Name the slug after the sign: `qrly.lol/sign-07`, or something you can read off the board.
2. Write the slug or the sign number on the back of the board in marker, so whoever puts it up knows which dashboard entry to edit.
3. Before the sign goes up, set that slug's destination to the listing. After the sale, set it to the next one.

A sign that carries a static code — one that encodes the portal URL directly — is a sign that has to be reprinted for every property, or, more often, one that keeps pointing at a sold listing for months. The [reusable code post](/blog/reusable-qr-code) covers the general pattern; a sign is the clearest case of it.

Riders, the small strips that hang under the main board, are a good place for the code: they are cheap to reprint if the agency ever changes its branding, and they sit at a readable height.

## Size for a sign

The rule of thumb is that a code needs to be about a tenth of the distance it is scanned from. The honest question is what that distance is for a yard sign, and the honest answer is that nobody scans at driving speed. People scan from the pavement, or they pull over and scan through the passenger window from a car length away.

| Scanned from | Distance | Minimum code width |
|---|---|---|
| Pavement, walking up to the sign | 1 to 2 m | 10 to 20 cm |
| A parked car, through the window | 3 to 5 m | 30 to 50 cm |
| A moving car | Any | Does not happen; do not design for it |

A code around 20 cm on a standard board covers the pavement case with margin and gives the parked-car case a fair chance, especially since a phone's camera can zoom. Bigger is fine. What is not fine is the 4 cm code tucked into the corner next to the agent's photo, which is what most signs actually have. The [size guide](/blog/qr-code-size-guide) has the general figures.

Note that the short link matters for size. A code containing `qrly.lol/sign-07` has fewer modules than one containing a 90-character portal URL, and fewer modules means each module is bigger at the same printed size, which is what makes the code readable from further away.

## Placement and print

Signs live outdoors, are glossy, and are read in direct sun. Some rules that come from that:

- **Eye height or lower.** A code at the top of a 2 m post is scanned at an angle, and skew reduces the effective size. On the rider or the lower half of the board is better.
- **Matte over gloss.** Reflected sun on a laminated code produces a bright patch the camera cannot read through. If the board must be gloss, matte the code area or put it on a matte rider.
- **Dark on light.** Agency colours are often a saturated brand colour on white; a dark navy or black code on white is safer than the brand colour.
- **Quiet zone.** A clear margin of at least four modules around the code. The frame of the board is not a quiet zone if it is dark.
- **A call to action.** "Scan for photos and price" converts far better than a bare code. People will not scan a code that does not say what it does.
- **SVG to the sign printer.** A raster file scaled up to 20 cm will be soft at the edges. Every QRly code exports as SVG.

Then scan the first printed board from the pavement, on an iPhone and an Android, before ordering the rest.

## What the scans tell you

A sign is the one marketing channel an agent has no other data on, so this is where scan analytics earn their keep. Because the redirect sees every scan, QRly records for each link:

- **Hour and weekday**, in the scanner's local time, shown as a heatmap. Evening and weekend scans mean the sign is being read by people walking the area. Weekday lunchtime scans from a city centre are often other agents. The [time analytics post](/blog/qr-code-scan-time-analytics) covers how to read it.
- **City and region**, from the IP address, which is approximate: it is city-level, and a scanner on mobile data may be placed at the carrier's exchange rather than the street. It still separates local interest from out-of-town interest, which for a relocation-heavy area is the number you want. The [location post](/blog/qr-code-location-tracking) says what is and is not knowable.
- **Device and OS**, which tells you whether the tour page needs to work better on one platform.
- **Referrer**, where none means a real camera scan rather than a click on the link from a listing email.
- **Unique visitors**, counted per day, so the same neighbour scanning on three evenings counts three times. For a sign that is the right behaviour; you want to know about repeat interest.

The IP address is discarded after those fields are derived, no cookie or script is set on the scanner's phone, and the [privacy page](/privacy) lists everything kept.

Because each sign has its own slug, the dashboard also compares signs. Two boards on the same street, one on the main road and one on the side road, tell you within a fortnight which position works, and that is the beginning of [A/B testing](/blog/qr-code-a-b-testing) print without a spreadsheet.

## Put it on your own domain

An agency with a hundred boards has a hundred codes it does not want to reprint if it ever changes generator. The way to make that safe is a [custom domain](/blog/custom-domain-qr-code): `qr.youragency.com`, one CNAME record pointed at the platform, and the certificate is issued automatically. Every sign then carries your hostname, and if you ever moved elsewhere you would point that hostname at the new provider and the boards would follow. It needs an account, and it is the one part of the setup worth doing before the first board goes to print rather than after.

## Frequently asked

**Can I reuse the same QR code sign for different properties?**
Yes, with a dynamic code. The sign carries a short link, and you change where the link goes from the dashboard when the property sells. A static code encoding the listing URL directly would need a new sign.

**How big should a QR code be on a yard sign?**
Around 20 cm wide for scanning from the pavement, larger if you expect scans from a parked car. Use the short link rather than the full listing URL so the modules are bigger at the same size.

**Can I see when people scan the sign?**
Yes. QRly shows scans by hour and weekday in the scanner's local time, plus approximate city, device and OS. Nothing is installed on the scanner's phone and the IP address is not stored.

**Should the code open the listing or the virtual tour?**
The listing, unless the tour is fast on mobile. Better still, a page you control that links to both, so the code keeps working when the listing moves between portals.

**Does the code stop working if the property sells?**
Only if you let it. Point it at the next listing, or at a page showing what else you have. QRly codes have no expiry unless you set one.
