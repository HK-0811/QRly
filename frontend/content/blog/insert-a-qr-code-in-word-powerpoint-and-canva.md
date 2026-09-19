---
title: Insert a QR code in Word, PowerPoint, Google Docs and Canva properly
description: How to add a QR code to Word, PowerPoint, Google Docs, Slides and Canva: which file to download, how to place it, and the app settings that make codes unscannable.
date: 2026-09-19
category: how-to
keywords: insert qr code in word, qr code in powerpoint, add qr code to canva, qr code in google docs, qr code google slides, svg qr code word, qr code in document
---

Getting a QR code into a document is a picture-insert. The part that goes wrong is everything around it: the file you chose, the size it ended up at, the crop that removed the border, the theme colour someone applied because it looked nicer. Every one of those is a code that scans on your screen and fails on the printed handout.

This is the sequence that avoids it, for each of the tools people actually use.

## Step 1: make the code and download the right file

Make the code first, outside the document. The document apps that have a built-in generator make static codes, which means the link is baked in and cannot be changed after the flyer is printed. If the document is going to be printed, or the link might change, make a dynamic code instead: paste the URL on [QRly](/create), get a short link and the code that encodes it, and download.

Then choose the file:

| Format | Use it in | Why |
|---|---|---|
| **SVG** | Word and PowerPoint (2016 and later, Microsoft 365), Canva, Keynote, Pages, Affinity, InDesign | Vector. Scales to any size with sharp edges. The right file for anything printed. |
| **PNG 1024** | Google Docs, Google Slides, older Office, anything that rejects SVG | Fine for screen and for print up to a few centimetres. |
| **PNG 2048** | Same apps, when the code will be printed large | Enough pixels for a poster-sized code without visible softness. |

QRly offers all three from the studio, without a watermark. If you are not sure, take the SVG and the PNG 2048; the file that turns out to be wrong for one app is right for the next. [SVG vs PNG for QR codes](/blog/qr-code-file-formats-svg-png) goes into the difference.

Do not screenshot the code off the screen. You get the screen's resolution and no guaranteed border.

## Word

Word has accepted SVG since Office 2016 for Microsoft 365 subscribers and in Office 2019 and later.

1. **Insert → Pictures → This Device**, choose the SVG or PNG.
2. With the picture selected, open **Layout Options** and set the wrap to **In Front of Text** or **Square**, so the code sits where you put it rather than inline with a paragraph that may reflow.
3. Set the size in **Picture Format → Size**. Keep **Lock aspect ratio** ticked. A code that is 40 mm wide and 38 mm tall is distorted, and distorted codes fail.
4. Leave the white border. Do not use **Crop** to tighten it. That border is the quiet zone the decoder needs.
5. Do not apply **Picture Styles**, shadows, reflections, artistic effects or the **Color** recolour options. Word's SVG recolour in particular will happily turn the modules light grey to match a theme.

Word also has a little-known field code, `DISPLAYBARCODE`, that generates a QR code from text inside the document (`Ctrl+F9`, then `DISPLAYBARCODE "https://example.com" QR`). It works, it is static, and it is useful for mail merges where every letter needs a different code. Check its output against a phone before relying on it, and remember that whatever it encodes is permanent.

Export to PDF (**File → Save As → PDF**) for print. Word's own print dialog can scale pages; the PDF fixes the size.

## PowerPoint

Same rules, one extra. PowerPoint is usually shown on a screen, so the code has to be readable from wherever the audience sits.

1. **Insert → Pictures → This Device**, SVG or PNG.
2. Resize with the corner handles, not the side handles, to keep the aspect ratio.
3. Make it big. A code on a slide is scanned from a distance; a quarter of the slide's height is not too much. See the [size guide](/blog/qr-code-size-guide) for the distance-to-size rule.
4. Put it on a plain area of the slide. A code over a photograph or gradient background loses contrast, and the audience's phones are further away than you think.
5. Keep it on screen long enough. Ten seconds is not enough for a room of people to get their phones out. Put the code on its own slide, or repeat it on the closing slide.

Do not animate the code. A fade-in is fine; anything that moves or scales while people are trying to scan is not.

