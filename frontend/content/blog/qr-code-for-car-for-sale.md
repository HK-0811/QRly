---
title: QR code for a car for sale: a window sticker buyers can actually scan
description: Put a QR code in the window of a car you are selling, pointing at a listing with photos, price and contact. What to link, how big to print it, and how to beat glare.
date: 2026-09-19
category: use-cases
keywords: qr code for car for sale, car window qr code, vehicle qr code, qr code car sale sign, for sale sign qr code, qr code windscreen, private car sale qr code
---

A car parked with a *For Sale* sign in the window gets looked at by far more people than ever ring the number on it. Most are walking past, have thirty seconds, and want the mileage, the year and the price without committing to a phone call with a stranger. A QR code answers all of that from the pavement.

The trick is that the sign has to work from a couple of metres away, through glass, in daylight, and it has to keep being right as the price drops and the car eventually sells. Each of those has a specific answer.

## What the code should point at

Not your phone number. A `tel:` code opens the dialler, which is exactly the commitment a passer-by is avoiding, and it gives them nothing to look at. Point the code at a **listing page** instead: the same advert you have on Autotrader, Facebook Marketplace, Gumtree, Craigslist or wherever you have posted it, with the photos, the spec, the service history and the asking price already written out.

If you have not listed it anywhere, a shared Google Doc set to "anyone with the link" or a page on a free site builder will do. What matters is that the person on the pavement gets photos, a price and a way to contact you, in that order.

Whatever page you use, check three things:

- It loads on a phone without a login. Some marketplace apps push non-members into an install screen; test the link in a private browser window.
- The contact method on it is one you will actually answer. Marketplace messaging is fine; a personal email you check weekly is not.
- It does not show your home address. The car is parked outside your house; the page does not need to say so as well.

## Why the code has to be dynamic

A static QR code, one that encodes the listing URL directly, is wrong for this job on the first day the price changes. Listings get deleted and relisted, prices come down, the car sells and the sign stays in the window for a week. A code that cannot be updated becomes a code that lies.

A [dynamic code](/blog/what-is-a-dynamic-qr-code) encodes a short link instead, and the short link redirects to wherever you point it. On QRly you [make a code](/create) from the listing URL, print it once, and then:

- when you relist on a different site, [change the destination](/blog/how-to-change-a-qr-code-link-after-printing) from the dashboard; the printed sign follows within a minute;
- when the price drops, the listing page is updated and the code does not care;
- when it sells, point the code at a one-line "Sold, thanks" page, or set an [expiry date](/blog/qr-code-with-expiration-date) so scans get an "expired" page after the date you choose.

The redirect is a 302, not a 301, so phones do not cache the old destination. The scan count is useful too: if thirty people scanned over the weekend and nobody messaged, the price is the problem, not the exposure.

## Which window, and where on it

Passers-by look at a parked car from the pavement side, at standing eye height, walking along it. That argues for:

- **The rear side window on the kerb side**, or the rear windscreen if the car is parked nose-in. The front windscreen is the worst option: it is raked, it reflects the sky, and it is the one window you legally need to keep clear in most places.
- **Inside the glass**, facing out, between about 1.2 and 1.6 metres from the ground. Taped to the outside it is gone after the first rain.
- **Flat against the glass.** A sheet curling at the corners puts the code at an angle and adds a reflection behind it.

Keep the code away from the edge of the window. Rubber seals, tint bands and the black ceramic dots around the border all eat into the quiet zone. There is more in [where to place a QR code](/blog/where-to-place-a-qr-code).

## How big to print it

Someone scanning from the pavement is standing one to two metres from the glass. The working rule of thumb is that a QR code scans comfortably from about **ten times its own width**, so a code scanned from two metres wants to be around **20 cm** across; from one metre, 10 cm. Print it at 15 cm and most phones manage from either distance; at 5 cm people have to press their phone against the window, which they will not do.

