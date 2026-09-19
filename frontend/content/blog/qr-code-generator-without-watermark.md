---
title: QR code generator without a watermark: what the logo in the corner costs
description: A watermark is a vendor logo squeezed into the quiet zone or a branded page shown before your link. Both make the code worse. How to spot them and get a clean file.
date: 2026-09-19
category: basics
keywords: qr code generator no watermark, qr code without logo of generator, qr code watermark, remove watermark from qr code, clean qr code download, free qr code no branding
---

Download a "free" QR code, open the file, and there in the bottom corner is a small grey logo that is not yours. Or the file is clean, but every scan passes through a page with the generator's name on it for a second before your site loads. Both are watermarks. Both are placed exactly where they do the most damage to the code, and both are there for the same reason: the download is an advert.

This post covers what a QR code watermark actually is, why it is not merely cosmetic, and how to get a file with nothing on it but your code.

## The two kinds of watermark

**The visible one** is an image or text stamped onto the downloaded file. It is usually placed in the margin around the code — the quiet zone — because the vendor knows that putting it over the modules would break the code outright. Sometimes it is a small logo, sometimes a line of text like *Generated with…*, sometimes a whole branded frame. On the free tier it is fixed; the paid tier removes it.

**The invisible one** is an interstitial page. The code encodes the vendor's short link, and instead of redirecting straight to your page, that link first serves a page with the vendor's branding — *You are being redirected*, with a logo and sometimes a *Create your own* button — and then forwards. The file you downloaded is spotless. The scanner still sees the advert.

The second kind is harder to catch because it only appears when the code is scanned from a real phone, not when you inspect the download. Scan every code you intend to print, and watch what happens between the camera and your page.

## Why a visible watermark breaks scanning

The quiet zone is the blank border around the code, at least four modules wide, and it is not decorative. The decoder in a phone finds the code by locating the three finder patterns and then uses the empty margin to establish where the symbol ends and the rest of the world begins. [The quiet zone](/blog/qr-code-quiet-zone) has its own post because it is the single most-violated rule in QR code design.

A watermark in that margin is, from the decoder's point of view, noise adjacent to the symbol. What happens next depends on the phone:

- A modern iPhone or Android with a good decoder will usually read the code anyway, because the finder patterns are intact and the noise is small.
- An older phone, a cheaper camera, or a scan at an angle in poor light will sometimes fail, because the decoder's edge detection picks up the watermark as part of the symbol and the sampling grid comes out wrong.
- A watermark that is dark and dense — a bold logo — fails more often than pale grey text.

You will not hear about the failures. Nobody emails a business to say the code on the flyer would not scan on their phone; they put the flyer down. So a watermark costs you some fraction of scans, silently, and the fraction is highest on exactly the phones belonging to people who least expect technology to work for them.

The interstitial kind costs differently. Every scan gets a second or two of a stranger's branding, and some people close the tab there. On a slow mobile connection it is worse, because two page loads happen instead of one. And if the vendor's terms ever change, the interstitial can grow a countdown, an advert, or a sign-up prompt, on a code you printed a year ago.

## Why generators add them

Because the free tier has to earn something. A watermark is a conversion tool: it makes the free download good enough to test and not good enough to print, so the person upgrades. That is a reasonable business model, and there is nothing dishonest about it as long as the watermark is visible before you download. It becomes dishonest when the watermark is the interstitial kind and you only discover it after printing.

What it is *not* is a technical necessity. Rendering a QR code is trivial — it happens in your browser, locally, in a few milliseconds. The watermark costs the vendor effort to add. Its absence costs nothing.

## How to check a download for a watermark

Three checks, thirty seconds:

1. **Open the file at full size.** Look at all four edges and the corners. A watermark is often light grey and easy to miss on a white background; zoom in.
2. **If it is an SVG, open it in a text editor.** Search for `<text`, `<image` and the vendor's name. A clean SVG contains only paths or rectangles for the modules and nothing else.
3. **Scan the code with a phone and watch the browser.** If any page appears before yours, even briefly, it is an interstitial. Check the URL bar during the redirect if you can.

And one check before you even download: point the camera at the on-screen code and read the decoded text. If it is the vendor's domain, the interstitial is possible; if it is your URL, it is not, because there is no server in the loop.

## Removing a watermark

You cannot, usefully, and you should not try. Editing the vendor's logo out of a PNG in an image editor is possible, but it leaves you with a raster file whose edges have been touched, and any slip near the modules breaks the code. Editing it out of an SVG is cleaner — delete the offending element — but check the vendor's terms; some licence the free download for non-commercial use only, and the watermark is how they enforce it.

The interstitial kind cannot be removed at all. It lives on the vendor's server, on the short link your printed code contains. The only fix is a different code.

The practical answer is to start with a generator that does not add one.

## What QRly gives you

QRly adds nothing to the file. The SVG contains the modules, the quiet zone, and whatever colour and logo you chose in the studio. The PNG, at 512, 1024 or 2048 pixels, is the same. Rendering is done in your browser, and no image is ever stored on a server.

The short link is a plain 302 redirect: the scanner's browser receives a redirect response and goes straight to your page. No interstitial, no branded page, no script. The [privacy page](/privacy) describes what the redirect records — country, device class, time — and confirms there is no cookie or pixel, which is another way of saying there is nothing between the scan and your page that could carry an advert.

There is no paid tier to upsell to, so there is no reason for a watermark to exist. The [cost page](/cost) shows what the platform costs to run and why that is sustainable. All of this is available without an account — paste a link on [the home page](/), download the file, done — and the [no sign-up post](/blog/qr-code-generator-no-sign-up) covers how claiming a code later works.

## Your own logo is not a watermark

A related question: can you put *your* logo in the code? Yes, in the centre, and it is a different thing entirely. A centred logo covers some of the data modules, and the code survives because of error correction — the redundancy built into the format that lets a decoder reconstruct up to 30% of the symbol at level H. The QRly studio caps the logo width to what the chosen error-correction level can recover and shows a scannability read-out as you adjust it. [QR codes with a logo](/blog/qr-code-with-logo) goes through the details.

The difference from a watermark is placement and budget. Your logo sits in the middle, where error correction is designed to cope, and is sized to the budget. A vendor's watermark sits in the quiet zone, where there is no budget at all, because that margin is supposed to be empty.

> A clean QR code is modules, quiet zone, and nothing else. Anything a generator adds beyond that is for the generator's benefit, not yours, and it comes out of your scan rate.

## Frequently asked

**What is a QR code watermark?**
A vendor logo or text added to the downloaded image, usually in the margin around the code, or a branded page shown for a moment before the scan reaches your link. Both are ways a free tier advertises the generator.

**Do watermarks stop a QR code scanning?**
Sometimes. A watermark in the quiet zone interferes with how the decoder finds the edge of the symbol. Modern phones usually cope; older phones and bad lighting cope less. You lose a share of scans and never find out which.

**Can I remove a watermark from a QR code?**
From an SVG, by deleting the element, though check the licence. From a PNG, only with risk to the modules. From an interstitial page, not at all, because it lives on the vendor's server. Better to regenerate with a tool that adds none.

**Does QRly add a watermark?**
No. The SVG and PNG contain only the code. The redirect is a direct 302 with no branded page in between. There is no paid plan, so nothing to upsell.

**Is a logo in the middle of a QR code the same as a watermark?**
No. A centred logo is your own branding, sized to the error-correction budget so the code still decodes. A watermark is the vendor's branding in the margin, where there is no budget for it.
