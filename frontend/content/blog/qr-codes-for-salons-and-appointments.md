---
title: QR codes for salons: booking links on mirrors, cards and the window
description: Where a salon should put a booking QR code, how to keep the price list and review link current after printing, and how an expiry date makes a promotion end itself.
date: 2026-09-19
category: business
keywords: salon qr code, qr code booking, qr code appointment, hair salon qr code, qr code for booking appointments, barber qr code, beauty salon qr code, online booking qr code
---

A salon sells time, and the moment a client is most likely to book their next slot is while they are sitting in the chair looking at the result. The second most likely moment is when they walk past the window on a Tuesday evening and remember they need a cut. Neither of those moments involves a laptop.

A QR code that opens the booking page, placed where those moments happen, is the entire strategy. The rest of this post is about where to put it, what else deserves a code, and how to keep all of it current when the booking system, the prices and the promotion change and the print does not.

## The booking code, in three places

**On the mirror.** A small, discreet card or vinyl in the corner of each station's mirror, at the client's eye level while seated. "Book your next appointment" and the code. The client has fifteen minutes of looking at that mirror; at some point they will scan it. This is the highest-value placement in the building, and most salons do not have one.

**On the card.** The appointment card or business card the client leaves with. Instead of a printed phone number, or as well as one, a code that opens the booking page. [The business card post](/blog/qr-code-for-business-card) covers the choice between a code to a page and a code that dials a number; for a salon the booking page wins, because the client wants to see availability, not talk.

**On the window.** For the Tuesday evening walk-past. Large — 10 cm or more — at chest height, on the inside of the glass facing out, with "Book online" above it. This code is scanned in the worst conditions of the three: through glass, at a distance, at dusk. Plain dark modules on a plain light background; the stylish inverted version fails on older phones, as [inverted codes](/blog/inverted-qr-code-white-on-black) explains.

Three placements, three codes, all pointing at the same booking page. The reason for three codes rather than one is that you then know which placement is booking appointments. If the mirror code produces twenty scans a week and the window five, the window's job is different from what you thought — it may be doing the "are they open" job rather than the booking job, in which case the hours belong on it too.

## Why the booking code must be dynamic

Salon booking systems change. The platform gets expensive, or gets acquired, or a better one appears, and the booking URL changes with it. A static QR code contains the URL and is wrong from that day. The mirror vinyl, the window and the last five hundred cards all point at a dead page.

A dynamic code contains a short link that redirects to the booking page. When the system changes, edit the destination in the dashboard, and every mirror, card and window follows within a minute. [How to change a QR code link after printing](/blog/how-to-change-a-qr-code-link-after-printing) shows the process; [static vs dynamic](/blog/static-vs-dynamic-qr-codes) explains the difference properly.

On QRly the dynamic code is free, without a watermark, an expiry or a scan cap, and there is no per-code fee, so three codes cost the same as one. The [home page](/) makes a code without an account; sign up to edit destinations and read the scan data later.

## The price list

The laminated price list at reception and the one on the website drift apart within a year. A code at reception that opens the current price list ends the drift: there is one list, on the page, and the card on the counter just points at it.

This is also the place to put the service descriptions that do not fit on the card — what a treatment involves, how long it takes, what to do beforehand. A client deciding between two treatments will read that on a phone while waiting.

## Reviews

The review request belongs at the end, on the receipt or on a card handed over at the till, opening the review form directly rather than the listing page. The client has just seen the result and is at peak goodwill; ten minutes later they are in the car and the moment has passed.

[The Google reviews post](/blog/qr-code-for-google-reviews) covers getting the direct link and what to say alongside the code. Keep the review code separate from the booking code so the two counts stay apart; and make it dynamic too, because review platforms come and go.

## Reschedule and cancellations

A late cancellation is a lost hour. Some of them are lost because rescheduling was a phone call the client did not get round to. A code on the appointment card that opens the manage-booking page — reschedule, cancel, add a treatment — makes the reschedule a thirty-second job at the bus stop.

If your booking system gives each appointment its own management link, that is a per-client URL and not something to print a code for. But a general "manage your booking" page, where the client enters their details, is one code on every card. Point the card's booking code at a page with both options, or use a second code; the card is small, so usually the first.

## Promotions with an expiry

"20% off colour in January" goes on a flyer, a window card and a social post. The flyer gets kept. In March someone walks in with it.

Set an expiry date on the link when you make it. After the date, scans see an expired page rather than a live offer you now have to honour or argue about. The flyer does not need to say the terms in small print, because the code enforces them. [QR codes with an expiry date](/blog/qr-code-with-expiration-date) covers the mechanics; [coupons and discounts](/blog/qr-code-for-coupons-and-discounts) covers making the offer page short enough to complete on a phone.

Because the code is dynamic, the alternative is also open: when January ends, repoint the flyer's code at the February offer instead of expiring it. Which is better depends on whether a late scan is worth a lead. For a seasonal offer, repoint; for a strict one, expire.

## What the scans tell you

Per link, QRly records the local hour and weekday, the device and OS, and the approximate location. For a salon, the useful reads:

- **Mirror code by hour** tells you which stations and which times of day produce rebookings, which is a quiet way to see which stylists' clients rebook on the spot.
- **Window code by hour** tells you whether the window is being read after closing, and therefore whether the hours and the "walk-ins welcome" line belong on it.
- **Card code by week** tells you how long cards keep working after they are handed out. If scans stop after a fortnight, the card is being thrown away; if they carry on for months, it is being kept.
- **Review code against reviews received** tells you whether the form is being completed.

Unique visitors are counted per day, so a regular client scanning the mirror every six weeks counts each time, which is what you want. Nothing runs on the client's phone: no cookie, no script, no stored IP address. [The privacy page](/privacy) lists every field, and [what you can actually know](/blog/qr-code-analytics-what-you-can-actually-know) is the honest limit of the whole exercise.

## Printing

Mirror cards and appointment cards are scanned at arm's length: 2 cm is the minimum, 2.5 cm is comfortable. The window needs 10 cm or more. Download the SVG for anything a printer is producing, keep the four-module quiet zone, and do not crop it to fit the card. If you want the salon's colours in the code, [custom colours](/blog/custom-qr-code-colours) explains how far you can go before the studio's scannability read-out warns you. Test a scan on the actual printed card, in the salon's lighting, with an iPhone and an Android.

## Frequently asked

**Where should a salon put a booking QR code?**
On the mirror at each station, on the appointment card, and on the window. Three separate codes pointing at the same booking page, so you can see which placement books.

**What if we change booking systems?**
With a dynamic code, edit the destination in the dashboard and every printed code follows within a minute. With a static code, everything printed is wrong and needs replacing.

**Can a promotion's QR code stop working after the offer ends?**
Yes. Set an expiry date on the link when you make it; after that date, scans see an expired page. Alternatively, repoint the code at the next offer.

**Does the client need an app to scan?**
No. The camera on any recent phone reads the code and opens the booking page. Put "Book online" or "Book your next appointment" next to it so the client knows what it opens.

**Is a free QR code good enough for a business?**
QRly's dynamic codes are free with no plan behind them, no watermark and no expiry, and the source is open. For a salon's booking, price list, review and promotion codes there is nothing a paid tier would add.
