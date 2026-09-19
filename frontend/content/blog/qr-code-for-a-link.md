---
title: QR code for a link — turn any URL into a code that scans first time
description: How to make a QR code for a website link, why a shorter URL gives a sparser code that scans better from print, and how to change the link or count the scans afterwards.
date: 2026-09-19
category: basics
keywords: qr code for a link, url to qr code, website qr code, qr code for website, link to qr code, qr code url, qr code for web page
---

The most common QR code by a wide margin is the simplest: a link to a web page. Menu, form, product, profile, video, booking page. The camera sees the code, offers the link, the person taps. There is not much to get wrong, which is exactly why the things that do go wrong go wrong so often — nobody thinks about a URL code for long enough to notice them.

This post covers what the code contains, why the length of the URL matters more than anything else, how to make one, and what you can do with it afterwards.

## What a URL QR code contains

A QR code is text drawn as a grid. For a link, the text is the URL, and the phone recognises the `https://` prefix and offers to open it. [What is a QR code](/blog/what-is-a-qr-code) covers how the grid is read; the relevant fact here is that the number of modules in the grid — and therefore how small each one is at a given print size — is set by the length of the text.

There are two ways to put a link in a code:

- **Directly.** The code contains `https://yourshop.com/collections/spring-2026?utm_source=poster`. This is a static code.
- **Through a short link.** The code contains `https://qrly.lol/spring`, and a redirect server sends the scanner on to the long URL. This is a dynamic code.

The [static versus dynamic](/blog/static-vs-dynamic-qr-codes) post covers what that choice means for editing and tracking. For this post the more immediate consequence is physical: the second code is much sparser than the first.

## Why a shorter URL scans better

QR codes come in 40 sizes, called versions. Version 1 is 21 modules a side; each version adds 4, up to 177. The encoder picks the smallest version that fits the text at the chosen error-correction level.

| Text | Length | Version at level M | Modules per side |
|---|---|---|---|
| `https://qrly.lol/spring` | 23 chars | 2 | 25 |
| `https://yourshop.com/spring` | 27 chars | 2 | 25 |
| `https://yourshop.com/collections/spring-2026` | 44 chars | 4 | 33 |
| Same, with three UTM parameters | ~110 chars | 7 | 45 |
| A shared Google Maps or Docs link | ~150 chars | 9 | 53 |

Print any of those at 3 cm wide. The version 2 code has modules of 1.2 mm; the version 9 code has modules of 0.57 mm, which is the edge of what a phone camera resolves from arm's length, and past it in poor light, at an angle, or on a blurred print.

Everything a scanner has to cope with — distance, glare, a fold, a cheap camera — is easier when the modules are bigger. And the only way to make the modules bigger at a fixed print size is to encode less text. [Why short URLs make better QR codes](/blog/why-short-urls-make-better-qr-codes) has the full capacity tables; the rule of thumb is that **a link under 30 characters gives you a code you can put almost anywhere**.

Long URLs are the norm. Google Forms, Maps, Drive, YouTube with a timestamp, anything from an e-commerce platform — all well over 60 characters. So the short link is not a luxury; it is the difference between a code that works on a business card and one that does not.

## How to make a QR code for a link

On [the home page](/), paste the URL. QRly makes a short link on `qrly.lol` — with a random slug or one you choose — and draws a code that encodes it. No account is needed for that, and the file downloads with no watermark.

Then:

1. **Scan the on-screen code with your phone and follow it.** Confirm it lands on the right page, over `https`, with no login wall or cookie wall you did not intend.
2. **Choose a slug you can live with.** `qrly.lol/spring` reads better than `qrly.lol/x7Kq2p` when someone sees it in a browser bar, and it is easier to type if the code will not scan. Once saved, the slug is permanent — it is already the thing you are about to print.
3. **Style it, within reason.** Colours, module shape and a centred logo are available in the studio; the scannability read-out tells you when a design has gone too far. Keep dark on light and leave the quiet zone alone. [Design rules that still scan](/blog/qr-code-design-rules-that-still-scan) has the detail.
4. **Download SVG for print, PNG for screens.** SVG scales with no loss. The PNG options are 512, 1024 and 2048 pixels.
5. **Print one and scan it** from the distance it will be used at, on two phones, before ordering the run.

