---
title: QR code vs NFC tag: cost, range, phone support and when to use both
description: An NFC tag is tapped, a QR code is scanned, and both can carry the same URL. Here is how they compare on cost, range, printability and editability, and when to use both.
date: 2026-09-19
category: advanced
keywords: qr code vs nfc, nfc tag or qr code, nfc vs qr code marketing, nfc tag url, qr code and nfc together, nfc business card vs qr code, dynamic nfc tag
---

An NFC tag and a QR code do the same job from the user's point of view: bring a phone close, and a link opens. The way they do it could hardly be more different. One is a printed pattern read by a camera from across a table; the other is a radio chip read by an antenna from a few centimetres. Each has a set of places where it is clearly the right choice, and a growing number where the answer is both, pointing at the same link.

## What each one actually is

A **QR code** is a two-dimensional barcode. It encodes text, usually a URL, as a grid of dark and light modules, and a phone's camera decodes it optically. It costs nothing beyond the ink, it can be reproduced anywhere an image can go, and [any recent phone reads one](/blog/how-to-scan-a-qr-code) from the camera app. [What is a QR code](/blog/what-is-a-qr-code) covers the format.

An **NFC tag** is a small passive chip with an antenna, usually on a sticker, a card or a keyfob. It has no battery; the phone's own radio field powers it when the two are within a few centimetres. The chip stores a short record, and the standard record for a URL is an NDEF URI, which the phone opens the same way it opens a scanned QR link. Common tags store a few hundred bytes, plenty for a URL and not much more.

## Side by side

| | QR code | NFC tag |
|---|---|---|
| Unit cost | Ink; effectively zero | A chip per placement; cheap in bulk, never free |
| Read range | Centimetres to metres, set by print size | A few centimetres; the phone has to touch or nearly touch |
| Line of sight | Needed; it is a camera | Not needed; works through a thin cover, a menu sleeve, a bag |
| Light | Needs enough to focus on | Irrelevant |
| Reproduction | Print, screen, email, TV, projected | Physical object only |
| Many people at once | Yes; a crowd can scan one poster | One tap at a time |
| Phone support | Every camera app since about 2017 | Nearly every modern phone; some budget models lack NFC, and older iPhones need an app |
| Surfaces | Anything flat enough to print on | Metal interferes unless the tag is an on-metal type |
| Discoverability | Visible; people know what to do | Invisible without a printed prompt |
| Editable after deployment | Only if it encodes a redirect | Only if it encodes a redirect, or is rewritten in person |
| Counterfeit resistance | None; a code can be photographed and reprinted | Modest; a tag can be locked, and some chips sign their responses |

The rows to dwell on are range, reproduction and cost, because those decide most real cases.

## Where the QR code wins

**Distance and crowds.** A QR code on a conference screen, a bus shelter or a shop window can be scanned by everyone who can see it, from wherever they are standing. An NFC tag on the same poster serves one person at a time and only if they can reach it. [Where to place a QR code](/blog/where-to-place-a-qr-code) is largely about this.

**Anywhere that is not a physical object.** A QR code can be in an email, on a slide, on a website, in a television advert. NFC needs a chip in the world.

**Zero marginal cost.** Ten thousand flyers with a QR code cost the same as ten thousand flyers without one. Ten thousand flyers with an NFC tag cost ten thousand tags plus the labour of applying them. For [print advertising](/blog/qr-codes-for-print-advertising) at any volume, this ends the discussion.

**Obviousness.** People recognise a QR code and know to point a camera at it. An NFC tag is invisible, so it needs a printed symbol and a prompt, and a good number of people will still not know that tapping is an option.

## Where the NFC tag wins

**Speed at close range.** Tapping a phone on a tag is faster than opening a camera, framing a code and waiting for the focus. At a reception desk, a table, a product on a shelf, the tag is quicker.

**No light, no line of sight, no focus.** A tag works in a dark venue, through a plastic sleeve, on a curved surface, and with a phone that has a poor camera. QR codes fail in each of those conditions before an NFC tag does.

**Durability and tampering.** A tag can be write-locked so its URL cannot be changed in the field, and it is not defeated by a sticker placed over it the way a QR code is by the well-known [quishing](/blog/qr-code-phishing-quishing) trick of pasting a fake code over a real one. It can, of course, be removed.

**Premium feel.** A business card or a product with a tap-to-open link reads as considered in a way that a printed square does not, which is why [business cards](/blog/qr-code-for-business-card) are the most common place people weigh the two.

## Dynamic-ness: both can redirect

A common claim is that NFC is dynamic and QR is static. Neither is true on its own. A QR code encoding your page URL and an NFC tag encoding your page URL are equally stuck if the page moves. A QR code encoding a redirect link and a tag encoding the same redirect link are equally editable, because in both cases the thing that changes is on the server, not on the object.

So the sensible way to deploy either is with a short link that redirects. Write `https://qrly.lol/yourslug` to the tag and print the same link as a QR code, and both go wherever you point that link from the dashboard, with changes arriving in under a minute. [What is a dynamic QR code](/blog/what-is-a-dynamic-qr-code) explains the redirect, and [the redirect explained](/blog/qr-code-redirect-explained) covers what the phone actually does. QRly does not write NFC tags; any phone app that writes NDEF records will, and the URL you give it is the short link.

One practical wrinkle: NFC tags have small memories, so the short link's length is not a problem, but a long URL with tracking parameters might not fit on the cheapest chips. That is the NFC version of the argument in [why short URLs make better QR codes](/blog/why-short-urls-make-better-qr-codes): put the long URL on the destination side of the redirect.

## Measuring the two

A scan and a tap both open the short link, so both are counted at the redirect. If you want to know which is being used, give them separate links pointing at the same destination: one slug on the tag, another in the code. The counts then tell you what a poster's audience actually does, which is often not what the designer expected. [Free QR code tracking](/blog/free-qr-code-tracking) covers what a redirect can and cannot know about a visit; the answer is the same for a tap, since the phone makes an identical request either way.

## Using both

For a fixed object that people approach, a table tent, a product display, a museum label, a card, the strongest answer is both on the same object: an NFC tag for the person standing next to it, and the QR code printed on it for the person a metre away and for the phone without NFC. The tag makes the tap available; the code makes the link visible and explains what the tag is for. Both encode the same short link, or two slugs to the same page if you want to know the split.

For anything printed at volume, seen from a distance, or shown on a screen, a QR code alone. For a small number of premium objects where speed and feel matter, NFC alone with a printed cue. You can [make the QR side](/create) in a minute without an account; the tag needs a chip and a writing app, and the same URL.

## Frequently asked

**Is NFC better than a QR code?**
Neither is better; they are read at different ranges. NFC is faster at touching distance and works without light or line of sight. A QR code works from across a room, on screens and in print at any volume, at zero cost per copy.

**Can an NFC tag do what a dynamic QR code does?**
Yes, if it holds a redirect link. Write a short link such as a QRly one to the tag and change the destination from the dashboard. A tag holding the final URL directly is as fixed as a static QR code.

**Do all phones read NFC tags?**
Most modern phones read a tag by holding it near the back, with no app. Some budget Android models omit NFC, and iPhones before the XS need an app to read tags. Every phone with a camera reads a QR code.

**Should a business card have NFC or a QR code?**
A QR code is enough for most, because it costs nothing and everyone can scan it. An NFC card is a premium option worth having only if the tap is part of the impression, and it should still carry a printed QR code for phones and people that do not tap.

**Can I count taps and scans separately?**
Yes. Make two short links to the same destination, put one on the tag and one in the code, and the redirect records each separately.
