---
title: QR code for Spotify and music: how to link a song, playlist or release
description: Spotify Codes only open inside Spotify. A URL QR code opens the same track for everyone, and a dynamic one lets a poster follow the next release. Here is how to do it.
date: 2026-09-19
category: use-cases
keywords: spotify qr code, qr code for spotify playlist, qr code for music, apple music qr code, qr code for song, music qr code generator, spotify code vs qr code, qr code for album release
---

A musician asks for a "Spotify QR code" and usually means one of two different things: the wavy barcode Spotify draws next to its logo, or an ordinary QR code that opens a Spotify link. They look nothing alike, they scan with different apps, and only one of them works for a listener who does not have Spotify installed. Knowing which is which saves a reprint.

## Spotify Codes are not QR codes

Inside the Spotify app, every track, album, playlist, artist and podcast has a share sheet, and one of the options is **Spotify Code**. It produces a small graphic: the Spotify logo followed by a row of vertical bars of varying height, a little like a sound wave.

That graphic is a proprietary barcode. It is read only by the camera inside the Spotify app's search screen. A phone's normal camera app does not recognise it, and neither does any other QR scanner. It also encodes the Spotify resource directly, so it can never point anywhere else.

That makes a Spotify Code fine for one specific situation: a listener who already has Spotify open and is standing in front of your poster. It is the wrong tool for a general audience, because you are asking people to open a specific app, find the camera inside it, and know that this graphic is scannable at all. Most people do not know.

## A URL QR code opens for everyone

A standard QR code that contains a Spotify link works with any phone camera. The link is the one you get from the same share sheet: **Copy link**, which gives you something like `open.spotify.com/track/…` (often with a `?si=` parameter on the end that identifies the share; it can be removed).

When a phone opens that link, one of two things happens. If Spotify is installed, the operating system hands the link to the app and the track opens there. If it is not, the link opens Spotify's web player in the browser, where the listener can play a preview or sign in. Either way, the scan lands somewhere useful.

Apple Music works the same way. The share sheet in the Music app gives a `music.apple.com/…` link; on an iPhone it opens the Music app, and on anything else it opens Apple's web player. YouTube Music, Deezer, Tidal, SoundCloud and Bandcamp all produce ordinary web links that behave similarly. The pattern is the same as a [QR code for a YouTube video](/blog/qr-code-for-youtube-video): the link is the thing, the QR code just carries it.

| | Spotify Code | URL QR code |
|---|---|---|
| Scanned by | Spotify app only | Any phone camera |
| Works without Spotify installed | No | Yes, opens the web player |
| Can point to other platforms | No | Yes, if it links to a smart link page |
| Can be changed after printing | No | Yes, if the code is dynamic |
| Scans counted | No | Yes, if the code is dynamic |

## One code, every platform: smart links

The next problem is that your audience is split across services. A Spotify link does nothing for an Apple Music subscriber except open a web page they will not sign up for.

The usual answer is a **smart link** (sometimes called a landing page or pre-save page): a single web page listing the release with a button for each platform. Distributors and services such as Linkfire, Feature.fm and similar tools generate these, and many artists simply build one on their own site. A Linktree-style page does the same job less elegantly.

Put the smart link URL in the QR code, not the Spotify URL, and the scan works for everyone. The listener taps the service they actually use.

## Make the code dynamic so the release can change

Here is where a printed code and a music career disagree. The poster, the vinyl insert, the sticker on the guitar case and the [t-shirt](/blog/qr-code-for-t-shirts-and-merch) all last for years. The thing you want people to hear changes every few months.

A **static** QR code encodes the link itself. If it points at the single you released in March, it points there forever, including the year the stickers are still on lampposts and the single is three releases old.

A **dynamic** QR code encodes a short link that redirects to the destination, and the destination can be edited. QRly makes this kind: paste the smart link, get a code that contains `qrly.lol/<your-slug>`, and when the next release lands, [change where the link goes](/blog/how-to-change-a-qr-code-link-after-printing) from the dashboard. Every printed code follows within a minute. It is free, it needs no account to make, and there is [no paid plan](/cost) waiting behind it. The [difference between static and dynamic codes](/blog/static-vs-dynamic-qr-codes) matters more for musicians than for almost anyone else, precisely because the merch outlives the release cycle.

Some practical patterns:

- **One code per surface, not one per release.** Make a `tour-poster` code, a `merch` code, a `vinyl-insert` code. Each one always points at whatever you want that surface to promote this month.
- **A "latest release" code** that lives on your social bios, business cards and the merch table sign. Update it on release day.
- **Pre-save before, stream after.** Point the code at the pre-save page in the run-up, then switch it to the smart link on release day. Same posters, no reprint.

Because the redirect is where the scan is counted, a dynamic code also tells you which surface people scan: the venue poster versus the sticker versus the back of the shirt. QRly reports the country, city, device and hour of each scan without putting any script on the listener's phone. Add [UTM parameters](/blog/qr-code-utm-parameters-google-analytics) to the destination if your smart link tool or website analytics can attribute streams to them.

## Posters, merch and vinyl: getting the print right

Music print tends to be dark, busy and stylised, which is exactly what QR codes dislike.

- **Contrast first.** Dark modules on a light patch. If the poster is black, give the code a white box rather than [inverting it](/blog/inverted-qr-code-white-on-black); inverted codes fail on a surprising number of phones.
- **Keep the quiet zone.** Four modules of clear space on every side. Designers crop it constantly; it is the most common reason a code on a gig poster does not scan.
- **Size for distance.** A poster read from a metre away needs a code around 3 cm or larger; a code on a wall across a bar needs to be much bigger. The [size guide](/blog/qr-code-size-guide) covers the arithmetic.
- **A logo is fine, within limits.** QRly's studio lets you drop an artwork or logo in the centre and caps its size to what the error-correction level can survive. Use level Q or H if you do this.
- **Short links make simpler codes.** A smart link URL with tracking parameters can be a hundred characters and produce a dense code. The short link in a dynamic code is under twenty characters, which means fewer modules and a code that scans from further away.
- **Export SVG for print.** PNG at 2048 px is acceptable for social images; anything going to a printer should be vector.

Test the final artwork from a print, on an iPhone and an Android, before it goes to the press. A code on screen scans more forgivingly than the same code on matte paper under stage lighting.

## Frequently asked

**Can a phone camera scan a Spotify Code?**
No. Spotify Codes are a proprietary barcode read only by the camera inside the Spotify app. A standard QR code containing a Spotify link opens with any phone camera and, if Spotify is installed, opens the track in the app.

**What link should I put in a music QR code?**
For a single-platform audience, the share link from that service. For a general audience, a smart link page that lists every platform, so the listener picks their own. Either way, put it behind a dynamic code so you can change it later.

**Can I make an Apple Music QR code?**
Yes. Copy the share link from the Music app (`music.apple.com/…`) and put it in a QR code. On an iPhone it opens the Music app; elsewhere it opens Apple's web player.

**Can I change which song the QR code plays after printing?**
Only with a dynamic code. On QRly, edit the destination in the dashboard and every printed copy follows within a minute. A static code, including a Spotify Code, is fixed forever.

**Is a Spotify playlist QR code different from a track one?**
No. Both are web links from the share sheet; the playlist one looks like `open.spotify.com/playlist/…`. A collaborative playlist behind a dynamic code is a good fit for a venue or a café, since the playlist changes but the code on the wall does not.
