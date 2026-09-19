---
title: QR code vs barcode: what the difference is and where each one still wins
description: A barcode stores a dozen digits in one direction; a QR code stores kilobytes in two. Here is how they differ in capacity, readers, damage tolerance and use.
date: 2026-09-19
category: advanced
keywords: qr code vs barcode, difference between qr code and barcode, 2d barcode vs 1d, linear barcode vs qr code, qr code or barcode, matrix barcode, upc vs qr code
---

A QR code is a barcode. That is the first thing to get straight, because the question *QR code vs barcode* usually means *QR code vs the stripes on a tin of beans*, and those stripes have a name: a linear, or one-dimensional, barcode. The QR code is a two-dimensional matrix barcode. They solve different problems, they are read by different hardware, and neither is going away.

## One dimension against two

A linear barcode encodes data in the widths of its bars and the gaps between them, read along a single line. The height of the bars carries no information at all; it is there so the scanner's line can cross the code at a slight angle and still work. A UPC-A code, the one on most retail packaging, holds exactly 12 digits. EAN-13 holds 13. Code 128 can hold more, but the code gets wider with every character, and a shelf label has only so much width.

A QR code encodes data in a grid of square modules, read in two directions at once. Because the area grows with the square of the side, capacity grows fast: a 25 by 25 grid already holds about 26 bytes at medium error correction, and the largest version holds nearly three kilobytes. The full table is in [QR code versions and capacity](/blog/qr-code-versions-and-capacity).

| | Linear barcode (UPC, EAN, Code 128) | QR code |
|---|---|---|
| Data direction | One axis | Two axes |
| Typical payload | 8 to 20 digits or characters | 20 to 300 characters; up to 2,953 bytes |
| Character set | Digits, or a limited ASCII set | Numeric, alphanumeric, bytes, kanji |
| Orientation | Must be read roughly along the bars | Any rotation, and off-axis |
| Error correction | A check digit; detects errors, rarely corrects | Reed-Solomon; recovers 7 to 30 percent |
| Readers | Laser or linear imager, phone camera apps | Phone camera, 2D imagers |
| Standard | GS1 (UPC/EAN), ISO/IEC 15417 (Code 128) | ISO/IEC 18004 |

## Capacity and what it changes

The number in a UPC code is not the product's name or price. It is an identifier that a database at the till turns into both. The barcode is a key; the value lives elsewhere. That model works beautifully when every reader is connected to the same database, which is the case for a retailer's own tills.

