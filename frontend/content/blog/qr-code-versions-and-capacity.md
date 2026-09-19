---
title: How much data can a QR code hold? Versions, capacity and the real limit
description: A QR code holds up to 7,089 digits or 2,953 bytes at version 40, but a code that full is unreadable in practice. Here is the capacity table and the limit that matters.
date: 2026-09-19
category: advanced
keywords: how much data can a qr code hold, qr code capacity, qr code versions, qr code maximum characters, qr code version 40, qr code data limit, qr code size versions, qr code byte capacity
---

The largest QR code the standard allows holds 7,089 digits, or 4,296 alphanumeric characters, or 2,953 bytes. Those are the numbers that show up in every answer to *how much data can a QR code hold*, and they are correct. They are also nearly useless, because a code that full is a 177 by 177 grid that no phone will read from a poster.

The practical limit is not the capacity. It is how dense a code your scanners will tolerate. This post covers both, because you need the first to understand the second.

## What a version is

A QR code is a square grid of modules, the dark and light cells. The grid size is called the **version**, and there are forty of them. Version 1 is 21 modules a side. Each version after that adds four modules per side, so version 2 is 25 by 25, version 10 is 57 by 57, and version 40 is 177 by 177.

The formula is simply `21 + 4 × (version − 1)`. A generator does not ask you for a version. It works out the smallest one that fits your data at the error-correction level you chose, and uses that.

Not every module carries data. Every version spends modules on the three finder patterns, the timing strips between them, the format information, and (from version 2 upwards) alignment patterns that help a reader correct for perspective. What is left is data plus [error correction](/blog/qr-code-error-correction-explained), and the split between those two is the second thing that decides capacity.

## The four encoding modes

The same version holds a different number of characters depending on what those characters are. The standard defines four modes, and a good encoder picks the tightest one that fits the input.

| Mode | Character set | Bits per character | Why it exists |
|---|---|---|---|
| Numeric | `0`–`9` | 3⅓ (three digits in 10 bits) | Part numbers, serials |
| Alphanumeric | `0`–`9`, `A`–`Z`, space, `$ % * + - . / :` | 5½ (two characters in 11 bits) | Upper-case text and simple URLs |
| Byte | Any 8-bit value; UTF-8 in practice | 8 | Ordinary URLs and text |
| Kanji | Shift JIS double-byte characters | 13 | The code was invented in Japan |

The one that catches people out is alphanumeric. It has no lower-case letters. A normal URL such as `https://example.com/menu` contains lower case, so it is encoded in byte mode at 8 bits a character, not 5½. An all-capitals URL encodes about a third smaller, but paths are case-sensitive on most servers, including QRly's endings, so it is a trick to test rather than assume.

## Capacity by version and error-correction level

Error correction is the share of the code that is redundancy: roughly 7 percent at level L, 15 at M, 25 at Q and 30 at H. More redundancy means fewer modules left for data, so capacity drops as the level rises. These are the byte-mode figures, which is what a URL uses, for a selection of versions.

| Version | Modules | L | M | Q | H |
|---|---|---|---|---|---|
| 1 | 21 × 21 | 17 | 14 | 11 | 7 |
| 2 | 25 × 25 | 32 | 26 | 20 | 14 |
| 3 | 29 × 29 | 53 | 42 | 32 | 24 |
| 4 | 33 × 33 | 78 | 62 | 46 | 34 |
| 5 | 37 × 37 | 106 | 84 | 60 | 44 |
| 10 | 57 × 57 | 271 | 213 | 151 | 119 |
| 20 | 97 × 97 | 858 | 666 | 482 | 382 |
| 40 | 177 × 177 | 2,953 | 2,331 | 1,663 | 1,273 |

And the maxima at version 40 across all four modes, since those are the numbers people quote.

| Mode | L | M | Q | H |
|---|---|---|---|---|
| Numeric | 7,089 | 5,596 | 3,993 | 3,057 |
| Alphanumeric | 4,296 | 3,391 | 2,420 | 1,852 |
| Byte | 2,953 | 2,331 | 1,663 | 1,273 |
| Kanji | 1,817 | 1,435 | 1,024 | 784 |

