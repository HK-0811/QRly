---
title: QR code SVG or PNG? Which file format to download, and why never JPG
description: SVG scales without loss and is the right format for print; PNG at 512, 1024 or 2048 pixels covers screens and documents; JPG blurs module edges and should be avoided.
date: 2026-09-19
category: basics
keywords: qr code svg, qr code png, vector qr code, qr code jpg, high resolution qr code, qr code file format, qr code for print format, qr code eps
---

A QR code is a grid of squares. It is the easiest image in the world to store losslessly and one of the easiest to ruin by storing it badly. The format you download in decides whether the code you print in a year is the code you made today, so it is worth a minute before clicking the button.

## The three formats, in one table

| Format | What it is | Scales | File size | Transparency | Use it for |
|---|---|---|---|---|---|
| SVG | Vector: a description of the squares | Infinitely, with no loss | A few KB | Yes | Print, design tools, anything that might be resized |
| PNG | Raster: a grid of pixels, losslessly compressed | Down well, up badly | Tens of KB | Yes | Web, email, documents, apps |
| JPG | Raster, lossily compressed for photographs | Down poorly, up badly | Small, but wrong | No | Nothing that involves a QR code |

QRly exports the first two: SVG, or PNG at 512, 1024 or 2048 pixels. It does not export JPG, on purpose.

## SVG is a vector, and a QR code is the ideal vector

An SVG file does not contain pixels. It contains instructions: draw a square of this size at this position, in this colour, and so on for every module. When the file is opened, whatever opens it renders those instructions at whatever size is needed. A 3 cm code and a 3 m code from the same SVG are equally sharp, because both are drawn fresh from the same instructions.

This is exactly what a QR code needs. The whole design is a few hundred identical squares, so the file is tiny, and there is no scale at which it degrades. A printer's rip renders it at the press's native resolution. A designer can drop it into Illustrator, Affinity, Figma or InDesign and recolour it, resize it, or align it to a grid without ever touching pixels.

Use SVG whenever:

- The code is going to print, at any size. Business cards especially, because they are small and the modules are close to the resolution limit of the press.
- Someone else is doing the layout. A designer will thank you for a vector and will quietly resample a PNG.
- The final size is not yet known.
- The code needs a transparent background to sit over a colour or a photo. The [transparent background guide](/blog/transparent-background-qr-code) has the contrast rules that go with that.

The [SVG download walkthrough](/blog/how-to-download-a-qr-code-as-svg) shows where the button is and what to do if a tool refuses the file.

The one thing SVG is not good at is being pasted into software that does not understand it. Some email clients, older versions of office suites and most social media uploaders want a raster. That is what the PNG is for.

## PNG is the right raster

A PNG stores pixels, but it stores them exactly. The compression is lossless, so a black square is a black square, and the edge between it and a white square is one pixel wide, not a smear. PNG also supports transparency, which JPG does not.

The only question with PNG is which size. A raster image can be scaled down with no visible harm; scaling up invents pixels and softens edges. So download the largest you might need, and never enlarge one afterwards.

QRly offers three:

| PNG size | Module width for a version 3 code | Good for |
|---|---|---|
| 512 px | about 14 px | Web pages, email signatures, chat, anywhere the code shows at under 500 px |
| 1024 px | about 28 px | Documents, slides, social posts, a print of up to about 8 cm at 300 dpi |
| 2048 px | about 55 px | Print when SVG is refused, up to about 17 cm at 300 dpi, or a large screen |

The module widths are approximate because they include the quiet zone, but the point stands: at every size, each module is many pixels wide, so the edges are clean after any reasonable downscale.

For print, the arithmetic is width in pixels divided by dots per inch. 2048 pixels at 300 dpi is 6.8 inches, about 17 cm. If the printed code needs to be larger than that and the print shop will not take an SVG, ask them again, because nearly all will; the ones that say no are usually thinking of photographs. If they genuinely cannot, a 2048 PNG stretched to 25 cm is still a code with modules 6 mm wide, so it will scan, but the edges will be softer than they should be.