A QR code can carry the value itself, and this is the real reason it took over outside retail. A URL, a [Wi-Fi network's credentials](/blog/qr-code-for-wifi), a [contact card](/blog/qr-code-for-vcard-contact), a boarding pass: all of these fit in a QR code and need no shared database to interpret. A stranger's phone can read them with nothing pre-arranged.

That said, the most common QR payload by a distance is a URL, and a URL is also a key that a server turns into a value. The [redirect](/blog/qr-code-redirect-explained) behind a dynamic code is exactly the database lookup that a till does with a UPC, moved onto the internet where any phone can perform it.

## Damage tolerance

A linear barcode has a check digit. If a bar is smudged so that the scanner reads a wrong width, the check digit will usually catch the error and the scanner will refuse to decode rather than decode wrongly. That is detection, not correction. The fix is to try again, which is why a cashier swipes the packet three times.

A QR code has Reed-Solomon [error correction](/blog/qr-code-error-correction-explained) built into its layout. At level H, 30 percent of the code's codewords can be missing or wrong and the reader will still return the correct data. This is what allows a [logo in the middle](/blog/qr-code-with-logo), and it is why a QR code on a wet menu still works after the third spill. A linear barcode with a coffee ring across it is dead.

The other half of damage tolerance is redundancy in the layout. A tall linear barcode survives a horizontal scratch because the scanner can read along a different line. A QR code survives a scratch in any direction because the data is spread across the grid and interleaved, so a localised defect takes out a little from many codewords rather than all of one.

## Orientation and reading distance

A laser scanner sweeps a line across a linear barcode, and if the line does not cross every bar the read fails. In practice that means the code has to be roughly horizontal to the scanner, which is why the cashier turns the packet.

A QR code has three finder patterns, the large squares in the corners, that tell the reader which way is up. It decodes at any rotation and corrects for the perspective of a camera held at an angle. That is the difference between a code on a poster that people scan from wherever they are standing and a code on a label that a machine presents to a fixed reader.

Reading distance follows from module size in both cases. The [size guide](/blog/qr-code-size-guide) has the arithmetic for QR; the short version is that a code must be printed at about a tenth of the distance it will be scanned from.

## Readers

This is where the two families diverge most, and where the choice is often made for you.

**Retail and logistics** run on dedicated hardware: laser scanners at the till, linear imagers in the warehouse, fixed scanners on conveyor lines. A laser scanner cannot read a QR code at all; it needs an area imager. Retailers have been replacing lasers with 2D imagers for years, which is why a till can now scan a coupon on a phone screen, but the product database, the shelf labels and the GS1 numbering scheme are still linear, and there is no reason for them to change.

**Everything consumer-facing** runs on phone cameras. iOS and Android decode QR codes natively in the camera app and have since 2017, with no app to install. Most camera apps can also read linear barcodes, but there is nothing useful for a consumer to do with a UPC number, so it never became a habit. [How to scan a QR code](/blog/how-to-scan-a-qr-code) covers the details per platform.

The consequence is simple. If the reader is a machine you control, either code works and the linear one is often the cheaper and more established choice. If the reader is a stranger's phone, it is a QR code.

## Where each one still wins

**Linear barcodes win** at the point of sale and in the supply chain. The GS1 system gives every product a globally unique number, every till on earth can read it, and the code costs nothing to print on a label. A QR code would add capacity nobody needs and require replacing hardware that already works. GS1 has been extending its own standards to include QR codes carrying a URL alongside the product number, so the two are converging on packaging, but the number in the stripes is not going anywhere.

**QR codes win** wherever the reader is a phone and the payload is more than a number: [menus](/blog/qr-code-for-restaurant-menu), [posters](/blog/qr-code-for-flyers-and-posters), [packaging](/blog/qr-code-for-product-packaging) that links to instructions, [event tickets](/blog/qr-code-for-events-and-invitations), and anything where the destination might change after printing. The last point matters more than it looks: a dynamic QR code on a print run can be pointed somewhere new from a dashboard, and QRly's version of that is [free](/cost) and needs no account to [try](/create).

**Other 2D codes** occupy the gaps. Data Matrix is standard on electronics and pharmaceutical packaging where the code has to be tiny. Aztec is on rail and airline tickets. PDF417 is on driving licences. [Micro QR, Data Matrix and Aztec](/blog/micro-qr-data-matrix-and-aztec) covers when you meet each one.

## Frequently asked

**Is a QR code a type of barcode?**
Yes. Barcode is the family; QR code is a two-dimensional member of it. When people say barcode on its own they usually mean the linear kind, such as UPC or EAN.

**Can a phone scan a regular barcode?**
Most camera apps and all barcode-scanner apps can read UPC and EAN codes. What you get is a number, so it is only useful with an app that looks the number up. Phones read QR codes natively and act on the result, which is why QR became the consumer format.

**Which holds more data, a QR code or a barcode?**
A QR code, by a large margin. A UPC-A code holds 12 digits. A QR code holds up to 7,089 digits, or 2,953 bytes, at its largest version, and a typical URL-carrying code holds 25 to 100 characters.

**Can a barcode scanner read a QR code?**
A laser scanner cannot. A 2D area imager can, and most modern retail scanners are imagers. If a checkout can scan a coupon from a phone screen, it can read a QR code.

**Should I put a barcode or a QR code on my product?**
If it is sold through retailers, you need the GS1 barcode regardless; that is what the till expects. A QR code alongside it is for the customer, linking to instructions, registration or support, and it should be a dynamic one so you can change the page without reprinting the packaging.
