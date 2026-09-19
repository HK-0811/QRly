---
title: QR code print size and resolution — how big, how many pixels, what DPI
description: Two different questions: file resolution and physical size. The 300 DPI arithmetic for PNG, when SVG makes DPI irrelevant, and how scanning distance sets the size.
date: 2026-09-19
category: design
keywords: qr code print size, qr code resolution, qr code dpi, high resolution qr code for print, qr code minimum size, qr code pixel size, print a qr code, qr code for poster
---

"How big should the QR code be" is two questions wearing one coat. One is about the file: how many pixels, what DPI, which format, so that the printer does not turn the modules to mush. The other is about the object: how many centimetres on the page, so that a phone can read it from where people will actually stand. Printers ask the first; readers care about the second.

## Resolution: SVG makes the question go away

A QR code is a grid of squares. That is the ideal case for a vector format, and **SVG** describes it as exact shapes with no pixels at all. An SVG QR code printed at 2 cm and one printed at 2 m are the same file; the printer's software rasterises it at whatever resolution the press can hold. DPI is not a property of the file, so there is nothing to get wrong.

If the workflow accepts SVG (most design tools, most print shops, anything built on PDF), use it and skip the arithmetic. QRly exports SVG on every code, without a watermark and without an account. The formats are compared in [SVG versus PNG for QR codes](/blog/qr-code-file-formats-svg-png).

## The 300 DPI arithmetic for PNG

When the workflow needs a PNG (a web-to-print form, a spreadsheet, an email to someone who will paste it into Word), the file has a fixed number of pixels and the printed size decides how densely they are laid down. Print shops usually ask for 300 dots per inch. The conversion is division:

| PNG export | Width at 300 DPI | Width at 150 DPI |
|---|---|---|
| 512 px | 4.3 cm (1.7 in) | 8.7 cm |
| 1024 px | 8.7 cm (3.4 in) | 17.3 cm |
| 2048 px | 17.3 cm (6.8 in) | 34.7 cm |

So a 2048 px PNG holds a code up to about 17 cm wide at full 300 DPI, which covers business cards, flyers, table tents, packaging and most A4 material. Larger than that and either the DPI drops or the code needs to be SVG.

The numbers are softer than they look, because QR codes are not photographs. A module is a flat square with hard edges; a 25-module code across 8 cm gives each module more than 3 mm, which is dozens of dots at any DPI, and a 1024 px PNG at 150 DPI is still crisp. What ruins a PNG code is not low DPI but resampling: scaling a small PNG up in a layout tool blurs the module edges into bands of grey. Export at the largest size on offer and scale down, never up.

## Physical size: scanning distance decides

A phone reads a code when each module occupies several pixels of the sensor with clean edges. The further away the reader, the larger the modules must be, and therefore the larger the code.

A widely used rule of thumb is that the code should be about **one tenth of the scanning distance** across. It is guidance rather than a specification, and it assumes a typical phone camera, ordinary lighting and a plain code with good contrast:

| Where | Typical distance | Code width (rule of thumb) |
|---|---|---|
| Business card, label, receipt | 10 to 20 cm | 2 cm minimum |
| Flyer, menu, table tent | 20 to 40 cm | 2.5 to 4 cm |
| Product packaging on a shelf | 30 to 50 cm | 3 to 5 cm |
| A4 poster on a wall | 0.5 to 1.5 m | 8 to 15 cm |
| Shop window, event banner | 1 to 3 m | 15 to 30 cm |
| Vehicle, billboard, large signage | 3 m and more | 30 cm and more, usually much more |

Below about 2 cm, most phone cameras struggle to focus closely enough regardless of the module count, so that is a practical floor for anything a person holds. Sizes by use case are in [the QR code size guide](/blog/qr-code-size-guide).

## Module size is the real constraint

Two codes printed at the same width are not equally readable if one has 25 modules across and the other has 45. The modules of the second are nearly half the size, and they are what the camera has to resolve.