## Why JPG is the wrong format for a QR code

JPG compression was designed for photographs, where a slight blur across a gradient is invisible. It works by throwing away detail that the eye does not notice in a natural scene. A QR code is the opposite of a natural scene: it is nothing but hard edges between black and white, and hard edges are exactly what JPG throws away.

The result is visible if you zoom in. Every module boundary gets a halo of grey pixels, the ringing artefacts of the compression. Faint speckle appears in the white areas. On a large, well-printed code none of that stops a scan, which is how JPG codes get into circulation in the first place: they work once, on screen, and then fail on a business card where the modules are half a millimetre wide and the halo is a noticeable fraction of that.

The damage is also cumulative. Each time a JPG is opened, edited and re-saved, it is recompressed and the artefacts stack. A code that has been through a design tool, a shared drive and a printer's pre-press workflow as a JPG has been degraded three times. There is no way to recover the original edges; the information has gone.

Two more practical problems: JPG has no transparency, so a code on a coloured background arrives with a white box around it; and JPG files of a QR code are often *larger* than the PNG, because the compressor struggles with content it was never designed for.

If someone sends you a JPG of a code and you have the source, remake it. If you do not, scan the JPG to get the content, then generate a fresh code from that. If it was a dynamic code, the content is the short link, and a new code encoding the same short link is, for every practical purpose, the same code.

## Other formats you may be asked for

**EPS and PDF.** Older print workflows sometimes ask for EPS. Any vector editor will open the SVG and save an EPS or a PDF with no loss, since both are vector containers. A PDF made from the SVG is as good as the SVG.

**WebP and AVIF.** Modern web formats, both with lossless modes. There is no reason to use them for a QR code; PNG is universally supported and the file is already small.

**GIF.** Lossless for a two-colour image, but limited to 256 colours and with clumsy transparency. It is not wrong, just pointless. Use PNG.

**"High resolution QR code."** This phrase usually means someone was given a 200-pixel PNG and it looked bad in print. The answer is not a higher-resolution raster; it is the SVG. If a raster is unavoidable, 2048 pixels is high enough for nearly everything.

## Which one to pick, in practice

- **Print of any kind:** SVG. If refused, PNG 2048.
- **Design tool, any layout work:** SVG.
- **Word, PowerPoint, Google Docs, Canva:** PNG 1024. Recent versions of Word and PowerPoint also import SVG, and the [office document guide](/blog/insert-a-qr-code-in-word-powerpoint-and-canva) covers which ones do.
- **Website, email, messaging:** PNG 512, or 1024 for a page that shows the code large.
- **Social media image:** PNG 1024. The platform will recompress it to JPG on upload, which is unavoidable; a large clean input survives that best.
- **Sending to someone else without knowing what they will do:** both. Two files cost nothing and avoid a round trip.

None of this changes the code itself. The same short link is inside every export, so switching format later is always possible. What the format decides is whether the modules stay square, and the [print size guide](/blog/qr-code-print-size-and-resolution) picks up from there on how big they need to be.

## Frequently asked

**Is SVG or PNG better for a QR code?**
SVG for print and design work, because it scales with no loss. PNG for screens and for software that cannot open SVG. Download both if you are not sure where the code will end up.

**Can I use a JPG QR code?**
It will often scan, but the format blurs the edges of every module and the damage grows each time the file is saved. Use PNG for a raster; never convert a code to JPG.

**What resolution should a QR code be for printing?**
A vector, ideally. If it must be a raster, 2048 pixels covers a print of about 17 cm at 300 dpi. Do not enlarge a smaller PNG; regenerate it at a larger size instead.

**Does the file format affect whether the code scans?**
Only through edge quality. SVG and PNG preserve the modules exactly. JPG adds halos that reduce contrast at module edges, which matters once the modules are small.

**Can I convert a PNG QR code to SVG?**
Tracing a raster gives an approximate vector with wobbly edges. It is better to scan the PNG to get its content and generate a new code from that, which produces an exact SVG.
