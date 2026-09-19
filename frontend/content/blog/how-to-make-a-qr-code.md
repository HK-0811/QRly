---
title: How to make a QR code that works on paper, not just on your screen
description: A step-by-step guide to making a QR code from a link, downloading it as SVG or PNG, and the checks to run before it goes to print. No account, no trial, no watermark.
date: 2026-09-19
category: basics
keywords: how to make a qr code, create a qr code, generate qr code, make a qr code from a link, qr code generator, download qr code svg, qr code for print
---

Making a QR code takes about fifteen seconds. Making one that still scans after it has been printed, laminated, faded by a window and photographed at an angle by a four-year-old phone takes about five minutes more, and almost nobody spends them. This post covers both parts.

The steps below use [QRly](/), because it is free, needs no account, and adds no watermark. The checks at the end apply to any generator.

## Step 1: decide what the code should do

A QR code encodes text. When that text is a web address, a phone offers to open it. So the first question is simply: what page should the scanner land on?

Be specific. Not the home page, but the menu. Not the YouTube channel, but the video. Not the app store, but the app. Every extra tap between the scan and the thing they wanted loses people.

If the answer is not a web page at all — Wi-Fi credentials, a phone number, a contact card — you want a **static** code from your phone's built-in tools or any static generator, and there is a section on that below. QRly makes URL codes only.

## Step 2: paste the link

Go to [the home page](/) and paste the URL into the box. That is the whole input.

Behind the scenes QRly creates a short link on `qrly.lol` with a slug — a few random characters, or one you choose — and draws a QR code that encodes that short link. Scanning the code hits the redirect engine, which answers with a 302 to your destination. The code you print never has to change, because the thing it points at is a row you can edit.

You can pick the ending yourself, for example `qrly.lol/spring-menu`. Once saved, the slug is fixed permanently — deliberately, because the moment it is printed anywhere it cannot be allowed to change. Choose it as carefully as you would choose a filename you will never rename.

## Step 3: check the destination is exactly right

Before downloading, scan the code on the screen with your phone and follow it. Check that:

- it is `https`, not `http`, so nobody gets a browser warning;
- it is the final page, not a redirect chain of your own (each hop is a second of spinner);
- it renders properly on a phone, because that is the only device that will ever scan it;
- it has no login wall, cookie wall or age gate that was not intended.

QRly checks every destination against Google Safe Browsing and refuses private or local addresses, but it cannot know whether you pasted the right page.

## Step 4: style it, within limits

The studio lets you change the foreground and background colours, the module shape (square, round, dots), the finder "eye" shape (square, round, ring), the error-correction level, the quiet zone, and add a logo.

Every one of those can break a code if pushed too far, so the studio shows a scannability read-out as you go and caps the logo at what the chosen error-correction level can absorb. The rules of thumb:

- **Dark on light.** The decoder thresholds each cell as dark or light. A pale foreground or a dark background inverts or flattens that. If you must go [white-on-black](/blog/inverted-qr-code-white-on-black), test more.
- **Keep the quiet zone at four modules.** The blank border is how the decoder finds the edge. The minimum in the studio is four; do not crop it afterwards in a design tool.
- **Use level H if there is a logo.** Level H recovers about 30% damage; the logo spends most of that. Level L leaves nothing for a scratch.
- **Rounded shapes are fine; merged blobs are not.** Modules that flow into each other confuse the sampling grid. Dots with a visible gap scan reliably.

A longer treatment is in [design rules that still scan](/blog/qr-code-design-rules-that-still-scan).

## Step 5: download the right format

Two options: **SVG**, or **PNG** at 512, 1024 or 2048 pixels. Rendering happens in your browser; nothing is stored as an image on a server.

| Going to | Download | Why |
|---|---|---|
| Print of any kind (flyer, poster, packaging, sign) | SVG | Vector; scales to any size with perfectly sharp edges. |
| A designer's InDesign, Illustrator, Figma or Canva file | SVG | Same reason; they will thank you. |
| A website, email or slide deck | PNG 1024 | Universally accepted; large enough for any screen. |
| Something that only takes PNG and will be printed | PNG 2048 | The largest raster; still test at the final size. |

If in doubt, SVG. A code that was downloaded as a small PNG and then scaled up for a banner has blurred module edges, and blurred edges are misread edges. The [file formats post](/blog/qr-code-file-formats-svg-png) goes into the detail.

## Step 6: the checks before printing

This is the five minutes almost nobody spends.

1. **Print one, at the real size, on the real stock.** Not the screen. Paper is lower contrast than a display, and gloss adds reflections.
2. **Scan the print with two phones**, one iPhone and one Android. The camera apps decode differently; a code one refuses, the other may accept, and you want to know now.
3. **Scan it from the distance a real person will stand.** A rule that rarely fails: the code should be at least one tenth of the scanning distance across. A poster read from three metres needs a code 30 cm wide. The [size guide](/blog/qr-code-size-guide) has the table.
4. **Scan it in bad light.** Under a warm bulb, in shade, with a slight glare. If it only works under office lighting it will fail outdoors.
5. **Check the quiet zone survived layout.** Designers crop it. Ask them not to, and check the proof.

Then keep a record of what the code points at and where it is printed. In a year you will not remember.

## Step 7: keep it alive

Because the code encodes a short link and not your URL directly, you can sign up afterwards and claim it. Anonymous codes carry a claim token; register with it and the code becomes yours to edit. From the dashboard you can change the destination — the change reaches every scanner in under a minute — and read scan counts, countries, devices and time of day, without any script or cookie on the scanner's phone.

There is no expiry unless you set one yourself, and nothing is deactivated for inactivity. That is stated on [the cost page](/cost) with the numbers behind it rather than as a promise.

## When to make a static code instead

Sometimes the indirection is not wanted. A static code encodes the payload directly, with no server in between, so it can never be counted, edited or switched off — which is exactly right when:

- **The payload is not a URL.** Wi-Fi credentials (`WIFI:T:WPA;S:name;P:password;;`), a contact card, a phone number, an SMS. Phones handle these natively and no redirect can. Your phone's own share or settings menu will generate a Wi-Fi code; any static generator does the rest.
- **The link must not depend on anyone.** A code going into a printed book, an engraved plaque or a legal document should contain the final URL and nothing else.
- **You do not want a scan count.** A static code goes straight to the page; nothing sees the scan.

For everything else — menus, campaigns, packaging, events, anything that will be changed, measured or reused — a dynamic code is the safer print. The [static versus dynamic](/blog/static-vs-dynamic-qr-codes) post has the full comparison, and if you are still deciding whether to trust a free generator at all, [what "free" actually means](/blog/free-qr-code-generator) is the one to read first.

## Frequently asked

**Can I make a QR code for free?**
Yes. On QRly the code and the short link are made and downloadable before you sign up, and there is no paid plan. Static generators are also free, because a static code is just a picture of your text.

**Do I need an account to create a QR code?**
Not to create or download one. An account is for claiming the code afterwards so you can edit the destination and see scans. [More on that here](/blog/qr-code-generator-no-sign-up).

**What size should a QR code be?**
About one tenth of the distance it will be scanned from, and never smaller than 2 cm across in print. Larger is always safe; smaller must be tested.

**SVG or PNG?**
SVG for anything printed or handed to a designer. PNG at 1024 for screens. Never scale a small PNG up.

**Can I change the link after I have printed the code?**
Only with a dynamic code. A QRly code points at a short link whose destination you can edit from the dashboard; the printed code stays the same. A static code has the URL baked in and cannot be changed without reprinting.
