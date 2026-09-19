---
title: Why short URLs make better QR codes: the character count that sets the grid
description: A 121-character campaign URL needs a 45 by 45 QR code; a 24-character short link fits in 25 by 25. Here is the arithmetic, and where the tracking parameters go.
date: 2026-09-19
category: advanced
keywords: qr code url length, shorter url qr code, qr code too complex, simplify qr code, qr code too dense, reduce qr code size, qr code utm parameters too long, qr code short link
---

The most common reason a QR code looks like a grey smudge is not the design and not the printer. It is the URL. A generator takes whatever you paste, works out the smallest grid that holds it, and gives you that grid. Paste a long address and you get a dense code. Nothing else you do in the design panel will undo it.

This is worth understanding as arithmetic, because once you see the chain from characters to modules you stop treating it as a mystery.

## Characters set the version, the version sets the grid

A QR code has forty sizes, called versions. Version 1 is 21 modules a side, and each version adds four, up to 177 at version 40. The generator picks the smallest version that fits your data at the [error-correction level](/blog/qr-code-error-correction-explained) you chose. [QR code versions and capacity](/blog/qr-code-versions-and-capacity) has the full table; the part that matters here is byte mode, which is what a normal URL uses because it contains lower-case letters.

| Version | Grid | Bytes at L | at M | at Q | at H |
|---|---|---|---|---|---|
| 2 | 25 × 25 | 32 | 26 | 20 | 14 |
| 3 | 29 × 29 | 53 | 42 | 32 | 24 |
| 5 | 37 × 37 | 106 | 84 | 60 | 44 |
| 7 | 45 × 45 | 154 | 122 | 86 | 64 |
| 9 | 53 × 53 | 230 | 180 | 130 | 98 |
| 11 | 61 × 61 | 321 | 251 | 177 | 137 |

Each row is a step up in density. Each column is a step up in how much damage or logo the code survives. The URL length decides which row you land on; you do not get to choose.

## A concrete pair

Here is a campaign URL of the kind a marketing team produces for a print run, with the tracking parameters that let Google Analytics attribute the visit:

```
https://www.example.com/spring-campaign/landing?utm_source=poster&utm_medium=print&utm_campaign=spring2026&utm_content=a3
```

That is 121 characters. And here is a short link of the kind QRly generates, which is a hostname plus a seven-character ending:

```
https://qrly.lol/aB3xK9p
```

That is 24 characters. Run both through the table.

| | Campaign URL, 121 bytes | Short link, 24 bytes |
|---|---|---|
| Level L | Version 6, 41 × 41 | Version 2, 25 × 25 |
| Level M | Version 7, 45 × 45 | Version 2, 25 × 25 |
| Level Q | Version 9, 53 × 53 | Version 3, 29 × 29 |
| Level H | Version 11, 61 × 61 | Version 3, 29 × 29 |

At the usual default of level M, the long URL produces a code with 2,025 modules and the short one a code with 625. Print both at 25 mm wide, ignoring the quiet zone, and the modules are 0.56 mm on the long one against 1.0 mm on the short one. A phone camera's ability to read a code from a given distance depends almost entirely on module size, so the short one reads from nearly twice as far, or reads at half the print size. The [size guide](/blog/qr-code-size-guide) has the distance rule.

Now look at the level H column, which is what you want if there is a [logo](/blog/qr-code-with-logo) in the middle. The long URL needs 61 modules a side. The short link needs 29. That is the difference between a logo that costs nothing and a logo that makes the code unreadable at business-card size.

## Where the tracking goes

The obvious objection is that the UTM parameters were the whole point. Dropping them makes the code cleaner and the campaign unmeasurable.

They do not have to be dropped. They have to be moved. A dynamic QR code does not encode your URL; it encodes a short link that redirects to your URL. The parameters go on the destination side of that redirect, where their length costs nothing, because the code only ever contains the short link.