The module count is set by how much data the code carries and by the error-correction level. A full URL with a path and tracking parameters can push a code to version 6 or 7 (41 or 45 modules). A short link like `qrly.lol/abc12` fits in version 2 or 3 (25 or 29 modules) even at level H. That is why [short URLs make better QR codes](/blog/why-short-urls-make-better-qr-codes), and it is the practical benefit of a dynamic code at print time: the code is small because it encodes a short link, and the short link redirects to whatever long destination you like, editable afterwards from the dashboard.

For the print itself, a sensible floor is a module of roughly **half a millimetre** on a good office or offset printer, and larger on anything coarse: thermal receipt printers, screen printing on fabric, engraving, embroidery. Coarse processes cannot hold a clean edge at small sizes, and a module with ragged edges is a module the decoder may misread. On those surfaces, use fewer modules (a short link at level M rather than H) and a bigger code.

## Bleed, trim and the safe area

Print layouts have a trim line, a bleed area beyond it that gets cut off, and a safe area inside it, because the cut can be a millimetre or two off. A QR code belongs entirely inside the safe area, quiet zone included.

The quiet zone is the four-module blank border around the code and it is part of the symbol, not decoration. Neither the trim nor a dark background or frame may come within it; both points are in [the QR code quiet zone](/blog/qr-code-quiet-zone). Position the code at least 3 mm inside the trim plus its own margin, and keep it on one side of any fold: a crease is where ink cracks and paper catches light.

## Laminates, glossy stock and glare

Contrast is what the decoder reads, and the print surface can throw it away after the ink is perfect.

- **Gloss laminate and gloss stock** reflect light sources as a bright patch. If it lands on the code, part of the code reads as white; the reader tilts once and gives up. Prefer matte or soft-touch laminate for anything with a code on it.
- **Clear sleeves, acrylic and glass** add a reflection of the room and an offset ghost of the code. Menus in sleeves and codes behind shop windows are the usual victims; go a size up and keep the code away from the light source.
- **Metallic or textured stock** breaks the flat dark-light boundary. Keep codes on the plain, matte parts of a design.
- **Curved surfaces** (bottles, cups, sleeves) distort the grid. Keep the code small relative to the curve.

Colour interacts with all of this: a navy that prints lighter than the screen showed has lost contrast before the laminate adds glare. The limits are in [custom QR code colours](/blog/custom-qr-code-colours).

## A print checklist

1. Export **SVG**. Fall back to **PNG at 2048 px** if SVG is refused, and never scale a PNG up.
2. Set the physical width from the scanning distance, about a tenth of it, and never below 2 cm for handheld material.
3. Check the module count. A short link keeps it low; a long URL does not. Prefer level H if a logo is involved, M if the surface is coarse.
4. Keep the four-module quiet zone, and keep both it and the code inside the safe area, away from folds.
5. Ask for matte over gloss. If gloss is unavoidable, go a size up.
6. Print a proof at final size on the final stock, and scan it with an iPhone and an Android, under the lighting and from the distance a reader will actually have. The routine is in [how to test a QR code before printing](/blog/test-a-qr-code-before-printing).

[Make a code](/create) and the studio gives you SVG or PNG at 512, 1024 or 2048 px, with the quiet zone included. Because the code is a dynamic short link, the printed item never needs replacing when the destination changes; only the design decisions above are permanent.

## Frequently asked

**What resolution should a QR code be for print?**
Use SVG, which has no resolution and prints crisply at any size. If PNG is required, 2048 px covers a code up to about 17 cm wide at 300 DPI, and 1024 px covers about 8.7 cm. Never enlarge a small PNG in the layout.

**What is the minimum size for a printed QR code?**
About 2 cm across for anything held in the hand, because phone cameras cannot focus closer. For greater distances, use roughly a tenth of the scanning distance: 10 cm for a poster read from a metre away.

**Does DPI matter for a QR code?**
Less than for a photograph. Modules are flat squares with hard edges, so a code printed at 150 DPI is still sharp if each module is several dots wide. What matters is that the file was not resampled and that the module size on paper is large enough for the camera.

**Can a laminated QR code still scan?**
Yes with matte laminate, and usually with gloss if the light source does not reflect off the code. Gloss under direct lighting produces a bright patch that reads as white and defeats the code. Choose matte where you can, and test the finished item under the real lighting.
