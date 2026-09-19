---
title: Bitly QR code alternative: a free dynamic QR code generator, no plan gating
description: How Bitly's shortener-first QR codes work, what tends to sit behind a plan, what QRly offers instead, and how to move without breaking codes already printed.
date: 2026-09-19
category: comparisons
keywords: bitly qr code, bitly qr code alternative, bitly qr code free, free alternative to bitly qr code, bitly qr code generator, dynamic qr code free, editable qr code
---

Bitly is a link shortener with QR codes attached, and that ordering matters. The short link is the product; the QR code is a way to put that link on paper. If you already use Bitly for links, making a QR code from one is a natural next step, and many people search for an alternative only after the code is printed and something about it turned out to need a plan they do not have.

This post explains how Bitly's model works in general terms, what to check on your own account before printing, what QRly offers instead, and how to move without breaking anything, because a printed code cannot be migrated.

## How a shortener-first QR code works

A Bitly QR code encodes a Bitly short link. Scan it and the phone requests that link, Bitly's server looks up the destination and redirects. That is a dynamic QR code by definition: the destination can be changed without reprinting, and every scan can be counted, because every scan passes through the shortener.

It also has the dependency every dynamic code has. The printed code contains `bit.ly/...` or a custom Bitly domain, and it works for as long as that link resolves under the terms of your account. [QR code redirects explained](/blog/qr-code-redirect-explained) covers the mechanism; the link is the code's lifeline.

## What tends to sit behind a plan

Bitly's tiers change, and this post will not quote them. Instead, here is the general shape of what a shortener-first vendor tends to gate, so you know what to look for on the pricing page and in your own dashboard.

**Customisation of the code.** Colours, logo, frames and corner styles are the usual candidates for a paid tier. On the free tier the code may be plain, or carry the vendor's styling.

**Depth of analytics.** A scan count is often free; location, device and referrer breakdowns, or a longer history, are often paid. Check what the dashboard shows you on your current plan, not what the marketing page shows.

**Changing the destination.** This is the one to check most carefully. Editing where a link points after it is created is the entire value of a dynamic code, and on shortener-first tools it has at times been limited by plan, by count, or by link age. If you cannot redirect the link, your printed code is effectively static with an extra dependency.

**Number of links or codes.** A monthly allowance of new short links, and sometimes a separate allowance of QR codes.

**Custom domains.** Using your own hostname for the short link instead of the vendor's is commonly a paid feature, and it is the one feature that would let you leave without a reprint.

None of this is a criticism. A shortener serving links at very large scale has real costs and prices its features accordingly. The point is that a QR code inherits every limit of the link it encodes, and you need to know those limits before the code is on a van.

## What to check before you print

1. **Decode the code** with a phone and note the domain. That is what your print depends on.
2. **Try editing the destination** of a test link on your current plan. If you cannot, or there is a limit, you now know.
3. **Open the analytics** for a test link after scanning it yourself, and see which fields your plan actually shows.
4. **Read the plan's terms on link expiry**, deletion of inactive links, and what happens on downgrade.
5. **Download the code** and check the format. If SVG is unavailable, the print resolution is capped at whatever PNG you get; [SVG vs PNG for QR codes](/blog/qr-code-file-formats-svg-png) explains why that matters.

## What QRly offers instead

QRly is a free, open-source dynamic QR code generator built around the QR code rather than around links. Every code encodes a short link, `qrly.lol/<slug>` or your own domain, that returns a 302 to the destination. The comparison against the gated list above:

