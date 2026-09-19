---
title: Google QR code generator — what Chrome, Lens and Sheets actually give you
description: Google has no standalone QR code generator. Chrome makes one from any page, Lens scans them, Sheets renders them by formula. What each does, and when to go dynamic.
date: 2026-09-19
category: comparisons
keywords: google qr code generator, google qr code, chrome qr code, does google have a qr code generator, google lens qr code, google sheets qr code, create qr code for this page
---

Does Google have a QR code generator? Not as a product. There is no page on google.com where you paste a link and download a code. What exists is scattered across three tools that most people already have: Chrome can make a code for the page you are looking at, Google Lens reads codes, and Google Sheets can render one from a formula if you point it at an image service. Each is useful, each has a hard limit, and none of them is what you want for anything going to print.

## Chrome's built-in QR code

Chrome has had a share-to-QR feature since around 2020. It makes a code for the **URL of the current tab** and nothing else.

On desktop, click the share icon in the address bar (or right-click the page) and choose **Create QR code**. A code appears in a small pop-up with a text field above it that you can edit before downloading. On Android, tap the share menu and pick **QR code**. On iOS Chrome, the same option lives under share.

Three things to know about what comes out.

**It is static.** The code encodes the URL directly. If you later move the page, the code is wrong for good. There is nothing between the scanner and the page, which also means nothing counts the scan. The [static vs dynamic](/blog/static-vs-dynamic-qr-codes) distinction is the whole story here.

**On desktop it has a dinosaur in the middle.** Chrome's offline dinosaur sits in the centre of the code, occupying space that the error correction has to make up for. It scans fine — Chrome chooses an error-correction level that survives it — but you cannot remove it, recolour it, or swap it for your own logo. If you need a code with your own logo, this is not the tool.

**It exports a PNG only**, at a fixed, fairly small size. There is no SVG, so it will not scale cleanly for a poster or a vehicle wrap. The [file format guide](/blog/qr-code-file-formats-svg-png) explains why that matters past business-card size.

Where Chrome's code is exactly right: getting a link from your laptop to your phone, showing a page URL on a projector during a talk, or sharing something in a meeting. Anywhere the code will be scanned within the hour and thrown away, it is the fastest option there is.

## Google Lens, for reading codes

Lens is the scanning half. It is built into the Google app, the Android camera on most phones, Chrome's image search, and Google Photos. Point it at a QR code and it decodes the payload and offers to open it.

Two useful things about it. First, Lens shows the decoded URL before you tap through, which is the habit that [protects you from malicious codes](/blog/check-where-a-qr-code-goes-before-scanning). Second, it works on codes in screenshots and photos, so you can scan a code from an image someone sent you, which the plain camera app cannot always do. A fuller walkthrough is in the scanning guide.

Lens does not generate codes. People searching *google qr code* often mean Lens, and the answer is that it reads, it does not write.

## Google Sheets and the image-formula trick

The third thing people mean by *Google QR code generator* is a spreadsheet formula. Sheets has an `IMAGE()` function that renders any image URL in a cell, and various free QR image services accept a URL as a query parameter and return a PNG. Combine them and each row of a sheet gets a QR code:

```
=IMAGE("https://<qr-image-service>/?size=200x200&data=" & ENCODEURL(A2))
```

It is a genuinely handy trick for a one-off list of a few hundred codes, and [the Sheets and Excel guide](/blog/how-to-make-a-qr-code-in-google-sheets-and-excel) walks through it properly. Be aware of what you are building, though.

- Every code is **static**: it encodes whatever is in column A. Change the cell and the image updates, but a printed copy does not.
- The image is fetched from a **third-party service every time the sheet renders**. If that service goes away or changes its parameters, the cells go blank. Google's own old image-charts endpoint that this trick was built around is deprecated and should not be relied on.
- The output is a **low-resolution PNG**. Fine for a screen, marginal for a label, wrong for anything larger.
- Nothing is tracked, because nothing sits between the scanner and the destination.

If you need per-row unique codes for a print run, the better pattern is to put a short link in each row from a dynamic generator and encode those, so each code can be edited and counted later.

## What all three have in common

Every Google-adjacent method makes a static code that contains the final URL. That is a feature when you want something with no dependency on anyone, and a limitation the moment the destination might change or you want to know whether anyone scanned it.

| Need | Chrome | Lens | Sheets formula | Dynamic generator |
|---|---|---|---|---|
| Code for the page I am on, right now | Yes | — | — | Yes |
| Read a code | — | Yes | — | — |
| Many codes from a list | — | — | Yes | Yes, one at a time |
| Change the destination after printing | No | — | No | Yes |
| Scan counts, country, device | No | — | No | Yes |
| SVG for print | No | — | No | Yes |
| Own logo, colours, shapes | No | — | No | Yes |
| Works with no third party involved | Yes | — | No | No |

## When to use a dynamic generator instead

The switch point is easy to state: use a dynamic code when the destination might change, when the code will be printed on something that outlives the campaign, or when you want to know whether it was scanned.

A dynamic code encodes a short link — `qrly.lol/<slug>`, or `qr.yourbrand.com/<slug>` on a [custom domain](/blog/custom-domain-qr-code) — and a redirect sends the scanner on to the real page with a 302. Change the destination in a dashboard and every printed code follows within a minute. The [dynamic QR code explainer](/blog/what-is-a-dynamic-qr-code) goes into how that works.

QRly does this for free, with no account needed to [make a code](/create), no expiry, no scan cap and no watermark. It exports SVG and PNG up to 2048 px, gives you colour, shape and logo control with a scannability check, and records scan analytics at the redirect without running any script on the phone. It is [open source](https://github.com/HK-0811/QRly) and runs on free cloud tiers, which is why there is no paid plan.

There is one thing a dynamic code cannot do that Chrome's can, and it is worth being honest about: Chrome's code depends on nobody. A dynamic code depends on whoever runs the redirect. If that concerns you, the strongest position is a dynamic code on your own hostname, so that if the platform ever vanished you would point the DNS somewhere else and the printed codes would keep working. QRly supports that with a single CNAME record.

A practical rule: Chrome for anything you will scan today and forget; a dynamic code for anything that goes on paper.

## Frequently asked

**Does Google have a QR code generator?**
Not as a standalone tool. Chrome can create a static QR code for the current page from its share menu, and that is the closest thing. Google Lens scans codes, and Google Sheets can render them via an image formula pointed at a third-party service.

**How do I make a QR code in Chrome?**
On desktop, click the share icon in the address bar and choose Create QR code, or right-click the page. On Android or iOS Chrome, open the share menu and choose QR code. The code encodes the page's URL and downloads as a PNG.

**Why is there a dinosaur in my Chrome QR code?**
It is Chrome's offline-game dinosaur, placed in the centre by design. It cannot be removed or replaced. If you need a clean code or your own logo, use a generator that gives you control over the centre.

**Can Chrome's QR code be tracked or edited?**
No. It is a static code containing the page URL, so nothing sits between the scanner and the page. For an editable, countable code you need a dynamic generator that encodes a short link.

**Is the Google Sheets QR code formula reliable for printing?**
For a quick list on screen, yes. For print, no: the images are small PNGs fetched from an outside service each time the sheet loads, and the codes are static. Generate proper SVGs from short links if the codes are going on anything physical.
