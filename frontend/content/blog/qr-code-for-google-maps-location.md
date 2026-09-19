---
title: QR code for a Google Maps location: share links, Plus Codes and geo: URIs
description: Three ways to put a place in a QR code, which phones open which, and why a dynamic link is the one to print when the venue, entrance or parking might change.
date: 2026-09-19
category: use-cases
keywords: qr code for location, google maps qr code, qr code for address, qr code directions, qr code for google maps, location qr code, qr code to navigate, apple maps qr code
---

A location QR code on a wedding invitation, a shop window or a conference banner does one job: the person scans, their map app opens on the right pin, and they tap "Directions". It sounds trivial. In practice there are three different things you could encode, they do not all open on every phone, and the one most people choose first is the one that goes wrong when the plan changes.

## Three ways to encode a place

**A Google Maps share link.** Open the place in Google Maps, tap Share, copy the link. You get a short `maps.app.goo.gl/…` URL or a long `google.com/maps/place/…` one. On a phone with Google Maps installed, either opens the app on the pin; without it, the link opens the map in the browser. This works on iPhone and Android alike, which is why it is the sensible default.

Google also documents a plain, constructable form of these links, which is useful if you want to build them without opening the app:

```
https://www.google.com/maps/search/?api=1&query=51.5007,-0.1246
https://www.google.com/maps/dir/?api=1&destination=Some+Venue,+Some+Town
```

The first opens a search on a coordinate or an address; the second opens directions straight to it, which is usually what a visitor wants.

**A Plus Code.** Google's open location code, the thing that looks like `9C3XGV4C+2X`. It is a short, unambiguous address for anywhere on earth, including places with no street address. Typed into Google Maps it resolves to the spot. On its own, though, it is just text: a phone camera scanning a bare Plus Code offers to copy it, not to navigate. Put it inside a Maps link (`query=9C3XGV4C%2B2X`) if you want it to open.

**A `geo:` URI.** The web-standard way to write a coordinate: `geo:51.5007,-0.1246`. Android recognises it and asks which map app to use. iOS support is unreliable: the built-in camera generally does not treat it as something to open, so a large share of your visitors get nothing. It is the purest format and the least practical one for print.

| Format | Example | iPhone | Android | Opens directions |
|---|---|---|---|---|
| Google Maps link | `maps.app.goo.gl/…` | Yes (app or browser) | Yes (app or browser) | With the `dir` form |
| Apple Maps link | `maps.apple.com/?q=…` | Yes, in Apple Maps | Opens in the browser | Yes |
| Plus Code alone | `9C3XGV4C+2X` | Copies text | Copies text | No |
| `geo:` URI | `geo:51.5,-0.12` | Usually not | Yes, app chooser | Via the app |

For a general audience, print a Google Maps link. If your visitors are overwhelmingly iPhone users and you prefer Apple Maps, an `maps.apple.com` link opens Apple Maps on iOS and a web map elsewhere. Do not print a `geo:` URI or a bare Plus Code and expect the public to cope.

## Why the plain link goes wrong

All three formats above, encoded directly, make a **static** code: the location is the code, and the code cannot be changed. That is fine on a fridge magnet. It is a problem on anything with a lifespan.

Venues move. A festival changes fields. The car park you told people to use closes for resurfacing, and now the pin should be at the overflow entrance. A pop-up shop moves to a different unit in the same centre. A wedding moves the ceremony indoors because of the forecast, and the invitations went out in March. In each case the printed code confidently sends people to the wrong place, and there is nothing to edit.

A **dynamic** code encodes a short link that redirects to the destination, and the destination can be edited after printing. On QRly, you paste the Maps link, get a short URL and a code, and later [change where it goes](/blog/how-to-change-a-qr-code-link-after-printing) from the dashboard. Every printed copy follows within a minute. The code is free, needs no account to make, and does not expire.

The pattern that works best is not to link to the map directly at all, but to a **small page you control**: the address, the map link, a line about parking, "use the side entrance after 6pm", and a phone number. Change the note without touching the code. For [events and invitations](/blog/qr-code-for-events-and-invitations) especially, that page absorbs every last-minute change the invitation cannot.

## Signage: what to print and where

Location codes almost always go on signs, and signs have their own rules.

- **Say what it does.** "Scan for directions" next to the code beats a bare square. People scan codes whose purpose they understand.
- **Size for reading distance.** A code on a window read from arm's length can be 3 cm. A banner read from across a lobby needs to be far larger; roughly, the width of the code should be at least a tenth of the distance it will be scanned from. The [size guide](/blog/qr-code-size-guide) has the working.
- **Outdoor placement.** Flat, at eye height, out of direct glare, and not behind glass at an angle that reflects the sky. Laminated or printed on rigid board rather than paper that will ripple. [Where to place a QR code](/blog/where-to-place-a-qr-code) covers the common mistakes.
- **Contrast and quiet zone.** Dark modules on a light patch, four clear modules on every side. Estate agents' and venues' brand colours are frequently the problem; use a white box behind the code if the sign is dark.
- **Also print the address.** A code is a convenience, not the only route. Some people will not scan; a few phones will fail. The address in text costs nothing.
- **Error correction.** Signs get scuffed. Level Q or H tolerates more damage; the [error correction explainer](/blog/qr-code-error-correction-explained) shows the trade-off in code density.

Estate-agent boards are the classic case: the board is printed in bulk, the listing changes weekly, and the [real-estate sign article](/blog/qr-code-for-real-estate-signs) goes into that pattern in detail. Hotels use the same trick on key cards and lobby signs for "how to find us" pages, and the [hospitality article](/blog/qr-codes-for-hotels-and-hospitality) covers it.

## What you learn from a dynamic location code

Because the scan is counted at the redirect, a dynamic code also tells you who is looking for you. QRly records the country, region and city of each scan, the hour and weekday, and the device type, with no cookie or script on the scanner's phone. On a "find us" code that means you can see that the poster at the station is scanned mostly in the hour before events, or that half the scans of the wedding invitation came from a city where none of the guests live, meaning it was shared.

Two honest caveats. Scan location comes from IP geolocation, which is city-level at best and wrong behind VPNs and mobile carrier networks; the [location tracking article](/blog/qr-code-location-tracking) explains what is and is not knowable. And a scan is not an arrival: it tells you someone opened the map, not that they came. For most signage, that is still the only measurement you will ever get.

## Frequently asked

**How do I make a QR code for a Google Maps location?**
Open the place in Google Maps, tap Share, copy the link, and put that link in a QR code. Made as a dynamic code on QRly, the link can be changed after printing if the venue or entrance changes.

**Will a Google Maps QR code open Apple Maps on an iPhone?**
No. A Google Maps link opens the Google Maps app if installed, otherwise the map in the browser. If you specifically want Apple Maps, use a `maps.apple.com` link, which opens Apple Maps on iOS and a web map elsewhere.

**Can a QR code open directions directly?**
Yes. The `google.com/maps/dir/?api=1&destination=…` form opens directions to the place rather than just showing the pin. Most visitors want this.

**Can I change the location after printing?**
Only with a dynamic code. On QRly, edit the destination in the dashboard and every printed copy follows within a minute. A static code with the map link inside it is fixed forever.

**Should I use a geo: URI or a Plus Code?**
Not for the public. `geo:` URIs are unreliable on iPhones, and a bare Plus Code is just text the phone offers to copy. Put the coordinate or Plus Code inside a Google Maps link instead.
