---
title: How to download a QR code as SVG, and what to do with the file
description: Where the SVG download is on QRly, what is inside the file, opening it in Illustrator, Inkscape and Figma, converting to PDF or EPS, and why not to trace a PNG.
date: 2026-09-19
category: how-to
keywords: download qr code svg, qr code svg download free, qr code vector download, svg qr code generator, qr code eps, qr code pdf vector, qr code illustrator
---

If a QR code is going anywhere near a printer, a designer or a sign maker, the file they want is a vector, and the vector format everyone accepts is SVG. It scales to any size with sharp edges, it is a few kilobytes, and it can be edited without loss. Most generators put SVG behind a paid tier; QRly does not, and there is no watermark in the file.

This post covers where the download is, what is actually in the file, and how to get it into the tools and formats a print workflow asks for.

## Where the SVG download is

1. Paste your URL on [the home page](/) or [/create](/create) and press the button. You get a short link and a working code.
2. Press **Design the QR code** to open the studio. The download buttons are in the studio: **SVG**, or **PNG** at 512, 1024 or 2048.
3. Choose SVG. The file downloads as `<ending>.svg`, where the ending is the part of the short link after `qrly.lol/`.

No account is needed for this. Downloading saves the current design first, so if you sign up later and reopen the code, the studio shows the same settings you downloaded. The style is what is stored; the image is rendered in your browser every time, which is why there is nothing to "regenerate" and no image hosting involved.

The button on the first screen, before the studio, downloads a PNG at 1024 of the default design. The SVG is in the studio because that is where the design is finalised.

## What is inside the file

A QRly SVG is deliberately plain, because it has to survive being opened by tools that were not written with it in mind. Open it in a text editor and this is what you will find:

- **A `viewBox` in module units.** A 29-module code with a 4-module quiet zone on each side has `viewBox="0 0 37 37"`. One unit is one module. This is what makes the file scale cleanly: there are no fractional pixel positions to round.
- **An intrinsic `width` and `height`** of 8 pixels per module (so 296 × 296 for that example). This is the size a browser or an `img` tag uses if you do not specify one. It is not a limit; it is a default. Set any size you like when you place it.
- **`shape-rendering="crispEdges"`**, which tells renderers not to anti-alias module boundaries. Edges stay hard when the file is rasterised.
- **A background rectangle** covering the whole viewBox, in the background colour. The quiet zone is part of the file, not something the layout has to supply.
- **The dark modules** as a single group with one fill colour. For square modules, horizontal runs are merged into one path, so the file is small. For rounded modules it is a path with rounded corners; for dots it is circles.
- **The three finder patterns**, drawn separately as rectangles or rings so that a designer can find and inspect them.
- **The logo**, if you added one: a background plate and an `<image>` element with the logo embedded as a data URI. Nothing in the file references an external URL.

No text, no fonts, no CSS, no scripts, no external references, no metadata beyond the XML namespace. It is the kind of SVG that Illustrator, Inkscape, Figma, Affinity, InDesign, Word, PowerPoint and Canva all open without complaint.

## Opening it in design tools

**Adobe Illustrator.** File → Open, or File → Place into an existing document. Placed, it arrives as a linked or embedded object; Object → Expand if you want to edit the paths. The modules come in as compound paths; the finder patterns as separate objects. Do not run Object → Path → Simplify, which can shave module corners.

**Inkscape.** File → Open or Import. Inkscape reads the viewBox and sets the document size from the intrinsic width. If Inkscape asks about DPI on import, the answer does not matter for a vector; it only affects how it interprets the intrinsic pixel size, and you will resize anyway.

**Figma.** Drag the file onto the canvas, or use the Place Image / Import options. Figma converts the SVG into vector layers and preserves the groups. You can then export from Figma as SVG, PDF or PNG at any scale. Do not apply a Figma stroke to the paths; a hairline stroke around every module changes their effective size.

**Affinity Designer, Sketch, CorelDRAW** all import SVG directly. Keep the aspect ratio locked when you resize.

