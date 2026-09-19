---
title: What is a QR code, and how does your phone actually read one
description: A QR code is a grid of dark and light squares that encodes text, usually a URL. Here is what each part of the pattern does and what your phone decodes from it.
date: 2026-09-19
category: basics
keywords: what is a qr code, how do qr codes work, qr code meaning, quick response code, qr code modules, finder pattern, qr code error correction, qr code versions
---

A QR code is a two-dimensional barcode. Where a supermarket barcode stores a dozen digits in a row of stripes, a QR code stores up to a few thousand characters in a square grid of dark and light cells. The name stands for *Quick Response*: Denso Wave, a Toyota subsidiary, designed it in 1994 to track car parts faster than a laser scanner could read a linear barcode.

The format is a published standard, ISO/IEC 18004, and Denso Wave has never enforced its patent against it. That is why every phone camera can read one and anyone can [make a code](/create) without licensing anything.

What follows is what is inside the square, because knowing that makes every later decision — size, colour, logo, error correction — obvious rather than superstitious.

## Modules: the cells of the grid

Each small square in a QR code is a **module**. A module is either dark or light, and that is the whole alphabet: one bit per cell. The code is always square, and its side length in modules is fixed by its **version**.

Version 1 is 21 × 21 modules. Each version adds four per side, so version 10 is 57 × 57 and version 40, the largest, is 177 × 177. More modules means more data, but also smaller modules at a given print size, and smaller modules are harder for a camera to resolve. This is the single reason [short URLs make better QR codes](/blog/why-short-urls-make-better-qr-codes): fewer characters, lower version, bigger cells.

A URL of around 25 characters fits comfortably in a version 2 or 3 code. A 120-character URL with tracking parameters pushes you to version 7 or beyond — twice as many modules per side, each one half the size.

## Finder patterns: how the camera knows where to look

The three large squares in the corners — top-left, top-right, bottom-left — are **finder patterns**. Each is a 7 × 7 block: a dark square, a light ring, a dark ring. That 1:1:3:1:1 ratio along any line through the centre is what the decoder scans for first, chosen because it is very unlikely to occur by accident in ordinary print.

Three finders, not four, is deliberate: the decoder can tell which corner is missing and therefore which way up the code is. That is why a QR code scans upside down, at an angle, or in a mirror.

Around each finder is a one-module light **separator**, and around the whole code is the **quiet zone**: a blank border at least four modules wide. The quiet zone is not decoration. The decoder uses it to find the edge of the symbol, and cropping it is the most common reason a code that "looks fine" refuses to scan. [The quiet zone](/blog/qr-code-quiet-zone) has its own post because designers remove it so often.

## Timing and alignment: correcting for a tilted phone

Between the finders run two **timing patterns**: a row and a column of alternating dark and light modules, finder to finder. They tell the decoder how many modules lie between the corners, so it can build a sampling grid even when the image is slightly stretched.

Versions 2 and above also carry **alignment patterns**: small 5 × 5 targets scattered across the interior. A phone held at an angle sees the code as a trapezoid, and a lens adds curvature. The alignment patterns let the decoder correct for that locally, so a large code on a curved bottle still resolves. Version 1 is small enough not to need any.

## Format information and masking

Next to the finders sit fifteen modules of **format information**, repeated twice so damage to one copy does not matter. They record the error-correction level and which of eight **mask patterns** was applied.

Masking is an XOR pass over the data region. Without it, certain payloads produce blank areas or stripes that resemble finder patterns and confuse decoders. The encoder tries all eight masks, scores each for ugly features, and uses the best; the decoder reads the format bits, un-masks, and only then has the real data. This is why two codes for the same URL from two generators can look different but decode identically.

## Error correction: why a logo in the middle still scans

The data is protected by **Reed–Solomon error correction**, the same family of codes used on CDs and in deep-space communication. The encoder appends redundancy codewords; the decoder uses them to reconstruct codewords that were misread or missing.

There are four levels, chosen when the code is made:

| Level | Recoverable damage | Cost |
|---|---|---|
| L | about 7% | smallest code |
| M | about 15% | the usual default |
| Q | about 25% | more modules |
| H | about 30% | largest code for the same data |