If you export the deck to video, the code is rasterised at the video resolution. A 1080p export gives a code that scans fine from a screen; do not rely on a code in a video that will be viewed on a phone at low bitrate.

## Google Docs and Google Slides

Neither accepts SVG as an inserted image. Use the PNG at 1024 or 2048.

1. **Insert → Image → Upload from computer**.
2. In Docs, choose **Wrap text** or **In front of text** from the image options so the code stays put.
3. Resize from a corner handle. Google Docs shows the dimensions while you drag.
4. Leave the border. Docs has a crop tool; do not use it on the code.
5. Docs and Slides both have **Image options → Recolor**. Do not.

When you download as PDF, Docs rasterises at a reasonable resolution and a 2048 PNG holds up for A4. For a printed poster made in Slides, set the page size to the poster size before you start (**File → Page setup**), so you are not scaling a small page up at the printer.

## Canva

Canva has a built-in QR Code app in the left panel. It generates static codes: the link is encoded directly, and it cannot be changed later or counted. That is fine for a one-off. For a menu, a sign or anything that will be reprinted, make a dynamic code on QRly and upload it.

1. **Uploads → Upload files**, choose the SVG. Canva accepts SVG and keeps it as a vector, so it will export sharp at any size.
2. Drag it onto the design. Resize from a corner; Canva locks the ratio by default.
3. Canva lets you recolour uploaded SVGs by clicking the colour swatches in the toolbar. This is the single most common way a Canva QR code becomes unscannable: the modules get set to a brand colour that is too light, or the background gets set to a dark tone and the code is now inverted. If you want a coloured code, colour it in the QRly studio, which checks contrast and warns you; leave it alone in Canva. [Custom QR code colours](/blog/custom-qr-code-colours) explains which combinations survive.
4. Do not apply Canva's **Effects**, shadows, transparency or **Edit image** filters to the code.
5. Keep the code off busy backgrounds and photos. Add a white block behind it if the design is dark, and make the block larger than the code so the quiet zone is preserved.

Export as **PDF Print** for anything going to a printer. Tick **Crop marks and bleed** if the printer asks for them. For screen, PNG at the largest size.

## Rules that apply everywhere

- **Keep the quiet zone.** The white border is at least four modules wide on any QRly export. Cropping it is the most frequent single cause of a code that will not scan from print. [The quiet zone](/blog/qr-code-quiet-zone) explains why.
- **Lock the aspect ratio.** A QR code is square. Stretched codes decode poorly or not at all.
- **Do not recolour in the layout app.** Colour the code where the contrast is being checked, or leave it black on white.
- **Do not add effects.** Shadows, glows, gradients and transparency on the code itself all reduce contrast at the edges.
- **Minimum size.** For a handout, 2 cm a side. For a slide or poster, larger, according to the scanning distance.
- **Test from the output**, not from the editor. Print the page, or put the slide up on the actual screen, and scan it with an iPhone and an Android. [Test a QR code before printing](/blog/test-a-qr-code-before-printing) has the full checklist.

## Frequently asked

**Can I insert an SVG QR code in Word?**
Yes, in Office 2016 for Microsoft 365 and in Office 2019 and later. Insert it as a picture. Older versions of Word need the PNG.

**Does PowerPoint have a QR code generator?**
Not built in. Some add-ins exist and make static codes. It is simpler and safer to make the code elsewhere and insert it as a picture.

**Can I add a QR code to Google Docs?**
Yes, as a PNG via Insert → Image. Google Docs and Slides do not accept SVG. Use the 1024 or 2048 PNG and do not crop or recolour it.

**Is the Canva QR code generator free?**
The built-in QR Code app is available in Canva, and it makes static codes. If you need to change the link after printing or count scans, make a dynamic code elsewhere and upload the SVG.

**Why does my QR code scan on screen but not from the printed handout?**
Usually one of: the quiet zone was cropped, the code was resized below 2 cm, it was recoloured to a low-contrast pair, or a PNG that was too small was scaled up. Work through [QR code not working](/blog/qr-code-not-working-how-to-fix) in order.
