---
title: Canva QR code generator: how it works, where it stops, the dynamic workflow
description: Canva's QR code element makes a static code embedded in the design. What that means for editing and tracking, and how to place a dynamic QRly code in Canva instead.
date: 2026-09-19
category: comparisons
keywords: canva qr code, canva qr code generator, qr code in canva, canva qr code dynamic, canva qr code not working, dynamic qr code canva, editable qr code
---

Canva has a QR code generator built into the editor. You type a URL, a code appears on the canvas, you resize it and export the design. It is the most convenient way to put a QR code on a poster that already exists in Canva, and for a lot of one-off print it is entirely adequate.

It is also the source of a specific kind of reprint. The code Canva generates is static and lives inside the design, so once the poster is printed the link can never change and nothing counts the scans. This post explains how the element works, what it is good for, where it stops, and the workflow that puts a dynamic code in a Canva design.

## How Canva's QR code element works

In the editor, the QR code tool takes a URL and generates a code that encodes that URL directly. The result is a graphic element like any other: you can scale it, position it, and, depending on the version of the tool, adjust its colours. When you export the design as PDF, PNG or SVG, the code is rendered as part of the image.

Two properties follow, and both are worth confirming on your own design rather than trusting a blog post, since the tool changes.

**The code is static.** Point a phone at it on screen and the decoded text is the URL you typed. There is no redirect and no Canva server in the path; the URL is what is in the squares.

**The code is baked into the export.** It is not a link the design references; it is pixels or paths in the file. Change the URL in Canva and you get a new code, but the old export, and anything printed from it, still contains the old URL.

## What it is good for

The static, embedded model has genuine advantages, and it would be unfair to skip them.

- **Speed.** The code is in the design in seconds, styled to sit with everything else on the page.
- **No dependency.** A static code cannot expire and cannot be watermarked at the scan. If it points at your website, it works for as long as your website does.
- **No account elsewhere.** Everything happens inside a tool the designer is already in.
- **Consistent output.** The code exports at whatever resolution the design does, with the design's colours.

For a link that will never change, on a print with a short life, where nobody needs a scan count, this is the right tool: a one-evening event poster, a sign pointing at your homepage, a handout for a single class. [Static vs dynamic QR codes](/blog/static-vs-dynamic-qr-codes) sets out the choice in general.

## Where it stops

The problems appear the moment either of two things is true: the destination might change, or you want to know whether anyone scanned.

**No editing after print.** A menu that moves to a new page, a promotion that ends, a form that gets replaced, a product page that is restructured. On a static code, every one of these is a reprint. There is nothing to edit because the URL is in the squares. [How to change a QR code link after printing](/blog/how-to-change-a-qr-code-link-after-printing) explains why only a dynamic code can be redirected.

**No tracking.** The phone goes straight from the code to your page. Nothing observes the scan, so there is no count, no location, no device breakdown, and no way to tell whether the poster in the window is outperforming the one by the till. If you need that, the code has to pass through something that can count it.

**Design risks with no warning.** A QR code inside a design editor is subject to everything a design editor can do to it: recolouring to low contrast, placing over a busy background, cropping the quiet zone to fit a layout, scaling it below a readable size. Canva does not check scannability for you. Read the [design rules that still scan](/blog/qr-code-design-rules-that-still-scan) before exporting anything, and [test the code before printing](/blog/test-a-qr-code-before-printing).

## The workflow: dynamic code from QRly, placed in Canva

Canva is where the design lives; the QR code does not have to be generated there. The workflow that gives you both a Canva layout and a code you can edit and count is three steps.

**1. Make the dynamic code on QRly.** Paste the destination URL on [the home page](/) or at [/create](/create). QRly makes a short link, `qrly.lol/<slug>` or your own domain, and a QR code that encodes it. Scanning hits the redirect engine, which sends a 302 to your destination, and that is what makes the destination editable and the scans countable. No account is needed for this step; sign up afterwards to keep the code and edit it.

Choose the ending you want before saving, because the slug is immutable once created; it is going on paper. Set colours and eye shapes here if you want them, or leave the code plain and let Canva's layout carry the styling around it. If a logo is going in, the studio caps its size to what the error-correction level can survive and shows a scannability read-out.

**2. Export as SVG.** SVG scales without loss, so the code in Canva will be as sharp at A0 as at A6. If Canva's uploader rejects an SVG in your plan or version, download the PNG at 2048 pixels instead, sized so it is never enlarged in the layout.

**3. Upload to Canva and place it.** Drag it onto the design and treat it as a fixed element: do not recolour it to low contrast, do not crop it, and keep a clear border of at least four modules around it. Size it for the viewing distance using [the print size guide](/blog/qr-code-print-size-and-resolution). Export the design as usual.

Now the code in the design encodes the QRly short link rather than the destination. When the destination changes, edit it in the QRly dashboard; the change reaches every edge in under 60 seconds and the printed poster follows. Every scan shows in the analytics: total and unique per day, country and city, device, OS, time of day, referrer and UTMs, derived from the redirect request with no script on the scanner's phone. The [privacy page](/privacy) lists every field.

## Why not do this with any dynamic generator

You can; the same three steps work with any tool that exports a clean SVG. The reason to be careful about which one is that the code in your Canva design now contains that tool's domain, and the print depends on that domain's redirect staying up. Before uploading anyone's dynamic code into a design going to print, decode it and read the terms for trials, scan caps and inactivity rules; the [rubric for free generators](/blog/best-free-qr-code-generators) is the checklist.

QRly's terms on that are short: no trial, no cap, no expiry unless you set one, no watermark. There is no paid plan, because the platform runs at $0 a month on cloud free tiers and the [cost page](/cost) shows how. The source is MIT licensed at https://github.com/HK-0811/QRly. If you want the printed code to depend on nobody but you, put it on your own domain with a custom domain, which needs an account and one CNAME record.

QRly makes URL codes only. If the code in your design needs to be a Wi-Fi code, a vCard or a phone number, a static generator, Canva's element included, is the correct tool, and there is no dynamic version of those formats to be had.

## A checklist before the Canva design goes to print

1. Decode the code on the exported design with a phone. Confirm it is the link you expect, static or dynamic.
2. Confirm contrast: dark modules on a light background, and think twice before inverting anything.
3. Confirm the quiet zone survived the layout: four modules minimum, clear of text, borders and photos.
4. Confirm the size at print scale, printed on paper, scanned from the distance it will be read at.
5. If dynamic, scan the print and confirm the redirect lands where it should. Then change the destination once and scan again, so you know editing works before it matters.

## Frequently asked

**Is Canva's QR code static or dynamic?**
The built-in element generates a code that encodes the URL you type, which is static: no redirect, no editing after export, no tracking. Decode a test code with your phone to confirm what your version produces.

**Can I edit a Canva QR code after printing?**
No. The URL is in the code itself and the code is baked into the exported design. To have an editable code, generate a dynamic one on QRly, export it as SVG, and place that in Canva instead.

**Can I track scans on a Canva QR code?**
Not on the built-in static code; nothing sits between the phone and your page. A QRly code placed in the design reports every scan from its redirect, with no script on the scanner's phone.

**Does the QRly code in my design ever expire?**
No, unless you set an expiry date on it yourself. There is no trial, cap or inactivity deletion. For a print whose life may outlast any vendor, put the code on your own domain so the hostname is yours.