**InDesign.** File → Place works with SVG in current versions. For older versions, convert to PDF first (below).

**Word and PowerPoint** (Office 2016 for Microsoft 365, and 2019 onward) and **Canva** all accept SVG as a picture. The [insertion post](/blog/insert-a-qr-code-in-word-powerpoint-and-canva) covers the placement rules for each.

Whatever the tool, three things apply. Resize from a corner so the ratio stays square. Leave the background rectangle in place; it is the quiet zone. And do not recolour the modules in the design tool unless you know what contrast you are producing; [custom colours](/blog/custom-qr-code-colours) explains which pairs decode.

## Converting to PDF or EPS for a printer

Some print shops ask for PDF or EPS rather than SVG. Both are vector, and converting between them is lossless as long as you do not rasterise on the way.

**PDF.** In Illustrator: File → Save As → Adobe PDF. In Inkscape: File → Save As → PDF. In Figma: export as PDF. In a browser: open the SVG, print to PDF, and set margins to none and scale to 100%, though the design-tool route gives you more control over page size. Check the resulting PDF in a viewer at high zoom; edges should stay perfectly sharp no matter how far you zoom.

**EPS.** Illustrator and Inkscape both save EPS. Older print workflows ask for it; it is the same paths in a different wrapper. Some tools convert the embedded logo image to a raster inside the EPS, which is fine because the logo was a raster anyway.

**Colour space.** The SVG is RGB. A print shop working in CMYK will convert black to whatever their default is; if you want the code in pure K (100% black, no other inks), say so, or set it in Illustrator before export. [How to print QR codes](/blog/how-to-print-qr-codes) has the colour notes.

If the printer asks for "a high-resolution image" and will not take a vector, export a PNG from the design tool at 300 dpi for the final size, or use the 2048 PNG from QRly, which covers codes up to about 17 cm.

## Why not trace a PNG

People who have only a PNG sometimes run Illustrator's Image Trace or Inkscape's Trace Bitmap on it to get a vector. Do not. Tracing fits curves to pixel edges, so square modules come out with slightly bowed sides and rounded corners, adjacent modules get merged where the anti-aliasing blurred them, and small features in the finder patterns drift. The result looks like a QR code and decodes worse than the PNG you started with, and sometimes not at all.

If you have a QRly code as a PNG, open the same link in the studio and download the SVG; the design is stored, so it is the same code. If you have a PNG from somewhere else and need a vector, make a new code. The content of a QR code is just a URL, and a new code for the same URL is indistinguishable in function from the old one, except that a dynamic one can be edited afterwards.

## SVG for the web

The same file works as a web image. Use it as the `src` of an `img` with equal width and height, or paste the markup inline. It is smaller than any PNG of comparable quality and looks sharp on every screen density. [Adding a QR code to a website](/blog/how-to-add-a-qr-code-to-a-website) covers the details, including alt text and print stylesheets.

## Frequently asked

**Is the SVG download free?**
Yes. Every QRly code can be downloaded as SVG, with no account, no watermark and no paid tier. The [cost page](/cost) explains why there is no paid tier to be locked behind.

**Why does the SVG open at a small size?**
The file has an intrinsic size of 8 pixels per module, so a typical code opens at around 300 pixels. That is only the default. Resize it to anything; it is a vector and nothing is lost.

**Can I edit the SVG in Illustrator?**
Yes. The modules are paths and the finders are separate objects. Resize freely, keep it square, and avoid simplifying paths, adding strokes or recolouring to low-contrast pairs.

**My printer wants EPS or PDF. Is that a problem?**
No. Open the SVG in Illustrator, Inkscape or Figma and save or export as PDF or EPS. Both are vector; nothing is lost in the conversion.

**Can I turn a PNG QR code into a vector?**
Not well. Auto-tracing distorts the modules and can make the code unreliable. If it is a QRly code, download the SVG from the studio. Otherwise, make a new code for the same URL.