Two things make a code at that size easier to decode through glass:

1. **Keep it low-density.** The short link is short by design, so the code stays at version 2 or 3, with big modules that survive a slightly out-of-focus camera. This is one of the practical reasons [short URLs make better QR codes](/blog/why-short-urls-make-better-qr-codes). Do not encode the full marketplace URL with its tracking parameters.
2. **Use error correction M or Q**, not H. H sounds safer but adds modules and shrinks each one. The [size guide](/blog/qr-code-size-guide) walks through the trade-off.

Download the SVG and print at whatever size you like; the [print size and resolution](/blog/qr-code-print-size-and-resolution) post covers the rest.

## Glare and tint

Glass is the part of this that breaks codes, and it breaks them in two ways.

**Reflection.** A phone camera pointed at a window sees the code plus a reflection of the sky, the street, and the person holding the phone. Contrast collapses. The fixes are to print on **matte** paper (not glossy photo paper, never gloss laminate), to use solid black on white, and to accept that a code at the top of a window under direct sun will be hard to scan at midday. Test it at noon and at dusk; if it fails at noon, move it lower on the glass.

**Tint.** Factory privacy glass on rear windows cuts the light through the code by half or more, and the code reads as grey on darker grey. If the rear windows are tinted, use a front side window or the rear windscreen, whichever is clearer, or put a white card on the dashboard behind the windscreen if people approach from the front.

Do not compensate for tint by inverting the code to white on black. Inverted codes fail on a number of phones regardless of glass; there is a separate post on [why inverted codes are a gamble](/blog/inverted-qr-code-white-on-black).

## What else goes on the sign

The code does not replace the sign; it sits on it. Alongside it, in large type:

- **Price**, or "offers around", so nobody scans just to find out;
- **Year, model, mileage**, the three things people ask first;
- **"Scan for photos and details"**, because a bare code gets fewer scans;
- **A phone number in text**, small, for the person who does not scan things. A second QR code on the same sign confuses cameras and people alike.

Print the sign at A4, portrait, with the code taking up the top or the middle third. A4 on the rear side window of most cars leaves the driver's view alone.

## Before it goes in the window

Print it, put it in the window, close the door, and go outside. Scan it from the pavement with an iPhone and with an Android, in daylight, then again in the evening under a street light. If any of those fails, fix it now rather than after a fortnight of nobody scanning. The [testing checklist](/blog/test-a-qr-code-before-printing) is short and worth the five minutes.

Then, when the car is sold, do the thing most sellers forget: repoint the code or set its expiry before the sign goes in the recycling. The photo of your sign someone took last Tuesday will otherwise keep pointing at a listing that no longer exists.

## Frequently asked

**Can I just put my phone number in the QR code?**
You can, with any static generator, and it will open the dialler. It is the wrong choice for a car sale because it gives the scanner nothing to read and asks them to call a stranger. A listing page with photos and a price gets more, and better, contacts. QRly only makes URL codes in any case; the post on [phone number and SMS codes](/blog/qr-code-for-phone-number-and-sms) explains the static route if you want one.

**How big does a QR code need to be to scan through a car window?**
Plan for the distance people will stand at, and make the code about a tenth of that. From two metres, a 20 cm code; from one metre, 10 cm. Matte paper, black on white, and a clear window make the difference between a scan and a squint.

**What happens to the code when the car sells?**
With a dynamic code, you change the destination to a "sold" page or set an expiry date, and every copy of the sign, including photos people took of it, stops pointing at a dead listing. With a static code, nothing happens: it keeps pointing at whatever it pointed at.

**Will a code behind tinted glass scan?**
Light tint, usually. Factory privacy glass, often not, and not reliably. Use the clearest window available, and test in the actual car in actual daylight before relying on it.

**Do I need an account to make the code?**
No. The code and its short link are made before any signup. An account is what lets you change the destination later, which for a car sale you will want, so claim the link once the sign is printed.
