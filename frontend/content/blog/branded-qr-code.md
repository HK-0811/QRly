---
title: Branded QR code: logo, colours, shape and your own domain in the link
description: How to make a branded QR code that still scans: which brand elements survive decoding, why the domain in the link matters more than the logo, and consistent placements.
date: 2026-09-19
category: design
keywords: branded qr code, custom branded qr code, qr code with brand colours and logo, brand qr code generator, qr code branding, company qr code, qr code with logo and colours
---

A branded QR code is usually taken to mean a code with a logo in the middle. That is one part of it, and the least important part. A code carries a brand in four places: the colours, the shape of the modules and eyes, the logo, and the hostname inside the link the code encodes. The first three are what the reader sees before scanning. The fourth is what they see after, in the camera's preview banner, and it is the one most people get wrong by leaving it as the generator's domain.

This post goes through all four, in order of how much they matter and how much scan reliability each one costs.

## What the reader sees before and after scanning

Before the scan, the reader sees a square of modules and whatever you have done to it. A logo, a brand colour and softened corners all say "this is ours" and make the code feel like part of the design rather than a barcode stuck on it.

After the scan, the reader sees a small banner from the camera app with the URL the code contains, and taps it. On an iPhone that banner shows the hostname; on Android it shows the URL. If the code was made with a typical dynamic generator, that hostname is the generator's, not yours. Every visual branding decision is undone in that moment by a link that says someone else's name.

So the order of priorities is: the domain first, because it is the only brand element the scanner shows the reader; then colour, which is nearly free; then shape, which is cheap; then the logo, which is the one that costs scan margin.

## The domain in the link

A dynamic code encodes a short link on some host, and that host redirects to the real destination. The host is a brand decision.

QRly makes codes on `qrly.lol/<slug>` by default. With an account, you can add a [custom domain](/blog/custom-domain-qr-code) such as `qr.yourbrand.com`: one CNAME record pointing at the platform, a certificate issued through Cloudflare for SaaS, and verification that checks DNS across two resolvers and tells you exactly what it found. Codes made on that domain encode `qr.yourbrand.com/<slug>`, and that is what the camera banner shows.

Two further reasons this matters beyond the banner. **Trust**: people have been told to be careful with unfamiliar QR links, and a hostname they recognise is the difference between a tap and a hesitation. **Portability**: a printed code lasts as long as the surface it is on. If the hostname is yours, you control where it resolves for the life of the print; if it is a vendor's, you depend on that vendor for the life of the print. On QRly the hostname and slug of a saved link cannot be changed, precisely because they are already on paper.

Choose the slug with the same care. `qr.yourbrand.com/menu` reads as a brand. `qr.yourbrand.com/x7Kq2` does not, though it works identically. Custom endings are free on every link.

## Colour

Colour is the cheapest brand element to add, and the only rule is contrast. Dark modules on a light background, with a luminance contrast ratio well above the 3:1 floor at which phone cameras begin to fail; 7:1 or better is a comfortable target for print. A dark brand colour for the modules and white, cream or a pale brand tint for the background will typically clear that with room to spare.

What does not work: light or mid-tone module colours (yellow, orange, light green, pastel anything), modules lighter than the background (an inverted code, with its own problems), and gradients across the modules that pass through a mid-tone somewhere. [Custom QR code colours](/blog/custom-qr-code-colours) goes through the pairings that hold up.

QRly's studio sets foreground and background separately and warns when the ratio drops below about 3:1 or the modules are lighter than the background.

## Shape

Rounded modules, dot modules and rounded or ring-shaped finder patterns ("eyes") make a code feel softer and more in keeping with a friendly brand. The cost in reliability is low, provided the structural parts of the symbol are left alone.

A decoder finds the code by its three finder patterns, corrects perspective with the alignment patterns, and reads the grid using the timing patterns. QRly renders all of those solid regardless of the module style you choose, so styling applies to the data modules only. Rounded finder eyes are fine; they keep the 1:1:3:1:1 proportion the decoder is looking for. Loose dots for the finders would not be, which is why the studio does not offer them. The [rounded and dot post](/blog/rounded-and-dot-qr-codes) explains where the limits are.

