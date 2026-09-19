---
title: How to make a QR code for free, step by step, from link to print
description: A complete walkthrough of making a free QR code on QRly: paste the URL, choose an ending, design it in the studio, download SVG or PNG, print, and edit it afterwards.
date: 2026-09-19
category: how-to
keywords: how to make a qr code for free, free qr code step by step, create free qr code, make qr code online free, free qr code generator tutorial, qr code without account
---

This is the whole process, in the order it happens, with what each choice does and which ones you can ignore. It uses QRly because it is free without a catch: no trial, no watermark, no expiry, no cap, and no account needed until you want to edit something. The [cost page](/cost) shows why that is sustainable, and the [source](https://github.com/HK-0811/QRly) is public.

Ten minutes from start to a test print, if you do not dawdle in the design step.

## Before you start: what you are making

A QRly code is a **dynamic** code. It does not contain your URL. It contains a short link, `qrly.lol/<ending>`, and scanning it sends the phone through a redirect (a 302) to your destination. The point of the indirection is that the destination can be changed after the code is printed, and the redirect can count the scans.

If you specifically want a **static** code, where the URL itself is in the image and nothing sits in between, QRly is not the tool; your phone can make one (see the iPhone and Android posts in this section). The trade-offs are in [static vs dynamic](/blog/static-vs-dynamic-qr-codes). For anything printed, dynamic is the safer choice, and this walkthrough assumes it.

## Step 1: paste the link

Open [the home page](/) or [/create](/create). There is one field. Paste the full destination URL, including `https://`.

Look at the URL first. If it has tracking junk on the end that you did not add on purpose, remove it. If it redirects somewhere else, use the final page. If it is behind a login, scanners will hit the login.

QRly checks the destination against Google Safe Browsing and refuses private or local addresses, so a link to `localhost` or a `192.168.x.x` address will be rejected; the code is for the public internet.

## Step 2: the optional fields

Under the URL field is a row for **label, custom ending and expiry**. All three are optional.

**Label.** A name only you see, so the dashboard reads "Spring menu poster" rather than a slug. Fill it in if you will ever have more than three codes.

**Custom ending.** The part after `qrly.lol/`. Leave it empty and one is invented. Set it if you want the short link to be readable by a human, because the short link is printed under the code on many designs and people do type them. Something like `spring` or `table-12`. Once the code is saved, the ending is permanent. It cannot be changed, by design, because it may already be printed.

**Expires.** A date after which scans get an "expired" page that says when it expired. Leave it blank for a code that never expires. Set it for a promotion or an event where a dead code is better than a stale one. You can change or clear the date later from the dashboard.

If you have an account with a custom domain, a **Domain** field also appears here. That is locked once saved, like the ending.

Press the button.

## Step 3: you have a code

The next screen shows the QR code, the short link (with a copy button), and the destination under it. This code already works. You could stop here and download the PNG at 1024 from the button on this screen; it is black on white with the default settings and it will scan.

If you are not signed in, a note says the file is yours already and that an account lets you change the destination later. That is accurate. Nothing about the code changes when you sign up; the account just gives you the dashboard for it.

## Step 4: the studio (optional)

Press **Design the QR code** to open the studio. Everything here is rendered in your browser; QRly stores the style settings, never an image. The panel has four sections.

**Appearance.**
- *Module colour* and *background*. Dark on light. The read-out warns if the contrast drops too far. Black on white is never wrong.
- *Module shape*: square, rounded, dots. Rounded and dots look softer; the finder patterns stay solid whatever you pick, because decoders need them intact.
- *Finder shape*: square, round, ring. The three big corner squares.
- *Error correction*: L, M, Q, H. How much of the code can be lost and still decode (roughly 7%, 15%, 25%, 30%). M is a good default. Go higher if you add a logo or the code will be somewhere rough; the code gets denser as you go up.
- *Quiet zone*: the border, in modules. The minimum is four, and four is fine. Widen it if the code is going into a busy layout.

**Logo.** Drop an image under 200 KB. It is embedded in the SVG itself, not uploaded anywhere. The size slider is capped to what the chosen error-correction level can survive: 14% of the code's width at L, 18% at M, 24% at Q, 30% at H. Raise the level if you want a bigger logo. [QR code with logo](/blog/qr-code-with-logo) explains the trade.

**Scannability.** A read-out that checks contrast, logo size, quiet zone and density and flags anything that has gone too far. If it shows a warning, fix it before downloading. This is the part most generators leave you to discover from a failed print.

**Download.** SVG, or PNG at 512, 1024 or 2048 pixels. Downloading saves the design first, so the file and the record agree.

The whole studio is optional. A default black code with a four-module quiet zone at level M is the most scannable thing you can produce, and every design choice moves away from that. Make the choices that matter to the design and leave the rest alone.

## Step 5: which file to download

| Going to | Download |
|---|---|
| A printer, a designer, InDesign, Canva, Word, PowerPoint | **SVG** |
| Google Docs, Google Slides, email, a chat message, social | **PNG 1024** |
| A large print where SVG is not accepted | **PNG 2048** |
| A tiny use on screen | PNG 512 |

SVG is a vector: sharp at any size, small file, what print wants. PNG is pixels: choose a size big enough for the largest use.

## Step 6: place, test, print

Put the file in the layout at the size it will be printed, keep the border, do not stretch it, do not recolour it in the layout tool. Print one. Scan it from the print with two phones from the distance a real person will use, and check the URL the phone shows. Then print the batch. [How to print QR codes](/blog/how-to-print-qr-codes) has the material and size detail; [test a QR code before printing](/blog/test-a-qr-code-before-printing) is the checklist.

## Step 7: the account (optional, and when it stops being optional)

You do not need an account to do any of the above. You need one for three things:

1. **Changing the destination.** From the dashboard, open the link, edit the URL, save. The change reaches every scanner in under a minute. The printed code does not change.
2. **Seeing scans.** Total scans, unique visitors per day, country and city, device and OS, hour and weekday, referrer, UTM parameters. Recorded at the redirect, with no cookie and no script on the scanner's phone; the [privacy page](/privacy) lists every field.
3. **Custom domains**, so the code says `qr.yourbrand.com` instead of `qrly.lol`.

If you made the code without an account, the browser that made it holds a claim token. Sign up from that browser and the code becomes yours. If you have closed that browser and cleared its storage, the code still works forever, but nobody can edit it; make a new one and sign in first next time. [QR code generator, no sign-up](/blog/qr-code-generator-no-sign-up) explains the claim flow.

## Step 8: the post-print edit

This is the step that justifies everything above. Six weeks later, the menu page moves, or the campaign changes, or the link you printed on two thousand boxes has a typo you only just noticed. Open the dashboard, open the link, change the destination, save. Done. Nothing is reprinted. [How to change a QR code link after printing](/blog/how-to-change-a-qr-code-link-after-printing) walks through it and through what you cannot change (the domain and the ending, which are what is printed).

## Frequently asked

**Is it really free, with no trial?**
Yes. There is no paid plan to be trialling. QRly runs on free-tier infrastructure and costs nothing to operate; the cost page shows the numbers next to what other generators publish.

**Do I have to sign up?**
Not to make and download a code. Sign up to change the destination later, see scans, or use a custom domain. Codes made without an account keep working indefinitely.

**Will the code stop working if I do not use it?**
No. Nothing is deactivated for inactivity and there is no scan cap. The only way a QRly code stops resolving is if you set an expiry date on it yourself.

**Can I make a Wi-Fi, contact or phone-number QR code this way?**
No. Every QRly code is a URL short link. Wi-Fi, vCard and tel: codes are static formats; your phone or any static generator makes them.

**How many codes can I make?**
There is no stated limit and no per-code charge. The service is sized for a thousand or two users rather than for bulk pipelines, and there is no CSV import, so each code is made individually.
