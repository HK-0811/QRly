---
title: Best free QR code generators — a rubric you can apply to any of them
description: A checklist for judging any free QR code generator: static or dynamic, expiry, watermark, scan caps, exports, tracking, own domain, open source, with QRly's answers.
date: 2026-09-19
category: comparisons
keywords: best free qr code generator, top qr code generators, free qr code generator comparison, free qr code generator, qr code generator comparison, free dynamic qr code generator, qr code generator without watermark, qr code generator no expiry
---

Every "best free QR code generators" article is a ranked list of vendors. Most are written to earn a referral fee, and all of them are out of date the next time a free tier is quietly trimmed. A ranking gives you a name. It does not give you a reason, and the reason is what you need when the code is about to go on ten thousand boxes.

So this is not a ranking. It is the eight questions that separate a generator you can print from one you will regret, how to answer each one in a few minutes with any tool, and what QRly's answers are. Free tiers change; a generator that allowed unlimited dynamic codes last year may cap scans this year. The questions below do not go stale, because they are about how a code works rather than what a vendor currently offers. Apply them to whichever generator you are looking at, including this one.

## The eight questions

### 1. Static or dynamic?

This is the question that decides everything else. A static code encodes your URL directly; a dynamic code encodes a short link on the generator's domain that redirects to your URL. Static codes cannot expire and cannot be tracked. Dynamic codes can be edited after printing and can be counted, and they depend on the redirect staying up. The full distinction is in [static vs dynamic QR codes](/blog/static-vs-dynamic-qr-codes).

**How to check:** point a phone at the code on screen and read the decoded text. Your URL means static. Anything else means dynamic, and the domain you see is the one your printed code will depend on.

**QRly:** dynamic only. Every code encodes a `qrly.lol/<slug>` short link, or a link on your own domain, which returns a 302 to your destination.

### 2. Does the code expire?

For a static code, the answer is always no. For a dynamic code, look for three things in the terms: a trial period, a scan cap after which the code stops resolving, and an inactivity rule that deletes codes nobody has scanned for a while. Any of these means the code has a lifespan the poster does not.

**QRly:** no trial, no inactivity deletion, no expiry unless you set one yourself. See [free QR codes with no expiration](/blog/free-qr-code-no-expiration) for the longer version.

### 3. Is there a watermark or interstitial?

Watermarks come in two forms. The obvious one is a vendor logo or frame baked into the downloaded image. The less obvious one is an interstitial page: the scan resolves to a page advertising the generator for a few seconds before forwarding, or a landing page you did not design. Both put someone else's brand between you and the scanner.

**How to check:** download the SVG and open it; then scan the code from a second phone and watch what loads first.

**QRly:** none. The export is the bare code, and the redirect goes straight to the destination.

### 4. Is there a scan cap?

Some free tiers count scans and stop serving the redirect past a monthly number. The cap is often reasonable for a business card and unreasonable for anything in a shop window. A cap you hit in week three of a campaign is worse than no dynamic code at all, because you have already printed.

**QRly:** no cap. The platform is sized for a thousand or two users, not for a stadium, but no individual link is metered.

### 5. What can you export?

For print you want SVG, because it scales without loss. For everything else you want PNG at a size the destination will not upscale. A generator that offers only a small PNG, or puts SVG behind a paid plan, is telling you it expects the code to live on a screen.

**QRly:** SVG, or PNG at 512, 1024 or 2048 pixels, on every code, before any account exists.

### 6. Does it track scans, and how?

Tracking requires a dynamic code, so a static generator cannot do it and should not claim to. For a dynamic generator, ask two things: what is recorded, and what runs on the scanner's phone to record it. A redirect can log the request it receives without running any script; a tracking pixel or a cookie-setting landing page is a different, heavier thing.

**QRly:** total scans, unique visitors per day, country and city, device, OS, browser, time of day, referrer and UTM parameters, all derived from the redirect request. No script, no cookie, no pixel. The field list is on [the privacy page](/privacy); what the numbers do and do not mean is in [what QR analytics can actually tell you](/blog/qr-code-analytics-what-you-can-actually-know).

