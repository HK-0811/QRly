---
title: The history of the QR code, from a Denso factory in 1994 to every menu
description: Masahiro Hara's team at Denso Wave invented the QR code in 1994 to track car parts. Here is how a Go board, an open licence and a camera app update made it universal.
date: 2026-09-19
category: advanced
keywords: history of qr code, who invented the qr code, qr code 1994 denso wave, why is it called qr code, masahiro hara, qr code invention, when was the qr code invented, qr code origin
---

The QR code was designed to be read by a factory scanner in a Japanese car-parts plant, and for its first fifteen years that is more or less all it did. The thing that made it universal was not a change to the code. It was a decision not to charge for it, followed a long time later by two phone makers deciding to build a reader into the camera. This is the sequence, with the parts that are reliably documented and without the parts that get embroidered.

## The problem at Denso

In the early 1990s Denso, a Toyota-group supplier, was tracking parts through its factories with linear barcodes. A barcode holds about twenty characters, so a single box of components might carry ten of them, and a worker scanned each in turn. The people on the line asked for something that could be read in one pass and hold more, including kanji, which no linear barcode could encode. [QR versus barcode](/blog/qr-code-vs-barcode) covers what a linear code can and cannot do; the short version is that it was the wrong tool.

The task went to a small team led by Masahiro Hara at Denso's development division. Two things in the brief shaped everything that followed: capacity, which pointed to a two-dimensional code, and speed, because a factory scanner reads hundreds of codes an hour and the existing 2D formats of the time were slow to locate in an image.

## The Go board and the finder pattern

Hara has said in interviews that the idea of a square grid came from playing Go at lunch: black and white stones on a grid, information carried by which cells are dark. That is the origin story most often repeated and it is his own.

The more important design decision is less charming and more clever. The reason a phone finds a QR code in a busy image almost instantly is the three finder patterns in the corners, and the reason they work is their proportions. Each is a dark square inside a light square inside a dark square, and along any line through the centre, the widths come out at 1:1:3:1:1. Hara's team surveyed printed material, magazines, packaging, documents, to find the ratio of black and white that occurred least often in ordinary print, and chose that ratio so the scanner would not confuse text or graphics for a finder. The name follows directly: *Quick Response* code, for the speed at which it can be located and read.

The rest of the format was assembled from known parts. Reed-Solomon [error correction](/blog/qr-code-error-correction-explained), the same family used on compact discs, so a code could survive grease and damage on a factory floor. Four encoding modes, including kanji. Forty sizes, or [versions](/blog/qr-code-versions-and-capacity), from 21 to 177 modules a side. The code was announced in 1994 and went into use in Denso's plants and across the Japanese automotive supply chain.

## The licence decision

Denso held patents on the QR code. It could have charged a royalty on every reader and every generator, as had been done with other formats. It chose not to. The company published the specification and declared that it would not exercise its patent rights against anyone implementing the standard. The name *QR Code* remains a registered trademark of Denso Wave, the subsidiary spun out in 2001 that now holds the technology, but the format itself is free to use.

Standardisation followed: AIM International in 1997, the Japanese Industrial Standard JIS X 0510 in 1999, and ISO/IEC 18004 in 2000, revised since. Anyone can read the standard and write an encoder or decoder, and a great many have. That is why a code made by one generator scans with every reader. It is also why there is no such thing as a licence fee for QR codes, whatever a vendor's pricing suggests; [why dynamic QR codes cost money](/blog/why-dynamic-qr-codes-cost-money) is about what is actually being charged for.

Nobody on the team became rich from the invention. Hara and his colleagues received the European Patent Office's Popular Prize at the European Inventor Award in 2014, which is roughly the recognition a free standard gets.

## Japan first, by a decade

In 2002, Japanese handset makers began shipping feature phones whose cameras could read QR codes, and the carriers' mobile internet services made a scanned URL useful. Within a few years codes were on Japanese advertising, packaging, tickets and business cards. A Japanese consumer in 2005 used QR codes roughly the way the rest of the world would in 2021.

Elsewhere, the format stalled. Reading a code required installing an app, most people did not, and the codes that did appear were often pointed at pages that were not built for phones. Around 2011 there was a wave of marketing enthusiasm followed by a wave of mockery, and for a while the QR code was a shorthand for technology nobody used. The codes were fine; the reader was missing.

China went a different way. From around 2011, WeChat and Alipay built payments around scanning and presenting QR codes, and by the middle of the decade a paper code taped to a market stall was a normal way to take money. That established, at enormous scale, that the format worked for the public once the reader was in everyone's pocket.

## The camera app

The turning point for the rest of the world is a date. In September 2017, iOS 11 gave the iPhone's camera app the ability to recognise a QR code in its viewfinder and offer to open it, with no app to install. Android reached the same point through camera integrations and Google Lens over the following year or so. From then on, a code on a poster worked for essentially everyone, and the objection that had held it back for fifteen years was gone. [How to scan a QR code](/blog/how-to-scan-a-qr-code) is a very short post as a result.

Adoption still took a push. It came in 2020.

## The menu era

When restaurants reopened during the pandemic, a laminated menu handled by every table was a problem, and a code on the table pointing at a menu web page was the obvious answer. Contact-tracing check-ins used the same mechanism. Within months, a population that had never scanned a code was scanning several a week, and the habit stuck after the reason for it faded. [QR codes for restaurant menus](/blog/qr-code-for-restaurant-menu) is still one of the most common uses.

The menu era also taught the lesson that decides how codes are used today. A menu changes. A code printed on a table tent does not. The solution was to print a code that encoded a short link and change where the short link went, which is the [dynamic QR code](/blog/what-is-a-dynamic-qr-code), and it is what most codes printed for the public now are.

## What has not changed

Thirty years on, the code on a menu is the same format that tracked a gearbox in 1994. The same finder proportions, the same error correction, the same forty versions. Denso Wave has published extensions, Micro QR for tiny labels, rMQR for rectangular ones, formats with a private layer for tickets, and [the other 2D codes](/blog/micro-qr-data-matrix-and-aztec) occupy their own niches. But the thing a phone reads is the 1994 design, unchanged because it did not need to change and because a free standard has no owner with an incentive to churn it.

That is the part of the history worth keeping. The format was given away, so everyone implemented it, so every reader works, so a code you print today will scan in twenty years. What sits behind the code, the redirect, is a separate question, and it is the one QRly is [open source](https://github.com/HK-0811/QRly) to answer. You can [make one](/create) in the format Hara's team designed, with no account and no licence, because there never was one.

## Frequently asked

**Who invented the QR code?**
A team at Denso, the Japanese automotive supplier, led by Masahiro Hara. It was announced in 1994. The technology is now held by Denso Wave, a Denso subsidiary.

**Why is it called a QR code?**
QR stands for Quick Response. The finder patterns in three corners let a scanner locate and orient the code almost instantly, which was the main requirement from the factory floor it was designed for.

**Is the QR code patented?**
Denso held patents but publicly waived enforcement against anyone implementing the published standard, ISO/IEC 18004. The name QR Code is a registered trademark of Denso Wave; the format is free to use and there is no licence fee.

**When did phones start reading QR codes?**
Japanese feature phones from 2002. Elsewhere, native support in the iPhone camera arrived with iOS 11 in September 2017, and Android followed through its camera apps and Google Lens. Before that a separate app was required, which is why adoption outside Japan and China was slow.

**Why did QR codes suddenly become common in 2020?**
Contactless menus and venue check-ins during the pandemic gave people a reason to scan several times a week, on phones that could already do it natively. The habit outlasted the reason.