## Logo

A logo covers modules, and the code survives only because error correction can rebuild what is covered. That budget is finite and it is shared with print wear, dirt, glare and the occasional creased corner.

| Error-correction level | Recoverable | Maximum logo width in QRly |
|---|---|---|
| L | ~7% | 14% |
| M | ~15% | 18% |
| Q | ~25% | 24% |
| H | ~30% | 30% |

The caps are lower than the recovery percentages because the logo should not consume the whole budget. The studio enforces them: choose a larger logo than the level allows and it is drawn at the cap, with a warning saying so. The practical advice is to use level H for any code with a logo, keep the logo within about a quarter of the code's width, and let it sit on the plate the studio draws behind it so it never lands on dark modules. [QR code with logo](/blog/qr-code-with-logo) has the full treatment.

Be honest about the return. A logo in the middle of a 30 mm code is a few millimetres wide. It identifies the brand to someone already looking closely; it does not make anyone look. The caption and the colours do that work at a distance.

## Which brand elements survive scanning

| Element | Seen before scanning | Seen in the camera banner | Affects scan reliability |
|---|---|---|---|
| Module and background colour | Yes | No | Only if contrast is low |
| Module and eye shape | Yes | No | Slightly, if structural parts are styled |
| Logo | Yes, up close | No | Yes; costs error-correction budget |
| Domain in the link | No | Yes | No |
| Caption next to the code | Yes | No | No |

The caption is not a QR feature but it is the most effective branding element on the surface. "Scan to book a table" in the brand typeface, next to a code in the brand colour, is a branded code. A plain black code with that caption still reads as yours. A heavily styled code with no caption and a vendor hostname does not.

## Consistency across placements

A brand usually has more than one code: a menu, a window sticker, a receipt, a bag, a poster, a business card. Keeping them consistent is mostly a matter of discipline about the source.

1. **Settle the style once.** Colours, shapes, logo, error-correction level. Write them down as the QR spec in the brand guidelines, the same way a typeface is specified.
2. **Export one master SVG per link** and place that file everywhere the link appears. SVG scales without loss, so the same file is right at 15 mm and at 400 mm.
3. **Use one domain for every code.** The camera banner should always show the same hostname.
4. **Use one link per placement, not one link per brand.** The window sticker, the menu and the receipt can all go to the same page while being different short links, so that the analytics tell you which surface produced the scan. [Where to place a QR code](/blog/where-to-place-a-qr-code) goes into this.
5. **Test each placement on paper.** Same style, different sizes and stocks, so the [print test](/blog/test-a-qr-code-before-printing) still has to be done per item.

Because QRly codes are dynamic, the style and the destination are independent. You can restyle a code and re-export from [the studio](/create) without touching the link, and change the destination without touching the print. The hostname and slug never change, which is the point.

> The brand element a scanner actually shows the reader is the hostname. Get that right first; the colours and the logo are decoration on top of it.

## Frequently asked

**What is a branded QR code?**
A code styled with a brand's colours, module shapes and logo, and, properly done, one whose link is on the brand's own domain so the camera preview shows a familiar hostname rather than a generator's.

**Can a QR code have brand colours and a logo and still scan?**
Yes, within limits: dark modules on a light background at a contrast ratio of 7:1 or better, structural patterns left solid, and a logo no wider than the error-correction level allows, which at level H is about 30% of the code's width.

**Does the logo affect scanning?**
It covers data modules that error correction has to rebuild, so it uses margin that print wear would otherwise use. Use level H with a logo and keep it well within the cap; the code will still scan, but with less tolerance for damage than a plain one.

**Can the QR code link show my company's domain?**
On QRly, yes, with a custom domain added to an account: one CNAME record and a certificate issued automatically. Codes made on that domain encode `qr.yourbrand.com/<slug>` and that is what the camera shows.

**Is there a free branded QR code generator?**
QRly is free with no paid tier, open source under MIT, and includes the studio, SVG and PNG export, editable destinations and custom domains. Its [cost page](/cost) shows what it costs to run alongside what incumbents publish.
