---
title: QR code generator for designers — SVG, control, and what tools miss
description: What a print designer needs from a QR code generator: clean SVG, colour and shape control, logo, quiet zone, no watermark, and a link the client can change later.
date: 2026-09-19
category: comparisons
keywords: qr code generator for designers, qr code for print designers, vector qr code for illustrator, qr code adobe express, svg qr code, qr code indesign, qr code figma, qr code canva
---

A designer's QR code problem is different from everyone else's. You are not scanning it; you are placing it. It has to sit in a layout at a precise size, in the brand's colours, in a file prepress will accept, and it has to survive whatever the printer does to it. Then, three weeks after the job ships, the client emails to say the URL has changed.

Most generators are built for the person scanning. Here is what to look for as the person placing, and how to get the code into Illustrator, InDesign, Figma or Canva without it falling apart.

## What a designer needs from the file

**SVG, not just PNG.** A QR code is a grid of squares. As vector it is resolution-independent, prints crisp at any size, and can be recoloured in the layout. As raster it is a fixed pixel grid that softens when scaled, and a 300 px PNG on an A2 poster is a blur. A generator that only offers PNG, or gates SVG behind a plan, is a screen tool. The [SVG vs PNG post](/blog/qr-code-file-formats-svg-png) covers the trade-offs.

**Clean geometry.** Open the SVG and look at what is in it. The good case is a single compound path, or one rect per module, all fills. The bad cases: modules drawn as strokes (they render with hairline gaps or overlaps depending on the RIP), a raster embedded in an SVG wrapper, or a clipping mask around the whole thing.

**Colour control that respects contrast.** Foreground and background as separate, editable colours. The rule is dark modules on a light ground with strong luminance contrast; hue barely matters, brightness does. Navy on cream is fine; gold on white fails on half of phones, and a good generator warns you.

**Shape control that stays within the spec.** Rounded modules, dots, and rounded or ring-shaped finder patterns are all fine as long as each module's centre stays clearly dark or light and the three finders keep their 1:1:3:1:1 proportions.

**Logo embedding, with a limit.** A logo works by covering modules that error correction reconstructs, so how much you can cover depends on the level, and in practice less than the nominal figure because the damage is concentrated rather than scattered. A generator should cap logo size to the chosen level and tell you when the design is at risk. QRly's studio caps logo width at 14% of the code at level L, 18% at M, 24% at Q and 30% at H, and shows a scannability read-out as you push it. The [logo post](/blog/qr-code-with-logo) has the detail.

**Quiet zone control.** The spec requires a blank margin of at least four modules on every side, in the background colour. Designers crop it because it looks like wasted space, and it is the most common reason a code scans on screen and fails on paper. You want the quiet zone exported as part of the SVG so it is measurable in the layout, and a generator that will not go below four. The [quiet zone post](/blog/qr-code-quiet-zone) is short and worth reading once.

**No watermark**, on the SVG as well as the PNG; some tools watermark only one.

## The one thing design tools miss

Adobe Express, Canva, InDesign's built-in generator (Object › Generate QR Code) and the QR plugins for Figma all produce **static** codes. The URL is encoded directly into the pattern. That is the right call for a code that will never change, and it means nothing sits between the scanner and the page.

It also means that when the client changes the URL — and the client changes the URL — the printed code is wrong and the job is reprinted at someone's expense. Landing pages get renamed, campaigns get retired, agencies lose the client and the domain goes with them. A static code has no answer to any of this.

A **dynamic** code encodes a short link instead, and a redirect sends the scanner to whatever the link currently points at. The client, or you, changes the destination in a dashboard and every printed piece follows. The [editable QR code post](/blog/editable-qr-code) covers how that works.

The workflow is simple: make the short link and the code in a dynamic generator, export the SVG, and place it. You keep every design control; the client gets a link they can change without calling you.

The trade-off is a dependency: the code now relies on whoever runs the redirect. A redirect on a free trial expires; a redirect on the vendor's hostname is theirs; a redirect on the client's own domain — `qr.clientbrand.com` — is portable and survives a change of platform. The [custom domain post](/blog/custom-domain-qr-code) explains the one CNAME record involved.

