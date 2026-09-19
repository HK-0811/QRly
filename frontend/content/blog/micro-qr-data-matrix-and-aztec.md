---
title: Micro QR, Data Matrix and Aztec: the other 2D barcodes and where they live
description: QR is not the only matrix code. Micro QR, Data Matrix, Aztec and PDF417 each own a niche, from circuit boards to boarding passes. Here is what each one is for.
date: 2026-09-19
category: advanced
keywords: micro qr code, data matrix vs qr code, aztec code, types of 2d barcodes, pdf417, 2d barcode types, data matrix code, which 2d barcode to use
---

Point a phone at a boarding pass and it may not react. Look closely at a circuit board and there is a tiny square of dots that no camera app recognises. Both are two-dimensional barcodes, both are older or nearly as old as QR, and both are in daily use at enormous scale. They just are not the code that phones learned to read.

This post covers the four you are likely to meet, what each was designed for, and why, if the reader is a phone, the answer is still a QR code.

## The family at a glance

| Code | Standard | Grid | Finder pattern | Max bytes | Where you meet it |
|---|---|---|---|---|---|
| QR | ISO/IEC 18004 | 21 to 177 square | Three corner squares | 2,953 | Everywhere consumer-facing |
| Micro QR | ISO/IEC 18004 | 11 to 17 square | One corner square | 15 | Small electronics, labels |
| Data Matrix | ISO/IEC 16022 | 10 to 144 square, plus rectangles | Solid L on two edges | 1,556 | Components, pharma, aerospace |
| Aztec | ISO/IEC 24778 | 15 to 151 square | Bullseye in the centre | 1,914 | Boarding passes, rail tickets |
| PDF417 | ISO/IEC 15438 | Stacked rows | Start and stop bars | about 1,100 | Driving licences, ID cards |

All of them are public standards with no licence fee, all of them use Reed-Solomon [error correction](/blog/qr-code-error-correction-explained), and all of them encode arbitrary bytes. The differences are in shape, in how small they can go, and in which readers know them.

## Micro QR

Micro QR is part of the QR specification, defined in the same ISO document. It has four sizes, M1 to M4, from 11 by 11 to 17 by 17 modules, and it drops two of the three finder patterns and most of the format overhead to get there. The largest Micro QR holds 35 digits, 21 alphanumeric characters or 15 bytes, with a two-module quiet zone instead of four.

It exists for the case where a full QR code is physically too large: a component label, a tiny part, the edge of a circuit board. It is not for URLs, since even a short one will not fit in 15 bytes, and it is not for consumers, because the built-in camera apps on phones generally do not decode it. A dedicated scanner app or industrial reader is needed.

There is also a rectangular variant, rMQR, standardised in 2022 for labels that are wide but not tall. It has the same problem: excellent for the factory, invisible to a phone.

## Data Matrix

Data Matrix is the code on the back of your phone's battery, on syringes, on aircraft parts, and on almost every small electronic component that has to be traced. Its finder pattern is an L: two solid edges, with the opposite two edges alternating dark and light so the reader can count the grid. That layout wastes far fewer modules than three corner squares, so a Data Matrix code holding the same data as a QR code is noticeably smaller.

It also goes very small. A 10 by 10 Data Matrix carries three digits, and the standard includes rectangular shapes for thin labels. Because it tolerates low contrast and can be read from a code that has been laser-etched or dot-peened into metal rather than printed, it became the standard for direct part marking in aerospace and automotive.

The pharmaceutical use is regulatory. In the EU, the Falsified Medicines Directive requires a unique identifier on prescription medicine packaging, and the carrier chosen was GS1 DataMatrix, encoding product code, serial number, batch and expiry. The same GS1 syntax is on a UPC barcode; Data Matrix just carries more of it in less space. [QR versus barcode](/blog/qr-code-vs-barcode) has more on where the linear codes still sit.

Phones can decode Data Matrix, but support in the built-in camera app varies by platform and version. Google Lens and most scanner apps read it; the plain iOS camera has been inconsistent. If your audience is the public, that inconsistency is disqualifying.

## Aztec