Read the first table by row and one thing stands out: going from L to H at the same version costs you roughly 55 to 60 percent of the capacity. Going the other way, keeping the data fixed and raising the level, pushes the version up. A 24-byte URL fits version 2 at M. The same URL at H needs version 3. A 120-byte URL is version 7 at M and version 11 at H, which is 61 modules a side instead of 45.

## Why more data is worse, not just bigger

The version sets the module count. The print size is whatever you make it. So a version 11 code printed at 30 mm has modules of about 0.5 mm, while a version 2 code at the same size has modules of 1.2 mm. The phone camera does not care how much data is in the code. It cares whether it can resolve individual modules from where the person is standing, in the light they have, with the focus their camera manages.

That is the whole argument. Every extra byte in the payload makes each module smaller for a given print size, or forces a larger print for a given module size. The [size guide](/blog/qr-code-size-guide) has the arithmetic for scanning distance, but the short form is that everything gets easier as the version drops.

Dense codes also fail in ways that are hard to see coming. Phone cameras need a minimum module size to focus on, so a high-version code at business-card size makes the camera hunt. Ink spreads, and on a 0.5 mm module a little spread closes the gaps between dark cells. And a thumbprint or a [logo](/blog/qr-code-with-logo) covers more codewords on a dense code than on a sparse one, so the same error-correction level buys less in practice.

A rule that works: aim for version 5 or lower on anything that will be printed. Version 2 to 4 is where most short URLs land, and it is comfortable.

## What this means for URLs

The single largest lever you have over a QR code's density is the length of the text inside it, and for a URL that means the length of the URL. A campaign link with tracking parameters can easily run to 100 or 150 characters. The same link behind a short redirect is around 24.

That is not a marketing argument for short links; it is a geometry argument. [Why short URLs make better QR codes](/blog/why-short-urls-make-better-qr-codes) works through a concrete example, and [dynamic versus static codes](/blog/static-vs-dynamic-qr-codes) covers the other reason to put a redirect in the middle, which is being able to change where it goes.

A QRly code encodes `https://qrly.lol/` plus a seven-character ending, or a shorter custom ending if you choose one. That lands at version 2 for L and M, and at version 3 for Q and H. The studio renders the code live as you change the error-correction level, so you can see the grid get denser before you decide. You can [make one](/create) without an account and compare it against a full-length URL in any static generator.

> The capacity table tells you what is possible. The version your scanners can actually read from a poster tells you what is sensible, and it is a long way below the maximum.

## When you genuinely need a large code

Offline payloads such as [Wi-Fi credentials](/blog/qr-code-for-wifi) or a [vCard](/blog/qr-code-for-vcard-contact) have to carry the whole thing because nothing on the other end will look it up. A vCard with a name, two numbers, an email and an address runs to 200 or 300 bytes and lands around version 10 to 13 at M. That is scannable, but it wants to be printed at 30 mm or more.

Past version 15, ask whether the data has to be in the code at all. A URL to a page that holds the data scans from further away, can be updated, and works on the phones that struggle with dense codes.

## Frequently asked

**What is the maximum number of characters in a QR code?**
At version 40 with level L error correction: 7,089 digits, 4,296 alphanumeric characters, 2,953 bytes, or 1,817 kanji. Raising the error-correction level lowers each of those. Very few real codes go anywhere near these figures.

**How many characters can a QR code hold and still scan well?**
For a printed code, keep the payload under about 100 bytes, which lands at version 5 or below at level M. A short URL of around 25 characters sits at version 2 and is the easiest case for any camera.

**What is a QR code version?**
The grid size. Version 1 is 21 modules a side, and each version adds four, up to 177 at version 40. The generator picks the smallest version that fits your data at the chosen error-correction level; you never set it directly.

**Why does my QR code get bigger when I add a logo?**
It does not, directly. What usually happens is that the generator raises the error-correction level to make room for the logo, and the higher level needs a larger version for the same data. Shortening the URL is the way to claw that back.