### 7. Can it be on your own domain?

A dynamic code on the vendor's domain depends on the vendor. A dynamic code on `qr.yourbrand.com` depends on you: if you ever change platform, you repoint the hostname and every printed code follows. Look for whether custom domains exist at all, whether they need a paid plan, and whether the certificate is handled for you.

**QRly:** supported, with an account. One CNAME record, a certificate issued automatically, and a verification step that reports what it found in DNS. The walkthrough is in [custom domains for QR codes](/blog/custom-domain-qr-code).

### 8. Is the source open?

This one is rarely on other people's lists, and it matters most for the longest-lived codes. If the code is dynamic and the vendor disappears, an open-source platform can be run by someone else. A closed one cannot. It also lets the privacy claims be read rather than trusted.

**QRly:** MIT licensed, at https://github.com/HK-0811/QRly.

## The rubric as a table

Copy this and fill in the right-hand column for whatever you are evaluating.

| Question | Good answer | Warning sign | QRly |
|---|---|---|---|
| Static or dynamic? | Whichever you actually need | Not disclosed; decoded text is a mystery domain | Dynamic (302 redirect) |
| Expires? | No, or only when you choose | Trial, inactivity rule, "upgrade to keep" | No, optional self-set date |
| Watermark or interstitial? | Neither | Frame on the image; ad page before redirect | Neither |
| Scan cap? | None | Monthly limit on the free tier | None |
| Export formats | SVG plus large PNG | Small PNG only; SVG paywalled | SVG, PNG 512/1024/2048 |
| Tracking method | Server-side at the redirect | Script, pixel or cookie on the phone | Server-side, no script |
| Own domain | Yes, with automatic TLS | Not available or paid-only | Yes, one CNAME |
| Source open | Yes, permissive licence | Closed | MIT |

## How to run the check in five minutes

1. Make a test code without signing up, if the tool allows it.
2. Decode it with a phone and note the domain. That answers question one.
3. Download the SVG. If there is none, or it has a frame, note it.
4. Read the whole pricing page, footnotes included. That answers two, four, five and seven.
5. Scan the code from a second phone and watch what loads. That answers three and, roughly, six.
6. Search for the vendor's name plus "GitHub". That answers eight.

If you want to run the same check on QRly, [make a code](/create) and follow the steps; nothing above is hidden.

## Where QRly is not the answer

A rubric that only ever points at its author is not a rubric. QRly does not do several things a paid tool might.

It does not make static codes for anything other than a URL: no Wi-Fi codes, no vCards, no phone, SMS or email codes. For those you want a static generator or the phone's own tools. It has no bulk or CSV import, no public API, no teams, no password-protected codes, and no routing by operating system. If your job is five thousand serialised codes for packaging, or shared access for a marketing team, a paid tool is the right purchase. The [side-by-side with paid generators](/blog/qrly-vs-paid-qr-code-generators) lists the gaps without softening them.

For a person or small organisation making a modest number of codes that need to be editable, trackable and free indefinitely, the eight answers above are the ones that matter.

## Frequently asked

**What is the best free QR code generator?**
The one whose answers to the eight questions match what you are printing. For a link that will never change, any static generator with SVG export is fine. For anything editable or trackable, you need a dynamic generator with no expiry, no cap and ideally your own domain. QRly meets those for URL codes.

**Are free dynamic QR codes safe to print?**
Only if the redirect is guaranteed to keep running. Read the terms for trial periods, scan caps and inactivity rules before printing. A code on your own domain is the safest form, because it outlives the vendor.

**Why do so many "free" generators end up costing money?**
Because the code contains the vendor's short link, and the vendor can stop serving it when the free period ends. The generator is free; the redirect is the product. [Pricing models explained](/blog/qr-code-generator-pricing-explained) goes through each of them.

**Does open source matter if I am not a developer?**
It matters for longevity. If the vendor closes, an open platform can be hosted by someone else and your codes keep working; a closed one cannot. It also means the privacy claims are verifiable.
