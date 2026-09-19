---
title: How to print QR codes that scan: file, size, paper, ink and a test print
description: A practical guide to printing QR codes: which file to send, the resolution and size that work, paper and laminate, colour management, sticker materials and label runs.
date: 2026-09-19
category: how-to
keywords: how to print qr codes, print qr code, print qr code stickers, qr code printing tips, qr code resolution for print, qr code label printing, qr code sticker material
---

Printing is where QR codes fail, because everything that was fine on screen meets ink, paper, light and distance at once. Almost all of it is avoidable before the file leaves your computer. This is the sequence, from file to finished sticker.

## Start with the right file

Send a **vector**. An SVG (or a PDF made from one) has no resolution; the printer's RIP draws the modules at whatever size you specify with perfectly sharp edges. Every QRly code downloads as SVG from the studio, without a watermark. If the print shop or the layout tool will not take SVG, use a **PNG at 2048 pixels**, which is enough for a code up to about 17 cm a side at 300 dpi, and far more than enough for anything smaller.

Do not send a JPG. JPEG compression puts ringing artefacts around every hard edge, and a QR code is nothing but hard edges. Do not send a screenshot, or a PNG at 200 pixels with a request to scale it up. [SVG vs PNG](/blog/qr-code-file-formats-svg-png) has the detail.

If the print is laid out in Word, Canva or InDesign, place the file at final size and export to PDF. The PDF is what goes to the printer.

## Size and resolution

Two numbers govern whether a printed code scans: the physical size of the code and the distance the phone will be from it.

A phone camera decodes reliably when each module is at least a fraction of a millimetre across at the scanning distance. The rule most people use is that the code should be roughly **one tenth of the scanning distance** wide: a code scanned from 30 cm should be about 3 cm; from 1 metre, 10 cm; from 3 metres, 30 cm. That is conservative and it works on old phones.

| Where the code goes | Typical scanning distance | Minimum size |
|---|---|---|
| Business card, product label | 15 to 30 cm | 2 cm |
| Menu, flyer, handout | 30 cm | 2.5 to 3 cm |
| Table tent, counter sign | 50 cm | 5 cm |
| Poster on a wall | 1 to 2 m | 10 to 20 cm |
| Window, banner, vehicle | 3 m and up | 30 cm and up |

Resolution only matters for raster files. At 300 dpi, a 2 cm code needs about 240 pixels, so the 512 PNG is fine; a 10 cm code needs 1200 pixels, so use 2048. Print from vector wherever you can and the question goes away. The [size guide](/blog/qr-code-size-guide) has more on the distance rule.

Dense codes need to be bigger. A code encoding a long URL can have 40 or more modules a side, so each module is smaller at a given print size. A short link makes a sparse code, which is one reason a dynamic code prints better than a static code of the full URL.

## Quiet zone and layout

The code needs a clear border on all four sides, at least **four modules** wide, in the background colour. Every QRly export includes it; the studio lets you widen it. What kills it is the layout stage: someone crops the image to fit a box, or places a border line or text hard against the code. Keep the quiet zone, and keep other graphics out of it. [The quiet zone](/blog/qr-code-quiet-zone) explains what the decoder is doing with it.

Do not put the code across a fold, a seam or a die-cut edge. On a bottle or a cup, put it where the curvature is gentlest and keep it small.

## Paper, laminate and glare

Matte or uncoated stock is the safest choice. Gloss paper and gloss laminate reflect light sources as a bright patch, and a bright patch across the code is a region the camera cannot read. Where gloss is unavoidable, make the code bigger so the reflection covers a smaller fraction of it, and rely on error correction (below).

Matte laminate is fine. Avoid textured laminates over the code; the texture becomes noise at the module scale. Outdoors, choose a material rated for UV, because ink that fades to grey loses contrast.

## Colour and ink

Black on white is the reference case and is never wrong. For a coloured code, the questions are contrast and consistency.