- **Customisation is not gated.** Colours, module and eye shapes, error-correction level, quiet zone and an embedded logo, with a scannability read-out, on every code. Export SVG or PNG at 512, 1024 or 2048 pixels.
- **Analytics are not gated.** Total scans, unique visitors per day, country and city, device, OS and browser, local hour and weekday, carrier, referrer and UTMs, on every code, with no plan. The data is derived from the redirect request alone: no cookie, no pixel, no script on the scanner's phone. The [privacy page](/privacy) lists every field. Geo data is city-level and approximate, as it is everywhere.
- **Editing the destination is not gated.** Change it from the dashboard; the change reaches every edge in under 60 seconds. The hostname and slug are immutable once saved, because they are already printed.
- **No link allowance, no scan cap, no expiry, no inactivity deletion.**
- **Custom domains** with an account: point one CNAME at the platform and a certificate is issued automatically. [Custom domain QR codes](/blog/custom-domain-qr-code) explains why this is the feature that matters most for anything with a long print life.
- **No account to make the first code.** Paste a URL on [the home page](/) and download. Sign up afterwards to keep it.

There is no paid plan, because the platform runs on Cloudflare Workers and Supabase free tiers at $0 a month. The [cost page](/cost) sets out the numbers, and the [source](https://github.com/HK-0811/QRly) is MIT licensed.

What QRly does not have matters if you use Bitly for more than QR codes. It is not a general link shortener with a browser extension and integrations. It has no API, no bulk import, no teams. It makes URL codes only, so no Wi-Fi or vCard codes, and no OS-based routing. The [side-by-side with paid generators](/blog/qrly-vs-paid-qr-code-generators) lists every gap. If your organisation lives in a shortener's team features, QRly replaces the QR code part of the job, not the rest.

## Migrating: you cannot move a printed code

This is the part most alternative posts skip. A printed QR code contains a specific short link on a specific domain. There is no way to make that printed code start pointing at a different service. The squares are the squares.

What you can do is plan the next print properly.

**Keep the old codes working for as long as you need them.** If they are on Bitly links, keep those links pointing at the right place for the life of the print. Do not delete the links, and check what happens to them if you change plan. A code that is still on a shop window still needs its redirect.

**Make the new codes on QRly** pointing at the same destinations, and test each from a phone. For a clean handover, add UTM parameters to the new destinations so the two generations are distinguishable in your own analytics; [QR code UTM parameters](/blog/qr-code-utm-parameters-google-analytics) shows how.

**Reprint on the natural cycle.** Menus get replaced, flyers get reordered, packaging runs end. Swap the code at each of those points rather than in one expensive sweep, and test the new code at real size before it ships.

**Put the new codes on your own domain from the start.** This is the one step that means you never do this migration again. A code that encodes `qr.yourbrand.com/menu` depends on your DNS, not on any vendor. If you ever leave QRly, you repoint the hostname and every print follows. Custom domains need an account and one CNAME record; [how to set up a custom domain for QR codes](/blog/how-to-set-up-a-custom-domain-for-qr-codes) is the walkthrough.

**Retire the old links deliberately.** Once every old print is out of circulation, point the old links at the same destination as the new ones, or at a page that says the code is out of date, rather than letting them lapse into whatever the vendor's default is for dead links.

## A note on scale

Bitly serves links at a scale QRly does not attempt. QRly is deliberately sized for a thousand or two users. For a small business, a venue or a charity, that is more than enough, and no single link is metered. For a national campaign with an agency behind it, a large vendor with a contract and a support line is the appropriate purchase, and the code should be on a custom domain either way.

## Frequently asked

**Is a Bitly QR code free?**
Making one is generally possible on a free account, but customisation, analytics depth, link allowances and destination editing tend to depend on plan. Check what your own dashboard allows on a test link before printing. This post quotes no prices; check the current pricing page.

**Can I move my Bitly QR code to QRly?**
Not the printed code; it contains a Bitly link and will always go through Bitly. You make a new code on QRly pointing at the same destination, keep the old link working until the old print is gone, and swap at the next reprint.

**Does QRly do everything Bitly does?**
No. QRly is a QR code generator, not a general link shortener. It has no API, bulk import, teams or integrations, and it makes URL codes only. It does have unmetered dynamic codes, full analytics, design controls and custom domains with no paid plan.

**How do I stop this happening again?**
Print codes on a domain you own. A dynamic code on `qr.yourbrand.com` follows your DNS, so switching platforms means repointing one record rather than reprinting.