Aztec has the finder pattern in the middle, a bullseye of concentric squares, with data spiralling outward around it. Two things follow from that design. It needs no quiet zone, because the reader locates the centre rather than the edges. And it survives damage to its edges well, because the critical structure is protected in the middle.

That combination made it the choice for tickets printed on cheap stock or displayed on phone screens. The airline industry's boarding pass standard permits several 2D codes, and Aztec is the one you most often see on a phone screen at the gate. Many rail operators in Europe use it on mobile and print-at-home tickets. It is read by the gate scanner, not by another passenger's phone, so consumer phone support was never a design goal.

## PDF417

PDF417 is not a matrix code; it is a stacked linear code, rows of a linear barcode piled up so that a linear scanner sweeping row by row can read it. It is the wide, dense block on the back of a US driving licence and on many ID cards, and it is also permitted for boarding passes. It is large for what it holds, and not something you would choose for a new consumer application.

## Why phones standardised on QR

Every code above works. The reason a poster carries a QR code and nothing else is a chain of decisions that had little to do with the codes themselves.

QR was invented in Japan in 1994 and released without a licence fee, which the [history of the QR code](/blog/history-of-the-qr-code) covers. Japanese feature phones gained QR readers in the early 2000s, so by the time smartphones arrived there was already a public that used it. When Apple added native QR reading to the iOS camera in 2017 and Android did the same through its camera and Lens, they added QR because that was what people were already scanning. The other formats went into scanner apps and platform code libraries, not into the camera app that everyone actually opens.

The result is a reader base that a marketer can rely on: [any recent phone reads a QR code](/blog/how-to-scan-a-qr-code) with no app. No other 2D code can make that claim, and reader coverage is the only thing that matters for a code aimed at the public.

A second reason gets less attention. A QR code is easy to make legible in print: three big finder squares that a camera locks on to from across a room, and a [size](/blog/qr-code-size-guide) that scales with scanning distance. Data Matrix is better on a 5 mm component; QR is better on an A3 poster.

## Choosing one

If you are not sure which code to use, the decision is almost always made by the reader, not the payload.

- **The reader is a member of the public with a phone:** QR code. Nothing else has the coverage. Use a dynamic one if the destination could ever change; [static versus dynamic](/blog/static-vs-dynamic-qr-codes) explains the trade.
- **The reader is your own scanner or a partner's, and space is tight:** Data Matrix. It is smaller for the same data and made for direct part marking.
- **The reader is a gate or a ticket barrier:** whatever the operator's system specifies. That is usually Aztec or PDF417 and it is not your choice.
- **The code has to fit in a few millimetres and holds a short identifier:** Micro QR or a small Data Matrix, read by a dedicated scanner.
- **The payload is a URL:** QR, and a short one. [Why short URLs make better QR codes](/blog/why-short-urls-make-better-qr-codes) goes through the geometry.

QRly makes only the first kind: a QR code, encoding a short link, that redirects to wherever you point it. It does not produce Data Matrix or Aztec, and it does not make offline payloads of any sort. For a public-facing code that is the right shape, and you can [make one](/create) without an account.

## Frequently asked

**Can a phone read a Data Matrix code?**
Usually, with a scanner app or Google Lens. The built-in camera app on some phones will not react to one. That inconsistency is why Data Matrix is used where the reader is known, not on posters.

**What is the difference between Data Matrix and QR code?**
Both are square matrix codes with Reed-Solomon error correction. Data Matrix uses an L-shaped finder along two edges and packs data more tightly, so it is smaller for the same payload and goes down to 10 by 10 modules. QR uses three corner finders, which cost space but let a phone camera find the code from a distance. Data Matrix wins on components; QR wins on anything a person scans.

**What is a Micro QR code used for?**
Very small labels where a full QR code will not fit and the payload is a short identifier, up to 15 bytes. It needs a dedicated reader; phone camera apps generally ignore it.

**What barcode is on a boarding pass?**
Most often Aztec, on both printed and mobile passes. The airline standard also allows PDF417, Data Matrix and QR, and some carriers use those. The gate scanner reads all of them; your phone's camera may not.

**Is Aztec code better than QR?**
For a ticket read by a fixed scanner, arguably: it needs no quiet zone and tolerates damaged edges. For anything a member of the public scans with a phone, no, because phones do not reliably read it.