[How to make a QR code](/blog/how-to-make-a-qr-code) covers every step, including the pre-print checks.

## Get the destination right

Things that go wrong with the URL itself, before the code is involved:

- **`http` instead of `https`.** Most browsers now warn on plain `http`. Use the secure address.
- **A redirect chain of your own.** If the URL you paste itself redirects (a `www` hop, a trailing-slash hop, a tracking hop), each is another round-trip on a mobile connection. Paste the final URL.
- **A page that is not mobile-friendly.** The scanner is on a phone, always. Check the page on one.
- **A link that needs a session.** A page that only works when logged in, or a shared-drive link with restricted access, will show a login prompt to every stranger who scans.
- **A destination that will move.** Campaign pages get archived. Product pages get discontinued. This is the one case a dynamic code fixes and a static code cannot.

QRly checks every destination against Google Safe Browsing and refuses private or local addresses, but it cannot tell you the page is the right one. Scan and follow it yourself.

## Changing the link after printing

Because the printed code contains the short link and not the destination, the destination is a database row you can edit. Sign up — before printing, ideally — to claim the code, then from the dashboard change where it points. The change reaches every edge location in under a minute; the next scan anywhere goes to the new page.

This is what makes a URL code safe to print in quantity. The poster says `qrly.lol/spring` for as long as the poster exists; what `spring` resolves to is up to you, in March and again in September. [How to change a QR code link after printing](/blog/how-to-change-a-qr-code-link-after-printing) covers the mechanics.

If there is any chance you will want this, claim the code before it goes to the printer. An unclaimed code keeps working, but nobody can edit it.

## Counting the scans

Every scan of a dynamic code is a request to the redirect server, so the server can count it. On QRly, each link reports total scans, unique visitors per day, country and city, device and OS, browser, language, time of day and weekday, and referrer — where "no referrer" means a genuine camera scan rather than a link tapped in a chat. All of it comes from the request alone: no cookie, no pixel, no script on the scanner's phone. The IP derives the location and a daily visitor hash, then is discarded. The [privacy page](/privacy) lists every field.

Two honest limits. Location is city-level and approximate; a VPN or carrier network mislocates. Unique visitors are counted per day, not for all time, because doing better would mean identifying people across days, which the design refuses to do. [What you can actually know from QR analytics](/blog/qr-code-analytics-what-you-can-actually-know) draws the line in detail.

If you already use Google Analytics on the destination, add UTM parameters to the *destination* URL, not to the code. The code stays short; the landing page still attributes the visit. [UTM parameters with QR codes](/blog/qr-code-utm-parameters-google-analytics) explains the set-up.

## A website QR code on your own domain

For a code that will be around for years — packaging, signage, a card — the strongest position is a short link on a hostname you own. Add `qr.yourbrand.com` in QRly and point one CNAME record at the platform; the printed code then contains your hostname, and if you ever moved platform you would re-point it and every print would follow. This needs an account; [custom domain QR codes](/blog/custom-domain-qr-code) covers the set-up.

> The link you print is not the link people land on. Keep the printed one short and permanent; keep the landing one long and changeable.

## Frequently asked

**How do I turn a URL into a QR code?**
Paste the URL on [the home page](/), download the SVG or PNG. No account is needed. The code encodes a short link that redirects to your URL, so it can be edited and counted afterwards.

**Does the length of the URL matter?**
More than anything else. A short URL gives a code with fewer, larger modules, which scans from further away and in worse conditions. Anything over about 60 characters should go through a short link.

**Can I make a QR code for a website for free?**
Yes. Static generators, including Chrome's built-in one, encode the URL directly at no cost. QRly makes a dynamic code free, with no trial, watermark or expiry, because the platform costs [nothing to run](/cost).

**Can I change the website a QR code goes to?**
With a dynamic code, yes: claim the code, edit the destination in the dashboard, and the change is live in under a minute. With a static code, no; the URL is in the print.

**Should the QR code go to my home page?**
Usually not. Send people to the specific page the context implies — the menu, the form, the product — and save them the navigation. If you later want a different page, change the destination rather than the print.