- **Rich black is fine.** Print shops often build black from all four inks (C60 M40 Y40 K100 or similar) for a deeper black. This is fine for a QR code, provided registration is good; on a cheap press with misregistered plates, a rich black produces coloured fringes on every module. When in doubt, ask for the code to be printed in 100% K only.
- **Avoid tinted "black".** A dark navy or charcoal that looked black on screen may print noticeably lighter. The decoder wants contrast; a 70% grey on white is marginal.
- **Light colours for modules are a mistake.** Yellow, light green, pastel anything. Save brand colours for the finder patterns or, better, for the material around the code. [Custom QR code colours](/blog/custom-qr-code-colours) has the pairs that work.
- **Do not invert.** White modules on a dark background fails on a meaningful share of phone cameras. If the design is dark, put the code in a light panel.
- **Metallic inks** are for the artwork, not the code. They reflect like gloss.

## Error correction and logos

A QR code carries redundant data so that a damaged code still decodes. The level is chosen when the code is made: L survives about 7% damage, M 15%, Q 25%, H 30%. For print, **M is the sensible default**, Q or H if the code carries a logo or will get scuffed. Higher levels make the code denser, so there is a trade against size.

A logo uses up that margin. The QRly studio caps the logo's width to what the chosen level can afford (14% of the code at L, 18% at M, 24% at Q, 30% at H). What the studio cannot know is how much damage the print will take, so if the code is going somewhere rough, keep the logo smaller than the cap.

## The test print

Print one. On the actual material, at the actual size, from the actual file. Then:

1. Scan it with an iPhone and an Android, from the distance a real person will use.
2. Scan it under the lighting it will live in. A code by a window, under a spotlight, or in a dim corridor behaves differently.
3. Scan it at an angle. Nobody stands square to a poster.
4. Check the phone shows the URL you expect before it opens anything.

If it fails any of these, fix the file or the size, not the phone. [Test a QR code before printing](/blog/test-a-qr-code-before-printing) is the complete checklist.

Only after the test print passes, run the batch.

## Stickers and labels

Vinyl is durable and comes matte or gloss; choose matte. Paper labels are fine indoors. For anything outdoors, on equipment, or handled often, use laminated vinyl or polyester. Die-cut stickers need the quiet zone inside the cut line, so add a few millimetres of background before the edge.

For a batch of labels with the same code, one file and a label template does it. For a batch where every label has a different code (asset tags, table numbers, per-unit packaging), you need one code per item and a way to place them:

- Make the codes individually on QRly and download each as SVG. There is no bulk import; for a few dozen this takes minutes. Keep a register of which short link went on which item.
- Use a label tool that accepts an image per row: InDesign data merge, Word mail merge with pictures, or the software that came with a thermal label printer. Thermal printers do QR codes well because they print pure black at a fixed dot pitch; keep the module a whole number of dots.

One thing only a dynamic code gets you: if five hundred labels go out with the wrong destination, you change it once in the dashboard rather than reprinting. That is the whole reason to prefer [a dynamic code on anything printed](/blog/how-to-change-a-qr-code-link-after-printing).

## Frequently asked

**What resolution should a QR code be for printing?**
Use a vector (SVG or PDF from it) and resolution does not apply. If you must use a PNG, 300 dpi at final size: about 240 pixels for a 2 cm code, 1200 for a 10 cm code. The 2048 PNG from QRly covers codes up to about 17 cm.

**What is the smallest a printed QR code can be?**
Around 2 cm a side for a sparse code scanned up close, on a good printer. Smaller codes work in labs and fail in the world. Dense codes with long URLs need more.

**Can I print a QR code in colour?**
Yes, as long as the modules are dark and the background is light, with strong contrast between them. Colour the code in a generator that checks contrast and leave it alone in the layout software.

**Should I laminate a QR code?**
Matte laminate is fine and protects the print. Gloss laminate causes reflections that block part of the code; if you must use it, make the code bigger.

**Why does my printed QR code not scan when the screen version does?**
Commonly a cropped quiet zone, a code printed too small for the distance, a low-resolution or JPG source, low contrast after printing, or glare. Test-print one and work through the causes in order.