The percentage is the share of codewords that can be lost and still recovered, and that budget is what a logo spends. Cover 20% of a level L code with a logo and nothing is left for a scratch, a fold or a reflection. That is why the [QRly studio](/) caps logo width to what the chosen level can survive — 14% of the width at L, up to 30% at H — and warns when a design goes further. [Error correction](/blog/qr-code-error-correction-explained) has its own post; the short version is that a higher level is the right trade whenever the code will be printed rather than displayed.

## Encoding modes: how text becomes bits

Before any of the above, the payload is converted to bits using one of four **modes**: numeric, alphanumeric, byte and kanji. Most URLs end up in byte mode, eight bits per character, because they contain lowercase letters. An all-uppercase URL can use the denser alphanumeric mode and produce a smaller code, but many web servers treat paths as case-sensitive, so only do that on a server you control. The [versions and capacity](/blog/qr-code-versions-and-capacity) post has the full tables.

## What the phone actually decodes

A camera app does not "see a link". It runs a decoder that:

1. finds three finder patterns in the frame and works out the orientation;
2. reads the timing patterns to establish the module grid;
3. samples every cell as dark or light;
4. reads the format bits, applies the inverse mask, and runs error correction;
5. reassembles the codewords into a string of bytes.

The result is plain text. Nothing more. If the text starts with `http://` or `https://`, the phone offers to open it in a browser. If it starts with `WIFI:`, `tel:`, `mailto:` or `BEGIN:VCARD`, the phone offers to join a network, dial a number, compose an email or save a contact. If it is neither, it shows the text.

This has two consequences worth holding on to.

First, **the code does nothing by itself**. It is inert print. Scanning it costs the code's creator nothing and tells them nothing, unless the text is a URL that leads to a server they control. That is the entire distinction between [static and dynamic codes](/blog/static-vs-dynamic-qr-codes): a static code contains your destination; a dynamic code contains a short link that redirects to it, and the redirect is where scans can be counted and the destination changed.

Second, **you can always inspect a code before trusting it**. Point the camera at it and read the text before tapping. A shortened link hides its destination until followed, which is why [checking where a QR code goes](/blog/check-where-a-qr-code-goes-before-scanning) is a habit worth having, and why QRly checks every destination against Google Safe Browsing.

> A QR code is a text string, drawn as a grid, with enough redundancy to survive a bit of abuse. Everything else — tracking, editing, expiry — happens on the server the text points at, not in the square.

## Why it matters when you make one

Every design decision maps back to one of the parts above. Print size is about module size, and the [size guide](/blog/qr-code-size-guide) works from that. A logo spends error-correction budget. Rounded modules and eye shapes are safe as long as the finder ratio and the quiet zone survive. A short link lowers the version and makes every module bigger. Contrast matters because decoding is a dark-or-light threshold on each cell.

Keep the quiet zone, keep the contrast, and keep the payload short, and a QR code is close to indestructible. Most failures are a human removing one of those three.

## Frequently asked

**What does QR stand for?**
Quick Response. The format was built for speed of reading on an assembly line, where a laser scanner had to be pointed carefully at a linear barcode and a camera could grab a QR code from any angle.

**How much data can a QR code hold?**
Up to 7,089 digits, 4,296 alphanumeric characters, or 2,953 bytes at the largest version and lowest error correction. In practice anything over a couple of hundred characters makes a dense code that is fiddly to scan from print.

**Do QR codes need an internet connection?**
Decoding does not; the phone reads the pattern locally. Opening the result usually does, if it is a URL. A Wi-Fi or contact code works entirely offline.

**Why do QR codes have three squares and not four?**
Three finders in three corners let the decoder work out which corner is empty, and therefore which way up the code is. A fourth would add nothing and cost data space.

**Can a QR code be read if part of it is damaged?**
Yes, up to the error-correction level it was made with: roughly 7%, 15%, 25% or 30% of the symbol. Damage to a finder pattern is worse than damage to the data area, because without the finders the decoder cannot locate the code at all.