So the code encodes `https://qrly.lol/aB3xK9p`, and the destination on file is the full 121-character address with every parameter intact. A scan hits the redirect, receives a 302 to the long URL, and lands on your page with `utm_source=poster` in place exactly as Google Analytics expects. [UTM parameters with QR codes](/blog/qr-code-utm-parameters-google-analytics) walks through the setup, and [how a redirect works](/blog/qr-code-redirect-explained) covers the hop itself.

Two further things fall out of this arrangement:

- **You can change the parameters after printing.** Renamed the campaign in your analytics? Edit the destination; the poster does not know.
- **The redirect counts the scan itself.** A static code carrying UTMs is only measured if the person's browser reaches your page and your analytics script runs. A redirect records the scan before any of that, with no script on the phone. [Free QR code tracking](/blog/free-qr-code-tracking) covers what that gives you.

## Shorter still

If 24 characters is good, is 16 better? Somewhat. A few things you can do and a few you cannot:

- **A custom ending.** QRly lets you pick the ending, so `https://qrly.lol/menu` is 21 characters. Endings can be as short as three characters. Choose one you are prepared to live with, because once saved [it cannot be changed](/blog/why-qr-code-short-links-must-be-immutable).
- **Your own short domain.** A [custom domain](/blog/custom-domain-qr-code) such as `qr.brand.co` is not necessarily shorter than `qrly.lol`, and the point of it is ownership rather than length. Do not pick a domain for the character count.
- **Dropping `https://`.** Saves eight bytes and most phones will still open the address. Some older readers treat a bare hostname as text and offer to search for it. QRly keeps the scheme in the code because a code that works on every phone is worth eight bytes.
- **Upper-casing the whole URL.** Legal for the scheme and hostname, and it lets the encoder use alphanumeric mode at 5½ bits a character instead of 8. The path is case-sensitive on most servers, including QRly's slugs, so this only works with an ending chosen in capitals. It is a trick for people who have already done everything else.

Below version 2 there is nothing to gain. A 24-byte link is already at version 2 for L and M, and version 1 only holds 14 bytes at M, which is not enough for any real URL. The short link has taken you as far down the table as a URL can go.

## When the code is "too complex"

Generators and scanner apps sometimes report a code as too complex, or a designer says it looks too busy. The diagnosis is always the same: count the characters in the payload. If it is over about 60, that is the problem, and the fix is a redirect. If it is under 30 and the code still fails, the problem is elsewhere: the quiet zone, the contrast, a module shape that has been pushed too far, or a print resolution that has blurred the edges. [QR code design rules that still scan](/blog/qr-code-design-rules-that-still-scan) and [fixing a QR code that will not scan](/blog/qr-code-not-working-how-to-fix) cover those.

QRly's studio renders the code live with a scannability read-out beside it, so you can see what a change to the error-correction level does to the grid before you download. You can [make a code](/create) without an account, put the long URL in as the destination, and compare the result with the same URL pasted into any static generator. The difference is usually two or three versions.

> The URL is the one design decision that is made before the design starts. Get it to 25 characters and every other choice gets easier.

## Frequently asked

**Does a shorter URL make a QR code easier to scan?**
Yes, directly. Fewer characters mean a lower version, which means fewer, larger modules at any print size. A 24-character short link lands at version 2 (25 by 25); a 121-character campaign URL at the same error-correction level lands at version 7 (45 by 45).

**How many characters should a QR code URL be?**
Under 30 is ideal and under 60 is fine for print. Above that, put the URL behind a short redirect and encode the redirect instead. A QRly short link is about 24 characters including the scheme.

**Do UTM parameters make a QR code bigger?**
If they are in the encoded URL, yes; a full set of four parameters adds 60 to 80 characters and two or three versions. Put them on the destination behind a dynamic code and they cost nothing in the code itself.

**Can I make a QR code smaller without changing the URL?**
You can lower the error-correction level, which drops the version by one or two steps, at the cost of damage tolerance and any logo. Beyond that, no: the URL length sets the floor. Shorten the URL or redirect it.

**Why does my QR code look different from someone else's with the same link?**
Different error-correction levels, or a different mask pattern chosen by the encoder, or one generator including the scheme and the other not. All produce valid codes; the version and the density are what to compare.