## Workflow into each tool

**Illustrator.** File › Place the SVG, or open it directly. Check the Layers panel: you want fills, not strokes. If the code arrived as hundreds of individual rects, Pathfinder › Unite merges them into one shape so there are no hairline gaps between adjacent modules on the RIP. Assign a spot or CMYK swatch here rather than trusting the SVG's RGB hex, which the printer will otherwise convert on their own terms. Never scale non-uniformly or apply effects that thin the modules.

**InDesign.** File › Place accepts SVG directly. Object › Generate QR Code produces a native static vector code with a swatch of your choosing, which is fine for a URL that will never change. For a placed SVG, set the frame to the final size and make sure the quiet zone is inside the frame, not cropped by it.

**Figma.** Drag the SVG onto the canvas or paste its contents. Figma imports it as a frame of vector paths; flatten (Ctrl/Cmd+E) if you want a single fill to recolour. Export the placed SVG at the end, not a PNG of the frame.

**Canva.** Upload the SVG or a 2048 px PNG and place it. Canva's own QR app makes a static code, with the caveat above. For a commercial printer, the uploaded SVG is the safer path, because Canva's PDF export keeps vector uploads as vectors.

**Adobe Express.** Its built-in QR generator has colour and style options and produces static codes, fine for a social post where the link will not move. For print, treat it like Canva: bring a dynamic-link SVG in as an asset.

## Pre-flight for the code

Before the file goes to press:

1. **Print it on a desk printer at final size** and scan it with an iPhone and an Android. Screens are more forgiving than paper. The [pre-print test](/blog/test-a-qr-code-before-printing) has the full routine.
2. **Measure the quiet zone** in the layout. Four modules minimum, in the background colour, with nothing inside it — not a caption, not a rule.
3. **Check the logo against the error-correction level.** If you enlarged the logo in the layout, you have exceeded what the level can survive. Regenerate instead.
4. **Decode the code from the proof** and confirm the URL is the short link you expect, on the hostname you expect.

## Where QRly fits

QRly is a free, [open-source](https://github.com/HK-0811/QRly) dynamic QR code generator with a studio built for the person placing the code. Foreground and background colour, square / round / dot modules, square / round / ring finders, error-correction level L to H, a quiet zone that will not go below four modules, and a logo capped to the chosen level, with a scannability read-out that warns before a design goes too far. Export is SVG, or PNG at 512, 1024 or 2048 px, with no watermark on either.

Every code is a short link on `qrly.lol` or on the client's own custom domain, editable from the dashboard after printing, with no expiry and no scan cap. No account is needed to [make one](/create). It does not do vCard, Wi-Fi or other non-URL payloads; for those, InDesign's built-in generator or any static tool is the right choice.

## Frequently asked

**What is the best QR code file format for print?**
SVG. It scales without loss, recolours in the layout, and prepress can convert it to the printer's colour space. Use a 2048 px PNG only where SVG is not accepted, and never below 1024 px for anything larger than a business card.

**Can I recolour a QR code in Illustrator?**
Yes, if it is a vector with fills. Keep dark modules on a light background with strong luminance contrast, and assign a proper swatch rather than relying on the SVG's RGB value.

**How big can the logo be in a QR code?**
It depends on the error-correction level. As a practical cap, around 14% of the code's width at level L, 18% at M, 24% at Q and 30% at H. A generator should enforce this; enlarging the logo afterwards in the layout defeats it.

**Should I use InDesign's or Canva's built-in QR code generator?**
For a URL that will never change, yes; they produce clean static codes. For a campaign, a menu, a product page, or anything a client might want to redirect later, generate a dynamic code elsewhere and place the SVG, so the destination can be edited after printing.

**Does QRly export vector files a printer will accept?**
Yes. The SVG is a plain vector with fills and the quiet zone included, and it places directly into Illustrator, InDesign, Figma and Canva. Assign your own CMYK or spot swatch in the layout, and keep the quiet zone at four modules or more.
